<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            departmentSeeder::class,
            StudyProgramSeeder::class,
            LantaiSeeder::class,
            GedungSeeder::class,
            PicSeeder::class,
            lecturerSeeder::class,
            mahasiswaSeeder::class,
            PegawaiSbumSeeder::class,
            AlatSeeder::class,
            RuanganSeeder::class,
            PeminjamanSeeder::class,
            
        ]);
    }
}