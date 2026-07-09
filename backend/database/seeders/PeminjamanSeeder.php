<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PeminjamanSeeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')->pluck('id_number')->toArray();
        $alats = DB::table('alats')->pluck('id_alat')->toArray();
        $ruangans = DB::table('ruangans')->pluck('id_ruangan')->toArray();

        $data = [
            [
                'name_kegiatan' => 'Workshop Pemrograman',
                'jenis_kegiatan' => 'akademik',
                'hari_tanggal' => Carbon::today()->addDays(2)->toDateString(),
                'jam_mulai' => '08:00:00',
                'jam_selesai' => '10:00:00',
                'keterangan' => 'Kegiatan praktikum pemrograman dasar',
                'status_persetujuan' => 'disetujui',
                'id_peminjam' => $users[0] ?? 10000001,
                'id_alat' => $alats[0] ?? null,
                'id_ruangan' => $ruangans[0] ?? null,
                'dibuat_pada' => Carbon::now(),
                'diubah_pada' => Carbon::now()->addHour(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_kegiatan' => 'Seminar Alumni',
                'jenis_kegiatan' => 'non-akademik',
                'hari_tanggal' => Carbon::today()->addDays(5)->toDateString(),
                'jam_mulai' => '13:00:00',
                'jam_selesai' => '15:00:00',
                'keterangan' => 'Seminar pengembangan karier',
                'status_persetujuan' => 'menunggu',
                'id_peminjam' => $users[1] ?? 10000002,
                'id_alat' => null,
                'id_ruangan' => $ruangans[1] ?? null,
                'dibuat_pada' => Carbon::now(),
                'diubah_pada' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_kegiatan' => 'Kunjungan Industri',
                'jenis_kegiatan' => 'akademik',
                'hari_tanggal' => Carbon::today()->addDays(7)->toDateString(),
                'jam_mulai' => '09:30:00',
                'jam_selesai' => '12:00:00',
                'keterangan' => 'Kegiatan kunjungan industri mahasiswa',
                'status_persetujuan' => 'ditolak',
                'id_peminjam' => $users[2] ?? 10000003,
                'id_alat' => $alats[1] ?? null,
                'id_ruangan' => null,
                'dibuat_pada' => Carbon::now(),
                'diubah_pada' => Carbon::now()->addHours(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        $jenisKegiatan = ['akademik', 'non-akademik'];
        $keteranganList = [
            'Kebutuhan ruangan untuk kegiatan akademik',
            'Peminjaman alat untuk keperluan praktikum',
            'Kegiatan organisasi mahasiswa',
            'Seminar nasional department',
            'Workshop pengembangan soft skill',
            'Presentasi tugas akhir mahasiswa',
            null,
        ];

        $today = Carbon::today();
        $maxDate = Carbon::createFromTimestamp(min($today->copy()->addDays(15)->timestamp, $today->copy()->endOfMonth()->timestamp));

        foreach ($users as $nomorInduk) {
            $jumlah = rand(2, 3);

            for ($j = 0; $j < $jumlah; $j++) {
                $hariTanggal = Carbon::createFromTimestamp(rand($today->timestamp, $maxDate->timestamp))->toDateString();
                $mulaiHour = rand(7, 16);
                $mulaiMinute = [0, 15, 30, 45][rand(0, 3)];
                $selesaiHour = min($mulaiHour + rand(1, 3), 20);
                $selesaiMinute = $mulaiMinute;
                $jamMulai = sprintf('%02d:%02d:00', $mulaiHour, $mulaiMinute);
                $jamSelesai = sprintf('%02d:%02d:00', $selesaiHour, $selesaiMinute);
                $statusList = ['menunggu', 'disetujui', 'ditolak'];
                $status = $statusList[rand(0, 2)];
                $pinjamRuangan = rand(0, 1) === 0;
                $idRuangan = $pinjamRuangan ? ($ruangans[array_rand($ruangans)] ?? null) : null;
                $idAlat = ! $pinjamRuangan && ! empty($alats) ? ($alats[array_rand($alats)] ?? null) : null;
                $now = Carbon::now();

                $data[] = [
                    'name_kegiatan' => $jenisKegiatan[array_rand($jenisKegiatan)] . ' ' . strtoupper(substr(md5(uniqid()), 0, 4)),
                    'jenis_kegiatan' => $jenisKegiatan[array_rand($jenisKegiatan)],
                    'hari_tanggal' => $hariTanggal,
                    'jam_mulai' => $jamMulai,
                    'jam_selesai' => $jamSelesai,
                    'keterangan' => $keteranganList[array_rand($keteranganList)],
                    'status_persetujuan' => $status,
                    'id_peminjam' => $nomorInduk,
                    'id_alat' => $idAlat,
                    'id_ruangan' => $idRuangan,
                    'dibuat_pada' => $now,
                    'diubah_pada' => $status !== 'menunggu' ? $now->copy()->addMinutes(rand(5, 120)) : null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('peminjaman')->insert($data);
    }
}