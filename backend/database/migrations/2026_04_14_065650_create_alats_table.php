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
        Schema::create('tools', function (Blueprint $table) {
            $table->id('tool_id');
            $table->string('tool_code')->unique();
            $table->string('tool_name');
            $table->text('tool_description')->nullable();
            $table->enum('tool_status', ['tersedia', 'dipinjam', 'rusak', 'maintenance'])->default('tersedia');

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
        Schema::dropIfExists('tools');
    }
};
