<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListPersetujuanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_persetujuan' => $this->id,
            'name_kegiatan' => $this->peminjaman?->name_kegiatan ?? null,
            'jenis_kegiatan' => $this->peminjaman?->jenis_kegiatan ?? null,
            'hari_tanggal' => $this->peminjaman?->hari_tanggal ?? null,
            'jam_mulai' => $this->peminjaman?->jam_mulai ?? null,
            'jam_selesai' => $this->peminjaman?->jam_selesai ?? null,
            'id_alat' => $this->peminjaman?->id_alat ?? null,
            'id_ruangan' => $this->peminjaman?->id_ruangan ?? null,
            'kode_alat' => $this->peminjaman?->alat?->kode_alat ?? null,
            'kode_ruangan' => $this->peminjaman?->ruangan?->kode_ruangan ?? null,
            'name_ruangan' => $this->peminjaman?->ruangan?->name_ruangan ?? null,
            'pic' => $this->peminjaman?->ruangan?->pic?->user?->name
                ?? $this->peminjaman?->alat?->pic?->user?->name
                ?? null,
            'status_persetujuan' => $this->status_persetujuan,
            'peminjam' => $this->peminjaman?->peminjam?->name ?? null,
            'email_peminjam' => $this->peminjaman?->peminjam?->email ?? null,
            'nomor_telephone_peminjam' => $this->peminjaman?->peminjam?->phone_number ?? null,
            'role_peminjam' => $this->peminjaman?->peminjam?->role ?? null,
            'keterangan' => $this->peminjaman?->keterangan ?? null,
            'penyetuju' => $this->user?->name ?? null,
            'role_penyetuju' => $this->user?->role ?? null,
        ];
    }
}
