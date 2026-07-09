<?php

namespace Tests\Feature;

use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KepalaRescheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_head_reschedule_marks_peminjaman_as_disetujui()
    {
        $user = User::create([
            'id_number' => 1001,
            'name' => 'Kepala Uji',
            'email' => 'kepala@example.com',
            'phone_number' => '081234567890',
            'password' => Hash::make('password'),
            'role' => 'kepala',
        ]);

        $peminjaman = Peminjaman::create([
            'name_kegiatan' => 'Rapat Internal',
            'jenis_kegiatan' => 'akademik',
            'hari_tanggal' => now()->addDay()->toDateString(),
            'jam_mulai' => '08:00:00',
            'jam_selesai' => '10:00:00',
            'keterangan' => 'Awal',
            'status_persetujuan' => 'disetujui',
            'id_peminjam' => $user->id_number,
            'id_alat' => null,
            'id_ruangan' => null,
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/kepala/jadwalkan-ulang/{$peminjaman->id_peminjaman}", [
                'hari_tanggal_baru' => now()->addDays(2)->toDateString(),
                'jam_mulai_baru' => '09:00',
                'jam_selesai_baru' => '11:00',
                'alasan_kepala' => 'Perlu penyesuaian jadwal',
            ]);

        $response->assertOk();

        $peminjaman->refresh();

        $this->assertSame('disetujui', $peminjaman->status_persetujuan);
        $this->assertSame(now()->addDays(2)->toDateString(), $peminjaman->hari_tanggal->toDateString());
    }
}