<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    private function formatProfilePhoto($user)
    {
        if ($user && $user->profile_picture && !str_starts_with($user->profile_picture, 'http')) {
            $user->profile_picture = asset('storage/' . $user->profile_picture);
        }
        return $user;
    }

    public function register(Request $request)
{
    $request->validate([
        'id_number' => 'required|unique:users,id_number',
        'name' => 'required',
        'email' => 'required|email|unique:users,email',
        'phone_number' => 'required',
        'study_program_id' => 'required',
        'password' => 'required|confirmed|min:8',
    ]);

    User::create([
        'id_number' => $request->id_number,
        'name' => $request->name,
        'email' => $request->email,
        'phone_number' => $request->phone_number,
        'password' => Hash::make($request->password),
        'role' => 'mahasiswa'
    ]);

    mahasiswa::create([
        'id_number' => $request->id_number,
        'study_program_id' => $request->study_program_id,
        'status' => 'aktif'
    ]);

    return response()->json([
        'message' => 'Register berhasil'
    ], 201);
}

    public function login(Request $request)
    {
        $credentials = [
            'id_number' => $request->id_number,
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
            'profile_picture' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = auth()->user();

        // Ambil path asli dari DB
        $oldPath = $user->getRawOriginal('profile_picture') ?: $user->profile_picture;

        if ($oldPath && !str_starts_with($oldPath, 'http')) {
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // simpan foto baru ke folder storage/profile_picture
        $path = $request->file('profile_picture')->store('profile_picture', 'public');

        // update path ke database
        $user->profile_picture = $path;
        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui',
            'user' => $this->formatProfilePhoto($user),
        ]);
    }
    public function updateProfilePhone(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'phone_number' => 'required|numeric|digits_between:10,15',
        ], [
            'phone_number.required' => 'Nomor telepon tidak boleh kosong.',
            'phone_number.numeric' => 'Nomor telepon harus berupa angka.',
            'phone_number.digits_between' => 'Nomor telepon harus di antara 10 sampai 15 digit.',
        ]);

        // Ambil data user 
        $user = auth()->user();

        // 3. Update nomor telepon di database
        $user->phone_number = $request->phone_number;
        $user->save();

        return response()->json([
            'message' => 'Nomor telepon berhasil diperbarui',
            'user' => $this->formatProfilePhoto($user),
        ], 200);
    }
}
