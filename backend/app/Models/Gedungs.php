<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gedungs extends Model
{
    protected $table = 'gedungs';
    protected $primaryKey = 'id_gedung';

    protected $fillable = [
        'name_gedung',
    ];

    public function lantai(): HasMany
    {
        return $this->hasMany(Lantai::class, 'id_gedung', 'id_gedung');
    }
}
