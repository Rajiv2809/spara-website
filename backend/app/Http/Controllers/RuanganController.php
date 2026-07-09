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
        $ruangan = Ruangan::with(['gedung', 'pic.user', 'fasilitas'])->get();
        return RuanganResource::collection($ruangan);
    }

    public function show(int $id)
    {
        $ruangan = Ruangan::with(['gedung', 'pic.user', 'fasilitas'])->findOrFail($id);
        return new RuanganResource($ruangan);
    }

    public function jadwalRuangan(int $id, string $tanggal)
    {
        $peminjaman = Peminjaman::with('persetujuans')
            ->where('id_ruangan', $id)
            ->whereDate('hari_tanggal', $tanggal)
            ->get();

        return JadwaRuanganResource::collection($peminjaman);
    }

    public function getGedung()
    {
        $gedung = Gedungs::all(['id_gedung', 'name_gedung']);
        return response()->json(['data' => $gedung]);
    }

    public function getLantai()
    {
        $lantai = Lantai::all(['nomor_lantai', 'name_lantai'])
            ->sortBy('nomor_lantai')
            ->values();
        return response()->json(['data' => $lantai]);
    }

    public function store(Request $request)
    {
        if ($request->user()?->role === 'pic') {
            abort(403, 'PIC tidak diperbolehkan menambah ruangan.');
        }

        $validated = $request->validate([
            'kode_ruangan'      => 'required|unique:ruangans,kode_ruangan',
            'name_ruangan'      => 'required|string|max:255',
            'kapasitas'         => 'required|integer|min:1',
            'fasilitas'         => 'required|string',
            'deskripsi_ruangan' => 'nullable|string',
            'status_ruangan'    => 'required|in:tersedia,maintenance,tidak_tersedia',
            'nomor_lantai'      => 'required|exists:lantai,nomor_lantai',
            'id_gedung'         => 'required|exists:gedungs,id_gedung',
            'id_number_pic'   => 'required|exists:users,id_number',
            'foto'              => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['path_foto'] = $request->file('foto')
                ->store('ruangan', 'public');
        }
        unset($validated['foto']);

        $fasilitasRaw = $validated['fasilitas'];
        unset($validated['fasilitas']);

        $ruangan = Ruangan::create($validated);

        // Simpan fasilitas
        $facilities = array_filter(array_map('trim', explode(',', $fasilitasRaw)));
        foreach ($facilities as $facility) {
            $ruangan->fasilitas()->create(['nama_fasilitas' => $facility]);
        }

        $ruangan->load(['gedung', 'pic.user', 'fasilitas']);

        return response()->json([
            'message' => 'Ruangan berhasil ditambahkan',
            'data'    => new RuanganResource($ruangan),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $ruangan = Ruangan::findOrFail($id);

        if ($request->user()?->role === 'pic') {
            if (!in_array($request->status_ruangan, ['tersedia', 'maintenance'], true)) {
                abort(403, 'PIC hanya boleh mengubah status menjadi tersedia atau maintenance.');
            }

            $validated = $request->validate([
                'status_ruangan' => 'required|in:tersedia,maintenance',
            ]);

            $ruangan->update([ 'status_ruangan' => $validated['status_ruangan'] ]);
            $ruangan->load(['gedung', 'pic.user', 'fasilitas']);

            return response()->json([
                'message' => 'Status ruangan berhasil diperbarui',
                'data'    => new RuanganResource($ruangan->fresh()),
            ]);
        }

        $validated = $request->validate([
            'kode_ruangan'      => 'required|unique:ruangans,kode_ruangan,' . $id . ',id_ruangan',
            'name_ruangan'      => 'required|string|max:255',
            'kapasitas'         => 'required|integer|min:1',
            'fasilitas'         => 'required|string',
            'deskripsi_ruangan' => 'nullable|string',
            'status_ruangan'    => 'required|in:tersedia,maintenance,tidak_tersedia',
            'nomor_lantai'      => 'required|exists:lantai,nomor_lantai',
            'id_gedung'         => 'required|exists:gedungs,id_gedung',
            'id_number_pic'   => 'required|exists:users,id_number',
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

        $fasilitasRaw = $validated['fasilitas'];
        unset($validated['fasilitas']);

        $ruangan->update($validated);

        // Sync fasilitas
        $ruangan->fasilitas()->delete();
        $facilities = array_filter(array_map('trim', explode(',', $fasilitasRaw)));
        foreach ($facilities as $facility) {
            $ruangan->fasilitas()->create(['nama_fasilitas' => $facility]);
        }

        $ruangan->load(['gedung', 'pic.user', 'fasilitas']);

        return response()->json([
            'message' => 'Ruangan berhasil diperbarui',
            'data'    => new RuanganResource($ruangan->fresh()),
        ]);
    }

    public function destroy(int $id)
    {
        if (request()->user()?->role === 'pic') {
            abort(403, 'PIC tidak diperbolehkan menghapus ruangan.');
        }

        $ruangan = Ruangan::findOrFail($id);
        $ruangan->delete();

        return response()->json([
            'message' => 'Ruangan berhasil dihapus'
        ]);
    }
}