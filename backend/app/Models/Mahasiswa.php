<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mahasiswa extends Model
{
    protected $table = 'mahasiswas';

    protected $primaryKey = 'nomor_induk';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'nomor_induk',
        'kelas',
        'angkatan',
        'status',
        'id_prodi'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'nomor_induk',
            'nomor_induk'
        );
    }

    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(
            ProgramStudi::class,
            'id_prodi',
            'id_prodi'
        );
    }
}
