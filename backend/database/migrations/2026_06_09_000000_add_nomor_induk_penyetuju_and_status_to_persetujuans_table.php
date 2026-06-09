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
        Schema::table('persetujuans', function (Blueprint $table) {
            if (!Schema::hasColumn('persetujuans', 'nomor_induk_penyetuju')) {
                $table->unsignedBigInteger('nomor_induk_penyetuju')->nullable()->after('id_peminjaman');
                $table->foreign('nomor_induk_penyetuju')->references('nomor_induk')->on('users')->onDelete('cascade');
            }

            if (!Schema::hasColumn('persetujuans', 'status_persetujuan')) {
                $table->enum('status_persetujuan', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu')->after('nomor_induk_penyetuju');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('persetujuans', function (Blueprint $table) {
            if (Schema::hasColumn('persetujuans', 'status_persetujuan')) {
                $table->dropColumn('status_persetujuan');
            }
            if (Schema::hasColumn('persetujuans', 'nomor_induk_penyetuju')) {
                $table->dropForeign(['nomor_induk_penyetuju']);
                $table->dropColumn('nomor_induk_penyetuju');
            }
        });
    }
};
