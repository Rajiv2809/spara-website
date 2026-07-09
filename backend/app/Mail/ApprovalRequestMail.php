<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ApprovalRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param string $namaApprover   Nama penerima email (PJ / PIC / Admin)
     * @param string $namaPeminjam   Nama orang yang mengajukan
     * @param string $itemName       Nama ruangan / alat
     * @param string $namaKegiatan   Nama kegiatan
     * @param string $tanggal        Tanggal peminjaman (formatted)
     * @param string $jamMulai       Jam mulai
     * @param string $jamSelesai     Jam selesai
     * @param string $peran          Peran approver: "Penanggung Jawab", "PIC", "Admin"
     * @param string $linkSetujui    URL tombol "Setujui"
     * @param string $linkTolak      URL tombol "Tolak"
     */
    public function __construct(
        public string $namaApprover,
        public string $namaPeminjam,
        public string $itemName,
        public string $namaKegiatan,
        public string $tanggal,
        public string $jamMulai,
        public string $jamSelesai,
        public string $peran,
        public string $linkSetujui,
        public string $linkTolak,
    ) {}

    public function build(): static
    {
        return $this->subject("Perlu Persetujuan Anda: {$this->itemName} — {$this->namaKegiatan}")
            ->markdown('emails.approval-request');
    }
}
