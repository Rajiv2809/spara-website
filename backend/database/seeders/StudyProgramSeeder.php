<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class StudyProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         DB::table('study_programs')->insert([
            ['study_program_id' => 101, 'study_program_name' => 'S1 Teknik Informatika', 'department_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['study_program_id' => 102, 'study_program_name' => 'D3 Teknik Informatika', 'department_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['study_program_id' => 201, 'study_program_name' => 'S1 Sistem Informasi',   'department_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['study_program_id' => 301, 'study_program_name' => 'S1 Teknik Elektro',     'department_id' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
