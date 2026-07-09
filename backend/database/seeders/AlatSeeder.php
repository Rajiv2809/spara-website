<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlatSeeder extends Seeder
{
    public function run(): void
    {
        $picNomorInduk = DB::table('pics')->value('id_number');

        $alats = [
            ['kode_alat' => 'ALT-001', 'name_alat' => 'Proyektor Epson EB-X41', 'deskripsi_alat' => 'Proyektor portabel untuk presentasi', 'status_alat' => 'tersedia'],
            ['kode_alat' => 'ALT-002', 'name_alat' => 'Laptop Lenovo ThinkPad', 'deskripsi_alat' => 'Laptop untuk keperluan presentasi', 'status_alat' => 'tersedia'],
            ['kode_alat' => 'ALT-003', 'name_alat' => 'Microphone Wireless', 'deskripsi_alat' => 'Mikrofon nirkabel untuk acara', 'status_alat' => 'maintenance'],
            ['kode_alat' => 'ALT-004', 'name_alat' => 'Kamera DSLR Canon EOS', 'deskripsi_alat' => 'Kamera dokumentasi kegiatan', 'status_alat' => 'tersedia'],
            ['kode_alat' => 'ALT-005', 'name_alat' => 'Speaker JBL Portable', 'deskripsi_alat' => 'Speaker untuk acara seminar', 'status_alat' => 'tersedia'],
            ['kode_alat' => 'ALT-006', 'name_alat' => 'Tripod Kamera', 'deskripsi_alat' => 'Tripod untuk dokumentasi', 'status_alat' => 'maintenance'],
            ['kode_alat' => 'ALT-007', 'name_alat' => 'Scanner Epson', 'deskripsi_alat' => 'Scanner kantor untuk dokumen', 'status_alat' => 'tersedia'],
        ];

        foreach ($alats as $alat) {
            DB::table('alats')->updateOrInsert(
                ['kode_alat' => $alat['kode_alat']],
                [
                    'name_alat' => $alat['name_alat'],
                    'deskripsi_alat' => $alat['deskripsi_alat'],
                    'status_alat' => $alat['status_alat'],
                    'id_number_pic' => $picNomorInduk,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}