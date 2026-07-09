@component('mail::message')
# Peminjaman Anda Disetujui ✅

Halo **{{ $namaPeminjam }}**,

Selamat! Peminjaman Anda telah **disetujui oleh semua pihak** dan siap digunakan.

@component('mail::panel')
**Item:** {{ $itemName }}
@endcomponent

Silakan cek detail peminjaman Anda melalui portal.

@component('mail::button', ['url' => $link])
Lihat Riwayat Peminjaman
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
