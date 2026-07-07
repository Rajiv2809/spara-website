<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\{FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle};
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\{Fill, Border, Alignment};

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
            'No',
            'Tanggal',
            'Nama Kegiatan',
            'Jenis Kegiatan',
            'Ruangan/Alat',
            'Kode',
            'Peminjam',
            'Unit/Jabatan',
            'Jam Mulai',
            'Jam Selesai',
            'Status',
            'Keterangan',
        ];
    }

    public function map($row): array
    {
        static $no = 0;
        $no++;

        $itemName = $row['jenis'] === 'ruangan' ? $row['name_ruangan'] : $row['name_alat'];
        $itemKode = $row['jenis'] === 'ruangan' ? $row['kode_ruangan'] : $row['kode_alat'];

        $statusMap = [
            'menunggu'  => 'Menunggu',
            'disetujui' => 'Disetujui',
            'ditolak'   => 'Ditolak',
            'dibatalkan'=> 'Dibatalkan',
        ];

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
            $statusMap[$row['status_persetujuan']] ?? ucfirst($row['status_persetujuan']),
            $row['keterangan'] ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Header row (row 1)
        $sheet->getStyle('A1:L1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '862440'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
            ],
        ]);

        $lastRow = $sheet->getHighestRow();

        // Alternating row colors
        for ($row = 2; $row <= $lastRow; $row++) {
            $color = ($row % 2 === 0) ? 'FFF6F1' : 'FFFFFF';
            $sheet->getStyle("A{$row}:L{$row}")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $color],
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E0E0E0'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Color-code status column
            $status = $sheet->getCell("K{$row}")->getValue();
            $statusColor = match ($status) {
                'Disetujui' => '1B7A2B',
                'Ditolak'   => 'B33A3A',
                'Dibatalkan'=> 'A0A0A0',
                default     => 'B8860B',
            };
            $sheet->getStyle("K{$row}")->getFont()->getColor()->setARGB($statusColor);
            $sheet->getStyle("K{$row}")->getFont()->setBold(true);
        }

        // Auto-size columns
        foreach (range('A', 'L') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }
}
