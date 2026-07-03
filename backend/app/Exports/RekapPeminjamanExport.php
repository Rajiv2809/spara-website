<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\{FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize};
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RekapPeminjamanExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection(): Collection
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        return [
            'No', 'Tanggal', 'Nama Kegiatan', 'Jenis Kegiatan',
            'Ruangan/Alat', 'Kode', 'Peminjam', 'Unit/Jabatan',
            'Jam Mulai', 'Jam Selesai', 'Status', 'Keterangan',
        ];
    }

    public function map($row): array
    {
        static $no = 0;
        $no++;

        $itemName = $row['jenis'] === 'ruangan' ? $row['name_ruangan'] : $row['name_alat'];
        $itemKode = $row['jenis'] === 'ruangan' ? $row['kode_ruangan'] : $row['kode_alat'];

        return [
            $no,
            $row['hari_tanggal'] ? \Carbon\Carbon::parse($row['hari_tanggal'])->format('d-m-Y') : '-',
            $row['name_kegiatan'],
            ucfirst($row['jenis_kegiatan']),
            $itemName ?? '-',
            $itemKode ?? '-',
            $row['name_peminjam'] ?? '-',
            $row['unit_peminjam'] ?? '-',
            $row['jam_mulai'],
            $row['jam_selesai'],
            ucfirst($row['status_persetujuan']),
            $row['keterangan'] ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
