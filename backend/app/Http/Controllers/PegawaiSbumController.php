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
            'id_number' => 'required|integer|unique:users,id_number',
            'name'        => 'required|string|max:100',
            'email'       => 'required|email|max:100|unique:users,email',
            'phone_number'  => 'required|string|max:15',
            'password'    => 'required|min:8|confirmed',
            'profile_picture'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('profile_picture')) {
            $fotoPath = $request->file('profile_picture')->store('profile_picture', 'public');
        }

        $admin = User::create([
            'id_number' => $validated['id_number'],
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'phone_number'  => $validated['phone_number'],
            'password'    => Hash::make($validated['password']),
            'profile_picture'  => $fotoPath,
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
            'name'       => 'required|string|max:100',
            'email'      => ['required', 'email', 'max:100', Rule::unique('users')->ignore($admin->id_number, 'id_number')],
            'phone_number' => 'required|string|max:15',
            'password'   => 'nullable|min:8|confirmed',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = [
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'phone_number' => $validated['phone_number'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('profile_picture')) {
            // Hapus foto lama jika ada
            if ($admin->profile_picture) {
                Storage::disk('public')->delete($admin->profile_picture);
            }
            $data['profile_picture'] = $request->file('profile_picture')->store('profile_picture', 'public');
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

        if ($admin->profile_picture) {
            Storage::disk('public')->delete($admin->profile_picture);
        }

        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil dihapus.',
        ]);
    }
}