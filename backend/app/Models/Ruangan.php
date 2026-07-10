<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class Ruangan extends Model
{
    protected $table      = 'ruangans';
    protected $primaryKey = 'id_ruangan';

    protected $fillable = [
        'kode_ruangan',
        'name_ruangan',
        'kapasitas',
        'deskripsi_ruangan',
        'status_ruangan',
        'nomor_lantai',
        'id_gedung',
        'id_number_pic',
        'path_foto',
    ];

    public function fasilitas(): HasMany
    {
        return $this->hasMany(Fasilitas::class, 'id_ruangan', 'id_ruangan');
    }

    public function lantai(): BelongsTo
    {
        return $this->belongsTo(Lantai::class, 'nomor_lantai', 'nomor_lantai');
    }

    public function gedung(): BelongsTo
    {
        return $this->belongsTo(Gedungs::class, 'id_gedung', 'id_gedung');
    }

    /** Relasi langsung ke User (bypass tabel pics) */
    public function picUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_number_pic', 'id_number');
    }

    public function peminjaman(): HasMany
    {
        return $this->hasMany(Peminjaman::class, 'id_ruangan', 'id_ruangan');
    }
}