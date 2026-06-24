<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$rows = App\Models\loan::take(10)->get();
foreach ($rows as $row) {
    echo $row->loan_id . ' | peminjam=' . $row->id_peminjam . ' | tool=' . $row->tool_id . ' | room=' . $row->room_id . ' | status=' . $row->status_persetujuan . "\n";
}
