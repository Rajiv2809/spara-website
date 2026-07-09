<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PersetujuanDisetujuiMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $namaPeminjam,
        public string $itemName,
        public string $approverName,
        public string $tahap,       // "Penanggung Jawab", "PIC", "Admin"
        public int    $tahapKe,     // 1, 2, 3, ...
        public int    $totalTahap,  // total tahap persetujuan
        public string $link,
    ) {}

    public function build()
    {
        return $this->subject("Peminjaman {$this->itemName} — Tahap {$this->tahapKe} Disetujui")
            ->markdown('emails.persetujuan-disetujui');
    }
}
