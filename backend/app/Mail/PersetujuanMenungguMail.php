<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PersetujuanMenungguMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $namaPenerima,
        public string $itemName,
        public string $approverName,
        public string $tahap, // "Penanggung Jawab", "PIC", "Admin"
        public string $link,
    ) {}

    public function build()
    {
        return $this->subject("Perlu Persetujuan: {$this->itemName}")
            ->markdown('emails.persetujuan-menunggu');
    }
}