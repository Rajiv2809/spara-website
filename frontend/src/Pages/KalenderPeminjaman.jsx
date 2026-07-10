import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import axiosClient from '../axios';
import Sidebar from '../Components/Sidebar';

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const monthNames = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];
const pad = (v) => String(v).padStart(2, '0');
const todayIso = () => new Date().toISOString().slice(0, 10);
const formatDate = (iso) => new Date(iso).toLocaleDateString('id-ID', {
  weekday:'long', day:'numeric', month:'long', year:'numeric',
});
const formatDateShort = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
};
const getYearOptions = () => {
  const c = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => c - 5 + i);
};

const statusColors = { disetujui:'bg-emerald-100 text-emerald-800', menunggu:'bg-amber-100 text-amber-800', ditolak:'bg-red-100 text-red-800' };
const statusDot    = { disetujui:'bg-emerald-500', menunggu:'bg-amber-500', ditolak:'bg-red-500' };
const statusLabel  = { disetujui:'Disetujui', menunggu:'Menunggu', ditolak:'Ditolak' };

/* ── Modal Detail ───────────────────────────────────────────────────────── */
function ModalDetailPeminjaman({ item, onClose }) {
  if (!item) return null;
  const isMultiHari = item.tanggal_mulai && item.tanggal_selesai && item.tanggal_mulai !== item.tanggal_selesai;
  const headerCls = item.status_persetujuan === 'disetujui'
    ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
    : item.status_persetujuan === 'ditolak'
      ? 'bg-gradient-to-br from-red-600 to-red-800'
      : 'bg-gradient-to-br from-[#C0254A] to-[#7A0B28]';
  const badgeCls = item.status_persetujuan === 'disetujui'
    ? 'bg-emerald-100 text-emerald-800'
    : item.status_persetujuan === 'ditolak'
      ? 'bg-red-100 text-red-800'
      : 'bg-amber-100 text-amber-800';
  const rows = [
    { icon:'ph:calendar-blank', label:'Tanggal',
      value: isMultiHari
        ? `${formatDateShort(item.tanggal_mulai)} – ${formatDateShort(item.tanggal_selesai)}`
        : formatDateShort(item.hari_tanggal) },
    { icon:'ph:clock', label:'Waktu',
      value:`${item.jam_mulai?.slice(0,5)??'-'} – ${item.jam_selesai?.slice(0,5)??'-'}` },
    { icon:'ph:tag',             label:'Jenis',    value: item.jenis_kegiatan || '-' },
    { icon:'ph:user-circle-fill',label:'Peminjam', value: item.name_peminjam  || '-' },
    ...(item.keterangan ? [{ icon:'ph:chat-text', label:'Keterangan', value: item.keterangan }] : []),
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`relative px-6 pt-5 pb-5 ${headerCls}`}>
          <button onClick={onClose} className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white border-none cursor-pointer transition">
            <Icon icon="ph:x-bold" width={14} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon icon={item.jenis==='ruangan'?'ph:door-open-bold':'ph:wrench-bold'} width={22} color="white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-extrabold text-[15px] leading-tight truncate m-0">
                {item.jenis==='ruangan' ? item.name_ruangan : item.name_alat}
              </h2>
              <p className="text-white/70 text-[11px] mt-0.5 truncate">{item.name_kegiatan}</p>
            </div>
          </div>
          <span className={`inline-block mt-3 text-[11px] font-bold px-3 py-1 rounded-full ${badgeCls}`}>
            {statusLabel[item.status_persetujuan] ?? item.status_persetujuan}
          </span>
        </div>
        <div className="px-6 py-5 space-y-3 overflow-y-auto max-h-[55vh]">
          <h3 className="text-[11px] font-bold text-[#C0254A] uppercase tracking-wider">Detail Peminjaman</h3>
          <div className="bg-[#FFF6F8] rounded-2xl p-4 space-y-2">
            {rows.map(({ icon, label, value }) => (
              <div key={label} className="flex gap-2 items-start">
                <Icon icon={icon} width={14} color="#C0254A" className="opacity-70 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-400 min-w-[72px] flex-shrink-0 font-medium">{label}</span>
                <span className="text-[11px] text-gray-700 font-medium">: {value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[13px] font-bold hover:bg-gray-50 transition cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Komponen Utama ─────────────────────────────────────────────────────── */
export default function KalenderPeminjaman() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear,  setCurrentYear]  = useState(() => new Date().getFullYear());
  const [filterJenis,  setFilterJenis]  = useState('semua');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTanggalMode, setFilterTanggalMode] = useState('bulan');
  const [filterTanggal,       setFilterTanggal]       = useState(todayIso);
  const [filterTanggalMulai,  setFilterTanggalMulai]  = useState(todayIso);
  const [filterTanggalSelesai,setFilterTanggalSelesai]= useState(todayIso);
  const [events,       setEvents]       = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [exporting,    setExporting]    = useState(null);
  const yearOptions = useMemo(() => getYearOptions(), []);

  const buildDateParams = () => {
    if (filterTanggalMode === 'tanggal')
      return filterTanggal ? { tanggal: filterTanggal } : {};
    if (filterTanggalMode === 'rentang')
      return {
        ...(filterTanggalMulai  ? { tanggal_mulai:  filterTanggalMulai  } : {}),
        ...(filterTanggalSelesai? { tanggal_selesai: filterTanggalSelesai } : {}),
      };
    return { bulan: currentMonth + 1, tahun: currentYear };
  };

  const fetchEvents = async () => {
    setLoading(true); setError(null);
    try {
      const params = buildDateParams();
      if (filterJenis !== 'semua') params.jenis = filterJenis;
      if (filterStatus) params.status = filterStatus;
      const res = await axiosClient.get('/kepala/monitoring-peminjaman', { params });
      setEvents(res.data.data || []);
      setStats(res.data.stats || null);
      setSelectedDate(cur => cur || todayIso());
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memuat data kalender.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterJenis, filterStatus, filterTanggalMode, filterTanggal, filterTanggalMulai, filterTanggalSelesai, currentMonth, currentYear]);

  useEffect(() => {
    if (filterTanggalMulai && filterTanggalSelesai && filterTanggalSelesai < filterTanggalMulai)
      setFilterTanggalSelesai(filterTanggalMulai);
  }, [filterTanggalMulai, filterTanggalSelesai]);

  const eventsByDate = useMemo(() => events.reduce((acc, item) => {
    if (!item.hari_tanggal) return acc;
    (acc[item.hari_tanggal] ??= []).push(item);
    return acc;
  }, {}), [events]);

  const monthStart   = new Date(currentYear, currentMonth, 1);
  const startWeekDay = monthStart.getDay();
  const totalDays    = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalCells   = Math.ceil((startWeekDay + totalDays) / 7) * 7;
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  const isToday = (y, m, d) => {
    const t = new Date();
    return t.getFullYear()===y && t.getMonth()===m && t.getDate()===d;
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const endpoint = type==='pdf'
        ? '/kepala/rekap-peminjaman/export-pdf'
        : '/kepala/rekap-peminjaman/export-excel';
      const params = buildDateParams();
      if (filterJenis !== 'semua') params.jenis = filterJenis;
      if (filterStatus) params.status = filterStatus;
      const res = await axiosClient.get(endpoint, { params, responseType:'blob' });
      const ext  = type==='pdf' ? 'pdf' : 'xlsx';
      const name = filterTanggalMode==='tanggal'
        ? filterTanggal
        : filterTanggalMode==='rentang'
          ? `${filterTanggalMulai||'awal'}-${filterTanggalSelesai||'akhir'}`
          : `${monthNames[currentMonth]}-${currentYear}`;
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url; link.setAttribute('download', `rekap-peminjaman-${name}.${ext}`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('Gagal mengekspor laporan.'); }
    finally { setExporting(null); }
  };

  return (
    <>
      <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
        <Sidebar />
        <div className="lg:ml-[300px] flex-1 lg:p-10 p-4">

          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight lg:mt-0 mt-12">Kalender Peminjaman</h1>
              <p className="text-sm text-gray-500 mt-1">Lihat semua peminjaman ruangan dan alat dalam tampilan kalender.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => handleExport('pdf')} disabled={!!exporting||loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#D85A30] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#c14e28] transition disabled:opacity-60">
                <Icon icon="mdi:file-pdf-box" width={18} />
                {exporting==='pdf' ? 'Mengekspor...' : 'Download PDF'}
              </button>
              <button type="button" onClick={() => handleExport('excel')} disabled={!!exporting||loading}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60">
                <Icon icon="mdi:file-excel-box" width={18} />
                {exporting==='excel' ? 'Mengekspor...' : 'Download Excel'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label:'Total aktif',  value:stats?.total??'-',    color:'text-gray-800',   icon:'mdi:calendar-check-outline' },
              { label:'Menunggu',     value:stats?.menunggu??'-', color:'text-amber-700',  icon:'mdi:clock-alert-outline' },
              { label:'Disetujui',    value:stats?.disetujui??'-',color:'text-emerald-700',icon:'mdi:check-decagram-outline' },
              { label:'Ruangan',      value:stats?.ruangan??'-',  color:'text-purple-700', icon:'mdi:door-open' },
            ].map(c => (
              <div key={c.label} className="bg-white/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div><p className="text-xs text-gray-500 mb-1">{c.label}</p><p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p></div>
                <Icon icon={c.icon} width={26} className={`${c.color} opacity-70`} />
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white/80 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Jenis peminjaman</p>
              <select value={filterJenis} onChange={e=>setFilterJenis(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40">
                <option value="semua">Semua</option>
                <option value="ruangan">Ruangan</option>
                <option value="alat">Alat</option>
              </select>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Status</p>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40">
                <option value="">Semua</option>
                <option value="menunggu">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Date filter mode */}
          <div className="bg-white/80 rounded-2xl p-4 shadow-sm mb-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { value:'bulan',   label:'Bulan/Tahun', icon:'mdi:calendar-month-outline' },
                { value:'tanggal', label:'Tanggal',     icon:'mdi:calendar-today-outline' },
                { value:'rentang', label:'Rentang',     icon:'mdi:calendar-range-outline' },
              ].map(m => (
                <button key={m.value} type="button" onClick={() => setFilterTanggalMode(m.value)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition
                    ${filterTanggalMode===m.value ? 'bg-[#D85A30] text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <Icon icon={m.icon} width={16} />{m.label}
                </button>
              ))}
            </div>

            {filterTanggalMode === 'bulan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Bulan</p>
                  <select value={currentMonth} onChange={e=>setCurrentMonth(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40">
                    {monthNames.map((n,i) => <option key={n} value={i}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Tahun</p>
                  <select value={currentYear} onChange={e=>setCurrentYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40">
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}
            {filterTanggalMode === 'tanggal' && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Pilih tanggal</p>
                <input type="date" value={filterTanggal}
                  onChange={e => { setFilterTanggal(e.target.value); if(e.target.value){ const d=new Date(e.target.value); setCurrentMonth(d.getMonth()); setCurrentYear(d.getFullYear()); setSelectedDate(e.target.value); }}}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40" />
              </div>
            )}
            {filterTanggalMode === 'rentang' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Tanggal mulai</p>
                  <input type="date" value={filterTanggalMulai} onChange={e=>setFilterTanggalMulai(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Tanggal selesai</p>
                  <input type="date" value={filterTanggalSelesai} min={filterTanggalMulai||undefined}
                    onChange={e=>setFilterTanggalSelesai(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40" />
                </div>
              </div>
            )}
          </div>

          {/* Month nav */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 rounded-2xl p-4 shadow-sm mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Bulan</p>
              <h2 className="text-2xl font-semibold text-gray-800">{monthNames[currentMonth]} {currentYear}</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { if(currentMonth===0){setCurrentMonth(11);setCurrentYear(y=>y-1);}else setCurrentMonth(m=>m-1); }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                <Icon icon="mdi:chevron-left" width={18} /> Sebelumnya
              </button>
              <button onClick={() => { const iso=todayIso(); const d=new Date(); setCurrentMonth(d.getMonth()); setCurrentYear(d.getFullYear()); setSelectedDate(iso); setFilterTanggal(iso); setFilterTanggalMulai(iso); setFilterTanggalSelesai(iso); }}
                className="rounded-lg border border-[#D85A30]/30 bg-[#FFF2E9] px-3 py-2 text-sm font-medium text-[#D85A30] hover:bg-[#FFE4D2] transition">
                Hari ini
              </button>
              <button onClick={() => { if(currentMonth===11){setCurrentMonth(0);setCurrentYear(y=>y+1);}else setCurrentMonth(m=>m+1); }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                Berikutnya <Icon icon="mdi:chevron-right" width={18} />
              </button>
            </div>
          </div>

          {/* Kalender + Panel Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-4">

            {/* Grid kalender */}
            <div className="bg-white/80 rounded-2xl p-3 sm:p-4 shadow-sm">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-semibold text-gray-500 mb-1">
                {WEEKDAYS.map(d => <div key={d} className="py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: totalCells }).map((_, idx) => {
                  const dayNum  = idx - startWeekDay + 1;
                  const inMonth = idx >= startWeekDay && dayNum <= totalDays;
                  const dateKey = inMonth ? `${currentYear}-${pad(currentMonth+1)}-${pad(dayNum)}` : null;
                  const dayEvts = dateKey ? (eventsByDate[dateKey]??[]) : [];
                  const isSel   = selectedDate === dateKey;
                  const today   = inMonth && isToday(currentYear, currentMonth, dayNum);
                  const MAX_DOTS = 4;
                  if (!inMonth) return (
                    <div key={idx} className="aspect-square sm:aspect-auto sm:h-[88px] lg:h-[100px] rounded-xl bg-gray-50/60 border border-gray-100/70" />
                  );
                  return (
                    <button key={idx} type="button" onClick={() => setSelectedDate(dateKey)}
                      className={`relative flex flex-col justify-between aspect-square sm:aspect-auto sm:h-[88px] lg:h-[100px] rounded-xl border p-1.5 sm:p-2 text-left transition-all
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D85A30]
                        ${isSel ? 'border-[#D85A30] bg-[#FFF2E9] shadow-sm ring-1 ring-[#D85A30]/30'
                               : 'border-gray-200 bg-white hover:border-[#D85A30]/50 hover:bg-orange-50/60'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-semibold leading-none
                          ${today ? 'bg-[#D85A30] text-white' : 'text-gray-700'}`}>
                          {dayNum}
                        </span>
                        {dayEvts.length > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400">{dayEvts.length}</span>
                        )}
                      </div>
                      {dayEvts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {dayEvts.slice(0, MAX_DOTS).map(e => (
                            <span key={e.id_peminjaman}
                              title={`${e.name_kegiatan} — ${statusLabel[e.status_persetujuan]??e.status_persetujuan}`}
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${statusDot[e.status_persetujuan]??'bg-gray-300'}`} />
                          ))}
                          {dayEvts.length > MAX_DOTS && (
                            <span className="text-[9px] sm:text-[10px] text-gray-400 leading-none">+{dayEvts.length - MAX_DOTS}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100">
                {Object.entries(statusLabel).map(([k, lbl]) => (
                  <div key={k} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${statusDot[k]}`} />{lbl}
                  </div>
                ))}
              </div>
            </div>

            {/* Panel detail */}
            <div className="bg-white/80 rounded-2xl p-4 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Detail tanggal</p>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    {selectedDate ? formatDate(selectedDate) : 'Pilih tanggal'}
                  </h3>
                </div>
                {selectedEvents.length > 0 && (
                  <span className="shrink-0 rounded-full bg-[#FDE8D8] px-2.5 py-1 text-[11px] font-semibold text-[#B45309]">
                    {selectedEvents.length} acara
                  </span>
                )}
              </div>

              {loading && (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400 py-12">
                  <Icon icon="mdi:loading" className="animate-spin mr-2" width={18} /> Memuat...
                </div>
              )}
              {error && !loading && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              {!loading && !error && selectedEvents.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-400">
                  <Icon icon="mdi:calendar-blank-outline" width={32} className="mb-2 opacity-60" />
                  <p className="text-sm">Tidak ada peminjaman pada tanggal ini.</p>
                </div>
              )}
              {!loading && !error && selectedEvents.length > 0 && (
                <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                  {selectedEvents.map(item => (
                    <div key={item.id_peminjaman} className="rounded-2xl border border-gray-200 bg-[#FEF5EE] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name_kegiatan}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {item.name_peminjam} · {item.jenis==='ruangan' ? item.name_ruangan : item.name_alat}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColors[item.status_persetujuan]??'bg-gray-100 text-gray-700'}`}>
                          {statusLabel[item.status_persetujuan]??item.status_persetujuan}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                        <Icon icon="mdi:clock-outline" width={13} className="shrink-0" />
                        <span>{item.jam_mulai?.slice(0,5)} – {item.jam_selesai?.slice(0,5)}</span>
                      </div>
                      <button onClick={() => setSelectedItem(item)}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-[#D85A30]/30 bg-[#FFF2E9] text-[#D85A30] text-[11px] font-bold hover:bg-[#FFE4D2] transition cursor-pointer">
                        <Icon icon="ph:info-bold" width={13} /> Lihat Detail
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal detail — di luar div utama agar tidak clipped */}
      <ModalDetailPeminjaman item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
