<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$ids = App\Models\loan::distinct('id_peminjam')->pluck('id_peminjam');
foreach ($ids as $id) {
    echo $id . "\n";
}
