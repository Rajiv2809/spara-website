<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\Peminjaman;
use App\Models\Persetujuan;
use App\Models\Notification;
use App\Models\User;

class PembatalanOtomatis extends Command
{
    protected $signature = 'peminjaman:batalkan-kadaluarsa
                            {--dry-run : Jalankan tanpa benar-benar mengubah data (hanya tampilkan preview)}';

    protected $description = 'Membatalkan otomatis peminjaman yang sudah melampaui batas waktu persetujuan (14 hari atau H-1 tanggal pakai)';

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $sekarang = Carbon::today();

        $this->info('');
        $this->info('╔══════════════════════════════════════════════════════╗');
        $this->info('║   Pembatalan Otomatis Peminjaman Kadaluarsa          ║');
        $this->info('╚══════════════════════════════════════════════════════╝');
        $this->info("  Tanggal sekarang : {$sekarang->toDateString()}");

        if ($isDryRun) {
            $this->warn('  Mode             : DRY RUN (tidak ada data yang diubah)');
        } else {
            $this->info('  Mode             : LIVE (data akan diubah)');
        }

        $this->info('');

        $peminjamanMenunggu = Peminjaman::with(['peminjam', 'persetujuans', 'ruangan', 'alat'])
            ->where('status_persetujuan', 'menunggu')
            ->get();

        $this->info("  Ditemukan {$peminjamanMenunggu->count()} peminjaman dengan status 'menunggu'.");
        $this->info('');

        $jumlahDibatalkan = 0;
        $jumlahDilompati  = 0;

        foreach ($peminjamanMenunggu as $peminjaman) {
            $tanggalDibuat = Carbon::parse($peminjaman->dibuat_pada)->startOfDay();
            $tanggalPakai  = Carbon::parse($peminjaman->hari_tanggal)->startOfDay();

            $batas14Hari = $tanggalDibuat->copy()->addDays(14);

            $batasH1 = $tanggalPakai->copy()->subDay();

            $batasAkhir = $batas14Hari->lessThanOrEqualTo($batasH1)
                ? $batas14Hari
                : $batasH1;

            $namaItem = $peminjaman->ruangan?->name_ruangan
                ?? $peminjaman->alat?->name_alat
                ?? 'Item';

            if ($sekarang->greaterThanOrEqualTo($batasAkhir)) {

                $alasanBatas = $batas14Hari->lessThanOrEqualTo($batasH1)
                    ? "14 hari sejak pengajuan ({$batas14Hari->toDateString()})"
                    : "H-1 tanggal pakai ({$batasH1->toDateString()})";

                $this->line("  <fg=red>[BATALKAN]</> ID #{$peminjaman->id_peminjaman} | {$namaItem}");
                $this->line("             Dibuat   : {$tanggalDibuat->toDateString()}");
                $this->line("             Tgl Pakai: {$tanggalPakai->toDateString()}");
                $this->line("             Alasan   : Melampaui batas {$alasanBatas}");

                if (!$isDryRun) {
                    $this->lakukanPembatalan($peminjaman, $namaItem, $alasanBatas);
                }

                $jumlahDibatalkan++;

            } else {
                $sisaHari = $sekarang->diffInDays($batasAkhir, false);

                $this->line("  <fg=green>[LEWATI]</>   ID #{$peminjaman->id_peminjaman} | {$namaItem}");
                $this->line("             Batas pada : {$batasAkhir->toDateString()} (sisa {$sisaHari} hari)");

                $jumlahDilompati++;
            }
        }

        $this->info('');
        $this->info('  ─────────────────────────────────────────');
        $this->info("  Total dibatalkan : {$jumlahDibatalkan}");
        $this->info("  Total dilewati   : {$jumlahDilompati}");

        if ($isDryRun) {
            $this->warn("  (Dry run selesai — tidak ada data yang diubah)");
        }

        $this->info('  ─────────────────────────────────────────');
        $this->info('');

        return Command::SUCCESS;
    }

    private function lakukanPembatalan(Peminjaman $peminjaman, string $namaItem, string $alasan): void
    {
        $peminjaman->status_persetujuan = 'dibatalkan';
        $peminjaman->save();

        Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)
            ->where('status_persetujuan', 'menunggu')
            ->update(['status_persetujuan' => 'dibatalkan']);

        Notification::create([
            'id_number'     => $peminjaman->id_peminjam,
            'type'          => 'dibatalkan',
            'judul'         => 'Peminjaman Dibatalkan Otomatis',
            'pesan'         => "Peminjaman {$namaItem} Anda telah dibatalkan secara otomatis karena melampaui batas waktu persetujuan ({$alasan}).",
            'peminjaman_id' => $peminjaman->id_peminjaman,
        ]);

        $persetujuans    = Persetujuan::where('id_peminjaman', $peminjaman->id_peminjaman)->get();
        $targetNotifikasi = [];

        foreach ($persetujuans as $ps) {
            if ($ps->id_number_penyetuju) {
                $targetNotifikasi[] = $ps->id_number_penyetuju;
            } else {
                $admins = User::where('role', 'admin')->pluck('id_number')->toArray();
                $targetNotifikasi = array_merge($targetNotifikasi, $admins);
            }
        }

        foreach (array_unique($targetNotifikasi) as $idNumber) {
            if ((string) $idNumber === (string) $peminjaman->id_peminjam) {
                continue;
            }

            Notification::create([
                'id_number'     => $idNumber,
                'type'          => 'dibatalkan',
                'judul'         => 'Peminjaman Dibatalkan Otomatis',
                'pesan'         => "Peminjaman {$namaItem} dibatalkan otomatis oleh sistem karena melampaui batas waktu ({$alasan}).",
                'peminjaman_id' => $peminjaman->id_peminjaman,
            ]);
        }
    }
}
