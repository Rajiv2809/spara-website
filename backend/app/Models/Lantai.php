<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class Lantai extends Model
{
     protected $table = 'lantai';
    protected $primaryKey = 'nomor_lantai';

    protected $fillable = [
        'nomor_lantai',
        'id_gedung',
    ];

    public function gedung(): BelongsTo
    {
        return $this->belongsTo(Gedungs::class, 'id_gedung', 'id_gedung');
    }

    public function ruangan(): HasMany
    {
        return $this->hasMany(Ruangan::class, 'nomor_lantai', 'nomor_lantai');
    }
}
