<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LantaiSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('lantai')->insert([
            ['nomor_lantai' => 1, 'name_lantai' => 'Lantai 1', 'created_at' => now(), 'updated_at' => now()],
            ['nomor_lantai' => 2, 'name_lantai' => 'Lantai 2', 'created_at' => now(), 'updated_at' => now()],
            ['nomor_lantai' => 3, 'name_lantai' => 'Lantai 3', 'created_at' => now(), 'updated_at' => now()],
            ['nomor_lantai' => 4, 'name_lantai' => 'Lantai 4', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}