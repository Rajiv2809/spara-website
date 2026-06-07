<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Peminjaman, Ruangan};
use App\Http\Resources\{RuanganResource, JadwaRuanganResource};

class RuanganController extends Controller
{
    /**
     * Menampilkan semua ruangan
     */
    public function getRuangan()
    {
        $ruangan = Ruangan::all();

        return RuanganResource::collection($ruangan);
    }

    /**
     * Menampilkan detail ruangan
     */
    public function show($id)
    {
        $ruangan = Ruangan::findOrFail($id);

        return new RuanganResource($ruangan);
    }

    /**
     * Menampilkan jadwal ruangan berdasarkan tanggal
     */
    public function jadwalRuangan($id, $tanggal)
    {
        $peminjaman = Peminjaman::where('id_ruangan', $id)
            ->whereDate('hari_tanggal', $tanggal)
            ->get();

        return JadwaRuanganResource::collection($peminjaman);
    }

    /**
     * Menambahkan ruangan baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_ruangan' => 'required|unique:ruangans,kode_ruangan',
            'nama_ruangan' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'fasilitas' => 'required|string',
            'deskripsi_ruangan' => 'nullable|string',
            'status_ruangan' => 'required|in:tersedia,maintenance,tidak_tersedia',
            'nomor_lantai' => 'required',
            'id_gedung' => 'required',
            'nomor_induk_pic' => 'required',
            'path_foto' => 'nullable|string'
        ]);

        $ruangan = Ruangan::create($validated);

        return response()->json([
            'message' => 'Ruangan berhasil ditambahkan',
            'data' => $ruangan
        ], 201);
    }

    /**
     * Mengubah data ruangan
     */
    public function update(Request $request, $id)
    {
        $ruangan = Ruangan::findOrFail($id);

        $validated = $request->validate([
            'kode_ruangan' => 'required|unique:ruangans,kode_ruangan,' . $id . ',id_ruangan',
            'nama_ruangan' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'fasilitas' => 'required|string',
            'deskripsi_ruangan' => 'nullable|string',
            'status_ruangan' => 'required|string',
            'nomor_lantai' => 'required',
            'id_gedung' => 'required',
            'nomor_induk_pic' => 'required',
            'path_foto' => 'nullable|string'
        ]);

        $ruangan->update($validated);

        return response()->json([
            'message' => 'Ruangan berhasil diperbarui',
            'data' => $ruangan
        ]);
    }

    /**
     * Menghapus ruangan
     */
    public function destroy($id)
    {
        $ruangan = Ruangan::findOrFail($id);

        $ruangan->delete();

        return response()->json([
            'message' => 'Ruangan berhasil dihapus'
        ]);
    }
}
