<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\{DB, Hash};

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            // Admin
            [
                'id_number' => 10000001,
                'name'        => 'Admin Utama',
                'email'       => 'admin@kampus.ac.id',
                'phone_number'  => '081200000001',
                'password'    => Hash::make('password'),
                'role'        => 'admin',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // lecturer
            [
                'id_number' => 19900001,
                'name'        => 'Dr. Budi Santoso',
                'email'       => 'budi.santoso@kampus.ac.id',
                'phone_number'  => '081200000002',
                'password'    => Hash::make('password'),
                'role'        => 'lecturer',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'id_number' => 19900002,
                'name'        => 'Dr. Sari Dewi',
                'email'       => 'sari.dewi@kampus.ac.id',
                'phone_number'  => '081200000003',
                'password'    => Hash::make('password'),
                'role'        => 'lecturer',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // PIC
            [
                'id_number' => 20230001,
                'name'        => 'Andi Wijaya',
                'email'       => 'andi.pic@kampus.ac.id',
                'phone_number'  => '081200000004',
                'password'    => Hash::make('password'),
                'role'        => 'pic',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // mahasiswa
            [
                'id_number' => 2021101001,
                'name'        => 'Rizky Pratama',
                'email'       => 'rizky@mahasiswa.ac.id',
                'phone_number'  => '081200000005',
                'password'    => Hash::make('password'),
                'role'        => 'mahasiswa',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'id_number' => 2021101002,
                'name'        => 'Siti Nurhaliza',
                'email'       => 'siti@mahasiswa.ac.id',
                'phone_number'  => '081200000006',
                'password'    => Hash::make('password'),
                'role'        => 'mahasiswa',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'id_number' => 2022202001,
                'name'        => 'Fajar Hidayat',
                'email'       => 'fajar@mahasiswa.ac.id',
                'phone_number'  => '081200000007',
                'password'    => Hash::make('password'),
                'role'        => 'mahasiswa',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // Kepala SBUM
            [
                'id_number' => 10000002,
                'name'        => 'Kepala SBUM',
                'email'       => 'kepala.sbum@kampus.ac.id',
                'phone_number'  => '081200000008',
                'password'    => Hash::make('password'),
                'role'        => 'kepala',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}
