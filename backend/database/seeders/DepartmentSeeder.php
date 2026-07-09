<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class departmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['department_id' => 1, 'department_name' => 'Teknik Informatika'],
            ['department_id' => 2, 'department_name' => 'Teknik Permesinan'],
            ['department_id' => 3, 'department_name' => 'Teknik Elektro'],
            ['department_id' => 4, 'department_name' => 'Teknik Sipil'],
            ['department_id' => 5, 'department_name' => 'Administrasi Bisnis'],
        ];

        foreach ($departments as $department) {
            DB::table('departments')->updateOrInsert(
                ['department_id' => $department['department_id']],
                ['department_name' => $department['department_name'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
