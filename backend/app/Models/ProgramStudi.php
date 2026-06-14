<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramStudi extends Model
{
    protected $table = 'program_studis';

    protected $primaryKey = 'id_prodi';

    protected $fillable = [
        'nama_prodi',
        'id_jurusan'
    ];

    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(
            Jurusan::class,
            'id_jurusan',
            'id_jurusan'
        );
    }

     public function mahasiswas(): HasMany
    {
        return $this->hasMany(
            Mahasiswa::class,
            'id_prodi',
            'id_prodi'
        );
    }
}
