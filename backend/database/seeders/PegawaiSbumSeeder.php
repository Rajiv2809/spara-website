<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\{DB, Hash};

class PegawaiSbumSeeder extends Seeder
{
    public function run(): void
    {
        // Tambahkan user terlebih dahulu (role admin di users)
        DB::table('users')->insert([
            [
                'id_number' => 10000005,
                'name'        => 'Ketua SBUM',
                'email'       => 'ketua.sbum@kampus.ac.id',
                'phone_number'  => '081200000010',
                'password'    => Hash::make('password'),
                'role'        => 'kepala',
                'created_at'  => now(), 'updated_at' => now(),
            ],
        ]);

        // DB::table('pegawai_sbums')->insert([
        //     ['id_number' => 10000001, 'role' => 'admin',  'created_at' => now(), 'updated_at' => now()],
        //     ['id_number' => 10000002, 'role' => 'kepala',  'created_at' => now(), 'updated_at' => now()],
        // ]);
    }
}