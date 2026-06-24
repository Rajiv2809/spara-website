<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use Carbon\Carbon;
use App\Models\{loan, Persetujuan, Notification};

class KepalaController extends Controller
{
    public function getMonitoringloan(Request $request)
    {
        $query = loan::with(['peminjam', 'tool', 'room', 'persetujuans'])
            ->orderBy('hari_tanggal', 'asc')
            ->orderBy('jam_mulai', 'asc');

        if ($request->jenis === 'room') {
            $query->whereNotNull('room_id');
        } elseif ($request->jenis === 'tool') {
            $query->whereNotNull('tool_id');
        }

        if ($request->filled('status')) {
            $query->where('status_persetujuan', $request->status);
        } else {
            $query->whereIn('status_persetujuan', ['menunggu', 'disetujui']);
        }

        $loans = $query->get();

        $data = $loans->map(function ($p) {
            return [
                'loan_id'        => $p->loan_id,
                'name_kegiatan'        => $p->name_kegiatan,
                'jenis_kegiatan'       => $p->jenis_kegiatan,
                'hari_tanggal'         => $p->hari_tanggal?->toDateString(),
                'jam_mulai'            => $p->jam_mulai,
                'jam_selesai'          => $p->jam_selesai,
                'keterangan'           => $p->keterangan,
                'status_persetujuan'   => $p->status_persetujuan,
                'alasan_kepala'         => $p->alasan_kepala,
                'dibuat_pada'          => $p->dibuat_pada?->toDateTimeString(),
                'jenis'                => $p->room_id ? 'room' : 'tool',
                'name_peminjam'        => $p->peminjam?->name,
                'id_number_peminjam' => $p->id_peminjam,
                'unit_peminjam'        => $p->peminjam?->unit ?? $p->peminjam?->jabatan ?? null,
                'room_id'           => $p->room_id,
                'room_name'         => $p->room?->room_name,
                'room_code'         => $p->room?->room_code,
                'tool_id'              => $p->tool_id,
                'tool_name'            => $p->tool?->tool_name,
                'tool_code'            => $p->tool?->tool_code,
            ];
        });

        $allActive = loan::whereIn('status_persetujuan', ['menunggu', 'disetujui'])->get();
        $stats = [
            'total'     => $allActive->count(),
            'menunggu'  => $allActive->where('status_persetujuan', 'menunggu')->count(),
            'disetujui' => $allActive->where('status_persetujuan', 'disetujui')->count(),
            'room'   => $allActive->whereNotNull('room_id')->count(),
            'tool'      => $allActive->whereNotNull('tool_id')->count(),
        ];

        return response()->json([
            'data'  => $data,
            'stats' => $stats,
        ]);
    }

    public function batalkanloan(Request $request, $id)
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

        $loan = loan::find($id);

        if (!$loan) {
            return response()->json(['message' => 'loan tidak ditemukan.'], 404);
        }

        if (in_array($loan->status_persetujuan, ['dibatalkan', 'ditolak'])) {
            return response()->json([
                'message' => 'loan sudah dalam status dibatalkan atau ditolak.',
            ], 422);
        }

        $loan->status_persetujuan = 'dibatalkan';
        $loan->alasan_kepala       = $request->alasan_kepala;
        $loan->diubah_pada        = Carbon::now();
        $loan->save();

        Persetujuan::where('loan_id', $id)
            ->where('status_persetujuan', 'menunggu')
            ->update([
                'status_persetujuan' => 'ditolak',
                'updated_at'         => Carbon::now(),
            ]);

        $itemName = $loan->room?->room_name
            ?? $loan->tool?->tool_name
            ?? 'Item';
        Notification::create([
            'id_number'   => $loan->id_peminjam,
            'type'          => 'dibatalkan',
            'judul'         => 'loan Dibatalkan Kepala SBUM',
            'pesan'         => "loan {$itemName} dibatalkan oleh Kepala SBUM. Alasan: {$request->alasan_kepala}.",
            'loan_id' => $loan->loan_id,
        ]);

        return response()->json([
            'message' => 'loan berhasil dibatalkan.',
        ]);
    }

    public function cekKetersediaan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis'        => 'required|in:room,tool',
            'hari_tanggal' => 'required|date_format:Y-m-d',
            'jam_mulai'    => 'required|date_format:H:i',
            'jam_selesai'  => 'required|date_format:H:i|after:jam_mulai',
            'room_id'   => 'required_if:jenis,room|integer|nullable',
            'tool_id'      => 'required_if:jenis,tool|integer|nullable',
            'exclude_id'   => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $overlap = loan::where('status_persetujuan', '!=', 'dibatalkan')
            ->where('status_persetujuan', '!=', 'ditolak')
            ->where('hari_tanggal', $request->hari_tanggal)
            ->when($request->exclude_id, function ($q) use ($request) {
                $q->where('loan_id', '!=', $request->exclude_id);
            })
            ->where('jam_mulai', '<', $request->jam_selesai)
            ->where('jam_selesai', '>', $request->jam_mulai)
            ->when($request->jenis === 'room', function ($q) use ($request) {
                $q->where('room_id', $request->room_id);
            })
            ->when($request->jenis === 'tool', function ($q) use ($request) {
                $q->where('tool_id', $request->tool_id);
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
            'room_id_baru'   => 'nullable|exists:rooms,room_id',
            'alasan_kepala'     => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $loan = loan::find($id);

        if (!$loan) {
            return response()->json(['message' => 'loan tidak ditemukan.'], 404);
        }

        if (in_array($loan->status_persetujuan, ['dibatalkan', 'ditolak'])) {
            return response()->json([
                'message' => 'loan sudah dalam status dibatalkan atau ditolak.',
            ], 422);
        }

        // ── 1. Cek ketersediaan (overlap) ───────────────────────────────────
        $overlapQuery = loan::where('status_persetujuan', '!=', 'dibatalkan')
            ->where('status_persetujuan', '!=', 'ditolak')
            ->where('hari_tanggal', $request->hari_tanggal_baru)
            ->where('loan_id', '!=', $id)
            ->where('jam_mulai', '<', $request->jam_selesai_baru)
            ->where('jam_selesai', '>', $request->jam_mulai_baru);

        if ($loan->room_id || $request->filled('room_id_baru')) {
            $idroom = $request->room_id_baru ?? $loan->room_id;
            $overlapQuery->where('room_id', $idroom);
        } elseif ($loan->tool_id) {
            $overlapQuery->where('tool_id', $loan->tool_id);
        }

        if ($overlapQuery->exists()) {
            return response()->json([
                'message' => 'room/tool sudah dibooking pada tanggal & jam tersebut.',
            ], 409);
        }

        try {
            DB::beginTransaction();

            // ── 2. Update jadwal + RESET status ke menunggu ───────────────────
            $loan->hari_tanggal       = $request->hari_tanggal_baru;
            $loan->jam_mulai          = $request->jam_mulai_baru;
            $loan->jam_selesai        = $request->jam_selesai_baru;
            $loan->status_persetujuan = 'menunggu'; // ← RESET KE AWAL
            $loan->alasan_kepala      = $request->alasan_kepala;
            $loan->diubah_pada        = Carbon::now();

            if ($loan->room_id && $request->filled('room_id_baru')) {
                $loan->room_id = $request->room_id_baru;
            }

            $loan->save();

            // ── 3. Ambil data untuk reset persetujuan ─────────────────────────
            // Nomor induk Penanggung Jawab dari persetujuan pertama (id terkecil)
            $pjLama = Persetujuan::where('loan_id', $id)
                ->orderBy('id')
                ->first();

            $nomorIndukPj = $pjLama?->id_number_penyetuju ?? $loan->id_peminjam;

            // Nomor induk PIC dari room/tool yang dipakai (baru atau lama)
            $nomorIndukPic = null;
            if ($loan->room_id || $request->filled('room_id_baru')) {
                $idroom = $request->room_id_baru ?? $loan->room_id;
                $room = DB::table('rooms')->where('room_id', $idroom)->first();
                $nomorIndukPic = $room?->id_number_pic;
            } elseif ($loan->tool_id) {
                $tool = DB::table('tools')->where('tool_id', $loan->tool_id)->first();
                $nomorIndukPic = $tool?->id_number_pic;
            }

            // ── 4. Hapus persetujuan lama, buat ulang 3 tahap ──────────────────
            Persetujuan::where('loan_id', $id)->delete();

            $now = Carbon::now();
            $persetujuans = [
                // Tahap 1: Penanggungjawab
                [
                    'loan_id'         => $id,
                    'id_number_penyetuju' => $nomorIndukPj,
                    'status_persetujuan'    => 'menunggu',
                    'created_at'            => $now,
                    'updated_at'            => $now,
                ],
                // Tahap 2: PIC
                [
                    'loan_id'         => $id,
                    'id_number_penyetuju' => $nomorIndukPic,
                    'status_persetujuan'    => 'menunggu',
                    'created_at'            => $now,
                    'updated_at'            => $now,
                ],
                // Tahap 3: Admin SBUM
                [
                    'loan_id'         => $id,
                    'id_number_penyetuju' => null,
                    'status_persetujuan'    => 'menunggu',
                    'created_at'            => $now,
                    'updated_at'            => $now,
                ],
            ];

            Persetujuan::insert($persetujuans);

            // ── 5. Notifikasi ───────────────────────────────────────────────────
            $itemName = $loan->room?->room_name
                ?? $loan->tool?->tool_name
                ?? 'Item';

            // Ke peminjam
            Notification::create([
                'id_number'   => $loan->id_peminjam,
                'type'          => 'menunggu',
                'judul'         => 'Jadwal Diubah — Perlu Persetujuan Ulang',
                'pesan'         => "Jadwal loan {$itemName} diubah oleh Kepala SBUM. Persetujuan direset ke tahap awal.",
                'loan_id' => $loan->loan_id,
            ]);

            // Ke penanggung jawab
            if ($nomorIndukPj) {
                Notification::create([
                    'id_number'   => $nomorIndukPj,
                    'type'          => 'menunggu',
                    'judul'         => 'Persetujuan Ulang Diperlukan',
                    'pesan'         => "loan {$itemName} dijadwalkan ulang oleh Kepala SBUM dan memerlukan persetujuan Anda kembali.",
                    'loan_id' => $loan->loan_id,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Jadwal berhasil diperbarui. Persetujuan direset ke tahap awal.',
                'data'    => $loan->fresh(),
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