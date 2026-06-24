<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class lecturerSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('lecturers')->insert([
            ['id_number' => 19900001, 'department_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id_number' => 19900002, 'department_id' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}