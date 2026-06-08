<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id_alat,
            'kode_alat'   => $this->kode_alat,
            'nama_alat'   => $this->nama_alat,
            'deskripsi_alat' => $this->deskripsi_alat,
            'status_alat' => $this->status_alat,
            'pic'         => $this->penanggungJawab?->nama ?? '-',
        ];
    }
}