<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminController extends Controller
{
    private function checkKetua()
    {
        if (auth()->user()->role !== 'kepala') {
            abort(403, 'Akses ditolak');
        }
    }

    public function getAdmin()
    {
        $this->checkKetua();

        $admins = User::where('role', 'admin')->get();

        return response()->json($admins);
    }

    public function show($id_number)
    {
        $this->checkKetua();

        $admin = User::where('role', 'admin')
            ->where('id_number', $id_number)
            ->firstOrFail();

        return response()->json($admin);
    }

    public function store(Request $request)
    {
        $this->checkKetua();

        $validated = $request->validate([
            'id_number' => 'required|unique:users,id_number',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'required|string|max:20',
            'password' => 'required|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'admin';

        $admin = User::create($validated);

        return response()->json([
            'message' => 'Admin berhasil ditambahkan',
            'data' => $admin
        ], 201);
    }

    public function update(Request $request, $id_number)
    {
        $this->checkKetua();

        $admin = User::where('role', 'admin')
            ->where('id_number', $id_number)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id_number . ',id_number',
            'phone_number' => 'required|string|max:20',
        ]);

        $admin->update($validated);

        return response()->json([
            'message' => 'Admin berhasil diperbarui',
            'data' => $admin
        ]);
    }

    public function destroy($id_number)
    {
        $this->checkKetua();

        $admin = User::where('role', 'admin')
            ->where('id_number', $id_number)
            ->firstOrFail();

        $admin->delete();

        return response()->json([
            'message' => 'Admin berhasil dihapus'
        ]);
    }
}