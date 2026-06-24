<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AdminController, AuthController, loanController, roomController, toolController, KepalaController, NotificationController};
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
//init untuk auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/riwayat-debug', [loanController::class, 'riwayatDebug']);

Route::middleware('auth:api')->group(function () {
    Route::get('/test', [AuthController::class, 'test']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/update-profile-photo', [AuthController::class, 'updateProfilePhoto']);

    Route::get('/get-room', [roomController::class, 'getroom']);
    Route::get('/room/{id}', [roomController::class, 'show']);
    Route::get('/jadwal-room/{id}/{tanggal}', [roomController::class, 'jadwalroom']);

    Route::post('/room', [roomController::class, 'store']);
    Route::put('/room/{id}', [roomController::class, 'update']);
    Route::delete('/room/{id}', [roomController::class, 'destroy']);

    Route::get('/get-building', [roomController::class, 'getbuilding']);
    Route::get('/get-floor', [roomController::class, 'getfloor']);

    Route::get('/get-tool', [toolController::class, 'gettool']);
    Route::get('/tool/{id}', [toolController::class, 'show']);
    Route::get('/jadwal-tool/{id}/{tanggal}', [toolController::class, 'jadwaltool']);
    Route::post('/tool', [toolController::class, 'store']);
    Route::put('/tool/{id}', [toolController::class, 'update']);
    Route::delete('/tool/{id}', [toolController::class, 'destroy']);

    Route::post('/loan', [loanController::class, 'create']);
    Route::get('/loan', [loanController::class, 'getloan']);
    Route::get('/loan-all', [loanController::class, 'getAllloan']);
    Route::get('/riwayat', [loanController::class, 'riwayat']);
    Route::post('/loan-rekapitulasi', [loanController::class, 'getloanRekapitulasi']);

    Route::get('/penanggung-jawab', [loanController::class, 'getPenanggungJawab']);
    Route::get('/dashboard-stats', [loanController::class, 'dashboard']);

    Route::get('/persetujuan', [loanController::class, 'getPersetujuan']);
    Route::get('/list-persetujuan', [loanController::class, 'getPersetujuanList']);

    Route::post('/persetujuan-setujui/{id}', [loanController::class, 'setujuloan']);
    Route::post('/persetujuan-tolak/{id}', [loanController::class, 'tolakloan']);
    Route::post('/loan-batal/{id}', [loanController::class, 'cancelloan']);

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
        Route::get('/monitoring-loan', [KepalaController::class, 'getMonitoringloan']);
        Route::post('/batalkan-loan/{id}', [KepalaController::class, 'batalkanloan']);
        Route::post('/jadwalkan-ulang/{id}', [KepalaController::class, 'jadwalkanUlang']);
        Route::post('/cek-ketersediaan', [KepalaController::class, 'cekKetersediaan']);
    });
});
