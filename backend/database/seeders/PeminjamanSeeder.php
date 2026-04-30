<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PeminjamanSeeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')->pluck('nomor_induk')->toArray();
        $alats = DB::table('alats')->pluck('id_alat')->toArray();

        $jenisKegiatan = [
           'akademik', 'non-akademik'
        ];

        $keteranganList = [
            'Kebutuhan ruangan untuk kegiatan akademik',
            'Peminjaman alat untuk keperluan praktikum',
            'Kegiatan organisasi mahasiswa',
            'Seminar nasional jurusan',
            'Workshop pengembangan soft skill',
            'Presentasi tugas akhir mahasiswa',
            null,
        ];

        $data = [];

        foreach ($users as $nomorInduk) {
            $jumlah = rand(2, 3);

            for ($j = 0; $j < $jumlah; $j++) {

                $hariTanggal = Carbon::create(2026, 5, rand(1, 31))->toDateString();

                // ✅ jam_mulai antara 07:00 - 16:00
                $mulaiHour   = rand(7, 16);
                $mulaiMinute = [0, 15, 30, 45][rand(0, 3)];

                // ✅ jam_selesai = jam_mulai + 1-3 jam, max 20:00
                $selesaiHour   = min($mulaiHour + rand(1, 3), 20);
                $selesaiMinute = $mulaiMinute;

                $jamMulai   = sprintf('%02d:%02d:00', $mulaiHour, $mulaiMinute);
                $jamSelesai = sprintf('%02d:%02d:00', $selesaiHour, $selesaiMinute);

                $statusList = ['menunggu', 'disetujui', 'ditolak'];
                $status     = $statusList[rand(0, 2)];

                $tipe      = rand(0, 2);
                $idRuangan = in_array($tipe, [0, 2]) ? rand(1, 10) : null;
                $idAlat    = in_array($tipe, [1, 2]) && !empty($alats)
                    ? $alats[rand(0, count($alats) - 1)]
                    : null;

                $now = Carbon::now();

                $data[] = [
                    'nama_kegiatan'      => $jenisKegiatan[rand(0, count($jenisKegiatan) - 1)]
                                            . ' ' . strtoupper(substr(md5(uniqid()), 0, 4)),
                    'jenis_kegiatan'     => $jenisKegiatan[rand(0, count($jenisKegiatan) - 1)],
                    'hari_tanggal'       => $hariTanggal,
                    'jam_mulai'          => $jamMulai,
                    'jam_selesai'        => $jamSelesai,
                    'keterangan'         => $keteranganList[rand(0, count($keteranganList) - 1)],
                    'status_persetujuan' => $status,
                    'id_peminjam'        => $nomorInduk,
                    'id_alat'            => $idAlat,
                    'id_ruangan'         => $idRuangan,
                    'dibuat_pada'        => $now,
                    'diubah_pada'        => $status !== 'menunggu'
                                            ? $now->copy()->addMinutes(rand(5, 120))
                                            : null,
                    'created_at'         => $now,
                    'updated_at'         => $now,
                ];
            }
        }

        DB::table('peminjaman')->insert($data);
    }
}