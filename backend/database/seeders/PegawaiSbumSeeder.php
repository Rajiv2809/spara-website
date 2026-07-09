<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\{DB, Hash};

class PegawaiSbumSeeder extends Seeder
{
    public function run(): void
    {
        $pegawai = [
            ['id_number' => 10000002, 'name' => 'Kepala SBUM', 'email' => 'kepala.sbum@polibatam.ac.id', 'phone_number' => '081200000008', 'role' => 'ketua'],
            ['id_number' => 10000003, 'name' => 'Staff SBUM', 'email' => 'staff.sbum@polibatam.ac.id', 'phone_number' => '081200000009', 'role' => 'admin'],
        ];

        foreach ($pegawai as $data) {
            DB::table('users')->updateOrInsert(
                ['id_number' => $data['id_number']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone_number' => $data['phone_number'],
                    'password' => Hash::make('password'),
                    'role' => 'kepala',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            DB::table('pegawai_sbums')->updateOrInsert(
                ['id_number' => $data['id_number']],
                ['role' => $data['role'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}