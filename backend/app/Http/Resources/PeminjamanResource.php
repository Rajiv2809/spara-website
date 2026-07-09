<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\PersetujuanResource;

class PeminjamanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Ambil user PIC langsung dari relasi ruangan/alat
        $picUser = $this->ruangan?->pic?->user
            ?? $this->alat?->pic?->user
            ?? null;

        return [
            'id_peminjaman'      => $this->id_peminjaman,
            'id_alat'            => $this->id_alat,
            'id_ruangan'         => $this->id_ruangan,
            'peminjam'           => $this->peminjam?->name ?? null,
            'phone_peminjam'     => $this->peminjam?->phone_number ?? null,
            'name_kegiatan'      => $this->name_kegiatan,
            'jenis_kegiatan'     => $this->jenis_kegiatan,
            'hari_tanggal'       => $this->hari_tanggal,
            'jam_mulai'          => $this->jam_mulai,
            'jam_selesai'        => $this->jam_selesai,
            'keterangan'         => $this->keterangan,
            'alat'               => $this->alat?->name_alat ?? ($this->id_alat ? 'Alat #' . $this->id_alat : null),
            'ruangan'            => $this->ruangan?->name_ruangan ?? $this->ruangan?->kode_ruangan ?? ($this->id_ruangan ? 'Ruangan #' . $this->id_ruangan : null),
            'pic'                => $picUser?->name ?? null,
            'phone_pic'          => $picUser?->phone_number ?? null,
            'status_persetujuan' => $this->status_persetujuan,
            'persetujuans'       => PersetujuanResource::collection($this->whenLoaded('persetujuans')),
            'dibuat_pada'        => $this->dibuat_pada,
        ];
    }
}
