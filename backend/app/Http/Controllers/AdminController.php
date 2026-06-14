<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminController extends Controller
{
    private function checkKetua()
    {
        if (auth()->user()->role !== 'ketua') {
            abort(403, 'Akses ditolak');
        }
    }

    public function getAdmin()
    {
        $this->checkKetua();

        $admins = User::where('role', 'admin')->get();

        return response()->json($admins);
    }

    public function show($nomor_induk)
    {
        $this->checkKetua();

        $admin = User::where('role', 'admin')
            ->where('nomor_induk', $nomor_induk)
            ->firstOrFail();

        return response()->json($admin);
    }

    public function store(Request $request)
    {
        $this->checkKetua();

        $validated = $request->validate([
            'nomor_induk' => 'required|unique:users,nomor_induk',
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'no_telepon' => 'required|string|max:20',
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

    public function update(Request $request, $nomor_induk)
    {
        $this->checkKetua();

        $admin = User::where('role', 'admin')
            ->where('nomor_induk', $nomor_induk)
            ->firstOrFail();

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $nomor_induk . ',nomor_induk',
            'no_telepon' => 'required|string|max:20',
        ]);

        $admin->update($validated);

        return response()->json([
            'message' => 'Admin berhasil diperbarui',
            'data' => $admin
        ]);
    }

    public function destroy($nomor_induk)
    {
        $this->checkKetua();

        $admin = User::where('role', 'admin')
            ->where('nomor_induk', $nomor_induk)
            ->firstOrFail();

        $admin->delete();

        return response()->json([
            'message' => 'Admin berhasil dihapus'
        ]);
    }
}