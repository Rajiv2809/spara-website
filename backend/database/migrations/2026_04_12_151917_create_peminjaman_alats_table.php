<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('peminjaman_alats', function (Blueprint $table) {
            $table->id('id_peminjaman');
            $table->string('kode_alat', 20)->unique();
            $table->enum('status_alat', ['tersedia', 'dipinjam', 'perbaikan']);
            $table->string('deskripsi_alat', 255)->nullable();
         
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman_alats');
    }
};
