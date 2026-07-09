<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PicSeeder extends Seeder
{
    public function run(): void
    {
        $pics = [
            ['id_number' => 20230001],
            ['id_number' => 20230002],
        ];

        foreach ($pics as $pic) {
            DB::table('pics')->updateOrInsert(
                ['id_number' => $pic['id_number']],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}