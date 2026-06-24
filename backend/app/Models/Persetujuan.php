<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persetujuan extends Model
{
      protected $table   = 'persetujuans';
    protected $fillable = [
        'loan_id',
        'id_number_penyetuju',
        'status_persetujuan',
    ];

    public function peminjam()
    {
        return $this->belongsTo(loan::class, 'loan_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'id_number_penyetuju', 'id_number');
    }
    public function loan()
    {
        return $this->belongsTo(loan::class, 'loan_id');
    }
}
