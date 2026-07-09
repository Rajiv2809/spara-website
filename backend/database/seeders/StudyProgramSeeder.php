<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudyProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            ['study_program_id' => 101, 'study_program_name' => 'S1 Teknik Informatika', 'department_id' => 1],
            ['study_program_id' => 102, 'study_program_name' => 'D3 Teknik Informatika', 'department_id' => 1],
            ['study_program_id' => 103, 'study_program_name' => 'D4 Rekayasa Perangkat Lunak', 'department_id' => 1],
            ['study_program_id' => 201, 'study_program_name' => 'S1 Sistem Informasi', 'department_id' => 2],
            ['study_program_id' => 202, 'study_program_name' => 'D3 Manajemen Informatika', 'department_id' => 2],
            ['study_program_id' => 301, 'study_program_name' => 'S1 Teknik Elektro', 'department_id' => 3],
            ['study_program_id' => 302, 'study_program_name' => 'D3 Teknik Listrik', 'department_id' => 3],
            ['study_program_id' => 401, 'study_program_name' => 'S1 Teknik Sipil', 'department_id' => 4],
            ['study_program_id' => 501, 'study_program_name' => 'D3 Administrasi Bisnis', 'department_id' => 5],
        ];

        foreach ($programs as $program) {
            DB::table('study_programs')->updateOrInsert(
                ['study_program_id' => $program['study_program_id']],
                [
                    'study_program_name' => $program['study_program_name'],
                    'department_id' => $program['department_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
