<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class department extends Model
{
    protected $table = 'department';
    protected $primaryKey = 'department_id';

    protected $fillable = [
        'department_name',
    ];

    public function StudyProgram(): HasMany
    {
        return $this->hasMany(StudyProgram::class, 'department_id', 'department_id');
    }
}
