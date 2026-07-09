<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LantaiSeeder extends Seeder
{
    public function run(): void
    {
        $lantai = [
            ['nomor_lantai' => 1, 'name_lantai' => 'Lantai 1'],
            ['nomor_lantai' => 2, 'name_lantai' => 'Lantai 2'],
            ['nomor_lantai' => 3, 'name_lantai' => 'Lantai 3'],
            ['nomor_lantai' => 4, 'name_lantai' => 'Lantai 4'],
            ['nomor_lantai' => 5, 'name_lantai' => 'Lantai 5'],
            ['nomor_lantai' => 6, 'name_lantai' => 'Lantai 6'],
        ];

        foreach ($lantai as $data) {
            DB::table('lantai')->updateOrInsert(
                ['nomor_lantai' => $data['nomor_lantai']],
                ['name_lantai' => $data['name_lantai'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}