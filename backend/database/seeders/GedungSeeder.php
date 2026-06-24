<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GedungSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('gedungs')->insert([
            ['id_gedung' => 1, 'name_gedung' => 'Gedung A', 'created_at' => now(), 'updated_at' => now()],
            ['id_gedung' => 2, 'name_gedung' => 'Gedung B', 'created_at' => now(), 'updated_at' => now()],
            ['id_gedung' => 3, 'name_gedung' => 'Gedung C', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}