<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Peminjaman</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        h2 { text-align: center; margin-bottom: 4px; }
        p.sub { text-align: center; margin-top: 0; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #999; padding: 5px 6px; text-align: left; }
        th { background: #f3f3f3; }
        .status-disetujui { color: #047857; font-weight: bold; }
        .status-menunggu { color: #b45309; font-weight: bold; }
        .status-ditolak { color: #b91c1c; font-weight: bold; }
        .status-dibatalkan { color: #6b7280; font-weight: bold; }
    </style>
</head>
<body>
    <h2>Rekap Peminjaman Bulanan</h2>
    <p class="sub">{{ $namaBulan }} {{ $tahun }}</p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kegiatan</th>
                <th>Jenis</th>
                <th>Ruangan/Alat</th>
                <th>Peminjam</th>
                <th>Unit/Jabatan</th>
                <th>Jam</th>
                <th>Status</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $item['hari_tanggal'] ? \Carbon\Carbon::parse($item['hari_tanggal'])->format('d-m-Y') : '-' }}</td>
                    <td>{{ $item['name_kegiatan'] }}</td>
                    <td>{{ ucfirst($item['jenis_kegiatan']) }}</td>
                    <td>{{ $item['jenis'] === 'ruangan' ? ($item['name_ruangan'] ?? '-') : ($item['name_alat'] ?? '-') }}</td>
                    <td>{{ $item['name_peminjam'] ?? '-' }}</td>
                    <td>{{ $item['unit_peminjam'] ?? '-' }}</td>
                    <td>{{ $item['jam_mulai'] }} - {{ $item['jam_selesai'] }}</td>
                    <td class="status-{{ $item['status_persetujuan'] }}">{{ ucfirst($item['status_persetujuan']) }}</td>
                    <td>{{ $item['keterangan'] ?? '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="10" style="text-align:center;">Tidak ada data pada bulan ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
