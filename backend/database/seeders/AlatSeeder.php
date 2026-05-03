<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlatSeeder extends Seeder
{
    public function run(): void
    {
        $picNomorInduk = DB::table('pics')->value('nomor_induk');

        DB::table('alats')->insert([
            [
                'kode_alat'          => 'ALT-001',
                'nama_alat'          => 'Proyektor Epson EB-X41',
                'deskripsi_alat'     => 'Proyektor portabel untuk presentasi',
                'status_alat'        => 'tersedia',
                'nomor_induk_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_alat'          => 'ALT-002',
                'nama_alat'          => 'Laptop Lenovo ThinkPad',
                'deskripsi_alat'     => 'Laptop untuk keperluan presentasi',
                'status_alat'        => 'tersedia',
                'nomor_induk_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_alat'          => 'ALT-003',
                'nama_alat'          => 'Microphone Wireless',
                'deskripsi_alat'     => 'Mikrofon nirkabel untuk acara',
                'status_alat'        => 'maintenance',
                'nomor_induk_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_alat'          => 'ALT-004',
                'nama_alat'          => 'Kamera DSLR Canon EOS',
                'deskripsi_alat'     => 'Kamera dokumentasi kegiatan',
                'status_alat'        => 'dipinjam',
                'nomor_induk_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
        ]);
    }
}