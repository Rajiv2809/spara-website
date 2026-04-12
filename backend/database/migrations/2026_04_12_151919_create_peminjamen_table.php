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
        Schema::create('peminjamen', function (Blueprint $table) {
            $table->id('id_peminjaman');
            $table->string('nama_kegiatan', 255)->nullable();
            $table->string('keterangan', 255)->nullable();
            $table->enum('hari_mulai', ['senin','selasa','rabu','kamis','jumat','sabtu','minggu']);
            $table->enum('hari_selesai', ['senin','selasa','rabu','kamis','jumat','sabtu','minggu']);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->enum('status_persetujuan', ['disetujui', 'ditolak', 'menunggu'])->default('menunggu');
            $table->dateTime('dibuat_pada')->useCurrent();
            $table->dateTime('diubah_pada')->nullable()->useCurrentOnUpdate();
            $table->enum('jenis_kegiatan', ['akademik', 'non-akademik']);
            $table->unsignedBigInteger('nik_peminjam');
            $table->unsignedBigInteger('nik_penyetuju');

            $table->foreign('nik_peminjam')
                  ->references('nik')
                  ->on('users')
                  ->onDelete('restrict');

           
        
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjamen');
    }
};
