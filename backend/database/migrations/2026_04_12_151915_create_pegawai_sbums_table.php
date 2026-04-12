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
        Schema::create('pegawai_sbums', function (Blueprint $table) {
            $table->unsignedBigInteger('nik')->primary();
            $table->enum('role', ['ketua', 'staf']);

            $table->foreign('nik')
                  ->references('nik')
                  ->on('pegawais')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawai_sbums');
    }
};
