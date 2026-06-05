<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController, PeminjamanController, RuanganController};
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
//init untuk auth
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/test', [AuthController::class, 'test']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/get-ruangan', [RuanganController::class, 'getRuangan']);
    Route::get('/jadwal-ruangan/{id}/{tanggal}', [RuanganController::class, 'jadwalRuangan']);


    Route::post('/peminjaman', [PeminjamanController::class, 'create']);
    Route::get('/peminjaman', [PeminjamanController::class, 'getPeminjaman']);

    Route::get('/penanggung-jawab', [PeminjamanController::class, 'getPenanggungJawab']);

    Route::get('/persetujuan', [PeminjamanController::class, 'getPersetujuan']);
    Route::get('/list-persetujuan', [PeminjamanController::class, 'getPersetujuanList']);

    Route::post('/persetujuan-setujui/{id}', [PeminjamanController::class, 'setujuPeminjaman']);
    Route::post('/persetujuan-tolak/{id}', [PeminjamanController::class, 'tolakPeminjaman']);
});