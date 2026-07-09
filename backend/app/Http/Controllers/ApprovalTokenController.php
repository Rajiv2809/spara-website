<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\{Log, Mail};
use App\Models\{Persetujuan, Peminjaman, Notification, User};
use App\Mail\{ApprovalRequestMail, PeminjamanSelesaiMail, PersetujuanDitolakMail};

class ApprovalTokenController extends Controller
{
    // ── GET /api/approve/{token} ───────────────────────────────────────────
    public function approve(string $token)
    {
        $persetujuan = Persetujuan::where('approval_token', $token)->first();

        if (!$persetujuan) {
            return $this->htmlResponse('❌ Link Tidak Valid', 'Token persetujuan tidak ditemukan.', 'error');
        }

        if ($persetujuan->token_expires_at && $persetujuan->token_expires_at->isPast()) {
            return $this->htmlResponse('⏰ Link Kedaluwarsa', 'Link persetujuan ini sudah kedaluwarsa. Silakan login ke portal untuk menyetujui.', 'warning');
        }

        if ($persetujuan->status_persetujuan !== 'menunggu') {
            $label = $persetujuan->status_persetujuan === 'disetujui' ? 'sudah disetujui' : 'sudah ditolak';
            return $this->htmlResponse('ℹ️ Sudah Diproses', "Peminjaman ini {$label} sebelumnya.", 'info');
        }

        $peminjaman = Peminjaman::with(['persetujuans', 'ruangan', 'alat', 'peminjam'])->find($persetujuan->id_peminjaman);

        if (!$peminjaman) {
            return $this->htmlResponse('❌ Data Tidak Ditemukan', 'Data peminjaman tidak ditemukan.', 'error');
        }

        if (in_array($peminjaman->status_persetujuan, ['ditolak', 'dibatalkan'])) {
            return $this->htmlResponse('ℹ️ Tidak Dapat Diproses', 'Peminjaman ini sudah ditolak atau dibatalkan.', 'info');
        }

        // ── Cek urutan: semua tahap sebelumnya harus sudah disetujui ──────
        $allPersetujuan = $peminjaman->persetujuans->sortBy('id');
        $currentIndex   = $allPersetujuan->search(fn($p) => (int) $p->id === (int) $persetujuan->id);

        for ($i = 0; $i < $currentIndex; $i++) {
            if ($allPersetujuan[$i]->status_persetujuan !== 'disetujui') {
                return $this->htmlResponse('⚠️ Belum Giliran Anda', 'Tahap persetujuan sebelumnya belum selesai.', 'warning');
            }
        }

        // ── Setujui ───────────────────────────────────────────────────────
        $persetujuan->status_persetujuan = 'disetujui';
        $persetujuan->approval_token     = null; // invalidate token setelah dipakai
        $persetujuan->updated_at         = Carbon::now();
        $persetujuan->save();

        $itemName     = $peminjaman->ruangan?->name_ruangan ?? $peminjaman->alat?->name_alat ?? 'Item';
        $approverName = optional($persetujuan->user)->name ?? 'Penyetuju';
        $frontendUrl  = rtrim(env('FRONTEND_URL', env('APP_URL')), '/');
        $tanggalFmt   = Carbon::parse($peminjaman->hari_tanggal)->translatedFormat('l, d F Y');

        $semuaDisetujui = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
            ->where('status_persetujuan', '!=', 'disetujui')
            ->doesntExist();

        if ($semuaDisetujui) {
            // ── Semua tahap selesai ────────────────────────────────────────
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
                    Log::warning('Gagal kirim email selesai ke peminjam', ['exception' => $e->getMessage()]);
                }
            }

