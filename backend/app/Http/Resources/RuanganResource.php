<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class roomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->room_id,
            'room_code'      => $this->room_code,
            'room_name'      => $this->room_name,
            'capacity'         => $this->capacity,
            'facility'         => $this->facility,
            'room_description' => $this->room_description,
            'room_status'    => $this->room_status,
            'path_foto' => $this->path_foto
                ? asset('storage/' . $this->path_foto)
                : null,
            'floor_number'      => $this->floor_number,
            'building_id'         => $this->building_id,
            'building_name'       => $this->building?->building_name ?? '-',

            'pic'               => $this->pic?->user?->name ?? '-',

            'id_number_pic'   => $this->id_number_pic,
        ];
    }
}