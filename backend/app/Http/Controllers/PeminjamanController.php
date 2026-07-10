<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator, Mail, Log};
use Carbon\Carbon;
use App\Models\{Peminjaman, Persetujuan, Notification, User};
use App\Http\Resources\PeminjamanResource;
use App\Http\Resources\PersetujuanResource;
use App\Http\Resources\ListPersetujuanResource;
use App\Models\Ruangan;
use App\Models\Alat;
use App\Mail\ApprovalRequestMail;
use App\Mail\PeminjamanSelesaiMail;
use App\Mail\PersetujuanDitolakMail;
use App\Http\Controllers\ApprovalTokenController;

class PeminjamanController extends Controller
{
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name_kegiatan'             => 'required|string|max:255',
            'jenis_kegiatan'            => 'required|string|max:255',
            // tanggal_mulai & tanggal_selesai untuk multi-hari
            // hari_tanggal tetap wajib (= tanggal_mulai) agar backward-compatible
            'hari_tanggal'              => 'required|date',
            'tanggal_mulai'             => 'nullable|date|after_or_equal:today',
            'tanggal_selesai'           => 'nullable|date|after_or_equal:tanggal_mulai',
            'jam_mulai'                 => 'required|date_format:H:i',
            'jam_selesai'               => 'required|date_format:H:i|after:jam_mulai',
            'keterangan'                => 'nullable|string',
            'id_alat'                   => 'nullable|exists:alats,id_alat',
            'id_ruangan'                => 'nullable|exists:ruangans,id_ruangan',
            'id_number_penanggungjawab' => 'required|exists:users,id_number',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // ── Normalkan rentang tanggal ──────────────────────────────────────
        $tanggalMulai   = $request->tanggal_mulai   ?? $request->hari_tanggal;
        $tanggalSelesai = $request->tanggal_selesai ?? $request->hari_tanggal;

        // Validasi ekstra: tanggal_selesai tidak boleh sebelum tanggal_mulai
        if ($tanggalSelesai < $tanggalMulai) {
            return response()->json([
                'message' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            ], 422);
        }

        // Hitung semua tanggal dalam rentang
        $allDates = [];
        $current  = Carbon::parse($tanggalMulai);
        $end      = Carbon::parse($tanggalSelesai);
        while ($current->lte($end)) {
            $allDates[] = $current->toDateString();
            $current->addDay();
        }

        // Batasi maksimal 30 hari
        if (count($allDates) > 30) {
            return response()->json([
                'message' => 'Peminjaman maksimal 30 hari sekaligus.',
            ], 422);
        }

        // ── Cek konflik ruangan di setiap hari dalam rentang ──────────────
        if ($request->id_ruangan) {
            foreach ($allDates as $tgl) {
                $konflik = Peminjaman::where('id_ruangan', $request->id_ruangan)
                    ->where(function ($q) use ($tgl) {
                        // peminjaman yang overlap secara tanggal
                        $q->where('hari_tanggal', $tgl)
                          ->orWhere(function ($q2) use ($tgl) {
                              $q2->where('tanggal_mulai', '<=', $tgl)
                                 ->where('tanggal_selesai', '>=', $tgl);
                          });
                    })
                    ->whereNotIn('status_persetujuan', ['ditolak', 'dibatalkan'])
                    ->where(function ($query) use ($request) {
                        $query->where('jam_mulai', '<', $request->jam_selesai)
                              ->where('jam_selesai', '>', $request->jam_mulai);
                    })
                    ->whereDoesntHave('persetujuans', fn ($q) =>
                        $q->where('status_persetujuan', '!=', 'disetujui')
                    )
                    ->whereHas('persetujuans')
                    ->exists();

                if ($konflik) {
                    return response()->json([
                        'message' => "Ruangan sudah dibooking pada tanggal {$tgl} jam {$request->jam_mulai}–{$request->jam_selesai}.",
                    ], 409);
                }
            }
        }

