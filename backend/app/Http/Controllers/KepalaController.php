<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use Carbon\Carbon;
use App\Models\{Peminjaman, Persetujuan, Notification};
use App\Exports\RekapPeminjamanExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class KepalaController extends Controller
{
    public function getMonitoringPeminjaman(Request $request)
    {
        $request->validate([
            'jenis'          => 'nullable|in:ruangan,alat,semua',
            'status'         => 'nullable|in:menunggu,disetujui,ditolak,dibatalkan',
            'bulan'          => 'nullable|integer|min:1|max:12',
            'tahun'          => 'nullable|integer|min:2020|max:2100',
            'tanggal'        => 'nullable|date_format:Y-m-d',
            'tanggal_mulai'  => 'nullable|date_format:Y-m-d',
            'tanggal_selesai'=> 'nullable|date_format:Y-m-d|after_or_equal:tanggal_mulai',
        ]);

        $query = Peminjaman::with(['peminjam', 'alat', 'ruangan', 'persetujuans'])
            ->orderBy('hari_tanggal', 'asc')
            ->orderBy('jam_mulai', 'asc');

        if ($request->jenis === 'ruangan') {
            $query->whereNotNull('id_ruangan');
        } elseif ($request->jenis === 'alat') {
            $query->whereNotNull('id_alat');
        }

        if ($request->filled('status')) {
            $query->where('status_persetujuan', $request->status);
        } else {
            $query->whereIn('status_persetujuan', ['menunggu', 'disetujui']);
        }

        $this->applyDateFilter($query, $request);

        $peminjamans = $query->get();

        $data = $peminjamans->map(function ($p) {
            return [
                'id_peminjaman'        => $p->id_peminjaman,
                'name_kegiatan'        => $p->name_kegiatan,
                'jenis_kegiatan'       => $p->jenis_kegiatan,
                'hari_tanggal'         => $p->hari_tanggal?->toDateString(),
                'jam_mulai'            => $p->jam_mulai,
                'jam_selesai'          => $p->jam_selesai,
                'keterangan'           => $p->keterangan,
                'status_persetujuan'   => $p->status_persetujuan,
                'alasan_kepala'         => $p->alasan_kepala,
                'dibuat_pada'          => $p->dibuat_pada?->toDateTimeString(),
                'jenis'                => $p->id_ruangan ? 'ruangan' : 'alat',
                'name_peminjam'        => $p->peminjam?->name,
                'id_number_peminjam' => $p->id_peminjam,
                'unit_peminjam'        => $p->peminjam?->unit ?? $p->peminjam?->jabatan ?? null,
                'id_ruangan'           => $p->id_ruangan,
                'name_ruangan'         => $p->ruangan?->name_ruangan,
                'kode_ruangan'         => $p->ruangan?->kode_ruangan,
                'id_alat'              => $p->id_alat,
                'name_alat'            => $p->alat?->name_alat,
                'kode_alat'            => $p->alat?->kode_alat,
            ];
        });

        $statsQuery = Peminjaman::query();

        if ($request->jenis === 'ruangan') {
            $statsQuery->whereNotNull('id_ruangan');
        } elseif ($request->jenis === 'alat') {
            $statsQuery->whereNotNull('id_alat');
        }

        if ($request->filled('status')) {
            $statsQuery->where('status_persetujuan', $request->status);
        } else {
            $statsQuery->whereIn('status_persetujuan', ['menunggu', 'disetujui']);
        }

        $this->applyDateFilter($statsQuery, $request);

        $allActive = $statsQuery->get();
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

        Persetujuan::where('id_peminjaman', $id)
            ->where('status_persetujuan', 'menunggu')
            ->update([
                'status_persetujuan' => 'ditolak',
                'updated_at'         => Carbon::now(),
            ]);

        $itemName = $peminjaman->ruangan?->name_ruangan
            ?? $peminjaman->alat?->name_alat
            ?? 'Item';
        Notification::create([
            'id_number'   => $peminjaman->id_peminjam,
            'type'          => 'dibatalkan',
            'judul'         => 'Peminjaman Dibatalkan Kepala SBUM',
            'pesan'         => "Peminjaman {$itemName} dibatalkan oleh Kepala SBUM. Alasan: {$request->alasan_kepala}.",
            'peminjaman_id' => $peminjaman->id_peminjaman,
        ]);

        return response()->json([
            'message' => 'Peminjaman berhasil dibatalkan.',
        ]);
    }

    public function cekKetersediaan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis'        => 'required|in:ruangan,alat',
            'hari_tanggal' => 'required|date_format:Y-m-d',
            'jam_mulai'    => 'required|date_format:H:i',
            'jam_selesai'  => 'required|date_format:H:i|after:jam_mulai',
            'id_ruangan'   => 'required_if:jenis,ruangan|integer|nullable',
            'id_alat'      => 'required_if:jenis,alat|integer|nullable',
            'exclude_id'   => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $overlap = Peminjaman::where('status_persetujuan', '!=', 'dibatalkan')
            ->where('status_persetujuan', '!=', 'ditolak')
            ->where('hari_tanggal', $request->hari_tanggal)
            ->when($request->exclude_id, function ($q) use ($request) {
                $q->where('id_peminjaman', '!=', $request->exclude_id);
            })
            ->where('jam_mulai', '<', $request->jam_selesai)
            ->where('jam_selesai', '>', $request->jam_mulai)
            ->when($request->jenis === 'ruangan', function ($q) use ($request) {
                $q->where('id_ruangan', $request->id_ruangan);
            })
            ->when($request->jenis === 'alat', function ($q) use ($request) {
                $q->where('id_alat', $request->id_alat);
            })
            ->exists();

        return response()->json([
            'tersedia' => !$overlap,
            'pesan'    => $overlap
                ? ucfirst($request->jenis) . ' sudah dibooking pada jam tersebut.'
                : 'Slot waktu tersedia.',
        ]);
    }

    public function jadwalkanUlang(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'hari_tanggal_baru' => 'required|date_format:Y-m-d|after_or_equal:today',
            'jam_mulai_baru'    => 'required|date_format:H:i',
            'jam_selesai_baru'  => 'required|date_format:H:i|after:jam_mulai_baru',
            'id_ruangan_baru'   => 'nullable|exists:ruangans,id_ruangan',
            'alasan_kepala'     => 'required|string|max:1000',
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

        // ── 1. Cek ketersediaan (overlap) ───────────────────────────────────
        $overlapQuery = Peminjaman::where('status_persetujuan', '!=', 'dibatalkan')
            ->where('status_persetujuan', '!=', 'ditolak')
            ->where('hari_tanggal', $request->hari_tanggal_baru)
            ->where('id_peminjaman', '!=', $id)
            ->where('jam_mulai', '<', $request->jam_selesai_baru)
            ->where('jam_selesai', '>', $request->jam_mulai_baru);

        if ($peminjaman->id_ruangan || $request->filled('id_ruangan_baru')) {
            $idRuangan = $request->id_ruangan_baru ?? $peminjaman->id_ruangan;
            $overlapQuery->where('id_ruangan', $idRuangan);
        } elseif ($peminjaman->id_alat) {
            $overlapQuery->where('id_alat', $peminjaman->id_alat);
        }

        if ($overlapQuery->exists()) {
            return response()->json([
                'message' => 'Ruangan/alat sudah dibooking pada tanggal & jam tersebut.',
            ], 409);
        }

        try {
            DB::beginTransaction();

            // ── 2. Update jadwal + tetapkan status disetujui oleh kepala ─────
            $peminjaman->hari_tanggal       = $request->hari_tanggal_baru;
            $peminjaman->jam_mulai          = $request->jam_mulai_baru;
            $peminjaman->jam_selesai        = $request->jam_selesai_baru;
            $peminjaman->status_persetujuan = 'disetujui';
            $peminjaman->alasan_kepala      = $request->alasan_kepala;
            $peminjaman->diubah_pada        = Carbon::now();

            if ($peminjaman->id_ruangan && $request->filled('id_ruangan_baru')) {
                $peminjaman->id_ruangan = $request->id_ruangan_baru;
            }

            $peminjaman->save();

            // ── 3. Tetapkan ulang persetujuan agar peminjaman tetap dianggap disetujui oleh kepala ───
            $now = Carbon::now();
            $existingPersetujuans = Persetujuan::where('id_peminjaman', $id)->get();

            if ($existingPersetujuans->isNotEmpty()) {
                foreach ($existingPersetujuans as $persetujuan) {
                    $persetujuan->status_persetujuan = 'disetujui';
                    $persetujuan->updated_at = $now;
                    $persetujuan->save();
                }
            } else {
                $persetujuans = [
                    [
                        'id_peminjaman'         => $id,
                        'id_number_penyetuju' => $peminjaman->id_peminjam,
                        'status_persetujuan'    => 'disetujui',
                        'created_at'            => $now,
                        'updated_at'            => $now,
                    ],
                ];

                Persetujuan::insert($persetujuans);
            }

            // ── 5. Notifikasi ───────────────────────────────────────────────────
            $itemName = $peminjaman->ruangan?->name_ruangan
                ?? $peminjaman->alat?->name_alat
                ?? 'Item';

            // Ke peminjam
            Notification::create([
                'id_number'   => $peminjaman->id_peminjam,
                'type'          => 'menunggu',
                'judul'         => 'Jadwal Diubah — Disetujui Kepala SBUM',
                'pesan'         => "Jadwal peminjaman {$itemName} diubah oleh Kepala SBUM dan langsung disetujui.",
                'peminjaman_id' => $peminjaman->id_peminjaman,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Jadwal berhasil diperbarui dan langsung disetujui oleh Kepala SBUM.',
                'data'    => $peminjaman->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Gagal jadwalkan ulang: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui jadwal.',
                'error'   => $e->getMessage(),
            ], 500);
        }

    }
    private function applyDateFilter($query, Request $request): void
    {
        if ($request->filled('tanggal')) {
            $query->whereDate('hari_tanggal', $request->tanggal);
            return;
        }

        if ($request->filled('tanggal_mulai') || $request->filled('tanggal_selesai')) {
            if ($request->filled('tanggal_mulai')) {
                $query->whereDate('hari_tanggal', '>=', $request->tanggal_mulai);
            }

            if ($request->filled('tanggal_selesai')) {
                $query->whereDate('hari_tanggal', '<=', $request->tanggal_selesai);
            }

            return;
        }

        if ($request->filled('bulan') || $request->filled('tahun')) {
            $bulan = (int) $request->input('bulan', now()->month);
            $tahun = (int) $request->input('tahun', now()->year);

            $query->whereYear('hari_tanggal', $tahun)
                ->whereMonth('hari_tanggal', $bulan);
        }
    }

    private function periodeLabel(Request $request): string
    {
        if ($request->filled('tanggal')) {
            return Carbon::parse($request->tanggal)->translatedFormat('d F Y');
        }

        if ($request->filled('tanggal_mulai') || $request->filled('tanggal_selesai')) {
            $mulai = $request->filled('tanggal_mulai')
                ? Carbon::parse($request->tanggal_mulai)->translatedFormat('d F Y')
                : 'Awal';
            $selesai = $request->filled('tanggal_selesai')
                ? Carbon::parse($request->tanggal_selesai)->translatedFormat('d F Y')
                : 'Akhir';

            return "{$mulai} - {$selesai}";
        }

        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        return Carbon::create()->month($bulan)->translatedFormat('F') . " {$tahun}";
    }

    private function buildRekapQuery(Request $request)
    {
        $request->validate([
            'jenis'          => 'nullable|in:ruangan,alat,semua',
            'status'         => 'nullable|in:menunggu,disetujui,ditolak,dibatalkan',
            'jenis_kegiatan' => 'nullable|string',
            'bulan'          => 'nullable|integer|min:1|max:12',
            'tahun'          => 'nullable|integer|min:2020|max:2100',
            'tanggal'        => 'nullable|date_format:Y-m-d',
            'tanggal_mulai'  => 'nullable|date_format:Y-m-d',
            'tanggal_selesai'=> 'nullable|date_format:Y-m-d|after_or_equal:tanggal_mulai',
        ]);

        $query = Peminjaman::with(['peminjam', 'alat', 'ruangan']);

        $this->applyDateFilter($query, $request);

        if ($request->filled('jenis') && $request->jenis !== 'semua') {
            $request->jenis === 'ruangan'
                ? $query->whereNotNull('id_ruangan')
                : $query->whereNotNull('id_alat');
        }

        if ($request->filled('status')) {
            $query->where('status_persetujuan', $request->status);
        }

        if ($request->filled('jenis_kegiatan')) {
            $query->where('jenis_kegiatan', $request->jenis_kegiatan);
        }

        return $query->orderBy('hari_tanggal')->orderBy('jam_mulai');
    }

    /**
     * Bentuk data rekap: siapa peminjam + ruangan/alat yang dipinjam.
     */
    private function mapRekapData($peminjamans)
    {
        return $peminjamans->map(function ($p) {
            return [
                'id_peminjaman'      => $p->id_peminjaman,
                'name_kegiatan'      => $p->name_kegiatan,
                'jenis_kegiatan'     => $p->jenis_kegiatan,
                'hari_tanggal'       => $p->hari_tanggal?->toDateString(),
                'jam_mulai'          => $p->jam_mulai,
                'jam_selesai'        => $p->jam_selesai,
                'keterangan'         => $p->keterangan,
                'status_persetujuan' => $p->status_persetujuan,
                'jenis'              => $p->id_ruangan ? 'ruangan' : 'alat',

                // Siapa yang meminjam
                'name_peminjam'      => $p->peminjam?->name,
                'unit_peminjam'      => $p->peminjam?->unit ?? $p->peminjam?->jabatan ?? null,

                // Ruangan / alat yang dipinjam
                'name_ruangan'       => $p->ruangan?->name_ruangan,
                'kode_ruangan'       => $p->ruangan?->kode_ruangan,
                'name_alat'          => $p->alat?->name_alat,
                'kode_alat'          => $p->alat?->kode_alat,
            ];
        });
    }

    public function exportPdf(Request $request)
    {
        $peminjamans = $this->buildRekapQuery($request)->get();
        $data        = $this->mapRekapData($peminjamans);
        $periode    = $this->periodeLabel($request);

        $pdf = Pdf::loadView('pdf.rekap-peminjaman', [
            'data'      => $data,
            'periode'   => $periode,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('rekap-peminjaman-' . str($periode)->slug('-') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        $peminjamans = $this->buildRekapQuery($request)->get();
        $data        = $this->mapRekapData($peminjamans);
        $periode    = $this->periodeLabel($request);

        return Excel::download(new RekapPeminjamanExport($data), 'rekap-peminjaman-' . str($periode)->slug('-') . '.xlsx');
    }
}
