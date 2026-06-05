<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function index()
    {
        $admins = User::where('role', 'admin')
                      ->latest()
                      ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $admins,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_induk' => 'required|integer|unique:users,nomor_induk',
            'nama'        => 'required|string|max:100',
            'email'       => 'required|email|max:100|unique:users,email',
            'no_telepon'  => 'required|string|max:15',
            'password'    => 'required|min:8|confirmed',
            'fotoprofil'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('fotoprofil')) {
            $fotoPath = $request->file('fotoprofil')->store('fotoprofil', 'public');
        }

        $admin = User::create([
            'nomor_induk' => $validated['nomor_induk'],
            'nama'        => $validated['nama'],
            'email'       => $validated['email'],
            'no_telepon'  => $validated['no_telepon'],
            'password'    => Hash::make($validated['password']),
            'fotoprofil'  => $fotoPath,
            'role'        => 'admin',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil ditambahkan.',
            'data'    => $admin,
        ], 201);
    }

    public function show(User $admin)
    {
        abort_if($admin->role !== 'admin', 404, 'Admin tidak ditemukan.');

        return response()->json([
            'success' => true,
            'data'    => $admin,
        ]);
    }

    public function update(Request $request, User $admin)
    {
        abort_if($admin->role !== 'admin', 404, 'Admin tidak ditemukan.');

        $validated = $request->validate([
            'nama'       => 'required|string|max:100',
            'email'      => ['required', 'email', 'max:100', Rule::unique('users')->ignore($admin->nomor_induk, 'nomor_induk')],
            'no_telepon' => 'required|string|max:15',
            'password'   => 'nullable|min:8|confirmed',
            'fotoprofil' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = [
            'nama'       => $validated['nama'],
            'email'      => $validated['email'],
            'no_telepon' => $validated['no_telepon'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('fotoprofil')) {
            // Hapus foto lama jika ada
            if ($admin->fotoprofil) {
                Storage::disk('public')->delete($admin->fotoprofil);
            }
            $data['fotoprofil'] = $request->file('fotoprofil')->store('fotoprofil', 'public');
        }

        $admin->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil diperbarui.',
            'data'    => $admin->fresh(),
        ]);
    }

    public function destroy(User $admin)
    {
        abort_if($admin->role !== 'admin', 404, 'Admin tidak ditemukan.');

        if ($admin->fotoprofil) {
            Storage::disk('public')->delete($admin->fotoprofil);
        }

        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil dihapus.',
        ]);
    }
}