<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DosenSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('dosens')->insert([
            ['nomor_induk' => 19900001, 'id_jurusan' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['nomor_induk' => 19900002, 'id_jurusan' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}