<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('persetujuans', function (Blueprint $table) {
            $table->string('approval_token', 64)->nullable()->unique()->after('alasan_penolakan');
            $table->timestamp('token_expires_at')->nullable()->after('approval_token');
        });
    }

    public function down(): void
    {
        Schema::table('persetujuans', function (Blueprint $table) {
            $table->dropColumn(['approval_token', 'token_expires_at']);
        });
    }
};
