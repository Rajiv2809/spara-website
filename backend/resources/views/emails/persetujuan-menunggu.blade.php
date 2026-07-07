@component('mail::message')
# Perlu Persetujuan Anda

Halo **{{ $namaPenerima }}**,

Peminjaman **{{ $itemName }}** telah disetujui oleh **{{ $approverName }}** dan sekarang menunggu persetujuan Anda sebagai **{{ $tahap }}**.

@component('mail::button', ['url' => $link])
Lihat Detail Peminjaman
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent