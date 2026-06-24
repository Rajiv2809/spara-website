<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class mahasiswaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('mahasiswas')->insert([
            [
                'id_number' => 2021101001,
                'kelas'       => 'TI-3A',
                'angkatan'    => '2021',
                'status'      => 'aktif',
                'study_program_id'    => 101,
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'id_number' => 2021101002,
                'kelas'       => 'TI-3A',
                'angkatan'    => '2021',
                'status'      => 'aktif',
                'study_program_id'    => 101,
                'created_at'  => now(), 'updated_at' => now(),
            ],
            [
                'id_number' => 2022202001,
                'kelas'       => 'SI-2B',
                'angkatan'    => '2022',
                'status'      => 'aktif',
                'study_program_id'    => 201,
                'created_at'  => now(), 'updated_at' => now(),
            ],
        ]);
    }
}