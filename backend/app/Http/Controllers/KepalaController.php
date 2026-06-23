<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Models\{Peminjaman, Persetujuan, Notification};

class KepalaController extends Controller
{
    /**
     * GET /api/ketua/monitoring-peminjaman
     *
     * Query params (opsional):
     *  - jenis  : 'ruangan' | 'alat'         → filter jenis peminjaman
     *  - status : 'menunggu' | 'disetujui'   → filter status (default: keduanya)
     *
     * Response:
     *  - data[]  : daftar peminjaman yang dipetakan
     *  - stats   : ringkasan statistik aktif
     */
    public function getMonitoringPeminjaman(Request $request)
    {
        $query = Peminjaman::with(['peminjam', 'alat', 'ruangan', 'persetujuans'])
            ->orderBy('hari_tanggal', 'asc')
            ->orderBy('jam_mulai', 'asc');

        // Filter jenis (ruangan / alat)
        if ($request->jenis === 'ruangan') {
            $query->whereNotNull('id_ruangan');
        } elseif ($request->jenis === 'alat') {
            $query->whereNotNull('id_alat');
        }

        // Filter status — default: hanya tampilkan yang aktif
        if ($request->filled('status')) {
            $query->where('status_persetujuan', $request->status);
        } else {
            $query->whereIn('status_persetujuan', ['menunggu', 'disetujui']);
        }

        $peminjamans = $query->get();

        // Peta data ke format yang dibutuhkan frontend
        $data = $peminjamans->map(function ($p) {
            return [
                'id_peminjaman'        => $p->id_peminjaman,
                'nama_kegiatan'        => $p->nama_kegiatan,
                'jenis_kegiatan'       => $p->jenis_kegiatan,
                'hari_tanggal'         => $p->hari_tanggal?->toDateString(),
                'jam_mulai'            => $p->jam_mulai,
                'jam_selesai'          => $p->jam_selesai,
                'keterangan'           => $p->keterangan,
                'status_persetujuan'   => $p->status_persetujuan,
                'alasan_kepala'         => $p->alasan_kepala,
                'dibuat_pada'          => $p->dibuat_pada?->toDateTimeString(),

                // Jenis ditentukan dari kolom yang diisi
                'jenis'                => $p->id_ruangan ? 'ruangan' : 'alat',

                // Data peminjam
                'nama_peminjam'        => $p->peminjam?->nama,
                'nomor_induk_peminjam' => $p->id_peminjam,
                'unit_peminjam'        => $p->peminjam?->unit ?? $p->peminjam?->jabatan ?? null,

                // Data ruangan (null jika bukan peminjaman ruangan)
                'id_ruangan'           => $p->id_ruangan,
                'nama_ruangan'         => $p->ruangan?->nama_ruangan,
                'kode_ruangan'         => $p->ruangan?->kode_ruangan,

                // Data alat (null jika bukan peminjaman alat)
                'id_alat'              => $p->id_alat,
                'nama_alat'            => $p->alat?->nama_alat,
                'kode_alat'            => $p->alat?->kode_alat,
            ];
        });

        // Statistik ringkas (selalu dari data aktif, tidak terpengaruh filter jenis)
        $allActive = Peminjaman::whereIn('status_persetujuan', ['menunggu', 'disetujui'])->get();
        $stats = [
            'total'     => $allActive->count(),
            'menunggu'  => $allActive->where('status_persetujuan', 'menunggu')->count(),
            'disetujui' => $allActive->where('status_persetujuan', 'disetujui')->count(),
            'ruangan'   => $allActive->whereNotNull('id_ruangan')->count(),
            'alat'      => $allActive->whereNotNull('id_alat')->count(),
        ];

        return response()->json([
            'data'  => $data,
            'stats' => $stats,
        ]);
    }

