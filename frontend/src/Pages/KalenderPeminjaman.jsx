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
  }, [filterJenis, filterStatus]);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events;
  }, [events, selectedDate]);

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

  const isToday = (year, month, day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      <Sidebar />
      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4">
        <div className="mb-6">
          <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight">
            Kalender Peminjaman
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lihat semua peminjaman ruangan dan alat dalam tampilan kalender.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-3 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            {[
              { label: 'Total aktif', value: stats?.total ?? '-', color: 'text-gray-800' },
              { label: 'Menunggu', value: stats?.menunggu ?? '-', color: 'text-amber-700' },
              { label: 'Disetujui', value: stats?.disetujui ?? '-', color: 'text-emerald-700' },
              { label: 'Ruangan', value: stats?.ruangan ?? '-', color: 'text-[#6b21a8]' },
            ].map((card) => (
              <div key={card.label} className="bg-white/70 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full xl:w-[420px]">
            <div className="bg-white/80 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Jenis peminjaman</p>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                <option value="semua">Semua</option>
                <option value="ruangan">Ruangan</option>
                <option value="alat">Alat</option>
              </select>
            </div>
            <div className="bg-white/80 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Status peminjaman</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                <option value="">Semua</option>
                <option value="menunggu">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-wrap gap-3 items-center justify-between bg-white/80 rounded-xl p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-700">Bulan</p>
              <h2 className="text-2xl font-semibold text-gray-800">{currentMonthLabel}</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Icon icon="mdi:chevron-left" width={18} /> Sebelumnya
              </button>
              <button
                onClick={handleNextMonth}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Berikutnya <Icon icon="mdi:chevron-right" width={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-3">
            <div className="bg-white/80 rounded-3xl p-4 shadow-sm">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mt-1">
                {Array.from({ length: totalCells }).map((_, index) => {
                  const dayNumber = index - startWeekDay + 1;
                  const inMonth = index >= startWeekDay && dayNumber <= totalDays;
                  const dateKey = inMonth
                    ? `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNumber)}`
                    : null;
                  const dayEvents = dateKey ? eventsByDate[dateKey] ?? [] : [];
                  const isSelected = selectedDate === dateKey;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => dateKey && setSelectedDate(dateKey)}
                      className={`min-h-[96px] rounded-3xl border px-2 py-2 text-left transition-colors ${
                        inMonth
                          ? isSelected
                            ? 'border-[#D85A30] bg-[#FFF2E9]'
                            : 'border-gray-200 bg-white hover:border-[#D85A30] hover:bg-orange-50'
                          : 'border-transparent bg-transparent'
                      }`}
                      disabled={!inMonth}
                    >
                      {inMonth && (
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold ${isToday(currentYear, currentMonth, dayNumber) ? 'text-[#D85A30]' : 'text-gray-700'}`}>
                            {dayNumber}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="inline-flex items-center rounded-full bg-[#FDE8D8] px-2 py-0.5 text-[11px] font-semibold text-[#B45309]">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Detail tanggal</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedDate ? formatDate(selectedDate) : 'Pilih tanggal'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Hari ini
                </button>
              </div>

              {loading && (
                <div className="text-center py-12 text-gray-400">Memuat kalender...</div>
              )}

              {error && !loading && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              {!loading && !error && selectedEvents.length === 0 && (
                <div className="text-sm text-gray-500">Tidak ada peminjaman pada tanggal ini.</div>
              )}

              {!loading && !error && selectedEvents.length > 0 && (
                <div className="space-y-3">
                  {selectedEvents.map((item) => (
                    <div key={item.id_peminjaman} className="rounded-3xl border border-gray-200 bg-[#FEF5EE] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.name_kegiatan}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.name_peminjam} · {item.jenis === 'ruangan' ? item.name_ruangan : item.name_alat}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusColors[item.status_persetujuan] ?? 'bg-gray-100 text-gray-700'}`}>
                          {item.status_persetujuan}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:clock-outline" width={14} />
                          <span>{item.jam_mulai} - {item.jam_selesai}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:information-outline" width={14} />
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
