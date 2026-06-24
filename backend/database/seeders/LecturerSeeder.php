<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class lecturerSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('lecturers')->insert([
            ['id_number' => 19900001, 'id_jurusan' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id_number' => 19900002, 'id_jurusan' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}