<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class floorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('floor')->insert([
            ['floor_number' => 1, 'floor_name' => 'floor 1', 'created_at' => now(), 'updated_at' => now()],
            ['floor_number' => 2, 'floor_name' => 'floor 2', 'created_at' => now(), 'updated_at' => now()],
            ['floor_number' => 3, 'floor_name' => 'floor 3', 'created_at' => now(), 'updated_at' => now()],
            ['floor_number' => 4, 'floor_name' => 'floor 4', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}