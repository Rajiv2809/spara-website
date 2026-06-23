<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('nomor_induk', auth('api')->user()->nomor_induk)
            ->with('peminjaman')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function unreadCount()
    {
        $count = Notification::where('nomor_induk', auth('api')->user()->nomor_induk)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markRead($id)
    {
        Notification::where('id', $id)
            ->where('nomor_induk', auth('api')->user()->nomor_induk)
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Berhasil ditandai dibaca']);
    }

    public function markAllRead()
    {
        Notification::where('nomor_induk', auth('api')->user()->nomor_induk)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi dibaca']);
    }
}
