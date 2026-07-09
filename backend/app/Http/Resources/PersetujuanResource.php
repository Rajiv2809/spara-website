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
            'id_peminjaman'  => $this->id_peminjaman,
            'status_persetujuan' => $this->status_persetujuan,
            'penyetuju'      => $this->user?->name ?? null,
            'role_penyetuju' => $this->user?->role ?? null,
            'phone_penyetuju' => $this->user?->phone_number ?? null,
        ];
    }
}
