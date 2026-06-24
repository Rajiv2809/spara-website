<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyProgram extends Model
{
    protected $table = 'study_programs';

    protected $primaryKey = 'study_program_id';

    protected $fillable = [
        'study_program_name',
        'department_id'
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(
            department::class,
            'department_id',
            'department_id'
        );
    }

     public function mahasiswas(): HasMany
    {
        return $this->hasMany(
            mahasiswa::class,
            'study_program_id',
            'study_program_id'
        );
    }
}
