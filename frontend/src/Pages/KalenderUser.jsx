import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import axiosClient from '../axios';
import Sidebar from '../Components/Sidebar';
import { useStateContext } from '../Contexts/context.jsx';

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];
const pad = (v) => String(v).padStart(2, '0');

const STATUS_DOT   = { disetujui: 'bg-emerald-500', menunggu: 'bg-amber-400', ditolak: 'bg-red-500' };
const STATUS_BADGE = { disetujui: 'bg-emerald-100 text-emerald-800', menunggu: 'bg-amber-100 text-amber-800', ditolak: 'bg-red-100 text-red-800' };
const STATUS_LABEL = { disetujui: 'Disetujui', menunggu: 'Menunggu', ditolak: 'Ditolak' };

export default function KalenderUser() {
  const { currentUser } = useStateContext();
  const isMahasiswa = currentUser?.role?.toLowerCase() === 'mahasiswa';

  const [month, setMonth]   = useState(() => new Date().getMonth());
  const [year, setYear]     = useState(() => new Date().getFullYear());
  const [jenis, setJenis]   = useState('semua');
  // Mahasiswa selalu lihat yang disetujui saja, role lain bisa filter
  const [status, setStatus] = useState(() =>
    (currentUser?.role?.toLowerCase() === 'mahasiswa') ? 'disetujui' : ''
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 10));

  // Sync status default saat currentUser tersedia
  useEffect(() => {
    if (currentUser?.role?.toLowerCase() === 'mahasiswa') {
      setStatus('disetujui');
    }
  }, [currentUser]);

  // Fetch kalender dari endpoint /api/kalender (semua role)
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { bulan: month + 1, tahun: year };
      if (jenis !== 'semua') params.jenis = jenis;
      if (status) params.status = status;
      const { data } = await axiosClient.get('/kalender', { params });
      setEvents(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memuat kalender.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [month, year, jenis, status]);

  const byDate = useMemo(() => events.reduce((acc, e) => {
    if (!e.hari_tanggal) return acc;
    (acc[e.hari_tanggal] ??= []).push(e);
    return acc;
  }, {}), [events]);

  const monthStart   = new Date(year, month, 1);
  const startWeekDay = monthStart.getDay();
  const totalDays    = new Date(year, month + 1, 0).getDate();
  const totalCells   = Math.ceil((startWeekDay + totalDays) / 7) * 7;

  const isToday = (y, m, d) => {
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday   = () => { const t = new Date(); setMonth(t.getMonth()); setYear(t.getFullYear()); setSelected(t.toISOString().slice(0, 10)); };

  const selectedEvents = selected ? byDate[selected] ?? [] : [];

  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      <Sidebar />
      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4">

        {/* Header — tanpa tombol download */}
        <div className="mb-6">
          <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight lg:mt-0 mt-12">
            Kalender Peminjaman
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lihat jadwal peminjaman ruangan dan alat.
          </p>
        </div>

        {/* Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="bg-white/80 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Jenis peminjaman</p>
            <select
              value={jenis} onChange={e => setJenis(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40"
            >
              <option value="semua">Semua</option>
              <option value="ruangan">Ruangan</option>
              <option value="alat">Alat</option>
            </select>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Status</p>
            {isMahasiswa ? (
              // Mahasiswa: tampilkan label saja, tidak bisa ganti filter
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">Disetujui</span>
              </div>
            ) : (
              <select
                value={status} onChange={e => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40"
              >
                <option value="">Semua</option>
                <option value="menunggu">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            )}
          </div>
        </div>

        {/* Month nav */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 rounded-2xl p-4 shadow-sm mb-4">
          <div>
            <p className="text-xs text-gray-500">Bulan</p>
            <h2 className="text-xl font-semibold text-gray-800">{MONTH_NAMES[month]} {year}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
              <Icon icon="mdi:chevron-left" width={18} /> Sebelumnya
            </button>
            <button onClick={goToday} className="rounded-lg border border-[#D85A30]/30 bg-[#FFF2E9] px-3 py-2 text-sm font-medium text-[#D85A30] hover:bg-[#FFE4D2] transition">
              Hari ini
            </button>
            <button onClick={nextMonth} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
              Berikutnya <Icon icon="mdi:chevron-right" width={18} />
            </button>
          </div>
        </div>

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
                const dateKey = inMonth ? `${year}-${pad(month + 1)}-${pad(dayNum)}` : null;
                const dayEvts = dateKey ? byDate[dateKey] ?? [] : [];
                const isSel   = selected === dateKey;
                const today   = inMonth && isToday(year, month, dayNum);
                const MAX_DOTS = 4;

                if (!inMonth) return (
                  <div key={idx} className="aspect-square sm:aspect-auto sm:h-[88px] rounded-xl bg-gray-50/60 border border-gray-100/70" />
                );

                return (
                  <button key={idx} type="button" onClick={() => setSelected(dateKey)}
                    className={`relative flex flex-col justify-between aspect-square sm:aspect-auto sm:h-[88px] rounded-xl border p-1.5 sm:p-2 text-left transition-all
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D85A30]
                      ${isSel ? 'border-[#D85A30] bg-[#FFF2E9] ring-1 ring-[#D85A30]/30 shadow-sm' : 'border-gray-200 bg-white hover:border-[#D85A30]/50 hover:bg-orange-50/60'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-semibold leading-none
                        ${today ? 'bg-[#D85A30] text-white' : 'text-gray-700'}`}>
                        {dayNum}
                      </span>
                      {dayEvts.length > 0 && (
                        <span className="text-[9px] text-gray-400 font-semibold">{dayEvts.length}</span>
                      )}
                    </div>
                    {dayEvts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {dayEvts.slice(0, MAX_DOTS).map(e => (
                          <span key={e.id_peminjaman}
                            title={`${e.item} ${e.jam_mulai}–${e.jam_selesai}`}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${STATUS_DOT[e.status_persetujuan] ?? 'bg-gray-300'}`}
                          />
                        ))}
                        {dayEvts.length > MAX_DOTS && (
                          <span className="text-[9px] text-gray-400 leading-none">+{dayEvts.length - MAX_DOTS}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100">
              {Object.entries(STATUS_LABEL).map(([key, lbl]) => (
                <div key={key} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[key]}`} />
                  {lbl}
                </div>
              ))}
            </div>
          </div>

          {/* Panel detail — hanya tampil jam dan nama item, tanpa detail peminjam */}
          <div className="bg-white/80 rounded-2xl p-4 shadow-sm flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Jadwal tanggal</p>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {selected
                    ? new Date(selected).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Pilih tanggal'}
                </h3>
              </div>
              {selectedEvents.length > 0 && (
                <span className="shrink-0 rounded-full bg-[#FDE8D8] px-2.5 py-1 text-[11px] font-semibold text-[#B45309]">
                  {selectedEvents.length} jadwal
                </span>
              )}
            </div>

            {loading && (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400 py-12">
                <Icon icon="mdi:loading" className="animate-spin mr-2" width={18} />Memuat...
              </div>
            )}
            {error && !loading && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            {!loading && !error && selectedEvents.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-400">
                <Icon icon="mdi:calendar-blank-outline" width={32} className="mb-2 opacity-60" />
                <p className="text-sm">Tidak ada jadwal pada tanggal ini.</p>
              </div>
            )}
            {!loading && !error && selectedEvents.length > 0 && (
              <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
                {selectedEvents.map(e => (
                  <div key={e.id_peminjaman} className="rounded-2xl border border-gray-200 bg-[#FEF5EE] p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#FDEAF0] flex items-center justify-center flex-shrink-0">
                          <Icon icon={e.jenis === 'ruangan' ? 'ph:door-open-bold' : 'ph:wrench-bold'} width={16} color="#C92B58" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{e.item}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_BADGE[e.status_persetujuan] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABEL[e.status_persetujuan] ?? e.status_persetujuan}
                      </span>
                    </div>
                    {/* Hanya tampilkan jam mulai–selesai */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#C0254A]">
                      <Icon icon="mdi:clock-outline" width={15} />
                      <span>{e.jam_mulai} – {e.jam_selesai}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
