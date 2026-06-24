<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class floor extends Model
{
     protected $table = 'floor';
    protected $primaryKey = 'floor_number';

    protected $fillable = [
        'floor_number',
        'building_id',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(buildings::class, 'building_id', 'building_id');
    }

    public function room(): HasMany
    {
        return $this->hasMany(room::class, 'floor_number', 'floor_number');
    }
}
