<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};

class loan extends Model
{
   protected $table = 'loan';
    protected $primaryKey = 'loan_id';

    protected $fillable = [
        'name_kegiatan',
        'jenis_kegiatan',
        'hari_tanggal',
        'jam_mulai',
        'jam_selesai',
        'keterangan',
        'status_persetujuan',
        'id_peminjam',
        'tool_id',
        'room_id',
        'dibuat_pada',
        'diubah_pada',
        'alasan_kepala',
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
        return $this->belongsTo(User::class, 'id_peminjam', 'id_number');
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(tool::class, 'tool_id', 'tool_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(room::class, 'room_id', 'room_id');
    }

    public function persetujuans(): HasMany
    {
        return $this->hasMany(Persetujuan::class, 'loan_id', 'loan_id');
    }

    // public function persetujuan(): BelongsTo
    // {
    //     return $this->belongsTo(Persetujuan::class, 'loan_id', 'loan_id');
    // }

    
}
