<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alat extends Model
{
    protected $table = 'alats';
    protected $primaryKey = 'id_alat';

    protected $fillable = [
        'kode_alat',
        'name_alat',
        'deskripsi_alat',
        'status_alat',
        'id_number_pic',
        'path_foto',
    ];

    /** Relasi langsung ke User (bypass tabel pics) */
    public function picUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_number_pic', 'id_number');
    }

    public function peminjaman(): HasMany
    {
        return $this->hasMany(Peminjaman::class, 'id_alat', 'id_alat');
    }
}
