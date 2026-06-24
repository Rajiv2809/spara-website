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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id('room_id');
            $table->string('room_code')->unique();

            $table->string('room_name');
            $table->integer('capacity')->nullable();
            $table->text('facility')->nullable();
            $table->text('room_description')->nullable();
            $table->enum('room_status', ['tersedia', 'maintenance', 'tidak_tersedia'])->default('tersedia');
            $table->string('path_foto');

            $table->unsignedBigInteger('building_id');
            $table->foreign('building_id'
            )->references('building_id')->on('buildings')->onDelete('cascade');

            $table->unsignedBigInteger('id_number_pic');
            $table->foreign('id_number_pic')->references('id_number')->on('users');

            $table->unsignedBigInteger('floor_number');
            $table->foreign('floor_number')->references('floor_number')->on('floor')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
