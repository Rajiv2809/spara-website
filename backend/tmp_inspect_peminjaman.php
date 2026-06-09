<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$rows = App\Models\Peminjaman::take(10)->get();
foreach ($rows as $row) {
    echo $row->id_peminjaman . ' | peminjam=' . $row->id_peminjam . ' | alat=' . $row->id_alat . ' | ruangan=' . $row->id_ruangan . ' | status=' . $row->status_persetujuan . "\n";
}
