<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JadwaRuanganResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $persetujuans = $this->persetujuans ?? collect();
        $allDisetujui = $persetujuans->isNotEmpty() && $persetujuans->every(fn($p) => $p->status_persetujuan === 'disetujui');
        $hasDitolak = $persetujuans->contains(fn($p) => $p->status_persetujuan === 'ditolak');

        return [
            'jam_mulai'          => $this->jam_mulai,
            'jam_selesai'        => $this->jam_selesai,
            'name_kegiatan'      => $this->name_kegiatan,
            'jenis_kegiatan'     => $this->jenis_kegiatan,
            'tanggal_mulai'      => $this->tanggal_mulai?->toDateString() ?? $this->hari_tanggal?->toDateString(),
            'tanggal_selesai'    => $this->tanggal_selesai?->toDateString() ?? $this->hari_tanggal?->toDateString(),
            'status_konfirmasi'  => $allDisetujui ? 'disetujui' : ($hasDitolak ? 'ditolak' : 'pending'),
        ];
    }
}
