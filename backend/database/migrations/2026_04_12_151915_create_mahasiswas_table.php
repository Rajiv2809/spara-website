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
        Schema::create('mahasiswas', function (Blueprint $table) {
             $table->unsignedBigInteger('nik')->primary();
            $table->integer('nim');
            $table->string('kelas', 32);
            $table->integer('angkatan')->length(4);
            $table->enum('status_mahasiswa', ['aktif', 'nonaktif']);
            $table->unsignedBigInteger('id_prodi');

            $table->foreign('nik')
                  ->references('nik')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('id_prodi')
                  ->references('id_prodi')
                  ->on('program_studis')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mahasiswas');
    }
};
