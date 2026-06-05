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
                'nomor_induk' => 10000001,
                'nama'        => 'Admin Utama',
                'email'       => 'admin@kampus.ac.id',
                'no_telepon'  => '081200000001',
                'password'    => Hash::make('password'),
                'role'        => 'admin',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // Dosen
            [
                'nomor_induk' => 19900001,
                'nama'        => 'Dr. Budi Santoso',
                'email'       => 'budi.santoso@kampus.ac.id',
                'no_telepon'  => '081200000002',
                'password'    => Hash::make('password'),
                'role'        => 'dosen',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'nomor_induk' => 19900002,
                'nama'        => 'Dr. Sari Dewi',
                'email'       => 'sari.dewi@kampus.ac.id',
                'no_telepon'  => '081200000003',
                'password'    => Hash::make('password'),
                'role'        => 'dosen',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // PIC
            [
                'nomor_induk' => 20230001,
                'nama'        => 'Andi Wijaya',
                'email'       => 'andi.pic@kampus.ac.id',
                'no_telepon'  => '081200000004',
                'password'    => Hash::make('password'),
                'role'        => 'pic',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // Mahasiswa
            [
                'nomor_induk' => 2021101001,
                'nama'        => 'Rizky Pratama',
                'email'       => 'rizky@mahasiswa.ac.id',
                'no_telepon'  => '081200000005',
                'password'    => Hash::make('password'),
                'role'        => 'mahasiswa',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'nomor_induk' => 2021101002,
                'nama'        => 'Siti Nurhaliza',
                'email'       => 'siti@mahasiswa.ac.id',
                'no_telepon'  => '081200000006',
                'password'    => Hash::make('password'),
                'role'        => 'mahasiswa',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'nomor_induk' => 2022202001,
                'nama'        => 'Fajar Hidayat',
                'email'       => 'fajar@mahasiswa.ac.id',
                'no_telepon'  => '081200000007',
                'password'    => Hash::make('password'),
                'role'        => 'mahasiswa',
                'created_at'  => now(), 'updated_at' => now(),
            ],
            // Kepala SBUM
            [
                'nomor_induk' => 10000002,
                'nama'        => 'Kepala SBUM',
                'email'       => 'kepala.sbum@kampus.ac.id',
                'no_telepon'  => '081200000008',
                'password'    => Hash::make('password'),
                'role'        => 'kepala',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}
