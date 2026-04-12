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
       Schema::create('peminjaman_penyetuju', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('id_peminjaman');
    $table->unsignedBigInteger('nik_penyetuju');
    $table->integer('urutan_approval');   // 1 = approve duluan, 2 = kedua, dst
    $table->enum('status', ['disetujui', 'ditolak', 'menunggu'])->default('menunggu');
    $table->string('catatan', 255)->nullable();
    $table->dateTime('diputuskan_pada')->nullable();

    $table->foreign('id_peminjaman')
          ->references('id_peminjaman')
          ->on('peminjamen')
          ->onDelete('cascade');

    $table->foreign('nik_penyetuju')
          ->references('nik')
          ->on('users')
          ->onDelete('restrict');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman_penyetuju');
    }
};
