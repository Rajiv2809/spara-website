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
            $table->unsignedBigInteger('id_number');
            $table->string('type'); // 'disetujui', 'ditolak', 'dibatalkan', 'menunggu'
            $table->string('judul');
            $table->text('pesan');
            $table->unsignedBigInteger('loan_id')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->foreign('id_number')->references('id_number')->on('users')->onDelete('cascade');
            $table->foreign('loan_id')->references('loan_id')->on('loan')->onDelete('cascade');
            $table->index('id_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
