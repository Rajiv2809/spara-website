<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GedungSeeder extends Seeder
{
    public function run(): void
    {
        $gedungs = [
            ['id_gedung' => 1, 'name_gedung' => 'Gedung A'],
            ['id_gedung' => 2, 'name_gedung' => 'Gedung B'],
            ['id_gedung' => 3, 'name_gedung' => 'Gedung C'],
            ['id_gedung' => 4, 'name_gedung' => 'Gedung D'],
            ['id_gedung' => 5, 'name_gedung' => 'Gedung E'],
        ];

        foreach ($gedungs as $gedung) {
            DB::table('gedungs')->updateOrInsert(
                ['id_gedung' => $gedung['id_gedung']],
                ['name_gedung' => $gedung['name_gedung'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}