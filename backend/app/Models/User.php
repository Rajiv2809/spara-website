<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
    'nomor_induk',
    'nama',
    'email',
    'no_telepon',
    'password',
    'fotoprofil',
    'role',
    ];

    protected $primaryKey = 'nomor_induk';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // WAJIB untuk JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}   