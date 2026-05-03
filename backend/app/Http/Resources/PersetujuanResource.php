<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersetujuanResource extends JsonResource
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
            'status_persetujuan' => $this->status_persetujuan,
            'penyetuju' => $this->user->nama,
            'role_penyetuju' => $this->user->role,
        ];
    }
}
