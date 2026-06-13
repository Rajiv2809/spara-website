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
            'nama_ruangan'      => $this->nama_ruangan,
            'kapasitas'         => $this->kapasitas,
            'fasilitas'         => $this->fasilitas,
            'deskripsi_ruangan' => $this->deskripsi_ruangan,
            'status_ruangan'    => $this->status_ruangan,
            'path_foto' => $this->path_foto
                ? asset('storage/' . $this->path_foto)
                : null,
            'nomor_lantai'      => $this->nomor_lantai,
            'id_gedung'         => $this->id_gedung,
            'nama_gedung'       => $this->gedung?->nama_gedung ?? '-',

            'pic'               => $this->pic?->user?->nama ?? '-',

            'nomor_induk_pic'   => $this->nomor_induk_pic,
        ];
    }
}