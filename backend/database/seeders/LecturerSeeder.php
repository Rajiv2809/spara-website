<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class lecturerSeeder extends Seeder
{
    public function run(): void
    {
        $lecturers = [
            ['id_number' => 19900001, 'department_id' => 1],
            ['id_number' => 19900002, 'department_id' => 2],
            ['id_number' => 19900003, 'department_id' => 3],
            ['id_number' => 19900004, 'department_id' => 4],
        ];

        foreach ($lecturers as $lecturer) {
            DB::table('lecturers')->updateOrInsert(
                ['id_number' => $lecturer['id_number']],
                ['department_id' => $lecturer['department_id'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}