<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class buildings extends Model
{
    protected $table = 'buildings';
    protected $primaryKey = 'building_id';

    protected $fillable = [
        'building_name',
    ];

    public function floor(): HasMany
    {
        return $this->hasMany(floor::class, 'building_id', 'building_id');
    }
}
