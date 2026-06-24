<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class tool extends Model
{
    protected $table = 'tools';
    protected $primaryKey = 'tool_id';

    protected $fillable = [
        'tool_code',
        'tool_name',
        'tool_description',
        'tool_status',
        'id_number_pic',
        'path_foto',
    ];

    public function pic(): BelongsTo
    {
        return $this->belongsTo(Pic::class, 'id_number_pic', 'id_number');
    }

    public function loan(): HasMany
    {
        return $this->hasMany(loan::class, 'tool_id', 'tool_id');
    }
}
