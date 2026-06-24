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
            $table->unsignedBigInteger('id_number')->primary();
            $table->foreign('id_number')->references('id_number')->on('users')->onDelete('cascade');
            $table->string('kelas')->nullable();
            $table->string('angkatan')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->unsignedBigInteger('study_program_id')->nullable();
            $table->foreign('study_program_id')->references('study_program_id')->on('study_programs')->onDelete('set null');
            $table->timestamps();
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
