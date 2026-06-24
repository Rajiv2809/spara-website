<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class departmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('departments')->insert([
            ['department_id' => 1, 'department_name' => 'Teknik Informatika', 'created_at' => now(), 'updated_at' => now()],
            ['department_id' => 2, 'department_name' => 'Teknik Permesinan', 'created_at' => now(), 'updated_at' => now()],
            ['department_id' => 3, 'department_name' => 'Teknik Elektro', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
