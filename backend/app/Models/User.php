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
    'id_number',
    'name',
    'email',
    'phone_number',
    'password',
    'profile_picture',
    'role',
    ];

    protected $primaryKey = 'id_number';
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

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPic(): bool
    {
        return $this->role === 'pic';
    }
}   