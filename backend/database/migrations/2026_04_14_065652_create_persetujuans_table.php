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

            $table->unsignedBigInteger('loan_id');
            $table->unsignedBigInteger('id_number_penyetuju')->nullable();
            $table->enum('status_persetujuan', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->foreign('loan_id')->references('loan_id')->on('loan')->onDelete('cascade');
            $table->foreign('id_number_penyetuju')->references('id_number')->on('users')->onDelete('cascade');
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
