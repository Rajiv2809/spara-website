@component('mail::message')
# Peminjaman Disetujui

Halo **{{ $namaPeminjam }}**,

Peminjaman **{{ $itemName }}** Anda telah **disetujui oleh semua pihak** dan siap digunakan.

@component('mail::button', ['url' => $link])
Lihat Detail
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent