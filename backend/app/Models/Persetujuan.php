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
}
