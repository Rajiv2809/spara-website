<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    private function formatProfilePhoto($user)
    {
        if ($user && $user->fotoprofil && !str_starts_with($user->fotoprofil, 'http')) {
            $user->fotoprofil = asset('storage/' . $user->fotoprofil);
        }
        return $user;
    }

    public function register(Request $request)
{
    $request->validate([
        'nomor_induk' => 'required|unique:users,nomor_induk',
        'nama' => 'required',
        'email' => 'required|email|unique:users,email',
        'no_telepon' => 'required',
        'id_prodi' => 'required',
        'password' => 'required|confirmed|min:8',
    ]);

    User::create([
        'nomor_induk' => $request->nomor_induk,
        'nama' => $request->nama,
        'email' => $request->email,
        'no_telepon' => $request->no_telepon,
        'password' => Hash::make($request->password),
        'role' => 'mahasiswa'
    ]);

    Mahasiswa::create([
        'nomor_induk' => $request->nomor_induk,
        'id_prodi' => $request->id_prodi,
        'status' => 'aktif'
    ]);

    return response()->json([
        'message' => 'Register berhasil'
    ], 201);
}

    public function login(Request $request)
    {
        $credentials = [
            'nomor_induk' => $request->nomor_induk,
            'password' => $request->password
        ];

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'Login gagal'
            ], 401);
        }

        // ambil data user yang login
        $user = auth()->user();
        $user = $this->formatProfilePhoto($user);

        return $this->respondWithToken($token, $user);
    }
    protected function respondWithToken($token, $user)
    {
        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
    public function me()
    {
        $user = auth()->user();
        $user = $this->formatProfilePhoto($user);


        return response()->json([
            'user' => $user
        ],200);
    }
    public function logout()
    {
        auth()->logout();
        return response()->json([
            'message' => 'Logout berhasil'
        ],200);
    }
    public function test(){

        return response()->json([
            'test' => 'berhasil test'
        ],200);
    }
    public function updateProfilePhoto(Request $request)
    {
        $request->validate([
            'fotoprofil' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = auth()->user();

        // Ambil path asli dari DB
        $oldPath = $user->getRawOriginal('fotoprofil') ?: $user->fotoprofil;

        if ($oldPath && !str_starts_with($oldPath, 'http')) {
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // simpan foto baru ke folder storage/fotoprofil
        $path = $request->file('fotoprofil')->store('fotoprofil', 'public');

        // update path ke database
        $user->fotoprofil = $path;
        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui',
            'user' => $this->formatProfilePhoto($user), 
        ]);
    }
}
