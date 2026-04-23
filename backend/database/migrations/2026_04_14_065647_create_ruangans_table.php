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
        Schema::create('ruangans', function (Blueprint $table) {
            $table->id('id_ruangan');
            $table->string('kode_ruangan')->unique();

            $table->string('nama_ruangan');
            $table->integer('kapasitas')->nullable();
            $table->text('fasilitas')->nullable();
            $table->text('deskripsi_ruangan')->nullable();
            $table->enum('status_ruangan', ['tersedia', 'tidak_tersedia', 'maintenance'])->default('tersedia');
            $table->string('path_foto');

            $table->unsignedBigInteger('id_gedung');
            $table->foreign('id_gedung'
            )->references('id_gedung')->on('gedungs')->onDelete('cascade');

            $table->unsignedBigInteger('nomor_induk_pic')->nullable();
            $table->foreign('nomor_induk_pic')->references('nomor_induk')->on('users')->onDelete('set null');

            $table->unsignedBigInteger('nomor_lantai');
            $table->foreign('nomor_lantai')->references('nomor_lantai')->on('lantai')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ruangans');
    }
};
