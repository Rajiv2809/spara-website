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
            'name_kegiatan' => $this->loan?->name_kegiatan ?? null,
            'jenis_kegiatan' => $this->loan?->jenis_kegiatan ?? null,
            'hari_tanggal' => $this->loan?->hari_tanggal ?? null,
            'jam_mulai' => $this->loan?->jam_mulai ?? null,
            'jam_selesai' => $this->loan?->jam_selesai ?? null,
            'tool_id' => $this->loan?->tool_id ?? null,
            'room_id' => $this->loan?->room_id ?? null,
            'tool_code' => $this->loan?->tool?->tool_code ?? null,
            'room_code' => $this->loan?->room?->room_code ?? null,
            'room_name' => $this->loan?->room?->room_name ?? null,
            'pic' => $this->loan?->room?->pic?->user?->name
                ?? $this->loan?->tool?->pic?->user?->name
                ?? null,
            'status_persetujuan' => $this->status_persetujuan,
            'peminjam' => $this->loan?->peminjam?->name ?? null,
            'email_peminjam' => $this->loan?->peminjam?->email ?? null,
            'nomor_telephone_peminjam' => $this->loan?->peminjam?->phone_number ?? null,
            'role_peminjam' => $this->loan?->peminjam?->role ?? null,
            'keterangan' => $this->loan?->keterangan ?? null,
            'penyetuju' => $this->user?->name ?? null,
            'role_penyetuju' => $this->user?->role ?? null,
        ];
    }
}