            return $this->htmlResponse(
                '✅ Disetujui',
                "Peminjaman <strong>{$itemName}</strong> telah disetujui. Peminjam akan mendapat notifikasi.",
                'success'
            );
        }

        // ── Masih ada tahap berikutnya — kirim notifikasi progress ke peminjam ──
        Notification::create([
            'id_number'     => $peminjaman->id_peminjam,
            'type'          => 'progress',
            'judul'         => 'Persetujuan Diproses',
            'pesan'         => "{$itemName} telah disetujui oleh {$approverName}. Menunggu persetujuan tahap berikutnya.",
            'peminjaman_id' => $peminjaman->id_peminjaman,
        ]);

        // ── Masih ada tahap berikutnya ─────────────────────────────────────
        $next = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
            ->where('id', '>', $persetujuan->id)
            ->orderBy('id')
            ->first();

        if ($next) {
            // Generate token baru untuk approver berikutnya
            $nextToken = $this->generateToken($next);

            if ($next->id_number_penyetuju) {
                // PIC
                $nextUser = User::where('id_number', $next->id_number_penyetuju)->first();

                Notification::create([
                    'id_number'     => $next->id_number_penyetuju,
                    'type'          => 'menunggu',
                    'judul'         => 'Perlu Persetujuan',
                    'pesan'         => "{$itemName} disetujui oleh {$approverName}, menunggu persetujuan Anda.",
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
                            tanggal:      $tanggalFmt,
                            jamMulai:     $peminjaman->jam_mulai,
                            jamSelesai:   $peminjaman->jam_selesai,
                            peran:        $peranNext,
                            linkSetujui:  url("/api/approve/{$nextToken}"),
                            linkTolak:    url("/api/tolak/{$nextToken}"),
                        ));
                    } catch (\Throwable $e) {
                        Log::warning('Gagal kirim email approval ke PIC', ['exception' => $e->getMessage()]);
                    }
                }
            } else {
                // Admin — kirim ke semua admin
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $adminUser) {
                    // Setiap admin dapat token yang sama (row persetujuan sama)
                    Notification::create([
                        'id_number'     => $adminUser->id_number,
                        'type'          => 'menunggu',
                        'judul'         => 'Perlu Persetujuan Admin',
                        'pesan'         => "{$itemName} disetujui oleh {$approverName}, menunggu persetujuan Admin.",
                        'peminjaman_id' => $peminjaman->id_peminjaman,
                    ]);

                    if ($adminUser->email) {
                        try {
                            Mail::to($adminUser->email)->send(new ApprovalRequestMail(
                                namaApprover: $adminUser->name,
                                namaPeminjam: $peminjaman->peminjam?->name ?? 'Peminjam',
                                itemName:     $itemName,
                                namaKegiatan: $peminjaman->name_kegiatan,
                                tanggal:      $tanggalFmt,
                                jamMulai:     $peminjaman->jam_mulai,
                                jamSelesai:   $peminjaman->jam_selesai,
                                peran:        'Admin',
                                linkSetujui:  url("/api/approve/{$nextToken}"),
                                linkTolak:    url("/api/tolak/{$nextToken}"),
                            ));
                        } catch (\Throwable $e) {
                            Log::warning('Gagal kirim email approval ke admin', ['exception' => $e->getMessage()]);
                        }
                    }
                }
            }
        }

        return $this->htmlResponse(
            '✅ Disetujui',
            "Peminjaman <strong>{$itemName}</strong> berhasil Anda setujui. Permintaan persetujuan diteruskan ke tahap berikutnya.",
            'success'
        );
    }

    // ── GET /api/tolak/{token} ─────────────────────────────────────────────
    public function tolak(string $token)
    {
        $persetujuan = Persetujuan::where('approval_token', $token)->first();

        if (!$persetujuan) {
            return $this->htmlResponse('❌ Link Tidak Valid', 'Token persetujuan tidak ditemukan.', 'error');
        }

        if ($persetujuan->token_expires_at && $persetujuan->token_expires_at->isPast()) {
            return $this->htmlResponse('⏰ Link Kedaluwarsa', 'Link penolakan ini sudah kedaluwarsa.', 'warning');
        }

        if ($persetujuan->status_persetujuan !== 'menunggu') {
            $label = $persetujuan->status_persetujuan === 'disetujui' ? 'sudah disetujui' : 'sudah ditolak';
            return $this->htmlResponse('ℹ️ Sudah Diproses', "Peminjaman ini {$label} sebelumnya.", 'info');
        }

        $peminjaman = Peminjaman::with(['ruangan', 'alat', 'peminjam'])->find($persetujuan->id_peminjaman);

        // ── Tolak ─────────────────────────────────────────────────────────
        $persetujuan->status_persetujuan = 'ditolak';
        $persetujuan->approval_token     = null;
        $persetujuan->updated_at         = Carbon::now();
        $persetujuan->save();

        if ($peminjaman && $peminjaman->status_persetujuan !== 'ditolak') {
            $peminjaman->status_persetujuan = 'ditolak';
            $peminjaman->save();
        }

        $itemName     = $peminjaman?->ruangan?->name_ruangan ?? $peminjaman?->alat?->name_alat ?? 'Item';
        $penolakName  = optional($persetujuan->user)->name ?? 'Penyetuju';
        $frontendUrl  = rtrim(env('FRONTEND_URL', env('APP_URL')), '/');

        // ── Notifikasi & email ke peminjam ───────────────────────────────
        if ($peminjaman) {
            Notification::create([
                'id_number'     => $peminjaman->id_peminjam,
                'type'          => 'ditolak',
                'judul'         => 'Peminjaman Ditolak',
                'pesan'         => "Peminjaman {$itemName} ditolak oleh {$penolakName}.",
                'peminjaman_id' => $peminjaman->id_peminjaman,
            ]);

            $peminjamUser = User::where('id_number', $peminjaman->id_peminjam)->first();
            $penolaRole   = optional($persetujuan->user)->role ?? 'admin';
            $tahapLabel   = match ($penolaRole) {
                'pic'      => 'PIC',
                'admin'    => 'Admin',
                'lecturer' => 'Penanggung Jawab',
                default    => ucfirst($penolaRole),
            };

            if ($peminjamUser?->email) {
                try {
                    Mail::to($peminjamUser->email)->send(new PersetujuanDitolakMail(
                        namaPeminjam: $peminjamUser->name,
                        itemName:     $itemName,
                        penolaName:   $penolakName,
                        tahap:        $tahapLabel,
                        link:         $frontendUrl . '/riwayat',
                    ));
                } catch (\Throwable $e) {
                    Log::warning('Gagal kirim email penolakan ke peminjam', ['exception' => $e->getMessage()]);
                }
            }
        }

        return $this->htmlResponse(
            '❌ Ditolak',
            "Peminjaman <strong>{$itemName}</strong> berhasil Anda tolak. Peminjam akan mendapat notifikasi.",
            'error'
        );
    }

    // ── Helper: generate & simpan token ke row persetujuan ────────────────
    public static function generateToken(Persetujuan $persetujuan): string
    {
        $token = bin2hex(random_bytes(32)); // 64 karakter hex
        $persetujuan->update([
            'approval_token'   => $token,
            'token_expires_at' => Carbon::now()->addDays(7), // kadaluarsa 7 hari
        ]);
        return $token;
    }

    // ── Helper: kembalikan halaman HTML sederhana sebagai response ─────────
    private function htmlResponse(string $title, string $message, string $type): \Illuminate\Http\Response
    {
        $colors = [
            'success' => ['bg' => '#f0fdf4', 'border' => '#16a34a', 'icon_bg' => '#dcfce7', 'text' => '#15803d'],
            'error'   => ['bg' => '#fef2f2', 'border' => '#dc2626', 'icon_bg' => '#fee2e2', 'text' => '#b91c1c'],
            'warning' => ['bg' => '#fffbeb', 'border' => '#d97706', 'icon_bg' => '#fef3c7', 'text' => '#b45309'],
            'info'    => ['bg' => '#eff6ff', 'border' => '#2563eb', 'icon_bg' => '#dbeafe', 'text' => '#1d4ed8'],
        ];
        $c           = $colors[$type] ?? $colors['info'];
        $appName     = config('app.name', 'SPARA');
        $frontendUrl = rtrim(env('FRONTEND_URL', env('APP_URL')), '/');

        $html = <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$title} — {$appName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: {$c['bg']};
      border: 2px solid {$c['border']};
      border-radius: 16px;
      padding: 40px 48px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon {
      width: 64px; height: 64px;
      background: {$c['icon_bg']};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      margin: 0 auto 20px;
    }
    h1 { color: {$c['text']}; font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    p  { color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      background: {$c['border']};
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 11px 28px;
      border-radius: 8px;
    }
    .footer { margin-top: 28px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">{$title[0]}</div>
    <h1>{$title}</h1>
    <p>{$message}</p>
    <a class="btn" href="{$frontendUrl}">Kembali ke Portal</a>
    <div class="footer">&copy; {$appName}</div>
  </div>
</body>
</html>
HTML;

        return response($html, 200)->header('Content-Type', 'text/html');
    }
}
