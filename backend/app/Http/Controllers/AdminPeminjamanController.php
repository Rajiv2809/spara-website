<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use App\Models\{Peminjaman, Persetujuan};
use App\Http\Resources\PeminjamanResource;

class AdminPeminjamanController extends Controller
{
    /**
     * POST /api/admin/peminjaman
     *
     * Admin membuat peminjaman yang langsung berstatus "disetujui"
     * tanpa melalui alur persetujuan bertahap.
     * Hanya bisa diakses oleh role admin.
     */
    public function store(Request $request)
    {
        // Pastikan hanya admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang dapat menggunakan fitur ini.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name_kegiatan'   => 'required|string|max:255',
            'jenis_kegiatan'  => 'required|in:akademik,non-akademik',
            'hari_tanggal'    => 'required|date',
            'tanggal_mulai'   => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'jam_mulai'       => 'required|date_format:H:i',
            'jam_selesai'     => 'required|date_format:H:i|after:jam_mulai',
            'keterangan'      => 'nullable|string',
            'id_alat'         => 'nullable|exists:alats,id_alat',
            'id_ruangan'      => 'nullable|exists:ruangans,id_ruangan',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Wajib salah satu
        if (!$request->id_alat && !$request->id_ruangan) {
            return response()->json(['message' => 'Pilih ruangan atau alat yang akan dipinjam.'], 422);
        }

        $tanggalMulai   = $request->tanggal_mulai   ?? $request->hari_tanggal;
        $tanggalSelesai = $request->tanggal_selesai ?? $request->hari_tanggal;

        // Hitung semua tanggal dalam rentang
        $allDates = [];
        $cur = Carbon::parse($tanggalMulai);
        $end = Carbon::parse($tanggalSelesai);
        while ($cur->lte($end)) {
            $allDates[] = $cur->toDateString();
            $cur->addDay();
        }

        if (count($allDates) > 30) {
            return response()->json(['message' => 'Peminjaman maksimal 30 hari sekaligus.'], 422);
        }

        // ── Cek konflik ruangan ───────────────────────────────────────────
        if ($request->id_ruangan) {
            foreach ($allDates as $tgl) {
                $konflik = Peminjaman::where('id_ruangan', $request->id_ruangan)
                    ->whereNotIn('status_persetujuan', ['ditolak', 'dibatalkan'])
                    ->where(function ($q) use ($tgl) {
                        $q->whereDate('hari_tanggal', $tgl)
                          ->orWhere(function ($q2) use ($tgl) {
                              $q2->whereDate('tanggal_mulai', '<=', $tgl)
                                 ->whereDate('tanggal_selesai', '>=', $tgl);
                          });
                    })
                    ->where(function ($q) use ($request) {
                        $q->where('jam_mulai', '<', $request->jam_selesai)
                          ->where('jam_selesai', '>', $request->jam_mulai);
                    })
                    ->exists();

                if ($konflik) {
                    return response()->json([
                        'message' => "Ruangan sudah dibooking pada tanggal {$tgl} jam {$request->jam_mulai}–{$request->jam_selesai}.",
                    ], 409);
                }
            }
        }

        // ── Cek konflik alat ──────────────────────────────────────────────
        if ($request->id_alat) {
            foreach ($allDates as $tgl) {
                $konflik = Peminjaman::where('id_alat', $request->id_alat)
                    ->whereNotIn('status_persetujuan', ['ditolak', 'dibatalkan'])
                    ->where(function ($q) use ($tgl) {
                        $q->whereDate('hari_tanggal', $tgl)
                          ->orWhere(function ($q2) use ($tgl) {
                              $q2->whereDate('tanggal_mulai', '<=', $tgl)
                                 ->whereDate('tanggal_selesai', '>=', $tgl);
                          });
                    })
                    ->where(function ($q) use ($request) {
                        $q->where('jam_mulai', '<', $request->jam_selesai)
                          ->where('jam_selesai', '>', $request->jam_mulai);
                    })
                    ->exists();

                if ($konflik) {
                    return response()->json([
                        'message' => "Alat sudah dipinjam pada tanggal {$tgl} jam {$request->jam_mulai}–{$request->jam_selesai}.",
                    ], 409);
                }
            }
        }

        // ── Buat peminjaman langsung disetujui ───────────────────────────
        $peminjaman = Peminjaman::create([
            'name_kegiatan'      => $request->name_kegiatan,
            'jenis_kegiatan'     => $request->jenis_kegiatan,
            'hari_tanggal'       => $tanggalMulai,
            'tanggal_mulai'      => $tanggalMulai,
            'tanggal_selesai'    => $tanggalSelesai,
            'jam_mulai'          => $request->jam_mulai,
            'jam_selesai'        => $request->jam_selesai,
            'keterangan'         => $request->keterangan,
            'status_persetujuan' => 'disetujui',  // langsung disetujui
            'id_peminjam'        => $request->user()->id_number,
            'id_alat'            => $request->id_alat,
            'id_ruangan'         => $request->id_ruangan,
            'dibuat_pada'        => Carbon::now(),
            'diubah_pada'        => null,
        ]);

        // Buat satu record persetujuan yang sudah disetujui oleh admin ini
        Persetujuan::create([
            'id_peminjaman'      => $peminjaman->id_peminjaman,
            'id_number_penyetuju' => $request->user()->id_number,
            'status_persetujuan' => 'disetujui',
            'created_at'         => Carbon::now(),
            'updated_at'         => Carbon::now(),
        ]);

        $peminjaman->load(['ruangan', 'alat', 'peminjam', 'persetujuans']);

        return response()->json([
            'message'    => 'Peminjaman berhasil dibuat dan langsung disetujui.',
            'peminjaman' => new PeminjamanResource($peminjaman),
        ], 201);
    }

    /**
     * GET /api/admin/peminjaman
     * Semua peminjaman milik admin yang sedang login.
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $riwayat = Peminjaman::with(['persetujuans', 'ruangan', 'alat', 'peminjam'])
            ->where('id_peminjam', $request->user()->id_number)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Data peminjaman admin berhasil diambil.',
            'data'    => PeminjamanResource::collection($riwayat),
        ]);
    }
}
