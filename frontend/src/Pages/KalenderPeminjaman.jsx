import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import axiosClient from '../axios';
import Sidebar from '../Components/Sidebar';

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const pad = (value) => String(value).padStart(2, '0');

const formatDate = (iso) => new Date(iso).toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const statusColors = {
  disetujui: 'bg-emerald-100 text-emerald-800',
  menunggu: 'bg-amber-100 text-amber-800',
  ditolak: 'bg-red-100 text-red-800',
};

// Warna titik indikator di dalam sel kalender — dibuat konsisten dengan statusColors
const statusDot = {
  disetujui: 'bg-emerald-500',
  menunggu: 'bg-amber-500',
  ditolak: 'bg-red-500',
};

const statusLabel = {
  disetujui: 'Disetujui',
  menunggu: 'Menunggu',
  ditolak: 'Ditolak',
};

export default function KalenderPeminjaman() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [filterJenis, setFilterJenis] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [exporting, setExporting] = useState(null); // 'pdf' | 'excel' | null

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (filterJenis !== 'semua') params.jenis = filterJenis;
      if (filterStatus) params.status = filterStatus;

      const response = await axiosClient.get('/kepala/monitoring-peminjaman', { params });
      setEvents(response.data.data || []);
      setStats(response.data.stats || null);
      setSelectedDate((current) => current || new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error('Gagal mengambil data kalender:', err);
      setError(err.response?.data?.message ?? 'Gagal memuat data kalender.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterJenis, filterStatus]);

  const eventsByDate = useMemo(() => {
    return events.reduce((acc, item) => {
      if (!item.hari_tanggal) return acc;
      const key = item.hari_tanggal;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [events]);

  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const startWeekDay = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  const totalCells = Math.ceil((startWeekDay + totalDays) / 7) * 7;

  const currentMonthLabel = `${monthNames[currentMonth]} ${currentYear}`;

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today.toISOString().slice(0, 10));
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  // ── Export PDF / Excel untuk bulan yang sedang ditampilkan ─────────────
  const handleExport = async (type) => {
    setExporting(type);
    try {
      const endpoint = type === 'pdf'
        ? '/kepala/rekap-peminjaman/export-pdf'
        : '/kepala/rekap-peminjaman/export-excel';

      const params = {
        bulan: currentMonth + 1, // JS month 0-indexed, backend 1-indexed
        tahun: currentYear,
      };
      if (filterJenis !== 'semua') params.jenis = filterJenis;
      if (filterStatus) params.status = filterStatus;

      const response = await axiosClient.get(endpoint, {
        params,
        responseType: 'blob',
      });

      const extension = type === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `rekap-peminjaman-${monthNames[currentMonth]}-${currentYear}.${extension}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengekspor laporan:', err);
      alert('Gagal mengekspor laporan. Silakan coba lagi.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      <Sidebar />
      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight">
              Kalender Peminjaman
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Lihat semua peminjaman ruangan dan alat dalam tampilan kalender.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D85A30] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#c14e28] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:file-pdf-box" width={18} />
              {exporting === 'pdf' ? 'Mengekspor...' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={() => handleExport('excel')}
              disabled={exporting !== null || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:file-excel-box" width={18} />
              {exporting === 'excel' ? 'Mengekspor...' : 'Download Excel'}
            </button>
          </div>
        </div>

        {/* Stats + Filters */}
        <div className="flex flex-col xl:flex-row gap-3 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            {[
              { label: 'Total aktif', value: stats?.total ?? '-', color: 'text-gray-800', icon: 'mdi:calendar-check-outline' },
              { label: 'Menunggu', value: stats?.menunggu ?? '-', color: 'text-amber-700', icon: 'mdi:clock-alert-outline' },
              { label: 'Disetujui', value: stats?.disetujui ?? '-', color: 'text-emerald-700', icon: 'mdi:check-decagram-outline' },
              { label: 'Ruangan', value: stats?.ruangan ?? '-', color: 'text-[#6b21a8]', icon: 'mdi:door-open' },
            ].map((card) => (
              <div key={card.label} className="bg-white/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
                </div>
                <Icon icon={card.icon} width={26} className={`${card.color} opacity-70`} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full xl:w-[420px]">
            <div className="bg-white/80 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Jenis peminjaman</p>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40 focus:border-[#D85A30]"
              >
                <option value="semua">Semua</option>
                <option value="ruangan">Ruangan</option>
                <option value="alat">Alat</option>
              </select>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Status peminjaman</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40 focus:border-[#D85A30]"
              >
                <option value="">Semua</option>
                <option value="menunggu">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Month navigator */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-wrap gap-3 items-center justify-between bg-white/80 rounded-2xl p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-700">Bulan</p>
              <h2 className="text-2xl font-semibold text-gray-800">{currentMonthLabel}</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Icon icon="mdi:chevron-left" width={18} /> Sebelumnya
              </button>
              <button
                onClick={handleToday}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D85A30]/30 bg-[#FFF2E9] px-4 py-2 text-sm font-medium text-[#D85A30] hover:bg-[#FFE4D2] transition"
              >
                Hari ini
              </button>
              <button
                onClick={handleNextMonth}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Berikutnya <Icon icon="mdi:chevron-right" width={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-3">
            {/* Calendar grid */}
            <div className="bg-white/80 rounded-2xl p-3 sm:p-4 shadow-sm">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-semibold text-gray-500 mb-1">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: totalCells }).map((_, index) => {
                  const dayNumber = index - startWeekDay + 1;
                  const inMonth = index >= startWeekDay && dayNumber <= totalDays;
                  const dateKey = inMonth
                    ? `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNumber)}`
                    : null;
                  const dayEvents = dateKey ? eventsByDate[dateKey] ?? [] : [];
                  const isSelected = selectedDate === dateKey;
                  const today = inMonth && isToday(currentYear, currentMonth, dayNumber);
                  const MAX_DOTS = 4;

                  if (!inMonth) {
                    return (
                      <div
                        key={index}
                        className="aspect-square sm:aspect-auto sm:h-[88px] lg:h-[100px] rounded-xl bg-gray-50/60 border border-gray-100/70"
                      />
                    );
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDate(dateKey)}
                      aria-label={`${dayNumber} ${monthNames[currentMonth]}${dayEvents.length ? `, ${dayEvents.length} peminjaman` : ''}`}
                      className={`
                        relative flex flex-col justify-between
                        aspect-square sm:aspect-auto sm:h-[88px] lg:h-[100px]
                        rounded-xl border p-1.5 sm:p-2
                        text-left transition-all duration-150
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D85A30] focus-visible:ring-offset-1
                        ${isSelected
                          ? 'border-[#D85A30] bg-[#FFF2E9] shadow-sm ring-1 ring-[#D85A30]/30'
                          : 'border-gray-200 bg-white hover:border-[#D85A30]/50 hover:bg-orange-50/60 hover:shadow-sm'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`
                            inline-flex items-center justify-center leading-none
                            w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-semibold
                            ${today ? 'bg-[#D85A30] text-white' : 'text-gray-700'}
                          `}
                        >
                          {dayNumber}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {dayEvents.slice(0, MAX_DOTS).map((item) => (
                            <span
                              key={item.id_peminjaman}
                              title={`${item.name_kegiatan} — ${statusLabel[item.status_persetujuan] ?? item.status_persetujuan}`}
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${statusDot[item.status_persetujuan] ?? 'bg-gray-300'}`}
                            />
                          ))}
                          {dayEvents.length > MAX_DOTS && (
                            <span className="text-[9px] sm:text-[10px] text-gray-400 leading-none">
                              +{dayEvents.length - MAX_DOTS}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100">
                {Object.entries(statusLabel).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${statusDot[key]}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Detail panel */}
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
                  Memuat kalender...
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
                  {selectedEvents.map((item) => (
                    <div key={item.id_peminjaman} className="rounded-2xl border border-gray-200 bg-[#FEF5EE] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name_kegiatan}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {item.name_peminjam} · {item.jenis === 'ruangan' ? item.name_ruangan : item.name_alat}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${statusColors[item.status_persetujuan] ?? 'bg-gray-100 text-gray-700'}`}>
                          {statusLabel[item.status_persetujuan] ?? item.status_persetujuan}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:clock-outline" width={14} className="shrink-0" />
                          <span>{item.jam_mulai} - {item.jam_selesai}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon={item.jenis === 'ruangan' ? 'mdi:door-open' : 'mdi:toolbox-outline'} width={14} className="shrink-0" />
                          <span>{item.jenis === 'ruangan' ? 'Ruangan' : 'Alat'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Icon icon="mdi:information-outline" width={14} className="shrink-0 mt-0.5" />
                          <span>{item.keterangan || 'Tanpa keterangan tambahan'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}