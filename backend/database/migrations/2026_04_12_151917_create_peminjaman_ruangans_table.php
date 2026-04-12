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
        Schema::create('peminjaman_ruangans', function (Blueprint $table) {
             $table->id('id_peminjaman');
            $table->string('kode_ruangan', 20)->unique();
            $table->string('nama_ruangan', 50);
            $table->string('fasilitas', 255)->nullable();
            $table->integer('kapasitas');
            $table->enum('status_ruangan', ['tersedia', 'dipinjam', 'perbaikan']);
            $table->string('deskripsi_ruangan', 255)->nullable();
            $table->integer('nomor_lantai');
             
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman_ruangans');
    }
};
