<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};

class Peminjaman extends Model
{
   protected $table = 'peminjaman';
    protected $primaryKey = 'id_peminjaman';

    protected $fillable = [
        'name_kegiatan',
        'jenis_kegiatan',
        'hari_tanggal',
        'tanggal_mulai',
        'tanggal_selesai',
        'jam_mulai',
        'jam_selesai',
        'keterangan',
        'status_persetujuan',
        'id_peminjam',
        'id_alat',
        'id_ruangan',
        'dibuat_pada',
        'diubah_pada',
        'alasan_kepala',
    ];

    protected function casts(): array
    {
        return [
            'hari_tanggal'    => 'date',
            'tanggal_mulai'   => 'date',
            'tanggal_selesai' => 'date',
            'dibuat_pada'     => 'datetime',
            'diubah_pada'     => 'datetime',
        ];
    }

    public function peminjam(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_peminjam', 'id_number');
    }

    public function alat(): BelongsTo
    {
        return $this->belongsTo(Alat::class, 'id_alat', 'id_alat');
    }

    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'id_ruangan', 'id_ruangan');
    }

    public function persetujuans(): HasMany
    {
        return $this->hasMany(Persetujuan::class, 'id_peminjaman', 'id_peminjaman');
    }

    // public function persetujuan(): BelongsTo
    // {
    //     return $this->belongsTo(Persetujuan::class, 'id_peminjaman', 'id_peminjaman');
    // }

    
}
