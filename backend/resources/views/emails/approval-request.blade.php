@component('mail::message')
# Perlu Persetujuan Anda

Halo **{{ $namaApprover }}**,

Anda mendapat permintaan persetujuan sebagai **{{ $peran }}**.

@component('mail::panel')
**Diajukan oleh:** {{ $namaPeminjam }}
**Kegiatan:** {{ $namaKegiatan }}
**Item:** {{ $itemName }}
**Tanggal:** {{ $tanggal }}
**Waktu:** {{ $jamMulai }} – {{ $jamSelesai }}
@endcomponent

Silakan tinjau dan ambil tindakan:

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
  <tr>
    <td align="center" style="padding:0 8px 0 0;">
      <a href="{{ $linkSetujui }}"
         style="display:inline-block;background-color:#16a34a;color:#ffffff;font-weight:600;
                font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">
        ✅ Setujui
      </a>
    </td>
    <td align="center" style="padding:0 0 0 8px;">
      <a href="{{ $linkTolak }}"
         style="display:inline-block;background-color:#dc2626;color:#ffffff;font-weight:600;
                font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">
        ❌ Tolak
      </a>
    </td>
  </tr>
</table>

Atau buka halaman persetujuan secara lengkap:

@component('mail::button', ['url' => $linkSetujui])
Buka Halaman Persetujuan
@endcomponent

> Jika Anda tidak merasa berwenang untuk permintaan ini, abaikan email ini.

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
