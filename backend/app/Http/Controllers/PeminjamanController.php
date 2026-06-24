<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use Carbon\Carbon;
use App\Models\{loan, Persetujuan, Notification};
use App\Http\Resources\loanResource;
use App\Http\Resources\PersetujuanResource;
use App\Http\Resources\ListPersetujuanResource;
use App\Models\room;
use App\Models\tool;

class loanController extends Controller
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
            'tool_id'        => 'nullable|exists:tools,tool_id',
            'room_id'     =>     'nullable|exists:rooms,room_id',
            'id_number_penanggungjawab' => 'required|exists:users,id_number',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Cek konflik jadwal room — hanya blokir jika sudah disetujui 3 tahap
        if ($request->room_id && $request->jam_mulai && $request->jam_selesai) {
            $konflik = loan::where('room_id', $request->room_id)
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
                    'message' => 'room sudah dibooking pada jam tersebut.',
                ], 409);
            }
        }

        // Cek konflik jadwal tool
        if ($request->tool_id && $request->jam_mulai && $request->jam_selesai) {
            $konfliktool = loan::where('tool_id', $request->tool_id)
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

            if ($konfliktool) {
                return response()->json([
                    'message' => 'tool sudah dipinjam pada jam tersebut.',
                ], 409);
            }
        }

        // Buat loan
        $loan = loan::create([
            'name_kegiatan'      => $request->name_kegiatan,
            'jenis_kegiatan'     => $request->jenis_kegiatan,
            'hari_tanggal'       => $request->hari_tanggal,
            'jam_mulai'          => $request->jam_mulai,
            'jam_selesai'        => $request->jam_selesai,
            'keterangan'         => $request->keterangan,
            'status_persetujuan' => 'menunggu',
            'id_peminjam'        => $request->user()->id_number,
            'tool_id'            => $request->tool_id,
            'room_id'         => $request->room_id,
            'dibuat_pada'        => Carbon::now(),
            'diubah_pada'        => null,
        ]);

        // ── Ambil id_number PIC dari room / tool ────────────────────────
        $nomorIndukPic = null;
        if ($request->room_id) {
            $room = DB::table('rooms')
                ->where('room_id', $request->room_id)
                ->first();

            if ($room && $room->id_number_pic) {
                $nomorIndukPic = $room->id_number_pic;
            }
        } elseif ($request->tool_id) {
            $tool = DB::table('tools')
                ->where('tool_id', $request->tool_id)
                ->first();

            if ($tool && $tool->id_number_pic) {
                $nomorIndukPic = $tool->id_number_pic;
            }
        }

        // ── Buat 3 row persetujuan ───────────────────────────────────────────
        $persetujuans = [
            // Row 1 — Penanggung jawab (user yang membuat loan)
            [
                'loan_id'         => $loan->loan_id,
                'id_number_penyetuju' => $request->id_number_penanggungjawab,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ],
            // Row 2 — PIC room
            [
                'loan_id'         => $loan->loan_id,
                'id_number_penyetuju' => $nomorIndukPic,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ],
            // Row 3 — Admin (null)
            [
                'loan_id'         => $loan->loan_id,
                'id_number_penyetuju' => null,
                'status_persetujuan'    => 'menunggu',
                'created_at'            => Carbon::now(),
                'updated_at'            => Carbon::now(),
            ],
        ];

        Persetujuan::insert($persetujuans);

        // ── Notifikasi ke penanggung jawab ──────────────────────────────────
        $itemName = $loan->room?->room_name
            ?? $loan->tool?->tool_name
            ?? 'Item';
        Notification::create([
            'id_number'   => $request->id_number_penanggungjawab,
            'type'          => 'menunggu',
            'judul'         => 'loan Baru',
            'pesan'         => "{$itemName} diajukan oleh {$request->user()->name}, perlu persetujuan Anda.",
            'loan_id' => $loan->loan_id,
        ]);

        return response()->json([
            'message'      => 'loan berhasil diajukan.',
            'loan'   => $loan,
            'persetujuans' => Persetujuan::where('loan_id', $loan->loan_id)->get(),
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
    public function getloan()
    {
        $loan = loan::where('id_peminjam', request()->user()->id_number)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'loan' => loanResource::collection($loan),
        ]);
    }
    public function dashboard()
    {
        $totaltool = tool::count();
        $totalroom = room::count();
        $toolDipinjam = loan::whereNotNull('tool_id')
            ->whereIn('status_persetujuan', ['menunggu', 'disetujui'])
            ->distinct('tool_id')
            ->count('tool_id');
        $roomDipinjam = loan::whereNotNull('room_id')
            ->whereIn('status_persetujuan', ['menunggu', 'disetujui'])
            ->distinct('room_id')
            ->count('room_id');

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
                    WHERE earlier.loan_id = persetujuans.loan_id
                      AND earlier.id < persetujuans.id
                      AND earlier.status_persetujuan != "disetujui"
                )')
                ->count();
        } else {
            $perluDisetujui = loan::where('id_peminjam', $user->id_number)
                ->where('status_persetujuan', 'menunggu')
                ->count();
        }

        return response()->json([
            'total_tool'       => $totaltool,
            'total_room'    => $totalroom,
            'tool_dipinjam'    => $toolDipinjam,
            'room_dipinjam' => $roomDipinjam,
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
                WHERE earlier.loan_id = persetujuans.loan_id
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
                WHERE earlier.loan_id = persetujuans.loan_id
                  AND earlier.id < persetujuans.id
                  AND earlier.status_persetujuan != "disetujui"
            )')
            ->latest()
            ->get();

        return response()->json([
            'persetujuan_list' => ListPersetujuanResource::collection($persetujuanList),
        ]);
    }

    public function setujuloan($id)
    {
        $persetujuan = Persetujuan::find($id);

        if (!$persetujuan) {
            return response()->json(['message' => 'Persetujuan tidak ditemukan.'], 404);
        }

        $loan = loan::with('persetujuans')->find($persetujuan->loan_id);
        if (!$loan) {
            return response()->json(['message' => 'loan tidak ditemukan.'], 404);
        }

        if ($loan->status_persetujuan === 'ditolak') {
            return response()->json(['message' => 'loan sudah ditolak.'], 422);
        }

        if ($loan->status_persetujuan === 'disetujui') {
            return response()->json(['message' => 'loan sudah disetujui sebelumnya.'], 422);
        }

        // Cek urutan persetujuan (berdasarkan id)
        $allPersetujuan = $loan->persetujuans->sortBy('id');
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
        $itemName = $loan->room?->room_name
            ?? $loan->tool?->tool_name
            ?? 'Item';
        $approverName = $persetujuan->user?->name ?? auth()->user()->name;

        // Cek apakah semua tahap sudah disetujui
        $semuaDisetujui = Persetujuan::where('loan_id', $loan->loan_id)
            ->where('status_persetujuan', '!=', 'disetujui')
            ->doesntExist();

        if ($semuaDisetujui) {
            $loan->status_persetujuan = 'disetujui';
            $loan->save();

            // Notif ke peminjam
            Notification::create([
                'id_number'   => $loan->id_peminjam,
                'type'          => 'disetujui',
                'judul'         => 'loan Disetujui',
                'pesan'         => "loan {$itemName} telah disetujui oleh semua pihak.",
                'loan_id' => $loan->loan_id,
            ]);
        } else {
            // Notif ke penyetuju selanjutnya
            $next = Persetujuan::where('loan_id', $loan->loan_id)
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
                        'loan_id' => $loan->loan_id,
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
                            'loan_id' => $loan->loan_id,
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'message' => 'loan disetujui.',
            'persetujuan' => new PersetujuanResource($persetujuan),
        ]);
    }

    public function tolakloan($id)
    {
        $persetujuan = Persetujuan::find($id);

        if (!$persetujuan) {
            return response()->json(['message' => 'Persetujuan tidak ditemukan.'], 404);
        }

        $loan = loan::find($persetujuan->loan_id);

        $persetujuan->status_persetujuan = 'ditolak';
        $persetujuan->updated_at = Carbon::now();
        $persetujuan->save();

        // Kalau ada yang tolak, loan langsung ditolak
        if ($loan && $loan->status_persetujuan !== 'ditolak') {
            $loan->status_persetujuan = 'ditolak';
            $loan->save();
        }

        // ── Notifikasi ke peminjam ──────────────────────────────────────────
        $itemName = $loan?->room?->room_name
            ?? $loan?->tool?->tool_name
            ?? 'Item';
        $penolak = auth()->user()->name;
        Notification::create([
            'id_number'   => $loan->id_peminjam,
            'type'          => 'ditolak',
            'judul'         => 'loan Ditolak',
            'pesan'         => "loan {$itemName} ditolak oleh {$penolak}.",
            'loan_id' => $loan->loan_id,
        ]);

        return response()->json([
            'message' => 'loan ditolak.',
            'persetujuan' => new PersetujuanResource($persetujuan),
        ]);
    }
    public function getAllloan()
    {
        $riwayat = loan::with(['persetujuans', 'room', 'tool', 'peminjam'])
            ->where('id_peminjam', request()->user()->id_number)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Riwayat loan berhasil diambil.',
            'data' => loanResource::collection($riwayat),
        ]);
    }

    public function cancelloan($id)
    {
        $loan = loan::where('loan_id', $id)
            ->where('id_peminjam', request()->user()->id_number)
            ->first();

        if (!$loan) {
            return response()->json(['message' => 'loan tidak ditemukan.'], 404);
        }

        if ($loan->status_persetujuan !== 'menunggu') {
            return response()->json(['message' => 'Hanya loan dengan status menunggu yang dapat dibatalkan.'], 422);
        }

        $loan->status_persetujuan = 'dibatalkan';
        $loan->save();

        Persetujuan::where('loan_id', $id)
            ->where('status_persetujuan', 'menunggu')
            ->update(['status_persetujuan' => 'ditolak']);

        // ── Notifikasi ke PJ, PIC, Admin ────────────────────────────────────
        $itemName = $loan->room?->room_name
            ?? $loan->tool?->tool_name
            ?? 'Item';
        $persetujuans = Persetujuan::where('loan_id', $id)->get();

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
                if ((string) $ni === (string) $loan->id_peminjam) continue;

                Notification::create([
                    'id_number'   => $ni,
                    'type'          => 'dibatalkan',
                    'judul'         => 'loan Dibatalkan',
                    'pesan'         => "loan {$itemName} dibatalkan oleh peminjam.",
                    'loan_id' => $loan->loan_id,
                ]);
            }
        }

        return response()->json(['message' => 'loan berhasil dibatalkan.']);
    }

    public function riwayat()
    {
        $user = request()->user();

        $riwayat = loan::with(['persetujuans', 'room', 'tool', 'peminjam'])
            ->where('id_peminjam', $user->id_number)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Riwayat loan berhasil diambil.',
            'data' => loanResource::collection($riwayat),
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

        $riwayat = loan::with(['persetujuans', 'room', 'tool', 'peminjam'])
            ->where('id_peminjam', $nomor)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return response()->json([
            'message' => 'Riwayat debug berhasil diambil.',
            'data' => loanResource::collection($riwayat),
        ]);
    }
    /**
     * GET /api/loan-rekapitulasi
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
    public function getloanRekapitulasi(Request $request)
    {
        $request->validate([
            'filter'   => 'nullable|in:seminggu,sebulan',
            'tanggal'  => 'nullable|date_format:Y-m-d',
            'dari'     => 'nullable|date_format:Y-m-d|required_with:sampai',
            'sampai'   => 'nullable|date_format:Y-m-d|required_with:dari|after_or_equal:dari',
            'status'   => 'nullable|in:menunggu,disetujui,ditolak',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = loan::with(['peminjam', 'tool', 'room'])
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
