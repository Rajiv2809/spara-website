<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use Carbon\Carbon;
use App\Models\{Peminjaman, Persetujuan};
use App\Http\Resources\PeminjamanResource;
use App\Http\Resources\PersetujuanResource;
use App\Http\Resources\ListPersetujuanResource;
class PeminjamanController extends Controller
{
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_kegiatan'  => 'required|string|max:255',
            'jenis_kegiatan' => 'required|string|max:255',
            'hari_tanggal'   => 'required|date',
            'jam_mulai'      => 'required|date_format:H:i',
            'jam_selesai'    => 'required|date_format:H:i|after:jam_mulai',
            'keterangan'     => 'nullable|string',
            'id_alat'        => 'nullable|exists:alats,id_alat',
            'id_ruangan'     =>     'nullable|exists:ruangans,id_ruangan',
            'nomor_induk_penanggungjawab' => 'required|exists:users,nomor_induk',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Cek konflik jadwal ruangan
        if ($request->id_ruangan && $request->jam_mulai && $request->jam_selesai) {
            $konflik = Peminjaman::where('id_ruangan', $request->id_ruangan)
                ->where('hari_tanggal', $request->hari_tanggal)
                ->where('status_persetujuan', '!=', 'ditolak')
                ->where(function ($query) use ($request) {
                    $query->whereBetween('jam_mulai', [$request->jam_mulai, $request->jam_selesai])
                        ->orWhereBetween('jam_selesai', [$request->jam_mulai, $request->jam_selesai])
                        ->orWhere(function ($q) use ($request) {
                            $q->where('jam_mulai', '<=', $request->jam_mulai)
                                ->where('jam_selesai', '>=', $request->jam_selesai);
                        });
                })->exists();

            if ($konflik) {
                return response()->json([
                    'message' => 'Ruangan sudah dibooking pada jam tersebut.',
                ], 409);
            }
        }

        // Cek konflik jadwal alat
        if ($request->id_alat && $request->jam_mulai && $request->jam_selesai) {
            $konflikAlat = Peminjaman::where('id_alat', $request->id_alat)
                ->where('hari_tanggal', $request->hari_tanggal)
                ->where('status_persetujuan', '!=', 'ditolak')
                ->where(function ($query) use ($request) {
                    $query->whereBetween('jam_mulai', [$request->jam_mulai, $request->jam_selesai])
                        ->orWhereBetween('jam_selesai', [$request->jam_mulai, $request->jam_selesai])
                        ->orWhere(function ($q) use ($request) {
                            $q->where('jam_mulai', '<=', $request->jam_mulai)
                                ->where('jam_selesai', '>=', $request->jam_selesai);
                        });
                })->exists();

            if ($konflikAlat) {
                return response()->json([
                    'message' => 'Alat sudah dipinjam pada jam tersebut.',
                ], 409);
            }
        }

        // Buat peminjaman
        $peminjaman = Peminjaman::create([
            'nama_kegiatan'      => $request->nama_kegiatan,
            'jenis_kegiatan'     => $request->jenis_kegiatan,
            'hari_tanggal'       => $request->hari_tanggal,
            'jam_mulai'          => $request->jam_mulai,
            'jam_selesai'        => $request->jam_selesai,
            'keterangan'         => $request->keterangan,
            'status_persetujuan' => 'menunggu',
            'id_peminjam'        => $request->user()->nomor_induk,
            'id_alat'            => $request->id_alat,
            'id_ruangan'         => $request->id_ruangan,
            'dibuat_pada'        => Carbon::now(),
            'diubah_pada'        => null,
        ]);

        // ── Ambil nomor_induk PIC dari ruangan ──────────────────────────────
        $nomorIndukPic = null;
        if ($request->id_ruangan) {
            $ruangan = DB::table('ruangans')
                ->where('id_ruangan', $request->id_ruangan)
                ->first();

            if ($ruangan && $ruangan->nomor_induk_pic) {
                // pics.nomor_induk → users.nomor_induk
                $pic = DB::table('pics')
                    ->where('nomor_induk', $ruangan->nomor_induk_pic)
                    ->first();

                $nomorIndukPic = $pic?->nomor_induk ?? null;
            }
        }

        // ── Buat 3 row persetujuan ───────────────────────────────────────────
        $persetujuans = [
            // Row 1 — Penanggung jawab (user yang membuat peminjaman)
            [
                'id_peminjaman'         => $peminjaman->id_peminjaman,
                'nomor_induk_penyetuju' => $request->nomor_induk_penanggungjawab,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ],
            // Row 2 — PIC ruangan
            [
                'id_peminjaman'         => $peminjaman->id_peminjaman,
                'nomor_induk_penyetuju' => $nomorIndukPic,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ],
            // Row 3 — Admin (null)
            [
                'id_peminjaman'         => $peminjaman->id_peminjaman,
                'nomor_induk_penyetuju' => null,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ],
        ];

        Persetujuan::insert($persetujuans);

        return response()->json([
            'message'      => 'Peminjaman berhasil diajukan.',
            'peminjaman'   => $peminjaman,
            'persetujuans' => Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)->get(),
        ], 201);
    }

    public function getPenanggungJawab()
    {
        $penanggungJawab = DB::table('users')
            ->whereIn('role', ['dosen', 'pic'])
            ->select('nomor_induk', 'nama')
            ->get();

        return response()->json([
            'penanggung_jawab' => $penanggungJawab,
        ]);
    }
    public function getPeminjaman()
    {
        $peminjaman = Peminjaman::where('id_peminjam', request()->user()->nomor_induk)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'peminjaman' => PeminjamanResource::collection($peminjaman),
        ]);
    }
    public function getPersetujuan()
    {
        $persetujuan = Persetujuan::where('nomor_induk_penyetuju', request()->user()->nomor_induk)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'persetujuan' => $persetujuan,
        ]);
    }

    public function getPersetujuanList()
    {
      $persetujuanList = Persetujuan::where('nomor_induk_penyetuju', request()->user()->nomor_induk)
          ->latest()
          ->get();

        return response()->json([
            'persetujuan_list' => ListPersetujuanResource::collection($persetujuanList),
        ]);
    }

    public function setujuPeminjaman($id)
    {
        $persetujuan = Persetujuan::find($id);

        if (!$persetujuan) {
            return response()->json([
                'message' => 'Persetujuan tidak ditemukan.',
            ], 404);
        }

        $persetujuan->status_persetujuan = 'disetujui';
        $persetujuan->updated_at = Carbon::now();
        $persetujuan->save();

        return response()->json([
            'message' => 'Peminjaman disetujui.',
            'persetujuan' => new PersetujuanResource($persetujuan),
        ]);
    }
    public function tolakPeminjaman($id)
    {
        $persetujuan = Persetujuan::find($id);

        if (!$persetujuan) {
            return response()->json([
                'message' => 'Persetujuan tidak ditemukan.',
            ], 404);
        }

        $persetujuan->status_persetujuan = 'ditolak';
        $persetujuan->updated_at = Carbon::now();
        $persetujuan->save();

        return response()->json([
            'message' => 'Peminjaman ditolak.',
            'persetujuan' => new PersetujuanResource($persetujuan),
        ]);
    }
}
