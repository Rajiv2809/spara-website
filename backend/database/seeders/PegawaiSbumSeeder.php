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
                'nomor_induk' => 10000005,
                'nama'        => 'Ketua SBUM',
                'email'       => 'ketua.sbum@kampus.ac.id',
                'no_telepon'  => '081200000010',
                'password'    => Hash::make('password'),
                'role'        => 'kepala',
                'created_at'  => now(), 'updated_at' => now(),
            ],
        ]);

        // DB::table('pegawai_sbums')->insert([
        //     ['nomor_induk' => 10000001, 'role' => 'admin',  'created_at' => now(), 'updated_at' => now()],
        //     ['nomor_induk' => 10000002, 'role' => 'kepala',  'created_at' => now(), 'updated_at' => now()],
        // ]);
    }
}