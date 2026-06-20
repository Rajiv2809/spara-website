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
        'nama_alat',
        'deskripsi_alat',
        'status_alat',
        'nomor_induk_pic',
        'path_foto',
    ];

    public function pic(): BelongsTo
    {
        return $this->belongsTo(Pic::class, 'nomor_induk_pic', 'nomor_induk');
    }

    public function peminjaman(): HasMany
    {
        return $this->hasMany(Peminjaman::class, 'id_alat', 'id_alat');
    }
}
