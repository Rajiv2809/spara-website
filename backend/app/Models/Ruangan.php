<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class room extends Model
{
    protected $table      = 'rooms';
    protected $primaryKey = 'room_id';

    protected $fillable = [
        'room_code',
        'room_name',
        'capacity',
        'facility',
        'room_description',
        'room_status',
        'floor_number',
        'building_id',
        'id_number_pic',
        'path_foto',
    ];

    public function floor(): BelongsTo
    {
        return $this->belongsTo(floor::class, 'floor_number', 'floor_number');
    }

    public function building(): BelongsTo
    {
        return $this->belongsTo(buildings::class, 'building_id', 'building_id');
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(Pic::class, 'id_number_pic', 'id_number');
    }

    public function penanggungJawab()
    {
        return $this->pic?->user;
    }

    public function loan(): HasMany
    {
        return $this->hasMany(loan::class, 'room_id', 'room_id');
    }
}