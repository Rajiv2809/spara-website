<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\{Peminjaman, Ruangan, Gedungs, Lantai};
use App\Http\Resources\{RuanganResource, JadwaRuanganResource};

class RuanganController extends Controller
{

    public function getRuangan()
    {
        $ruangan = Ruangan::with(['gedung', 'pic.user'])->get();
        return RuanganResource::collection($ruangan);
    }

    public function show(int $id)
    {
        $ruangan = Ruangan::with(['gedung', 'pic.user'])->findOrFail($id);
        return new RuanganResource($ruangan);
    }

    public function jadwalRuangan(int $id, string $tanggal)
    {
        $peminjaman = Peminjaman::where('id_ruangan', $id)
            ->whereDate('hari_tanggal', $tanggal)
            ->get();

        return JadwaRuanganResource::collection($peminjaman);
    }

    public function getGedung()
    {
        $gedung = Gedungs::all(['id_gedung', 'nama_gedung']);
        return response()->json(['data' => $gedung]);
    }

    public function getLantai()
    {
        $lantai = Lantai::all(['nomor_lantai', 'nama_lantai'])
            ->sortBy('nomor_lantai')
            ->values();
        return response()->json(['data' => $lantai]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_ruangan'      => 'required|unique:ruangans,kode_ruangan',
            'nama_ruangan'      => 'required|string|max:255',
            'kapasitas'         => 'required|integer|min:1',
            'fasilitas'         => 'required|string',
            'deskripsi_ruangan' => 'nullable|string',
            'status_ruangan'    => 'required|in:tersedia,maintenance,tidak_tersedia',
            'nomor_lantai'      => 'required|exists:lantai,nomor_lantai',
            'id_gedung'         => 'required|exists:gedungs,id_gedung',
            'nomor_induk_pic'   => 'required|exists:users,nomor_induk',
            'foto'              => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['path_foto'] = $request->file('foto')
                ->store('ruangan', 'public');
        }
        unset($validated['foto']);

        $ruangan = Ruangan::create($validated);
        $ruangan->load(['gedung', 'pic.user']);

        return response()->json([
            'message' => 'Ruangan berhasil ditambahkan',
            'data'    => new RuanganResource($ruangan),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $ruangan = Ruangan::findOrFail($id);

        $validated = $request->validate([
            'kode_ruangan'      => 'required|unique:ruangans,kode_ruangan,' . $id . ',id_ruangan',
            'nama_ruangan'      => 'required|string|max:255',
            'kapasitas'         => 'required|integer|min:1',
            'fasilitas'         => 'required|string',
            'deskripsi_ruangan' => 'nullable|string',
            'status_ruangan'    => 'required|in:tersedia,maintenance,tidak_tersedia',
            'nomor_lantai'      => 'required|exists:lantai,nomor_lantai',
            'id_gedung'         => 'required|exists:gedungs,id_gedung',
            'nomor_induk_pic'   => 'required|exists:users,nomor_induk',
            'foto'              => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            if ($ruangan->path_foto) {
                Storage::disk('public')->delete($ruangan->path_foto);
            }
            $validated['path_foto'] = $request->file('foto')
                ->store('ruangan', 'public');
        }
        unset($validated['foto']);

        $ruangan->update($validated);
        $ruangan->load(['gedung', 'pic.user']);

        return response()->json([
            'message' => 'Ruangan berhasil diperbarui',
            'data'    => new RuanganResource($ruangan->fresh()),
        ]);
    }

    public function destroy(int $id)
    {
        $ruangan = Ruangan::findOrFail($id);
        $ruangan->delete();

        return response()->json([
            'message' => 'Ruangan berhasil dihapus'
        ]);
    }
}