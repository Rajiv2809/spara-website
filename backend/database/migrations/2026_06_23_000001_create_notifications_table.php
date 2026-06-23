<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nomor_induk');
            $table->string('type'); // 'disetujui', 'ditolak', 'dibatalkan', 'menunggu'
            $table->string('judul');
            $table->text('pesan');
            $table->unsignedBigInteger('peminjaman_id')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->foreign('nomor_induk')->references('nomor_induk')->on('users')->onDelete('cascade');
            $table->foreign('peminjaman_id')->references('id_peminjaman')->on('peminjaman')->onDelete('cascade');
            $table->index('nomor_induk');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
