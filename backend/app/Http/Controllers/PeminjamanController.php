<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use Carbon\Carbon;
use App\Models\{Peminjaman, Persetujuan};
use App\Http\Resources\PeminjamanResource;
use App\Http\Resources\PersetujuanResource;
use App\Http\Resources\ListPersetujuanResource;
use App\Models\Ruangan;
use App\Models\Alat;

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

        // Cek konflik jadwal ruangan — hanya blokir jika sudah disetujui 3 tahap
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
                })
                ->whereDoesntHave('persetujuans', function ($q) {
                    $q->where('status_persetujuan', '!=', 'disetujui');
                })
                ->whereHas('persetujuans')
                ->exists();

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

        // ── Ambil nomor_induk PIC dari ruangan / alat ────────────────────────
        $nomorIndukPic = null;
        if ($request->id_ruangan) {
            $ruangan = DB::table('ruangans')
                ->where('id_ruangan', $request->id_ruangan)
                ->first();

            if ($ruangan && $ruangan->nomor_induk_pic) {
                $nomorIndukPic = $ruangan->nomor_induk_pic;
            }
        } elseif ($request->id_alat) {
            $alat = DB::table('alats')
                ->where('id_alat', $request->id_alat)
                ->first();

            if ($alat && $alat->nomor_induk_pic) {
                $nomorIndukPic = $alat->nomor_induk_pic;
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
        $persetujuan = Persetujuan::where(function ($q) {
            $q->where('nomor_induk_penyetuju', request()->user()->nomor_induk);
            if (request()->user()->role === 'admin') {
                $q->orWhereNull('nomor_induk_penyetuju');
            }
        })
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'persetujuan' => $persetujuan,
        ]);
    }

    public function getPersetujuanList()
    {
        $persetujuanList = Persetujuan::where(function ($q) {
            $q->where('nomor_induk_penyetuju', request()->user()->nomor_induk);
            if (request()->user()->role === 'admin') {
                $q->orWhereNull('nomor_induk_penyetuju');
            }
        })
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
            return response()->json(['message' => 'Persetujuan tidak ditemukan.'], 404);
        }

        $peminjaman = Peminjaman::with('persetujuans')->find($persetujuan->id_peminjaman);
        if (!$peminjaman) {
            return response()->json(['message' => 'Peminjaman tidak ditemukan.'], 404);
        }

        if ($peminjaman->status_persetujuan === 'ditolak') {
            return response()->json(['message' => 'Peminjaman sudah ditolak.'], 422);
        }

        if ($peminjaman->status_persetujuan === 'disetujui') {
            return response()->json(['message' => 'Peminjaman sudah disetujui sebelumnya.'], 422);
        }

        // Cek urutan persetujuan (berdasarkan id)
        $allPersetujuan = $peminjaman->persetujuans->sortBy('id');
        $currentIndex = $allPersetujuan->search(fn($item) => (int) $item->id === (int) $id);

        if ($currentIndex === false) {
            return response()->json(['message' => 'Data tidak valid.'], 422);
        }

        // Semua tahap sebelumnya harus sudah disetujui
        for ($i = 0; $i < $currentIndex; $i++) {
            if ($allPersetujuan[$i]->status_persetujuan !== 'disetujui') {
                return response()->json([
                    'message' => 'Tahap sebelumnya belum disetujui.',
                ], 422);
            }
        }

        $persetujuan->status_persetujuan = 'disetujui';
        $persetujuan->updated_at = Carbon::now();
        $persetujuan->save();

        // Cek apakah semua 3 tahap sudah disetujui
        $semuaDisetujui = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
            ->where('status_persetujuan', '!=', 'disetujui')
            ->doesntExist();

        if ($semuaDisetujui) {
            $peminjaman->status_persetujuan = 'disetujui';
            $peminjaman->save();
        }

        return response()->json([
            'message' => 'Peminjaman disetujui.',
            'persetujuan' => new PersetujuanResource($persetujuan),
        ]);
    }

    public function tolakPeminjaman($id)
    {
        $persetujuan = Persetujuan::find($id);

        if (!$persetujuan) {
            return response()->json(['message' => 'Persetujuan tidak ditemukan.'], 404);
        }

        $peminjaman = Peminjaman::find($persetujuan->id_peminjaman);

        $persetujuan->status_persetujuan = 'ditolak';
        $persetujuan->updated_at = Carbon::now();
        $persetujuan->save();

        // Kalau ada yang tolak, peminjaman langsung ditolak
        if ($peminjaman && $peminjaman->status_persetujuan !== 'ditolak') {
            $peminjaman->status_persetujuan = 'ditolak';
            $peminjaman->save();
        }

        return response()->json([
            'message' => 'Peminjaman ditolak.',
            'persetujuan' => new PersetujuanResource($persetujuan),
        ]);
    }
    public function getAllPeminjaman()
    {
        $riwayat = Peminjaman::with(['persetujuans','ruangan','alat','peminjam'])
            ->where('id_peminjam', request()->user()->nomor_induk)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Riwayat peminjaman berhasil diambil.',
            'data' => PeminjamanResource::collection($riwayat),
        ]);
    }

    public function cancelPeminjaman($id)
    {
        $peminjaman = Peminjaman::where('id_peminjaman', $id)
            ->where('id_peminjam', request()->user()->nomor_induk)
            ->first();

        if (!$peminjaman) {
            return response()->json(['message' => 'Peminjaman tidak ditemukan.'], 404);
        }

        if ($peminjaman->status_persetujuan !== 'menunggu') {
            return response()->json(['message' => 'Hanya peminjaman dengan status menunggu yang dapat dibatalkan.'], 422);
        }

        $peminjaman->status_persetujuan = 'dibatalkan';
        $peminjaman->save();

        Persetujuan::where('id_peminjaman', $id)
            ->where('status_persetujuan', 'menunggu')
            ->update(['status_persetujuan' => 'ditolak']);

        return response()->json(['message' => 'Peminjaman berhasil dibatalkan.']);
    }

    public function riwayat()
    {
        $user = request()->user();

        $riwayat = Peminjaman::with(['persetujuans','ruangan','alat','peminjam'])
            ->where('id_peminjam', $user->nomor_induk)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Riwayat peminjaman berhasil diambil.',
            'data' => PeminjamanResource::collection($riwayat),
        ]);
    }

    public function riwayatDebug(Request $request)
    {
        if (!app()->environment('local')) {
            return response()->json([
                'message' => 'Debug route hanya tersedia di environment local.',
            ], 403);
        }

        $nomor = $request->query('nomor');
        if (!$nomor) {
            return response()->json([
                'message' => 'Parameter nomor diperlukan.',
            ], 400);
        }

        $riwayat = Peminjaman::with(['persetujuans','ruangan','alat','peminjam'])
            ->where('id_peminjam', $nomor)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Riwayat debug berhasil diambil.',
            'data' => PeminjamanResource::collection($riwayat),
        ]);
    }
}
