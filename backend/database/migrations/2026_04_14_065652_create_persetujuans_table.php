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
            $table->unsignedBigInteger('id_penanggungjawab')->nullable();
            $table->unsignedBigInteger('id_pic')->nullable();
            $table->unsignedBigInteger('id_admin')->nullable();

            $table->foreign('id_peminjaman')->references('id_peminjaman')->on('peminjman')->onDelete('cascade');
            $table->foreign('id_penanggungjawab')->references('nomor_induk')->on('users')->onDelete('set null');
            $table->foreign('id_pic')->references('nomor_induk')->on('pics')->onDelete('set null');
            $table->foreign('id_admin')->references('nomor_induk')->on('users')->onDelete('set null');
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
