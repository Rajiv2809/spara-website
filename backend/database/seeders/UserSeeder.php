<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\{DB, Hash};

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['id_number' => 10000001, 'name' => 'Admin Utama', 'email' => 'admin@polibatam.ac.id', 'phone_number' => '081200000001', 'role' => 'admin'],
            ['id_number' => 10000002, 'name' => 'Kepala SBUM', 'email' => 'kepala.sbum@polibatam.ac.id', 'phone_number' => '081200000008', 'role' => 'kepala'],
            ['id_number' => 10000003, 'name' => 'Staff SBUM', 'email' => 'staff.sbum@polibatam.ac.id', 'phone_number' => '081200000009', 'role' => 'kepala'],
            ['id_number' => 99999999, 'name' => 'Rajiv', 'email' => 'rajivcream@gmail.com', 'phone_number' => '081299999999', 'role' => 'lecturer'],
            ['id_number' => 19900001, 'name' => 'Dr. Budi Santoso', 'email' => 'budi.santoso@polibatam.ac.id', 'phone_number' => '081200000002', 'role' => 'lecturer'],
            ['id_number' => 19900002, 'name' => 'Dr. Sari Dewi', 'email' => 'sari.dewi@polibatam.ac.id', 'phone_number' => '081200000003', 'role' => 'lecturer'],
            ['id_number' => 19900003, 'name' => 'Dr. Ahmad Rizal', 'email' => 'ahmad.rizal@polibatam.ac.id', 'phone_number' => '081200000011', 'role' => 'lecturer'],
            ['id_number' => 19900004, 'name' => 'Dra. Lina Hartati', 'email' => 'lina.hartati@polibatam.ac.id', 'phone_number' => '081200000012', 'role' => 'lecturer'],
            ['id_number' => 20230001, 'name' => 'Andi Wijaya', 'email' => 'andi.wijaya@polibatam.ac.id', 'phone_number' => '081200000004', 'role' => 'pic'],
            ['id_number' => 20230002, 'name' => 'Maya Sari', 'email' => 'maya.sari@polibatam.ac.id', 'phone_number' => '081200000013', 'role' => 'pic'],
            ['id_number' => 2021101001, 'name' => 'Rizky Pratama', 'email' => 'rizky.pratama@polibatam.ac.id', 'phone_number' => '081200000005', 'role' => 'mahasiswa'],
            ['id_number' => 2021101002, 'name' => 'Siti Nurhaliza', 'email' => 'siti.nurhaliza@polibatam.ac.id', 'phone_number' => '081200000006', 'role' => 'mahasiswa'],
            ['id_number' => 2021101003, 'name' => 'Dewi Anggraini', 'email' => 'dewi.anggraini@polibatam.ac.id', 'phone_number' => '081200000014', 'role' => 'mahasiswa'],
            ['id_number' => 2021101004, 'name' => 'Teguh Saputra', 'email' => 'teguh.saputra@polibatam.ac.id', 'phone_number' => '081200000015', 'role' => 'mahasiswa'],
            ['id_number' => 2022202001, 'name' => 'Fajar Hidayat', 'email' => 'fajar.hidayat@polibatam.ac.id', 'phone_number' => '081200000007', 'role' => 'mahasiswa'],
            ['id_number' => 2022202002, 'name' => 'Nadia Lestari', 'email' => 'nadia.lestari@polibatam.ac.id', 'phone_number' => '081200000016', 'role' => 'mahasiswa'],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['id_number' => $user['id_number']],
                [
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'phone_number' => $user['phone_number'],
                    'password' => Hash::make('password'),
                    'role' => $user['role'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
