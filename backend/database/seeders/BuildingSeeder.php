<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class buildingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('buildings')->insert([
            ['building_id' => 1, 'building_name' => 'building A', 'created_at' => now(), 'updated_at' => now()],
            ['building_id' => 2, 'building_name' => 'building B', 'created_at' => now(), 'updated_at' => now()],
            ['building_id' => 3, 'building_name' => 'building C', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}