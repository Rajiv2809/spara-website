<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MahasiswaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('mahasiswas')->insert([
            [
                'nomor_induk' => 2021101001,
                'kelas'       => 'TI-3A',
                'angkatan'    => '2021',
                'status'      => 'aktif',
                'id_prodi'    => 101,
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'nomor_induk' => 2021101002,
                'kelas'       => 'TI-3A',
                'angkatan'    => '2021',
                'status'      => 'aktif',
                'id_prodi'    => 101,
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'nomor_induk' => 2022202001,
                'kelas'       => 'SI-2B',
                'angkatan'    => '2022',
                'status'      => 'aktif',
                'id_prodi'    => 201,
                'created_at'  => now(), 'updated_at' => now(),
            ],
        ]);
    }
}