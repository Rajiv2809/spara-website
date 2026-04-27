<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RuanganSeeder extends Seeder
{
    public function run(): void
    {
        // nomor_induk_pic merujuk ke kolom nomor_induk di tabel pics
        $picNomorInduk = DB::table('pics')->value('nomor_induk');

        DB::table('ruangans')->insert([
            [
                'kode_ruangan'       => 'A-101',
                'nama_ruangan'       => 'Ruang Kelas A101',
                'kapasitas'          => 40,
                'fasilitas'          => 'Proyektor, AC, Whiteboard',
                'deskripsi_ruangan'  => 'Ruang kelas standar lantai 1',
                'status_ruangan'     => 'tersedia',
                'path_foto'          => 'ruangan/a101.jpg',
                'id_gedung'          => 1,
                'nomor_induk_pic'    => $picNomorInduk,
                'nomor_lantai'       => 1,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_ruangan'       => 'A-201',
                'nama_ruangan'       => 'Ruang Lab Komputer A201',
                'kapasitas'          => 30,
                'fasilitas'          => 'Komputer, AC, Proyektor',
                'deskripsi_ruangan'  => 'Laboratorium komputer lantai 2',
                'status_ruangan'     => 'tersedia',
                'path_foto'          => 'ruangan/a201.jpg',
                'id_gedung'          => 1,
                'nomor_induk_pic'    => $picNomorInduk,
                'nomor_lantai'       => 2,
                'created_at'         => now(), 'updated_at' => now(),
            ],
            [
                'kode_ruangan'       => 'B-301',
                'nama_ruangan'       => 'Aula Gedung B',
                'kapasitas'          => 200,
                'fasilitas'          => 'Sound System, Proyektor, AC',
                'deskripsi_ruangan'  => 'Aula serbaguna lantai 3',
                'status_ruangan'     => 'tersedia',
                'path_foto'          => 'ruangan/b301.jpg',
                'id_gedung'          => 2,
                'nomor_induk_pic'    => null,
                'nomor_lantai'       => 3,
                'created_at'         => now(), 'updated_at' => now(),
            ],
        ]);
    }
}