import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosClient from '../axios';
import {
    ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const STATUS_CONFIG = {
    disetujui: { label: 'Disetujui', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    menunggu:  { label: 'Menunggu',  bg: 'bg-amber-100',   text: 'text-amber-800'   },
    ditolak:   { label: 'Ditolak',   bg: 'bg-red-100',     text: 'text-red-800'     },
};

const STATUS_COLORS = {
    disetujui: '#10b981',
    menunggu:  '#f59e0b',
    ditolak:   '#ef4444',
};

const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtTime = (t) => (t ? t.slice(0, 5) : '-');

export default function DashboardAdmin() {
    const [filter, setFilter]         = useState('seminggu');
    const [tanggal, setTanggal]       = useState('');
    const [status, setStatus]         = useState('');
    const [data, setData]             = useState([]);
    const [meta, setMeta]             = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        const payload = {};

        if (filter === 'seminggu' || filter === 'sebulan') {
            payload.filter = filter;
            if (tanggal) payload.tanggal = tanggal;
        } else if (filter === 'custom' && tanggal) {
            payload.tanggal = tanggal;
        }

        if (status) payload.status = status;

        axiosClient.post('/peminjaman-rekapitulasi', payload)
            .then((res) => {
                setData(res.data.data.data);
                setMeta(res.data.meta);
                setPagination(res.data.data);
            })
            .catch((err) => {
                console.error('Gagal mengambil data peminjaman:', err);
                setError(err.response?.data?.message ?? 'Gagal memuat data.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filter, tanggal, status]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const counts = {
        total:     data.length,
        disetujui: data.filter((x) => x.status_persetujuan === 'disetujui').length,
        menunggu:  data.filter((x) => x.status_persetujuan === 'menunggu').length,
        ditolak:   data.filter((x) => x.status_persetujuan === 'ditolak').length,
    };

    const statusChartData = useMemo(() => (
        Object.keys(STATUS_CONFIG)
            .map((key) => ({
                key,
                name: STATUS_CONFIG[key].label,
                value: counts[key],
            }))
            .filter((item) => item.value > 0)
    ), [data]);

    const dailyChartData = useMemo(() => {
        const grouped = {};

        data.forEach((p) => {
            const tgl = p.hari_tanggal?.slice(0, 10);
            if (!tgl) return;
            if (!grouped[tgl]) {
                grouped[tgl] = { tanggal: tgl, disetujui: 0, menunggu: 0, ditolak: 0 };
            }
            grouped[tgl][p.status_persetujuan] += 1;
        });

        return Object.values(grouped)
            .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
            .map((item) => ({ ...item, label: fmtDate(item.tanggal) }));
    }, [data]);

    return (
        <>
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="mb-6">
                <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Rekapitulasi data peminjaman ruangan &amp; alat
                </p>
            </div>

            {/* ── Filter bar ─────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
                {[
                    { key: 'seminggu', label: 'Minggu ini' },
                    { key: 'sebulan',  label: 'Bulan ini'  },
                    { key: 'custom',   label: 'Custom'     },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => { setFilter(key); if (key !== 'custom') setTanggal(''); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                            ${filter === key
                                ? 'bg-[#D85A30] text-white border-[#D85A30]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50'}`}
                    >
                        {label}
                    </button>
                ))}

                <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700"
                >
                    <option value="">Semua status</option>
                    <option value="menunggu">Menunggu</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                </select>

                <button
                    onClick={fetchData}
                    className="px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-orange-50"
                >
                    ↻ Muat ulang
                </button>
            </div>

            {/* ── Meta rentang ───────────────────────────────────── */}
            {meta && (
                <div className="text-xs text-gray-500 bg-white/60 border-l-4 border-[#D85A30] rounded px-3 py-2 mb-4">
                    {meta.filter_aktif === 'seminggu' && `Minggu: ${meta.dari} – ${meta.sampai}`}
                    {meta.filter_aktif === 'sebulan'  && `Bulan: ${meta.dari} – ${meta.sampai}`}
                    {meta.filter_aktif === 'custom'   && (meta.tanggal
                        ? `Tanggal: ${meta.tanggal}`
                        : `Range: ${meta.dari} – ${meta.sampai}`)}
                    {pagination && ` · ${pagination.total} data ditemukan`}
                </div>
            )}

            {/* ── Stat cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    { key: 'total',     label: 'Total',     color: 'text-gray-800'    },
                    { key: 'disetujui', label: 'Disetujui', color: 'text-emerald-700' },
                    { key: 'menunggu',  label: 'Menunggu',  color: 'text-amber-700'   },
                    { key: 'ditolak',   label: 'Ditolak',   color: 'text-red-700'     },
                ].map(({ key, label, color }) => (
                    <div key={key} className="bg-white/70 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className={`text-2xl font-semibold ${color}`}>{counts[key]}</p>
                    </div>
                ))}
            </div>

            {/* ── Grafik ─────────────────────────────────────────── */}
            {!loading && !error && data.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-5">
                    <div className="lg:col-span-2 bg-white/70 rounded-xl p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-700 mb-2">Distribusi Status</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                >
                                    {statusChartData.map((entry) => (
                                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={28} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-3 bg-white/70 rounded-xl p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-700 mb-2">Peminjaman per Tanggal</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dailyChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={28} />
                                <Bar dataKey="disetujui" stackId="a" name="Disetujui" fill={STATUS_COLORS.disetujui} />
                                <Bar dataKey="menunggu"  stackId="a" name="Menunggu"  fill={STATUS_COLORS.menunggu} />
                                <Bar dataKey="ditolak"   stackId="a" name="Ditolak"   fill={STATUS_COLORS.ditolak} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── States ─────────────────────────────────────────── */}
            {loading && (
                <div className="text-center py-12 text-gray-400 text-sm">Memuat data...</div>
            )}

            {error && !loading && (
                <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            {!loading && !error && data.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                    Tidak ada data peminjaman pada periode ini.
                </div>
            )}

            {/* ── List kartu ─────────────────────────────────────── */}
            {!loading && !error && data.length > 0 && (
                <div className="flex flex-col gap-3">
                    {data.map((p) => {
                        const st   = STATUS_CONFIG[p.status_persetujuan];
                        const aset = p.alat
                            ? { icon: '🖥', label: p.alat.name_alat }
                            : p.ruangan
                            ? { icon: '🚪', label: `${p.ruangan.name_ruangan} (${p.ruangan.kode_ruangan})` }
                            : null;

                        return (
                            <div
                                key={p.id_peminjaman}
                                className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-white/60"
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{p.name_kegiatan}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {p.jenis_kegiatan} · {p.peminjam?.name}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.bg} ${st.text}`}>
                                        {st.label}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                    <span>📅 {fmtDate(p.hari_tanggal)}</span>
                                    <span>🕐 {fmtTime(p.jam_mulai)} – {fmtTime(p.jam_selesai)}</span>
                                    {aset && <span>{aset.icon} {aset.label}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Pagination info ────────────────────────────────── */}
            {pagination && pagination.last_page > 1 && (
                <p className="text-xs text-center text-gray-400 mt-4">
                    Halaman {pagination.current_page} dari {pagination.last_page}
                    {' '}· {pagination.total} total
                </p>
            )}
        </>
    );
}