    /**
     * POST /api/ketua/batalkan-peminjaman/{id}
     *
     * Body:
     *  - alasan_ketua (required) : alasan pembatalan oleh ketua
     *
     * Bisa membatalkan peminjaman berstatus menunggu MAUPUN disetujui.
     */
    public function batalkanPeminjaman(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'alasan_kepala' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman) {
            return response()->json(['message' => 'Peminjaman tidak ditemukan.'], 404);
        }

        if (in_array($peminjaman->status_persetujuan, ['dibatalkan', 'ditolak'])) {
            return response()->json([
                'message' => 'Peminjaman sudah dalam status dibatalkan atau ditolak.',
            ], 422);
        }

        $peminjaman->status_persetujuan = 'dibatalkan';
        $peminjaman->alasan_kepala       = $request->alasan_kepala;
        $peminjaman->diubah_pada        = Carbon::now();
        $peminjaman->save();

        // Tandai semua persetujuan yang masih menunggu sebagai ditolak
        Persetujuan::where('id_peminjaman', $id)
            ->where('status_persetujuan', 'menunggu')
            ->update([
                'status_persetujuan' => 'ditolak',
                'updated_at'         => Carbon::now(),
            ]);

        // ── Notifikasi ke peminjam ──────────────────────────────────────────
        $itemName = $peminjaman->ruangan?->nama_ruangan
            ?? $peminjaman->alat?->nama_alat
            ?? 'Item';
        Notification::create([
            'nomor_induk'   => $peminjaman->id_peminjam,
            'type'          => 'dibatalkan',
            'judul'         => 'Peminjaman Dibatalkan Kepala SBUM',
            'pesan'         => "Peminjaman {$itemName} dibatalkan oleh Kepala SBUM. Alasan: {$request->alasan_kepala}.",
            'peminjaman_id' => $peminjaman->id_peminjaman,
        ]);

        return response()->json([
            'message' => 'Peminjaman berhasil dibatalkan.',
        ]);
    }

    /**
     * POST /api/ketua/jadwalkan-ulang/{id}
     *
     * Body:
     *  - hari_tanggal_baru  (required) : tanggal baru (Y-m-d, tidak boleh lampau)
     *  - jam_mulai_baru     (required) : jam mulai baru (H:i)
     *  - jam_selesai_baru   (required) : jam selesai baru (H:i, setelah jam_mulai_baru)
     *  - id_ruangan_baru    (nullable) : ID ruangan pengganti (khusus peminjaman ruangan)
     *  - alasan_ketua       (required) : alasan penjadwalan ulang
     *
     * Status peminjaman TIDAK berubah — hanya data jadwal yang diperbarui.
     */
    public function jadwalkanUlang(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'hari_tanggal_baru' => 'required|date_format:Y-m-d|after_or_equal:today',
            'jam_mulai_baru'    => 'required|date_format:H:i',
            'jam_selesai_baru'  => 'required|date_format:H:i|after:jam_mulai_baru',
            'id_ruangan_baru'   => 'nullable|exists:ruangans,id_ruangan',
            'alasan_kepala'      => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman) {
            return response()->json(['message' => 'Peminjaman tidak ditemukan.'], 404);
        }

        if (in_array($peminjaman->status_persetujuan, ['dibatalkan', 'ditolak'])) {
            return response()->json([
                'message' => 'Peminjaman sudah dalam status dibatalkan atau ditolak.',
            ], 422);
        }

        $peminjaman->hari_tanggal = $request->hari_tanggal_baru;
        $peminjaman->jam_mulai    = $request->jam_mulai_baru;
        $peminjaman->jam_selesai  = $request->jam_selesai_baru;
        $peminjaman->alasan_kepala = $request->alasan_kepala;
        $peminjaman->diubah_pada  = Carbon::now();

        // Ganti ruangan jika peminjaman jenis ruangan dan id_ruangan_baru diisi
        if ($peminjaman->id_ruangan && $request->filled('id_ruangan_baru')) {
            $peminjaman->id_ruangan = $request->id_ruangan_baru;
        }

        $peminjaman->save();

        return response()->json([
            'message' => 'Peminjaman berhasil dijadwalkan ulang.',
        ]);
    }
}