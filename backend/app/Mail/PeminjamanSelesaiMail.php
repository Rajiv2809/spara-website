<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PeminjamanSelesaiMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $namaPeminjam,
        public string $itemName,
        public string $link,
    ) {}

    public function build()
    {
        return $this->subject("Peminjaman {$this->itemName} Disetujui")
            ->markdown('emails.peminjaman-selesai');
    }
}