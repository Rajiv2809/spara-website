<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LantaiSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('lantai')->insert([
            ['nomor_lantai' => 1, 'nama_lantai' => 'Lantai 1', 'created_at' => now(), 'updated_at' => now()],
            ['nomor_lantai' => 2, 'nama_lantai' => 'Lantai 2', 'created_at' => now(), 'updated_at' => now()],
            ['nomor_lantai' => 3, 'nama_lantai' => 'Lantai 3', 'created_at' => now(), 'updated_at' => now()],
            ['nomor_lantai' => 4, 'nama_lantai' => 'Lantai 4', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}