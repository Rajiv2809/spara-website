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
            floorSeeder::class,
            buildingSeeder::class,
            PicSeeder::class,
            lecturerSeeder::class,
            mahasiswaSeeder::class,
            PegawaiSbumSeeder::class,
            toolSeeder::class,
            roomSeeder::class,
            loanSeeder::class,
            
        ]);
    }
}