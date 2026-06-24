<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JurusanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('jurusans')->insert([
            ['id_jurusan' => 1, 'name_jurusan' => 'Teknik Informatika', 'created_at' => now(), 'updated_at' => now()],
            ['id_jurusan' => 2, 'name_jurusan' => 'Teknik Permesinan', 'created_at' => now(), 'updated_at' => now()],
            ['id_jurusan' => 3, 'name_jurusan' => 'Teknik Elektro', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
