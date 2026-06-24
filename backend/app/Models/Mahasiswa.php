<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class mahasiswa extends Model
{
    protected $table = 'mahasiswas';

    protected $primaryKey = 'id_number';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id_number',
        'kelas',
        'angkatan',
        'status',
        'study_program_id'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'id_number',
            'id_number'
        );
    }

    public function StudyProgram(): BelongsTo
    {
        return $this->belongsTo(
            StudyProgram::class,
            'study_program_id',
            'study_program_id'
        );
    }
}
