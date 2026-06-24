<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function register(Request $request)
{
    $request->validate([
        'id_number' => 'required|unique:users,id_number',
        'name' => 'required',
        'email' => 'required|email|unique:users,email',
        'phone_number' => 'required',
        'id_prodi' => 'required',
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
}
