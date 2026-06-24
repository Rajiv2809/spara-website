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
            $table->string('name_kegiatan');
            $table->enum('jenis_kegiatan', ['akademik', 'non-akademik']);
            $table->date('hari_tanggal');
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->text('keterangan')->nullable();
            $table->enum('status_persetujuan', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');

            $table->unsignedBigInteger('id_peminjam');
            $table->unsignedBigInteger('id_alat')->nullable();
            $table->unsignedBigInteger('id_ruangan')->nullable();

            $table->foreign('id_peminjam')->references('id_number')->on('users')->onDelete('cascade');
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
