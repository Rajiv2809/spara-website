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
        Schema::create('peminjaman', function (Blueprint $table) {
            $table->id('id_peminjaman');
            $table->string('nama_kegiatan');
            $table->string('jenis_kegiatan')->nullable();
            $table->date('hari_tanggal');
            $table->time('jam');
            $table->text('keterangan')->nullable();
            $table->enum('status_persetujuan', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');

            $table->unsignedBigInteger('id_peminjam');
            $table->unsignedBigInteger('id_alat')->nullable();
            $table->unsignedBigInteger('id_ruangan')->nullable();

            $table->foreign('id_peminjam')->references('nomor_induk')->on('users')->onDelete('cascade');
            $table->foreign('id_alat')->references('id_alat')->on('alats')->onDelete('set null');
            $table->foreign('id_ruangan')->references('id_ruangan')->on('ruangans')->onDelete('set null');
            
            $table->timestamp('dibuat_pada')->nullable();
            $table->timestamp('diubah_pada')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman');
    }
};
