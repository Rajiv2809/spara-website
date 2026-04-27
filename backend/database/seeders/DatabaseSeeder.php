<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            JurusanSeeder::class,
            ProgramStudiSeeder::class,
            LantaiSeeder::class,
            GedungSeeder::class,
            UserSeeder::class,
            DosenSeeder::class,
            PicSeeder::class,
            MahasiswaSeeder::class,
            PegawaiSbumSeeder::class,
            RuanganSeeder::class,
            AlatSeeder::class,
        ]);
    }
}