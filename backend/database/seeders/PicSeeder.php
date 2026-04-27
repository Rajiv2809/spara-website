<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PicSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pics')->insert([
            ['nomor_induk' => 20230001, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}