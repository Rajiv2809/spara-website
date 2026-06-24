<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\{loan, room, buildings, floor};
use App\Http\Resources\{roomResource, JadwaroomResource};

class roomController extends Controller
{

    public function getroom()
    {
        $room = room::with(['building', 'pic.user'])->get();
        return roomResource::collection($room);
    }

    public function show(int $id)
    {
        $room = room::with(['building', 'pic.user'])->findOrFail($id);
        return new roomResource($room);
    }

    public function jadwalroom(int $id, string $tanggal)
    {
        $loan = loan::with('persetujuans')
            ->where('room_id', $id)
            ->whereDate('hari_tanggal', $tanggal)
            ->get();

        return JadwaroomResource::collection($loan);
    }

    public function getbuilding()
    {
        $building = buildings::all(['building_id', 'building_name']);
        return response()->json(['data' => $building]);
    }

    public function getfloor()
    {
        $floor = floor::all(['floor_number', 'floor_name'])
            ->sortBy('floor_number')
            ->values();
        return response()->json(['data' => $floor]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_code'      => 'required|unique:rooms,room_code',
            'room_name'      => 'required|string|max:255',
            'capacity'         => 'required|integer|min:1',
            'facility'         => 'required|string',
            'room_description' => 'nullable|string',
            'room_status'    => 'required|in:tersedia,maintenance,tidak_tersedia',
            'floor_number'      => 'required|exists:floor,floor_number',
            'building_id'         => 'required|exists:buildings,building_id',
            'id_number_pic'   => 'required|exists:users,id_number',
            'foto'              => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['path_foto'] = $request->file('foto')
                ->store('room', 'public');
        }
        unset($validated['foto']);

        $room = room::create($validated);
        $room->load(['building', 'pic.user']);

        return response()->json([
            'message' => 'room berhasil ditambahkan',
            'data'    => new roomResource($room),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $room = room::findOrFail($id);

        $validated = $request->validate([
            'room_code'      => 'required|unique:rooms,room_code,' . $id . ',room_id',
            'room_name'      => 'required|string|max:255',
            'capacity'         => 'required|integer|min:1',
            'facility'         => 'required|string',
            'room_description' => 'nullable|string',
            'room_status'    => 'required|in:tersedia,maintenance,tidak_tersedia',
            'floor_number'      => 'required|exists:floor,floor_number',
            'building_id'         => 'required|exists:buildings,building_id',
            'id_number_pic'   => 'required|exists:users,id_number',
            'foto'              => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            if ($room->path_foto) {
                Storage::disk('public')->delete($room->path_foto);
            }
            $validated['path_foto'] = $request->file('foto')
                ->store('room', 'public');
        }
        unset($validated['foto']);

        $room->update($validated);
        $room->load(['building', 'pic.user']);

        return response()->json([
            'message' => 'room berhasil diperbarui',
            'data'    => new roomResource($room->fresh()),
        ]);
    }

    public function destroy(int $id)
    {
        $room = room::findOrFail($id);
        $room->delete();

        return response()->json([
            'message' => 'room berhasil dihapus'
        ]);
    }
}