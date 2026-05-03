<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persetujuan extends Model
{
      protected $table   = 'persetujuans';
    protected $fillable = [
        'id_peminjaman',
        'nomor_induk_penyetuju',
        'status_persetujuan',
    ];

    public function peminjam()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'nomor_induk_penyetuju', 'nomor_induk');
    }
    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman');
    }
}
