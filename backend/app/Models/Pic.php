<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pic extends Model
{
     protected $table = 'pics';
    
       public function user()
    {
        return $this->belongsTo(User::class, 'id_number', 'id_number');
    }
}
