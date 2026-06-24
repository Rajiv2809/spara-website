<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Http\Resources\AlatResource;
use App\Http\Resources\JadwaRuanganResource;

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
            'name_alat'        => 'required|string|max:255',
            'deskripsi_alat'   => 'nullable|string',
            'status_alat'      => 'required|in:tersedia,dipinjam,rusak,maintenance',
            'id_number_pic'  => 'nullable|exists:users,id_number',
            'foto'            => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['path_foto'] = $request->file('foto')
                ->store('alat', 'public');
        }
        unset($validated['foto']);

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
            'name_alat'        => 'required|string|max:255',
            'deskripsi_alat'   => 'nullable|string',
            'status_alat'      => 'required|in:tersedia,dipinjam,rusak,maintenance',
            'id_number_pic'  => 'nullable|exists:users,id_number',
            'foto'            => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            if ($alat->path_foto) {
                Storage::disk('public')->delete($alat->path_foto);
            }
            $validated['path_foto'] = $request->file('foto')
                ->store('alat', 'public');
        }
        unset($validated['foto']);

        $alat->update($validated);

        return response()->json([
            'message' => 'Alat berhasil diperbarui',
            'data'    => $alat
        ]);
    }

    public function jadwalAlat(int $id, string $tanggal)
    {
        $peminjaman = Peminjaman::with('persetujuans')
            ->where('id_alat', $id)
            ->whereDate('hari_tanggal', $tanggal)
            ->get();

        return JadwaRuanganResource::collection($peminjaman);
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