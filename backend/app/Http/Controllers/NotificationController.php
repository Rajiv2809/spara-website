<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('id_number', auth('api')->user()->id_number)
            ->with('peminjaman')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function unreadCount()
    {
        $count = Notification::where('id_number', auth('api')->user()->id_number)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markRead($id)
    {
        Notification::where('id', $id)
            ->where('id_number', auth('api')->user()->id_number)
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Berhasil ditandai dibaca']);
    }

    public function markAllRead()
    {
        Notification::where('id_number', auth('api')->user()->id_number)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi dibaca']);
    }
}
