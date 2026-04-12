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
        Schema::create('pics', function (Blueprint $table) {
          $table->unsignedBigInteger('nik');
            $table->string('kode_alat', 20)->nullable();
            $table->string('kode_ruangan', 20)->nullable();

            $table->primary(['nik', 'kode_alat', 'kode_ruangan']);

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
        Schema::dropIfExists('pics');
    }
};
