<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class toolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->tool_id,
            'tool_code'   => $this->tool_code,
            'tool_name'   => $this->tool_name,
            'tool_description' => $this->tool_description,
            'tool_status' => $this->tool_status,
            'pic'         => $this->penanggungJawab?->name ?? '-',
            'id_number_pic' => $this->id_number_pic,
            'path_foto'      => $this->path_foto
            ? asset('storage/' . $this->path_foto)
            : null,
        ];
    }
}