<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class loanSeeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')->pluck('id_number')->toArray();
        $tools = DB::table('tools')->pluck('tool_id')->toArray();

        $jenisKegiatan = [
            'akademik',
            'non-akademik'
        ];

        $keteranganList = [
            'Kebutuhan room untuk kegiatan akademik',
            'loan tool untuk keperluan praktikum',
            'Kegiatan organisasi mahasiswa',
            'Seminar nasional department',
            'Workshop pengembangan soft skill',
            'Presentasi tugas akhir mahasiswa',
            null,
        ];

        $data = [];

        $today = Carbon::today();

        // Maksimal tanggal = 15 hari ke depan atau akhir bulan (mana yang lebih dulu)
        $maxDate = Carbon::createFromTimestamp(
            min(
                $today->copy()->addDays(15)->timestamp,
                $today->copy()->endOfMonth()->timestamp
            )
        );

        foreach ($users as $nomorInduk) {
            $jumlah = rand(2, 3);

            for ($j = 0; $j < $jumlah; $j++) {

                $hariTanggal = Carbon::createFromTimestamp(
                    rand(
                        $today->timestamp,
                        $maxDate->timestamp
                    )
                )->toDateString();

                $mulaiHour = rand(7, 16);
                $mulaiMinute = [0, 15, 30, 45][rand(0, 3)];

                $selesaiHour = min($mulaiHour + rand(1, 3), 20);
                $selesaiMinute = $mulaiMinute;

                $jamMulai = sprintf(
                    '%02d:%02d:00',
                    $mulaiHour,
                    $mulaiMinute
                );

                $jamSelesai = sprintf(
                    '%02d:%02d:00',
                    $selesaiHour,
                    $selesaiMinute
                );

                $statusList = [
                    'menunggu',
                    'disetujui',
                    'ditolak'
                ];

                $status = $statusList[rand(0, 2)];

                $pinjamroom = rand(0, 1) === 0;

                $idroom = $pinjamroom
                    ? rand(1, 10)
                    : null;

                $idtool = !$pinjamroom && !empty($tools)
                    ? $tools[array_rand($tools)]
                    : null;

                $now = Carbon::now();

                $data[] = [
                    'name_kegiatan'      => $jenisKegiatan[array_rand($jenisKegiatan)]
                                            . ' ' .
                                            strtoupper(substr(md5(uniqid()), 0, 4)),
                    'jenis_kegiatan'     => $jenisKegiatan[array_rand($jenisKegiatan)],
                    'hari_tanggal'       => $hariTanggal,
                    'jam_mulai'          => $jamMulai,
                    'jam_selesai'        => $jamSelesai,
                    'keterangan'         => $keteranganList[array_rand($keteranganList)],
                    'status_persetujuan' => $status,
                    'id_peminjam'        => $nomorInduk,
                    'tool_id'            => $idtool,
                    'room_id'         => $idroom,
                    'dibuat_pada'        => $now,
                    'diubah_pada'        => $status !== 'menunggu'
                                            ? $now->copy()->addMinutes(rand(5, 120))
                                            : null,
                    'created_at'         => $now,
                    'updated_at'         => $now,
                ];
            }
        }

        DB::table('loan')->insert($data);
    }
}