        // ── Cek konflik alat di setiap hari dalam rentang ─────────────────
        if ($request->id_alat) {
            foreach ($allDates as $tgl) {
                $konflikAlat = Peminjaman::where('id_alat', $request->id_alat)
                    ->where(function ($q) use ($tgl) {
                        $q->where('hari_tanggal', $tgl)
                          ->orWhere(function ($q2) use ($tgl) {
                              $q2->where('tanggal_mulai', '<=', $tgl)
                                 ->where('tanggal_selesai', '>=', $tgl);
                          });
                    })
                    ->whereNotIn('status_persetujuan', ['ditolak', 'dibatalkan'])
                    ->where(function ($query) use ($request) {
                        $query->where('jam_mulai', '<', $request->jam_selesai)
                              ->where('jam_selesai', '>', $request->jam_mulai);
                    })
                    ->exists();

                if ($konflikAlat) {
                    return response()->json([
                        'message' => "Alat sudah dipinjam pada tanggal {$tgl} jam {$request->jam_mulai}–{$request->jam_selesai}.",
                    ], 409);
                }
            }
        }

        // ── Buat peminjaman ───────────────────────────────────────────────
        $peminjaman = Peminjaman::create([
            'name_kegiatan'      => $request->name_kegiatan,
            'jenis_kegiatan'     => $request->jenis_kegiatan,
            'hari_tanggal'       => $tanggalMulai,   // backward-compat
            'tanggal_mulai'      => $tanggalMulai,
            'tanggal_selesai'    => $tanggalSelesai,
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

        // ── Ambil row pertama & generate approval token ───────────────────
        $persetujuanPertama = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
            ->orderBy('id')
            ->first();

        $tokenPertama = ApprovalTokenController::generateToken($persetujuanPertama);

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

        // ── Email ke penanggung jawab (tahap pertama) ───────────────────────
        $penanggungJawab = User::where('id_number', $request->id_number_penanggungjawab)->first();
        if ($penanggungJawab?->email) {
            try {
                Mail::to($penanggungJawab->email)->send(new ApprovalRequestMail(
                    namaApprover:  $penanggungJawab->name,
                    namaPeminjam:  $request->user()->name,
                    itemName:      $itemName,
                    namaKegiatan:  $peminjaman->name_kegiatan,
                    tanggal:       \Carbon\Carbon::parse($peminjaman->hari_tanggal)->translatedFormat('l, d F Y'),
                    jamMulai:      $peminjaman->jam_mulai,
                    jamSelesai:    $peminjaman->jam_selesai,
                    peran:         'Penanggung Jawab',
                    linkSetujui:   url("/api/approve/{$tokenPertama}"),
                    linkTolak:     url("/api/tolak/{$tokenPertama}"),
                ));
            } catch (\Throwable $e) {
                Log::warning('Gagal mengirim email approval ke PJ', [
                    'to'        => $penanggungJawab->email,
                    'exception' => $e->getMessage(),
                ]);
            }
        }

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

        // ── Info dasar ─────────────────────────────────────────────────────
        $itemName     = $peminjaman->ruangan?->name_ruangan ?? $peminjaman->alat?->name_alat ?? 'Item';
        $approverName = optional($persetujuan->user)->name ?? auth()->user()?->name ?? 'Sistem';
        $frontendUrl  = rtrim(env('FRONTEND_URL', env('APP_URL')), '/');

        $tanggalFormatted = \Carbon\Carbon::parse($peminjaman->hari_tanggal)->translatedFormat('l, d F Y');

        // ── Cek apakah semua tahap sudah disetujui ─────────────────────────
        $semuaDisetujui = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
            ->where('status_persetujuan', '!=', 'disetujui')
            ->doesntExist();

        if ($semuaDisetujui) {
            // ── Semua selesai: update status & kirim email ke peminjam ────
            $peminjaman->status_persetujuan = 'disetujui';
            $peminjaman->save();

            Notification::create([
                'id_number'     => $peminjaman->id_peminjam,
                'type'          => 'disetujui',
                'judul'         => 'Peminjaman Disetujui ✅',
                'pesan'         => "Peminjaman {$itemName} telah disetujui oleh semua pihak dan siap digunakan.",
                'peminjaman_id' => $peminjaman->id_peminjaman,
            ]);

            $peminjamUser = User::where('id_number', $peminjaman->id_peminjam)->first();
            if ($peminjamUser?->email) {
                try {
                    Mail::to($peminjamUser->email)->send(new PeminjamanSelesaiMail(
                        namaPeminjam: $peminjamUser->name,
                        itemName:     $itemName,
                        link:         $frontendUrl . '/riwayat',
                    ));
                } catch (\Throwable $e) {
                    Log::warning('Gagal mengirim email peminjaman selesai', [
                        'to' => $peminjamUser->email, 'exception' => $e->getMessage(),
                    ]);
                }
            }
        } else {
            // ── Masih ada tahap berikutnya — kirim notifikasi progress ke peminjam ──
            Notification::create([
                'id_number'     => $peminjaman->id_peminjam,
                'type'          => 'progress',
                'judul'         => 'Persetujuan Diproses',
                'pesan'         => "{$itemName} telah disetujui oleh {$approverName}. Menunggu persetujuan tahap berikutnya.",
                'peminjaman_id' => $peminjaman->id_peminjaman,
            ]);
            // ── Masih ada tahap berikutnya: kirim email approval ke approver berikutnya ──
            $next = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
                ->where('id', '>', $persetujuan->id)
                ->orderBy('id')
                ->first();

            if ($next) {
                // Generate token untuk approver berikutnya
                $nextToken = ApprovalTokenController::generateToken($next);

                if ($next->id_number_penyetuju) {
                    // ── Approver berikutnya adalah PIC ────────────────────
                    $nextUser = User::where('id_number', $next->id_number_penyetuju)->first();

                    Notification::create([
                        'id_number'     => $next->id_number_penyetuju,
                        'type'          => 'menunggu',
                        'judul'         => 'Perlu Persetujuan',
                        'pesan'         => "{$itemName} telah disetujui oleh {$approverName}, menunggu persetujuan Anda.",
                        'peminjaman_id' => $peminjaman->id_peminjaman,
                    ]);

                    if ($nextUser?->email) {
                        $peranNext = match ($nextUser->role) {
                            'pic'   => 'PIC',
                            'admin' => 'Admin',
                            default => ucfirst($nextUser->role),
                        };
                        try {
                            Mail::to($nextUser->email)->send(new ApprovalRequestMail(
                                namaApprover: $nextUser->name,
                                namaPeminjam: $peminjaman->peminjam?->name ?? 'Peminjam',
                                itemName:     $itemName,
                                namaKegiatan: $peminjaman->name_kegiatan,
                                tanggal:      $tanggalFormatted,
                                jamMulai:     $peminjaman->jam_mulai,
                                jamSelesai:   $peminjaman->jam_selesai,
                                peran:        $peranNext,
                                linkSetujui:  url("/api/approve/{$nextToken}"),
                                linkTolak:    url("/api/tolak/{$nextToken}"),
                            ));
                        } catch (\Throwable $e) {
                            Log::warning('Gagal mengirim email approval ke PIC', [
                                'to' => $nextUser->email, 'exception' => $e->getMessage(),
                            ]);
                        }
                    }
                } else {
                    // ── Approver berikutnya adalah Admin (semua admin) ────
                    $admins = User::where('role', 'admin')->get();
                    foreach ($admins as $adminUser) {
                        Notification::create([
                            'id_number'     => $adminUser->id_number,
                            'type'          => 'menunggu',
                            'judul'         => 'Perlu Persetujuan Admin',
                            'pesan'         => "{$itemName} telah disetujui oleh {$approverName}, menunggu persetujuan Admin.",
                            'peminjaman_id' => $peminjaman->id_peminjaman,
                        ]);

                        if ($adminUser->email) {
                            try {
                                Mail::to($adminUser->email)->send(new ApprovalRequestMail(
                                    namaApprover: $adminUser->name,
                                    namaPeminjam: $peminjaman->peminjam?->name ?? 'Peminjam',
                                    itemName:     $itemName,
                                    namaKegiatan: $peminjaman->name_kegiatan,
                                    tanggal:      $tanggalFormatted,
                                    jamMulai:     $peminjaman->jam_mulai,
                                    jamSelesai:   $peminjaman->jam_selesai,
                                    peran:        'Admin',
                                    linkSetujui:  url("/api/approve/{$nextToken}"),
                                    linkTolak:    url("/api/tolak/{$nextToken}"),
                                ));
                            } catch (\Throwable $e) {
                                Log::warning('Gagal mengirim email approval ke admin', [
                                    'to' => $adminUser->email, 'exception' => $e->getMessage(),
                                ]);
                            }
                        }
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
        $penolak = auth()->user()?->name ?? 'Sistem';
        Notification::create([
            'id_number'   => $peminjaman->id_peminjam,
            'type'          => 'ditolak',
            'judul'         => 'Peminjaman Ditolak',
            'pesan'         => "Peminjaman {$itemName} ditolak oleh {$penolak}.",
            'peminjaman_id' => $peminjaman->id_peminjaman,
        ]);

        // ── Email penolakan ke peminjam ────────────────────────────────────
        $peminjamUser = User::where('id_number', $peminjaman->id_peminjam)->first();
        if ($peminjamUser?->email) {
            $penolaRole = auth()->user()?->role ?? 'admin';
            $tahapLabel = match ($penolaRole) {
                'pic'      => 'PIC',
                'admin'    => 'Admin',
                'lecturer' => 'Penanggung Jawab',
                default    => ucfirst($penolaRole),
            };
            try {
                $frontendUrl = rtrim(env('FRONTEND_URL', env('APP_URL')), '/');
                Mail::to($peminjamUser->email)->send(new PersetujuanDitolakMail(
                    namaPeminjam: $peminjamUser->name,
                    itemName: $itemName,
                    penolaName: $penolak,
                    tahap: $tahapLabel,
                    link: $frontendUrl . '/riwayat',
                ));
            } catch (\Throwable $e) {
                Log::warning('Gagal mengirim email penolakan peminjaman', [
                    'to' => $peminjamUser->email,
                    'exception' => $e->getMessage(),
                ]);
            }
        }

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
                $admins = User::where('role', 'admin')->pluck('id_number');
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

    /**
     * GET /api/kalender
     * Kalender peminjaman untuk semua role.
     * Hanya mengembalikan: tanggal, jam mulai-selesai, nama item, status.
     * Tidak ada detail peminjam.
     */
    public function getKalender(Request $request)
    {
        $request->validate([
            'bulan'  => 'nullable|integer|min:1|max:12',
            'tahun'  => 'nullable|integer|min:2020|max:2100',
            'jenis'  => 'nullable|in:ruangan,alat,semua',
            'status' => 'nullable|in:menunggu,disetujui,ditolak',
        ]);

        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        $query = Peminjaman::with(['ruangan', 'alat'])
            ->whereYear('hari_tanggal', $tahun)
            ->whereMonth('hari_tanggal', $bulan)
            ->whereNotIn('status_persetujuan', ['dibatalkan']);

        if ($request->filled('jenis') && $request->jenis !== 'semua') {
            $request->jenis === 'ruangan'
                ? $query->whereNotNull('id_ruangan')
                : $query->whereNotNull('id_alat');
        }

        if ($request->filled('status')) {
            $query->where('status_persetujuan', $request->status);
        }

        $data = $query->orderBy('hari_tanggal')->orderBy('jam_mulai')
            ->get()
            ->map(fn ($p) => [
                'id_peminjaman'      => $p->id_peminjaman,
                'hari_tanggal'       => $p->hari_tanggal?->toDateString(),
                'jam_mulai'          => substr($p->jam_mulai, 0, 5),
                'jam_selesai'        => substr($p->jam_selesai, 0, 5),
                'item'               => $p->ruangan?->name_ruangan ?? $p->alat?->name_alat ?? '-',
                'jenis'              => $p->id_ruangan ? 'ruangan' : 'alat',
                'status_persetujuan' => $p->status_persetujuan,
            ]);

        return response()->json(['data' => $data]);
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