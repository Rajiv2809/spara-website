<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class toolSeeder extends Seeder
{
    public function run(): void
    {
        $picNomorInduk = DB::table('pics')->value('id_number');

        DB::table('tools')->insert([
            [
                'tool_code'          => 'ALT-001',
                'tool_name'          => 'Proyektor Epson EB-X41',
                'tool_description'     => 'Proyektor portabel untuk presentasi',
                'tool_status'        => 'tersedia',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'tool_code'          => 'ALT-002',
                'tool_name'          => 'Laptop Lenovo ThinkPad',
                'tool_description'     => 'Laptop untuk keperluan presentasi',
                'tool_status'        => 'tersedia',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'tool_code'          => 'ALT-003',
                'tool_name'          => 'Microphone Wireless',
                'tool_description'     => 'Mikrofon nirkabel untuk acara',
                'tool_status'        => 'maintenance',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'tool_code'          => 'ALT-004',
                'tool_name'          => 'Kamera DSLR Canon EOS',
                'tool_description'     => 'Kamera dokumentasi kegiatan',
                'tool_status'        => 'dipinjam',
                'id_number_pic'    => $picNomorInduk,
                'created_at'         => now(), 'updated_at' => now(),
            ],
        ]);
    }
}