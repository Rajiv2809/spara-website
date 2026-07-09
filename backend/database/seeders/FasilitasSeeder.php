<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Ruangan;

class FasilitasSeeder extends Seeder
{
    public function run(): void
    {
        // Fasilitas per kode ruangan
        $fasilitasData = [
            // ===== GEDUNG A =====
            'A-101' => ['AC', 'Proyektor', 'Papan Tulis', 'Meja Kursi', 'WiFi'],
            'A-102' => ['AC', 'Proyektor', 'Papan Tulis', 'Meja Kursi', 'WiFi'],
            'A-103' => ['AC', 'Papan Tulis', 'Meja Kursi', 'Kipas Angin'],
            'A-104' => ['AC', 'Proyektor', 'Meja Rapat', 'Kursi Rapat', 'WiFi', 'Whiteboard'],
            'A-201' => ['AC', 'Komputer', 'Proyektor', 'Papan Tulis', 'WiFi', 'Printer'],
            'A-202' => ['AC', 'Komputer', 'Router', 'Switch', 'Kabel LAN', 'WiFi', 'Proyektor'],
            'A-203' => ['AC', 'Proyektor', 'Papan Tulis', 'Meja Kursi'],
            'A-301' => ['AC', 'Proyektor', 'Sound System', 'Podium', 'Meja Kursi', 'WiFi', 'Microphone'],
            'A-302' => ['AC', 'Komputer', 'Meja Kerja', 'Loker', 'WiFi'],

            // ===== GEDUNG B =====
            'B-101' => ['AC', 'Proyektor', 'Papan Tulis', 'Meja Kursi', 'WiFi'],
            'B-102' => ['AC', 'Proyektor', 'Papan Tulis', 'Meja Kursi', 'Kipas Angin'],
            'B-103' => ['AC', 'Rak Buku', 'Meja Baca', 'Kursi', 'Komputer Katalog', 'WiFi'],
            'B-201' => ['AC', 'Alat Praktikum Fisika', 'Meja Lab', 'Proyektor', 'WiFi', 'Papan Tulis'],
            'B-202' => ['AC', 'Alat Praktikum Kimia', 'Meja Lab', 'Lemari Bahan', 'Exhaust Fan'],
            'B-203' => ['AC', 'Proyektor', 'Papan Tulis', 'Meja Kursi', 'WiFi'],
            'B-301' => ['AC', 'Sound System', 'Podium', 'Panggung', 'Kursi Lipat', 'Proyektor Besar', 'Microphone', 'WiFi'],
            'B-302' => ['AC', 'Proyektor', 'Meja Rapat', 'Kursi Rapat', 'WiFi', 'Whiteboard', 'TV LED'],

            // ===== GEDUNG C =====
            'C-101' => ['AC', 'Proyektor', 'Papan Tulis', 'Meja Kursi', 'WiFi'],
            'C-102' => ['AC', 'Papan Tulis', 'Meja Kursi'],
            'C-201' => ['AC', 'Komputer', 'Kamera', 'Green Screen', 'Proyektor', 'WiFi', 'Sound System'],
            'C-202' => ['AC', 'Mixer Audio', 'Microphone', 'Headphone', 'Soundproof', 'Komputer Recording'],
            'C-301' => ['AC', 'Proyektor', 'Meja Sidang', 'Kursi', 'WiFi', 'Microphone', 'Whiteboard'],
        ];

        foreach ($fasilitasData as $kodeRuangan => $fasilitas) {
            $ruangan = Ruangan::where('kode_ruangan', $kodeRuangan)->first();

            if (!$ruangan) {
                continue;
            }

            // Hapus fasilitas lama jika sudah ada (idempotent)
            DB::table('fasilitas')->where('id_ruangan', $ruangan->id_ruangan)->delete();

            foreach ($fasilitas as $namaFasilitas) {
                DB::table('fasilitas')->insert([
                    'nama_fasilitas' => $namaFasilitas,
                    'id_ruangan'     => $ruangan->id_ruangan,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }
    }
}
