<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Alat;
use App\Http\Resources\AlatResource;

class AlatController extends Controller
{
    public function getAlat()
    {
        $alat = Alat::all();
        return AlatResource::collection($alat);
    }

    public function show($id)
    {
        $alat = Alat::findOrFail($id);
        return new AlatResource($alat);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_alat'        => 'required|unique:alats,kode_alat',
            'nama_alat'        => 'required|string|max:255',
            'deskripsi_alat'   => 'nullable|string',
            'status_alat'      => 'required|in:tersedia,dipinjam,rusak,maintenance',
            'nomor_induk_pic'  => 'nullable|exists:users,nomor_induk',
        ]);

        $alat = Alat::create($validated);

        return response()->json([
            'message' => 'Alat berhasil ditambahkan',
            'data'    => $alat
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $alat = Alat::findOrFail($id);

        $validated = $request->validate([
            'kode_alat'        => 'required|unique:alats,kode_alat,' . $id . ',id_alat',
            'nama_alat'        => 'required|string|max:255',
            'deskripsi_alat'   => 'nullable|string',
            'status_alat'      => 'required|in:tersedia,dipinjam,rusak,maintenance',
            'nomor_induk_pic'  => 'nullable|exists:users,nomor_induk',
        ]);

        $alat->update($validated);

        return response()->json([
            'message' => 'Alat berhasil diperbarui',
            'data'    => $alat
        ]);
    }

    public function destroy($id)
    {
        $alat = Alat::findOrFail($id);
        $alat->delete();

        return response()->json([
            'message' => 'Alat berhasil dihapus'
        ]);
    }
}