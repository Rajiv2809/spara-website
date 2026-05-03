<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            JurusanSeeder::class,
            ProgramStudiSeeder::class,
            LantaiSeeder::class,
            GedungSeeder::class,
            PicSeeder::class,
            DosenSeeder::class,
            MahasiswaSeeder::class,
            PegawaiSbumSeeder::class,
            AlatSeeder::class,
            RuanganSeeder::class,
            PeminjamanSeeder::class,
            
        ]);
    }
}