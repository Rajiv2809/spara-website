<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlatSeeder extends Seeder
{
    public function run(): void
    {
        $picNomorInduk = DB::table('pics')->value('id_number');

        DB::table('alats')->insert([
            [
                'kode_alat'          => 'ALT-001',
                'name_alat'          => 'Proyektor Epson EB-X41',
                'deskripsi_alat'     => 'Proyektor portabel untuk presentasi',
                'status_alat'        => 'tersedia',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_alat'          => 'ALT-002',
                'name_alat'          => 'Laptop Lenovo ThinkPad',
                'deskripsi_alat'     => 'Laptop untuk keperluan presentasi',
                'status_alat'        => 'tersedia',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_alat'          => 'ALT-003',
                'name_alat'          => 'Microphone Wireless',
                'deskripsi_alat'     => 'Mikrofon nirkabel untuk acara',
                'status_alat'        => 'maintenance',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_alat'          => 'ALT-004',
                'name_alat'          => 'Kamera DSLR Canon EOS',
                'deskripsi_alat'     => 'Kamera dokumentasi kegiatan',
                'status_alat'        => 'dipinjam',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
        ]);
    }
}