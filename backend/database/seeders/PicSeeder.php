<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PicSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pics')->insert([
            ['id_number' => 20230001, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}