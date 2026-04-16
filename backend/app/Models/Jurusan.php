<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    protected $table = 'jurusan';
    protected $primaryKey = 'id_jurusan';

    protected $fillable = [
        'nama_jurusan',
    ];

    public function programStudi(): HasMany
    {
        return $this->hasMany(ProgramStudi::class, 'id_jurusan', 'id_jurusan');
    }
}
