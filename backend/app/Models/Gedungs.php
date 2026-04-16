<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gedungs extends Model
{
    protected $table = 'gedung';
    protected $primaryKey = 'id_gedung';

    protected $fillable = [
        'nama_gedung',
    ];

    public function lantai(): HasMany
    {
        return $this->hasMany(Lantai::class, 'id_gedung', 'id_gedung');
    }
}
