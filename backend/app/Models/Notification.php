<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'id_number', 'type', 'judul', 'pesan', 'loan_id', 'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_number', 'id_number');
    }

    public function loan()
    {
        return $this->belongsTo(loan::class, 'loan_id', 'loan_id');
    }
}
