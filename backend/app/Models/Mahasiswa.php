<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    protected $table = 'peminjaman';
    protected $primaryKey = 'id_peminjaman';

    protected $fillable = [
        'nama_kegiatan',
        'jenis_kegiatan',
        'hari_tanggal',
        'jam',
        'keterangan',
        'status_persetujuan',
        'id_peminjam',
        'id_alat',
        'id_ruangan',
        'dibuat_pada',
        'diubah_pada',
    ];

    protected function casts(): array
    {
        return [
            'hari_tanggal' => 'date',
            'dibuat_pada'  => 'datetime',
            'diubah_pada'  => 'datetime',
        ];
    }

    public function peminjam(): BelongsTo
    {
        return $this->belongsTo(Peminjam::class, 'id_peminjam', 'id_pengguna');
    }

    public function alat(): BelongsTo
    {
        return $this->belongsTo(Alat::class, 'id_alat', 'id_alat');
    }

    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'id_ruangan', 'id_ruangan');
    }

    public function tahapPersetujuan(): HasOne
    {
        return $this->hasOne(TahapPersetujuan::class, 'id_peminjaman', 'id_peminjaman');
    }

    public function persetujuan(): HasMany
    {
        return $this->hasMany(Persetujuan::class, 'id_peminjaman', 'id_peminjaman');
    }
}
