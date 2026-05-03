<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeminjamanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_peminjaman' => $this->peminjam->nama,
            'nama_kegiatan' => $this->nama_kegiatan,
            'jenis_kegiatan' => $this->jenis_kegiatan,
            'hari_tanggal' => $this->hari_tanggal,
            'jam_mulai' => $this->jam_mulai,
            'jam_selesai' => $this->jam_selesai,
            'id_alat' => $this->id_alat,
            'id_ruangan' => $this->ruangan->kode_ruangan ?? null, 
            'pic' => $this->ruangan->pic?->user?->nama ?? $this->alat->pic->user?->nama ?? null,
            'status_persetujuan' => $this->status_persetujuan,
        ];
    }
}
