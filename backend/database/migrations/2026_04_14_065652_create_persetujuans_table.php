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
        Schema::create('persetujuans', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('id_peminjaman');
            $table->unsignedBigInteger('nomor_induk_penyetuju')->nullable();
            $table->enum('status_persetujuan', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->foreign('id_peminjaman')->references('id_peminjaman')->on('peminjaman')->onDelete('cascade');
            $table->foreign('nomor_induk_penyetuju')->references('nomor_induk')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('persetujuans');
    }
};
