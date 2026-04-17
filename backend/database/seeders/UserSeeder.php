<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\{DB, Hash};

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'nomor_induk' => 1001,
                'nama' => 'Admin User',
                'email' => 'admin@gmail.com',
                'no_telepon' => '081234567890',
                'password' => Hash::make('password'), // penting!
                'fotoprofil' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nomor_induk' => 1002,
                'nama' => 'User Biasa',
                'email' => 'user@gmail.com',
                'no_telepon' => '081298765432',
                'password' => Hash::make('password'),
                'fotoprofil' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}