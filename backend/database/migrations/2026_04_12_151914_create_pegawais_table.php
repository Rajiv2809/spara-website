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
        Schema::create('pegawais', function (Blueprint $table) {
              $table->unsignedBigInteger('nik')->primary();
            $table->integer('nip');
            $table->enum('status_pegawai', ['aktif', 'nonaktif']);
            $table->enum('status_kontrak', ['pns', 'pppk', 'non-pns']);

            $table->foreign('nik')
                  ->references('nik')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawais');
    }
};
