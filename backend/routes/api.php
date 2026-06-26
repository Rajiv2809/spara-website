<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AdminController, AuthController, PeminjamanController, RuanganController, AlatController, KepalaController, NotificationController};
use App\Models\{Alat, Ruangan, User};
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
//init untuk auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/riwayat-debug', [PeminjamanController::class, 'riwayatDebug']);

// Public stats for landing page (no auth required)
Route::get('/public-stats', function () {
    return response()->json([
        'alat'    => Alat::count(),
        'ruangan' => Ruangan::count(),
        'users'   => User::count(),
    ]);
});

Route::get('/get-ruangan', [RuanganController::class, 'getRuangan']);
Route::middleware('auth:api')->group(function () {
    Route::get('/test', [AuthController::class, 'test']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/update-profile-photo', [AuthController::class, 'updateProfilePhoto']);
    Route::post('/update-profile-phone', [AuthController::class, 'updateProfilePhone']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);

    Route::get('/ruangan/{id}', [RuanganController::class, 'show']);
    Route::get('/jadwal-ruangan/{id}/{tanggal}', [RuanganController::class, 'jadwalRuangan']);

    Route::post('/ruangan', [RuanganController::class, 'store']);
    Route::put('/ruangan/{id}', [RuanganController::class, 'update']);
    Route::delete('/ruangan/{id}', [RuanganController::class, 'destroy']);

    Route::get('/get-gedung', [RuanganController::class, 'getGedung']);
    Route::get('/get-lantai', [RuanganController::class, 'getLantai']);

    Route::get('/get-alat', [AlatController::class, 'getAlat']);
    Route::get('/alat/{id}', [AlatController::class, 'show']);
    Route::get('/jadwal-alat/{id}/{tanggal}', [AlatController::class, 'jadwalAlat']);
    Route::post('/alat', [AlatController::class, 'store']);
    Route::put('/alat/{id}', [AlatController::class, 'update']);
    Route::delete('/alat/{id}', [AlatController::class, 'destroy']);

    Route::post('/peminjaman', [PeminjamanController::class, 'create']);
    Route::get('/peminjaman', [PeminjamanController::class, 'getPeminjaman']);
    Route::get('/peminjaman-all', [PeminjamanController::class, 'getAllPeminjaman']);
    Route::get('/riwayat', [PeminjamanController::class, 'riwayat']);
    Route::post('/peminjaman-rekapitulasi', [PeminjamanController::class, 'getPeminjamanRekapitulasi']);

    Route::get('/penanggung-jawab', [PeminjamanController::class, 'getPenanggungJawab']);
    Route::get('/dashboard-stats', [PeminjamanController::class, 'dashboard']);

    Route::get('/persetujuan', [PeminjamanController::class, 'getPersetujuan']);
    Route::get('/list-persetujuan', [PeminjamanController::class, 'getPersetujuanList']);

    Route::post('/persetujuan-setujui/{id}', [PeminjamanController::class, 'setujuPeminjaman']);
    Route::post('/persetujuan-tolak/{id}', [PeminjamanController::class, 'tolakPeminjaman']);
    Route::post('/peminjaman-batal/{id}', [PeminjamanController::class, 'cancelPeminjaman']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::get('/get-admin', [AdminController::class, 'getAdmin']);
    Route::get('/admin/{id_number}', [AdminController::class, 'show']);
    Route::post('/admin', [AdminController::class, 'store']);
    Route::put('/admin/{id_number}', [AdminController::class, 'update']);
    Route::delete('/admin/{id_number}', [AdminController::class, 'destroy']);

    Route::prefix('kepala')->group(function () {
        Route::get('/monitoring-peminjaman', [KepalaController::class, 'getMonitoringPeminjaman']);
        Route::post('/batalkan-peminjaman/{id}', [KepalaController::class, 'batalkanPeminjaman']);
        Route::post('/jadwalkan-ulang/{id}', [KepalaController::class, 'jadwalkanUlang']);
        Route::post('/cek-ketersediaan', [KepalaController::class, 'cekKetersediaan']);
    });
});
