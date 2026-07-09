@component('mail::message')
# Peminjaman Anda Ditolak ❌

Halo **{{ $namaPeminjam }}**,

Mohon maaf, peminjaman **{{ $itemName }}** Anda telah **ditolak** oleh **{{ $penolaName }}** sebagai **{{ $tahap }}**.

@component('mail::panel')
Jika Anda memerlukan klarifikasi, silakan hubungi pihak terkait secara langsung.
@endcomponent

Anda dapat mengajukan peminjaman baru melalui portal jika diperlukan.

@component('mail::button', ['url' => $link, 'color' => 'red'])
Lihat Riwayat Peminjaman
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
