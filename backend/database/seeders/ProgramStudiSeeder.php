<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class ProgramStudiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         DB::table('program_studis')->insert([
            ['id_prodi' => 101, 'nama_prodi' => 'S1 Teknik Informatika', 'id_jurusan' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id_prodi' => 102, 'nama_prodi' => 'D3 Teknik Informatika', 'id_jurusan' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id_prodi' => 201, 'nama_prodi' => 'S1 Sistem Informasi',   'id_jurusan' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id_prodi' => 301, 'nama_prodi' => 'S1 Teknik Elektro',     'id_jurusan' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
