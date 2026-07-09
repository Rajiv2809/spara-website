@component('mail::message')
# Perlu Persetujuan Anda

Halo **{{ $namaPenerima }}**,

@if($tahap === 'Penanggung Jawab')
Peminjaman **{{ $itemName }}** telah diajukan oleh **{{ $approverName }}** dan sekarang menunggu persetujuan Anda sebagai **{{ $tahap }}**.
@else
Peminjaman **{{ $itemName }}** telah disetujui oleh **{{ $approverName }}** dan sekarang menunggu persetujuan Anda sebagai **{{ $tahap }}**.
@endif

@component('mail::button', ['url' => $link])
Lihat Detail Peminjaman
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent