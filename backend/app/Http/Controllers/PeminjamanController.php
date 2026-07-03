<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use Carbon\Carbon;
use App\Models\{Peminjaman, Persetujuan, Notification};
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
            'name_kegiatan'  => 'required|string|max:255',
            'jenis_kegiatan' => 'required|string|max:255',
            'hari_tanggal'   => 'required|date',
            'jam_mulai'      => 'required|date_format:H:i',
            'jam_selesai'    => 'required|date_format:H:i|after:jam_mulai',
            'keterangan'     => 'nullable|string',
            'id_alat'        => 'nullable|exists:alats,id_alat',
            'id_ruangan'     =>     'nullable|exists:ruangans,id_ruangan',
            'id_number_penanggungjawab' => 'required|exists:users,id_number',
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
            'name_kegiatan'      => $request->name_kegiatan,
            'jenis_kegiatan'     => $request->jenis_kegiatan,
            'hari_tanggal'       => $request->hari_tanggal,
            'jam_mulai'          => $request->jam_mulai,
            'jam_selesai'        => $request->jam_selesai,
            'keterangan'         => $request->keterangan,
            'status_persetujuan' => 'menunggu',
            'id_peminjam'        => $request->user()->id_number,
            'id_alat'            => $request->id_alat,
            'id_ruangan'         => $request->id_ruangan,
            'dibuat_pada'        => Carbon::now(),
            'diubah_pada'        => null,
        ]);

        // ── Ambil id_number PIC dari ruangan / alat ────────────────────────
        $nomorIndukPic = null;
        if ($request->id_ruangan) {
            $ruangan = DB::table('ruangans')
                ->where('id_ruangan', $request->id_ruangan)
                ->first();

            if ($ruangan && $ruangan->id_number_pic) {
                $nomorIndukPic = $ruangan->id_number_pic;
            }
        } elseif ($request->id_alat) {
            $alat = DB::table('alats')
                ->where('id_alat', $request->id_alat)
                ->first();

            if ($alat && $alat->id_number_pic) {
                $nomorIndukPic = $alat->id_number_pic;
            }
        }

        // ── Buat row persetujuan ───────────────────────────────────────────
        $pjSamaDenganPic = $nomorIndukPic
            && $request->id_number_penanggungjawab === $nomorIndukPic;

        $persetujuans = [
            // Row 1 — Penanggung jawab (atau PJ + PIC jika sama)
            [
                'id_peminjaman'         => $peminjaman->id_peminjaman,
                'id_number_penyetuju' => $request->id_number_penanggungjawab,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ],
        ];

        // Row 2 — PIC ruangan (hanya jika berbeda dengan penanggung jawab)
        if (!$pjSamaDenganPic && $nomorIndukPic) {
            $persetujuans[] = [
                'id_peminjaman'         => $peminjaman->id_peminjaman,
                'id_number_penyetuju' => $nomorIndukPic,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ];
        }

        // Row terakhir — Admin (null)
        $persetujuans[] = [
            'id_peminjaman'         => $peminjaman->id_peminjaman,
            'id_number_penyetuju' => null,
            'status_persetujuan'    => 'menunggu',
            'created_at'            => Carbon::now(),
            'updated_at'            => Carbon::now(),
        ];

        Persetujuan::insert($persetujuans);

        // ── Notifikasi ke penanggung jawab ──────────────────────────────────
        $itemName = $peminjaman->ruangan?->name_ruangan
            ?? $peminjaman->alat?->name_alat
            ?? 'Item';
        Notification::create([
            'id_number'   => $request->id_number_penanggungjawab,
            'type'          => 'menunggu',
            'judul'         => 'Peminjaman Baru',
            'pesan'         => "{$itemName} diajukan oleh {$request->user()->name}, perlu persetujuan Anda.",
            'peminjaman_id' => $peminjaman->id_peminjaman,
        ]);

        return response()->json([
            'message'      => 'Peminjaman berhasil diajukan.',
            'peminjaman'   => $peminjaman,
            'persetujuans' => Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)->get(),
        ], 201);
    }

    public function getPenanggungJawab()
    {
        $penanggungJawab = DB::table('users')
            ->whereIn('role', ['lecturer', 'pic'])
            ->select('id_number', 'name')
            ->get();

        return response()->json([
            'penanggung_jawab' => $penanggungJawab,
        ]);
    }
    public function getPeminjaman()
    {
        $peminjaman = Peminjaman::where('id_peminjam', request()->user()->id_number)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'peminjaman' => PeminjamanResource::collection($peminjaman),
        ]);
    }
    public function dashboard()
    {
        $totalAlat = Alat::count();
        $totalRuangan = Ruangan::count();
        $alatDipinjam = Peminjaman::whereNotNull('id_alat')
            ->whereIn('status_persetujuan', ['menunggu', 'disetujui'])
            ->distinct('id_alat')
            ->count('id_alat');
        $ruanganDipinjam = Peminjaman::whereNotNull('id_ruangan')
            ->whereIn('status_persetujuan', ['menunggu', 'disetujui'])
            ->distinct('id_ruangan')
            ->count('id_ruangan');

        $user = request()->user();
        if (in_array($user->role, ['lecturer', 'pic'])) {
            $perluDisetujui = Persetujuan::where('id_number_penyetuju', $user->id_number)
                ->where('status_persetujuan', 'menunggu')
                ->count();
        } elseif ($user->role === 'admin') {
            $perluDisetujui = Persetujuan::whereNull('id_number_penyetuju')
                ->where('status_persetujuan', 'menunggu')
                ->whereRaw('NOT EXISTS (
                    SELECT 1 FROM persetujuans AS earlier
                    WHERE earlier.id_peminjaman = persetujuans.id_peminjaman
                      AND earlier.id < persetujuans.id
                      AND earlier.status_persetujuan != "disetujui"
                )')
                ->count();
        } else {
            $perluDisetujui = Peminjaman::where('id_peminjam', $user->id_number)
                ->where('status_persetujuan', 'menunggu')
                ->count();
        }

        return response()->json([
            'total_alat'       => $totalAlat,
            'total_ruangan'    => $totalRuangan,
            'alat_dipinjam'    => $alatDipinjam,
            'ruangan_dipinjam' => $ruanganDipinjam,
            'perlu_disetujui'  => $perluDisetujui,
        ]);
    }

    public function getPersetujuan()
    {
        $persetujuan = Persetujuan::where(function ($q) {
            $q->where('id_number_penyetuju', request()->user()->id_number);
            if (request()->user()->role === 'admin') {
                $q->orWhereNull('id_number_penyetuju');
            }
        })
            ->whereRaw('NOT EXISTS (
                SELECT 1 FROM persetujuans AS earlier
                WHERE earlier.id_peminjaman = persetujuans.id_peminjaman
                  AND earlier.id < persetujuans.id
                  AND earlier.status_persetujuan != "disetujui"
            )')
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
            $q->where('id_number_penyetuju', request()->user()->id_number);
            if (request()->user()->role === 'admin') {
                $q->orWhereNull('id_number_penyetuju');
            }
        })
            ->whereRaw('NOT EXISTS (
                SELECT 1 FROM persetujuans AS earlier
                WHERE earlier.id_peminjaman = persetujuans.id_peminjaman
                  AND earlier.id < persetujuans.id
                  AND earlier.status_persetujuan != "disetujui"
            )')
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

        // ── Notifikasi ─────────────────────────────────────────────────────
        $itemName = $peminjaman->ruangan?->name_ruangan
            ?? $peminjaman->alat?->name_alat
            ?? 'Item';
        $approverName = $persetujuan->user?->name ?? auth()->user()->name;

        // Cek apakah semua tahap sudah disetujui
        $semuaDisetujui = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
            ->where('status_persetujuan', '!=', 'disetujui')
            ->doesntExist();

        if ($semuaDisetujui) {
            $peminjaman->status_persetujuan = 'disetujui';
            $peminjaman->save();

            // Notif ke peminjam
            Notification::create([
                'id_number'   => $peminjaman->id_peminjam,
                'type'          => 'disetujui',
                'judul'         => 'Peminjaman Disetujui',
                'pesan'         => "Peminjaman {$itemName} telah disetujui oleh semua pihak.",
                'peminjaman_id' => $peminjaman->id_peminjaman,
            ]);
        } else {
            // Notif ke penyetuju selanjutnya
            $next = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
                ->where('id', '>', $persetujuan->id)
                ->orderBy('id')
                ->first();

            if ($next) {
                if ($next->id_number_penyetuju) {
                    Notification::create([
                        'id_number'   => $next->id_number_penyetuju,
                        'type'          => 'menunggu',
                        'judul'         => 'Perlu Persetujuan',
                        'pesan'         => "{$itemName} telah disetujui oleh {$approverName}, menunggu persetujuan Anda.",
                        'peminjaman_id' => $peminjaman->id_peminjaman,
                    ]);
                } else {
                    // Admin — notif semua admin
                    $admins = \App\Models\User::where('role', 'admin')->pluck('id_number');
                    foreach ($admins as $ni) {
                        Notification::create([
                            'id_number'   => $ni,
                            'type'          => 'menunggu',
                            'judul'         => 'Perlu Persetujuan Admin',
                            'pesan'         => "{$itemName} telah disetujui oleh {$approverName}, menunggu persetujuan Admin.",
                            'peminjaman_id' => $peminjaman->id_peminjaman,
                        ]);
                    }
                }
            }
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

        // ── Notifikasi ke peminjam ──────────────────────────────────────────
        $itemName = $peminjaman?->ruangan?->name_ruangan
            ?? $peminjaman?->alat?->name_alat
            ?? 'Item';
        $penolak = auth()->user()->name;
        Notification::create([
            'id_number'   => $peminjaman->id_peminjam,
            'type'          => 'ditolak',
            'judul'         => 'Peminjaman Ditolak',
            'pesan'         => "Peminjaman {$itemName} ditolak oleh {$penolak}.",
            'peminjaman_id' => $peminjaman->id_peminjaman,
        ]);

        return response()->json([
            'message' => 'Peminjaman ditolak.',
            'persetujuan' => new PersetujuanResource($persetujuan),
        ]);
    }
    public function getAllPeminjaman()
    {
        $riwayat = Peminjaman::with(['persetujuans', 'ruangan', 'alat', 'peminjam'])
            ->where('id_peminjam', request()->user()->id_number)
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
            ->where('id_peminjam', request()->user()->id_number)
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

        // ── Notifikasi ke PJ, PIC, Admin ────────────────────────────────────
        $itemName = $peminjaman->ruangan?->name_ruangan
            ?? $peminjaman->alat?->name_alat
            ?? 'Item';
        $persetujuans = Persetujuan::where('id_peminjaman', $id)->get();

        foreach ($persetujuans as $ps) {
            $notifTargets = [];
            if ($ps->id_number_penyetuju) {
                $notifTargets[] = $ps->id_number_penyetuju;
            } else {
                $admins = \App\Models\User::where('role', 'admin')->pluck('id_number');
                $notifTargets = array_merge($notifTargets, $admins->toArray());
            }

            foreach (array_unique($notifTargets) as $ni) {
                // Jangan notif ke peminjam sendiri
                if ((string) $ni === (string) $peminjaman->id_peminjam) continue;

                Notification::create([
                    'id_number'   => $ni,
                    'type'          => 'dibatalkan',
                    'judul'         => 'Peminjaman Dibatalkan',
                    'pesan'         => "Peminjaman {$itemName} dibatalkan oleh peminjam.",
                    'peminjaman_id' => $peminjaman->id_peminjaman,
                ]);
            }
        }

        return response()->json(['message' => 'Peminjaman berhasil dibatalkan.']);
    }

    public function riwayat()
    {
        $user = request()->user();

        $riwayat = Peminjaman::with(['persetujuans', 'ruangan', 'alat', 'peminjam'])
            ->where('id_peminjam', $user->id_number)
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

        $riwayat = Peminjaman::with(['persetujuans', 'ruangan', 'alat', 'peminjam'])
            ->where('id_peminjam', $nomor)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Riwayat debug berhasil diambil.',
            'data' => PeminjamanResource::collection($riwayat),
        ]);
    }
    /**
     * GET /api/peminjaman-rekapitulasi
     *
     * Query params:
     *  - filter    : 'seminggu' | 'sebulan' | (opsional, default tampil semua)
     *  - tanggal   : 'YYYY-MM-DD' — titik acuan untuk seminggu/sebulan,
     *                atau filter tepat satu hari jika tanpa `filter`
     *  - dari      : 'YYYY-MM-DD' — range manual (bersama `sampai`)
     *  - sampai    : 'YYYY-MM-DD' — range manual (bersama `dari`)
     *  - status    : 'menunggu' | 'disetujui' | 'ditolak' (opsional)
     *  - per_page  : integer (default 15, max 100)
     */
    public function getPeminjamanRekapitulasi(Request $request)
    {
        $request->validate([
            'filter'   => 'nullable|in:seminggu,sebulan',
            'tanggal'  => 'nullable|date_format:Y-m-d',
            'dari'     => 'nullable|date_format:Y-m-d|required_with:sampai',
            'sampai'   => 'nullable|date_format:Y-m-d|required_with:dari|after_or_equal:dari',
            'status'   => 'nullable|in:menunggu,disetujui,ditolak',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Peminjaman::with(['peminjam', 'alat', 'ruangan'])
            ->orderBy('hari_tanggal', 'desc')
            ->orderBy('jam_mulai', 'asc');

        // ── Logika filter tanggal ──────────────────────────────────────────
        $acuan = $request->filled('tanggal')
            ? Carbon::parse($request->tanggal)
            : Carbon::today();

        if ($request->filled('filter')) {
            match ($request->filter) {
                'seminggu' => $query->whereBetween('hari_tanggal', [
                    $acuan->copy()->startOfWeek(Carbon::MONDAY)->toDateString(),
                    $acuan->copy()->endOfWeek(Carbon::SUNDAY)->toDateString(),
                ]),
                'sebulan'  => $query->whereBetween('hari_tanggal', [
                    $acuan->copy()->startOfMonth()->toDateString(),
                    $acuan->copy()->endOfMonth()->toDateString(),
                ]),
            };
        } elseif ($request->filled('dari') && $request->filled('sampai')) {
            // Range manual
            $query->whereBetween('hari_tanggal', [
                $request->dari,
                $request->sampai,
            ]);
        } elseif ($request->filled('tanggal')) {
            // Tepat satu hari
            $query->whereDate('hari_tanggal', $request->tanggal);
        }
        // Tanpa parameter → tampil semua (tidak difilter)

        // ── Filter status (opsional) ───────────────────────────────────────
        if ($request->filled('status')) {
            $query->where('status_persetujuan', $request->status);
        }

        $perPage = min((int) $request->input('per_page', 15), 100);
        $data    = $query->paginate($perPage);

        // ── Tambahkan meta rentang ke response ────────────────────────────
        $meta = $this->buildMeta($request, $acuan);

        return response()->json([
            'success' => true,
            'meta'    => $meta,
            'data'    => $data,
        ]);
    }

    // ── Helper: bangun info rentang untuk response ─────────────────────────
    private function buildMeta(Request $request, Carbon $acuan): array
    {
        $meta = ['filter_aktif' => $request->input('filter', 'custom')];

        if ($request->filled('filter')) {
            $meta += match ($request->filter) {
                'seminggu' => [
                    'dari'   => $acuan->copy()->startOfWeek(Carbon::MONDAY)->toDateString(),
                    'sampai' => $acuan->copy()->endOfWeek(Carbon::SUNDAY)->toDateString(),
                ],
                'sebulan'  => [
                    'dari'   => $acuan->copy()->startOfMonth()->toDateString(),
                    'sampai' => $acuan->copy()->endOfMonth()->toDateString(),
                ],
            };
        } elseif ($request->filled('dari')) {
            $meta += ['dari' => $request->dari, 'sampai' => $request->sampai];
        } elseif ($request->filled('tanggal')) {
            $meta += ['tanggal' => $request->tanggal];
        }

        return $meta;
    }
}
