@component('mail::message')
# Peminjaman Anda Sedang Diproses ✅

Halo **{{ $namaPeminjam }}**,

Kabar baik! Peminjaman **{{ $itemName }}** Anda telah **disetujui** oleh **{{ $approverName }}** sebagai **{{ $tahap }}**.

**Progress Persetujuan:**

@component('mail::panel')
Tahap {{ $tahapKe }} dari {{ $totalTahap }} telah disetujui.
@if($tahapKe < $totalTahap)
Masih ada **{{ $totalTahap - $tahapKe }} tahap** lagi yang perlu diproses.
@else
Semua tahap telah selesai — peminjaman Anda **disetujui penuh**.
@endif
@endcomponent

@if($tahapKe < $totalTahap)
Peminjaman Anda sedang menunggu persetujuan dari tahap berikutnya. Kami akan memberi tahu Anda ketika ada pembaruan.
@else
Selamat! Peminjaman Anda telah disetujui oleh semua pihak dan siap digunakan.
@endif

@component('mail::button', ['url' => $link])
Lihat Status Peminjaman
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
