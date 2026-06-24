<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\tool;
use App\Models\loan;
use App\Http\Resources\toolResource;
use App\Http\Resources\JadwaroomResource;

class toolController extends Controller
{
    public function gettool()
    {
        $tool = tool::all();
        return toolResource::collection($tool);
    }

    public function show($id)
    {
        $tool = tool::findOrFail($id);
        return new toolResource($tool);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tool_code'        => 'required|unique:tools,tool_code',
            'tool_name'        => 'required|string|max:255',
            'tool_description'   => 'nullable|string',
            'tool_status'      => 'required|in:tersedia,dipinjam,rusak,maintenance',
            'id_number_pic'  => 'nullable|exists:users,id_number',
            'foto'            => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['path_foto'] = $request->file('foto')
                ->store('tool', 'public');
        }
        unset($validated['foto']);

        $tool = tool::create($validated);

        return response()->json([
            'message' => 'tool berhasil ditambahkan',
            'data'    => $tool
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tool = tool::findOrFail($id);

        $validated = $request->validate([
            'tool_code'        => 'required|unique:tools,tool_code,' . $id . ',tool_id',
            'tool_name'        => 'required|string|max:255',
            'tool_description'   => 'nullable|string',
            'tool_status'      => 'required|in:tersedia,dipinjam,rusak,maintenance',
            'id_number_pic'  => 'nullable|exists:users,id_number',
            'foto'            => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            if ($tool->path_foto) {
                Storage::disk('public')->delete($tool->path_foto);
            }
            $validated['path_foto'] = $request->file('foto')
                ->store('tool', 'public');
        }
        unset($validated['foto']);

        $tool->update($validated);

        return response()->json([
            'message' => 'tool berhasil diperbarui',
            'data'    => $tool
        ]);
    }

    public function jadwaltool(int $id, string $tanggal)
    {
        $loan = loan::with('persetujuans')
            ->where('tool_id', $id)
            ->whereDate('hari_tanggal', $tanggal)
            ->get();

        return JadwaroomResource::collection($loan);
    }

    public function destroy($id)
    {
        $tool = tool::findOrFail($id);
        $tool->delete();

        return response()->json([
            'message' => 'tool berhasil dihapus'
        ]);
    }
}