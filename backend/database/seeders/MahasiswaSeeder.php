<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class mahasiswaSeeder extends Seeder
{
    public function run(): void
    {
        $mahasiswa = [
            ['id_number' => 2021101001, 'kelas' => 'TI-3A', 'angkatan' => '2021', 'status' => 'aktif', 'study_program_id' => 101],
            ['id_number' => 2021101002, 'kelas' => 'TI-3A', 'angkatan' => '2021', 'status' => 'aktif', 'study_program_id' => 101],
            ['id_number' => 2021101003, 'kelas' => 'TI-3B', 'angkatan' => '2021', 'status' => 'aktif', 'study_program_id' => 103],
            ['id_number' => 2021101004, 'kelas' => 'TI-3C', 'angkatan' => '2021', 'status' => 'aktif', 'study_program_id' => 102],
            ['id_number' => 2022202001, 'kelas' => 'SI-2B', 'angkatan' => '2022', 'status' => 'aktif', 'study_program_id' => 201],
            ['id_number' => 2022202002, 'kelas' => 'SI-2C', 'angkatan' => '2022', 'status' => 'aktif', 'study_program_id' => 202],
        ];

        foreach ($mahasiswa as $data) {
            DB::table('mahasiswas')->updateOrInsert(
                ['id_number' => $data['id_number']],
                [
                    'kelas' => $data['kelas'],
                    'angkatan' => $data['angkatan'],
                    'status' => $data['status'],
                    'study_program_id' => $data['study_program_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}