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
        Schema::create('lantais', function (Blueprint $table) {
            $table->integer('nomor_lantai');
            $table->unsignedBigInteger('id_gedung');

            $table->primary(['nomor_lantai', 'id_gedung']);

            $table->foreign('id_gedung')
                  ->references('id_gedung')
                  ->on('gedungs')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lantais');
    }
};
