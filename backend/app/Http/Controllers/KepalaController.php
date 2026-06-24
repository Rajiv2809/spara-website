<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use Carbon\Carbon;
use App\Models\{Peminjaman, Persetujuan, Notification};

class KepalaController extends Controller
{
    public function getMonitoringPeminjaman(Request $request)
    {
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

            // ── 2. Update jadwal + RESET status ke menunggu ───────────────────
            $peminjaman->hari_tanggal       = $request->hari_tanggal_baru;
            $peminjaman->jam_mulai          = $request->jam_mulai_baru;
            $peminjaman->jam_selesai        = $request->jam_selesai_baru;
            $peminjaman->status_persetujuan = 'menunggu'; // ← RESET KE AWAL
            $peminjaman->alasan_kepala      = $request->alasan_kepala;
            $peminjaman->diubah_pada        = Carbon::now();

            if ($peminjaman->id_ruangan && $request->filled('id_ruangan_baru')) {
                $peminjaman->id_ruangan = $request->id_ruangan_baru;
            }

            $peminjaman->save();

            // ── 3. Ambil data untuk reset persetujuan ─────────────────────────
            // Nomor induk Penanggung Jawab dari persetujuan pertama (id terkecil)
            $pjLama = Persetujuan::where('id_peminjaman', $id)
                ->orderBy('id')
                ->first();

            $nomorIndukPj = $pjLama?->id_number_penyetuju ?? $peminjaman->id_peminjam;

            // Nomor induk PIC dari ruangan/alat yang dipakai (baru atau lama)
            $nomorIndukPic = null;
            if ($peminjaman->id_ruangan || $request->filled('id_ruangan_baru')) {
                $idRuangan = $request->id_ruangan_baru ?? $peminjaman->id_ruangan;
                $ruangan = DB::table('ruangans')->where('id_ruangan', $idRuangan)->first();
                $nomorIndukPic = $ruangan?->id_number_pic;
            } elseif ($peminjaman->id_alat) {
                $alat = DB::table('alats')->where('id_alat', $peminjaman->id_alat)->first();
                $nomorIndukPic = $alat?->id_number_pic;
            }

            // ── 4. Hapus persetujuan lama, buat ulang 3 tahap ──────────────────
            Persetujuan::where('id_peminjaman', $id)->delete();

            $now = Carbon::now();
            $persetujuans = [
                // Tahap 1: Penanggungjawab
                [
                    'id_peminjaman'         => $id,
                    'id_number_penyetuju' => $nomorIndukPj,
                    'status_persetujuan'    => 'menunggu',
                    'created_at'            => $now,
                    'updated_at'            => $now,
                ],
                // Tahap 2: PIC
                [
                    'id_peminjaman'         => $id,
                    'id_number_penyetuju' => $nomorIndukPic,
                    'status_persetujuan'    => 'menunggu',
                    'created_at'            => $now,
                    'updated_at'            => $now,
                ],
                // Tahap 3: Admin SBUM
                [
                    'id_peminjaman'         => $id,
                    'id_number_penyetuju' => null,
                    'status_persetujuan'    => 'menunggu',
                    'created_at'            => $now,
                    'updated_at'            => $now,
                ],
            ];

            Persetujuan::insert($persetujuans);

            // ── 5. Notifikasi ───────────────────────────────────────────────────
            $itemName = $peminjaman->ruangan?->name_ruangan
                ?? $peminjaman->alat?->name_alat
                ?? 'Item';

            // Ke peminjam
            Notification::create([
                'id_number'   => $peminjaman->id_peminjam,
                'type'          => 'menunggu',
                'judul'         => 'Jadwal Diubah — Perlu Persetujuan Ulang',
                'pesan'         => "Jadwal peminjaman {$itemName} diubah oleh Kepala SBUM. Persetujuan direset ke tahap awal.",
                'peminjaman_id' => $peminjaman->id_peminjaman,
            ]);

            // Ke penanggung jawab
            if ($nomorIndukPj) {
                Notification::create([
                    'id_number'   => $nomorIndukPj,
                    'type'          => 'menunggu',
                    'judul'         => 'Persetujuan Ulang Diperlukan',
                    'pesan'         => "Peminjaman {$itemName} dijadwalkan ulang oleh Kepala SBUM dan memerlukan persetujuan Anda kembali.",
                    'peminjaman_id' => $peminjaman->id_peminjaman,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Jadwal berhasil diperbarui. Persetujuan direset ke tahap awal.',
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
}