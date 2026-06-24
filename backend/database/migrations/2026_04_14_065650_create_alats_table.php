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
        Schema::create('alats', function (Blueprint $table) {
            $table->id('id_alat');
            $table->string('kode_alat')->unique();
            $table->string('name_alat');
            $table->text('deskripsi_alat')->nullable();
            $table->enum('status_alat', ['tersedia', 'dipinjam', 'rusak', 'maintenance'])->default('tersedia');

            $table->unsignedBigInteger('id_number_pic')->nullable();
            $table->foreign('id_number_pic')->references('id_number')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alats');
    }
};
