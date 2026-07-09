<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RuanganResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id_ruangan,
            'kode_ruangan'      => $this->kode_ruangan,
            'name_ruangan'      => $this->name_ruangan,
            'kapasitas'         => $this->kapasitas,
            'fasilitas'         => $this->fasilitas ? $this->fasilitas->pluck('nama_fasilitas')->toArray() : [],
            'deskripsi_ruangan' => $this->deskripsi_ruangan,
            'status_ruangan'    => $this->status_ruangan,
            'path_foto' => $this->path_foto
                ? asset('storage/' . $this->path_foto)
                : null,
            'nomor_lantai'      => $this->nomor_lantai,
            'id_gedung'         => $this->id_gedung,
            'name_gedung'       => $this->gedung?->name_gedung ?? '-',

            'pic'               => $this->pic?->user?->name ?? '-',

            'id_number_pic'   => $this->id_number_pic,
        ];
    }
}