<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use App\Models\Peminjaman;

class Ruangan extends Model
{
     protected $table = 'ruangan';
    protected $primaryKey = 'id_ruangan';

    protected $fillable = [
        'kode_ruangan',
        'nama_ruangan',
        'kapasitas',
        'fasilitas',
        'deskripsi_ruangan',
        'status_ruangan',
        'nomor_lantai',
    ];

    public function lantai(): BelongsTo
    {
        return $this->belongsTo(Lantai::class, 'nomor_lantai', 'nomor_lantai');
    }

    public function peminjaman(): HasMany
    {
        return $this->hasMany(Peminjaman::class, 'id_ruangan', 'id_ruangan');
    }
    
}
