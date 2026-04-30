<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RuanganResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_ruangan'       => $this->id_ruangan,
            'kode_ruangan'      => $this->kode_ruangan,
            'nama_ruangan'      => $this->nama_ruangan,
            'kapasitas'         => $this->kapasitas,
            'fasilitas'         => $this->fasilitas,
            'deskripsi_ruangan' => $this->deskripsi_ruangan,
            'status_ruangan'    => $this->status_ruangan,
            'path_foto'         => $this->path_foto,
            
            'nama_gedung'       => $this->gedung->nama_gedung, // tambahan
            'nomor_induk_pic'   => $this->pic?->user?->nama, 
            'nomor_lantai'      => $this->nomor_lantai,
        ];
    }
}
