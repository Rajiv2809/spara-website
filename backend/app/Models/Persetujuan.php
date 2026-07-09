<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persetujuan extends Model
{
      protected $table   = 'persetujuans';
    protected $fillable = [
        'id_peminjaman',
        'id_number_penyetuju',
        'status_persetujuan',
        'alasan_penolakan',
        'approval_token',
        'token_expires_at',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
    ];

    public function peminjam()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'id_number_penyetuju', 'id_number');
    }
    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman');
    }
}
