<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AdminController, AuthController, PeminjamanController, RuanganController, AlatController};
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
//init untuk auth
Route::post('/login', [AuthController::class, 'login']);
Route::get('/riwayat-debug', [PeminjamanController::class, 'riwayatDebug']);

Route::middleware('auth:api')->group(function () {
    Route::get('/test', [AuthController::class, 'test']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/get-ruangan', [RuanganController::class, 'getRuangan']);
    Route::get('/ruangan/{id}', [RuanganController::class, 'show']);
    Route::get('/jadwal-ruangan/{id}/{tanggal}', [RuanganController::class, 'jadwalRuangan']);

    Route::post('/ruangan', [RuanganController::class, 'store']);
    Route::put('/ruangan/{id}', [RuanganController::class, 'update']);
    Route::delete('/ruangan/{id}', [RuanganController::class, 'destroy']);

    Route::get('/get-gedung', [RuanganController::class, 'getGedung']);
    Route::get('/get-lantai', [RuanganController::class, 'getLantai']);

    Route::get('/get-alat', [AlatController::class, 'getAlat']);
    Route::get('/alat/{id}', [AlatController::class, 'show']);
    Route::post('/alat', [AlatController::class, 'store']);
    Route::put('/alat/{id}', [AlatController::class, 'update']);
    Route::delete('/alat/{id}', [AlatController::class, 'destroy']);

    Route::post('/peminjaman', [PeminjamanController::class, 'create']);
    Route::get('/peminjaman', [PeminjamanController::class, 'getPeminjaman']);
    Route::get('/peminjaman-all', [PeminjamanController::class, 'getAllPeminjaman']);
    Route::get('/riwayat', [PeminjamanController::class, 'riwayat']);

    Route::get('/penanggung-jawab', [PeminjamanController::class, 'getPenanggungJawab']);

    Route::get('/persetujuan', [PeminjamanController::class, 'getPersetujuan']);
    Route::get('/list-persetujuan', [PeminjamanController::class, 'getPersetujuanList']);

    Route::post('/persetujuan-setujui/{id}', [PeminjamanController::class, 'setujuPeminjaman']);
    Route::post('/persetujuan-tolak/{id}', [PeminjamanController::class, 'tolakPeminjaman']);

    Route::get('/get-admin', [AdminController::class, 'getAdmin']);
    Route::get('/admin/{nomor_induk}', [AdminController::class, 'show']);
    Route::post('/admin', [AdminController::class, 'store']);
    Route::put('/admin/{nomor_induk}', [AdminController::class, 'update']);
    Route::delete('/admin/{nomor_induk}', [AdminController::class, 'destroy']);
});
