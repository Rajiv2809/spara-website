<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PersetujuanDitolakMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $namaPeminjam,
        public string $itemName,
        public string $penolaName,
        public string $tahap,   // "Penanggung Jawab", "PIC", "Admin"
        public string $link,
    ) {}

    public function build()
    {
        return $this->subject("Peminjaman {$this->itemName} Ditolak")
            ->markdown('emails.persetujuan-ditolak');
    }
}
