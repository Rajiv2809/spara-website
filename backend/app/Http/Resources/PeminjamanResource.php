<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\PersetujuanResource;

class loanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'loan_id' => $this->loan_id,
            'tool_id' => $this->tool_id,
            'room_id' => $this->room_id,
            'peminjam' => $this->peminjam?->name ?? null,
            'name_kegiatan' => $this->name_kegiatan,
            'jenis_kegiatan' => $this->jenis_kegiatan,
            'hari_tanggal' => $this->hari_tanggal,
            'jam_mulai' => $this->jam_mulai,
            'jam_selesai' => $this->jam_selesai,
            'tool' => $this->tool?->tool_name ?? ($this->tool_id ? 'tool #' . $this->tool_id : null),
            'room' => $this->room?->room_name ?? $this->room?->room_code ?? ($this->room_id ? 'room #' . $this->room_id : null),
            'pic' => $this->room?->pic?->user?->name
                ?? $this->tool?->pic?->user?->name
                ?? null,
            'status_persetujuan' => $this->status_persetujuan,
            'persetujuans' => PersetujuanResource::collection($this->whenLoaded('persetujuans')),
            'dibuat_pada' => $this->dibuat_pada,
        ];
    }
}
