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
            if (!Schema::hasColumn('persetujuans', 'id_number_penyetuju')) {
                $table->unsignedBigInteger('id_number_penyetuju')->nullable()->after('loan_id');
                $table->foreign('id_number_penyetuju')->references('id_number')->on('users')->onDelete('cascade');
            }

            if (!Schema::hasColumn('persetujuans', 'status_persetujuan')) {
                $table->enum('status_persetujuan', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu')->after('id_number_penyetuju');
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
            if (Schema::hasColumn('persetujuans', 'id_number_penyetuju')) {
                $table->dropForeign(['id_number_penyetuju']);
                $table->dropColumn('id_number_penyetuju');
            }
        });
    }
};
