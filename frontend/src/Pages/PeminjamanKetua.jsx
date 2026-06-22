import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;

const STATUS_CONFIG = {
  menunggu: {
    label: "Menunggu",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    icon: "mdi:clock-outline",
  },
  disetujui: {
    label: "Disetujui",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    icon: "mdi:check-circle-outline",
  },
  ditolak: {
    label: "Ditolak",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-400",
    icon: "mdi:close-circle-outline",
  },
  dibatalkan: {
    label: "Dibatalkan",
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    dot: "bg-gray-400",
    icon: "mdi:cancel",
  },
  dijadwalkan_ulang: {
    label: "Dijadwalkan Ulang",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
    icon: "mdi:calendar-refresh",
  },
};

// ─── Utilitas ─────────────────────────────────────────────────────────────────

const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatJam = (timeStr) => {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5);
};

// ─── Sub-komponen: StatusBadge ─────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["menunggu"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Sub-komponen: Dropdown Filter ────────────────────────────────────────────

const Dropdown = ({ label, icon, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-[13px] font-semibold transition shadow-sm ${
          value
            ? "border-[#C0254A] text-white bg-[#C0254A]"
            : "border-pink-300 text-[#C0254A] bg-white hover:bg-pink-50"
        }`}
      >
        <Icon icon={icon} width={14} />
        {value || label}
        <Icon icon={open ? "mdi:chevron-up" : "mdi:chevron-down"} width={14} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-pink-100 rounded-2xl shadow-xl min-w-[180px] py-1 overflow-hidden">
          {value && (
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:bg-red-50 flex items-center gap-2"
            >
              <Icon icon="mdi:close-circle" width={13} /> Hapus filter
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-[12px] hover:bg-pink-50 ${
                value === opt.value ? "text-[#C0254A] font-bold" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sub-komponen: StatCard ────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-4 flex items-center gap-4 border border-white/60 shadow-sm`}>
    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
      <Icon icon={icon} width={22} />
    </div>
    <div>
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      <p className="text-[22px] font-extrabold text-[#2D0A18] leading-tight">{value}</p>
    </div>
  </div>
);

// ─── Sub-komponen: Modal Aksi (Batalkan / Jadwalkan Ulang) ────────────────────

const ModalAksi = ({ peminjaman, onClose, onSubmit }) => {
  const [mode, setMode] = useState(null); // "batalkan" | "jadwalkan_ulang"
  const [alasan, setAlasan] = useState("");
  const [newTanggal, setNewTanggal] = useState("");
  const [newJamMulai, setNewJamMulai] = useState("");
  const [newJamSelesai, setNewJamSelesai] = useState("");
  const [newRuangan, setNewRuangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!peminjaman) return null;

  const isRuangan = peminjaman.jenis === "ruangan";
  const isMenunggu = peminjaman.status === "menunggu";

  const validate = () => {
    const e = {};
    if (!alasan.trim()) e.alasan = "Alasan wajib diisi";
    if (mode === "jadwalkan_ulang") {
      if (!newTanggal) e.newTanggal = "Tanggal baru wajib diisi";
      if (!newJamMulai) e.newJamMulai = "Jam mulai wajib diisi";
      if (!newJamSelesai) e.newJamSelesai = "Jam selesai wajib diisi";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        id: peminjaman.id,
        jenis: peminjaman.jenis,
        mode,
        alasan,
        ...(mode === "jadwalkan_ulang" && {
          newTanggal,
          newJamMulai,
          newJamSelesai,
          ...(isRuangan && newRuangan && { newRuangan }),
        }),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-[520px] max-w-[95vw] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D0C1F] to-[#C0254A] p-5 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-[17px]">Kelola Peminjaman</h2>
            <p className="text-pink-200 text-[12px] mt-0.5">
              {peminjaman.nama_peminjam} ·{" "}
              {isRuangan ? peminjaman.nama_ruangan : peminjaman.nama_alat}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white bg-white/20 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Info peminjaman */}
          <div className="bg-pink-50 rounded-2xl p-4 mb-5 flex flex-col gap-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon icon="mdi:calendar-range" className="text-[#C0254A]" />
                Tanggal
              </span>
              <span className="text-[#2D0A18] font-semibold">
                {formatTanggal(peminjaman.tanggal_mulai)}
                {peminjaman.tanggal_selesai && peminjaman.tanggal_selesai !== peminjaman.tanggal_mulai
                  ? ` – ${formatTanggal(peminjaman.tanggal_selesai)}`
                  : ""}
              </span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon icon="mdi:clock-outline" className="text-[#C0254A]" />
                Waktu
              </span>
              <span className="text-[#2D0A18] font-semibold">
                {formatJam(peminjaman.jam_mulai)} – {formatJam(peminjaman.jam_selesai)}
              </span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon icon="mdi:tag-outline" className="text-[#C0254A]" />
                Status
              </span>
              <StatusBadge status={peminjaman.status} />
            </div>
          </div>

          {/* Pilih mode aksi */}
          {!mode && (
            <>
              <p className="text-[12px] text-gray-500 mb-3 text-center">Pilih tindakan yang akan dilakukan:</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode("jadwalkan_ulang")}
                  className="flex items-center gap-3 border-2 border-blue-200 rounded-2xl p-4 hover:border-blue-400 hover:bg-blue-50 transition text-left group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition flex-shrink-0">
                    <Icon icon="mdi:calendar-refresh" className="text-blue-600" width={20} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-blue-700">Jadwalkan Ulang</p>
                    <p className="text-[11px] text-blue-400">
                      Ubah tanggal, waktu{isRuangan ? ", atau ruangan" : ""} peminjaman
                    </p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="text-blue-300 ml-auto" width={18} />
                </button>

                <button
                  onClick={() => setMode("batalkan")}
                  className="flex items-center gap-3 border-2 border-red-200 rounded-2xl p-4 hover:border-red-400 hover:bg-red-50 transition text-left group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition flex-shrink-0">
                    <Icon icon="mdi:cancel" className="text-red-500" width={20} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-red-600">Batalkan Peminjaman</p>
                    <p className="text-[11px] text-red-400">
                      {isMenunggu
                        ? "Tolak pengajuan yang belum diproses"
                        : "Batalkan peminjaman yang sudah disetujui (memerlukan alasan)"}
                    </p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="text-red-300 ml-auto" width={18} />
                </button>
              </div>
            </>
          )}

          {/* Form Jadwalkan Ulang */}
          {mode === "jadwalkan_ulang" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setMode(null); setErrors({}); }}
                className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition mb-1 w-fit"
              >
                <Icon icon="mdi:arrow-left" width={14} /> Kembali
              </button>

              <p className="text-[13px] font-bold text-blue-700 flex items-center gap-2">
                <Icon icon="mdi:calendar-refresh" width={16} />
                Jadwalkan Ulang Peminjaman
              </p>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                    Tanggal Baru <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTanggal}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setNewTanggal(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A] ${errors.newTanggal ? "border-red-400" : "border-pink-200"}`}
                  />
                  {errors.newTanggal && <p className="text-[10px] text-red-400 mt-1">{errors.newTanggal}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                      Jam Mulai <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={newJamMulai}
                      onChange={(e) => setNewJamMulai(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A] ${errors.newJamMulai ? "border-red-400" : "border-pink-200"}`}
                    />
                    {errors.newJamMulai && <p className="text-[10px] text-red-400 mt-1">{errors.newJamMulai}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                      Jam Selesai <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={newJamSelesai}
                      onChange={(e) => setNewJamSelesai(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A] ${errors.newJamSelesai ? "border-red-400" : "border-pink-200"}`}
                    />
                    {errors.newJamSelesai && <p className="text-[10px] text-red-400 mt-1">{errors.newJamSelesai}</p>}
                  </div>
                </div>

                {isRuangan && (
                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                      Ruangan Pengganti{" "}
                      <span className="text-gray-300 font-normal">(opsional, kosongkan jika tidak berubah)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nama atau kode ruangan baru..."
                      value={newRuangan}
                      onChange={(e) => setNewRuangan(e.target.value)}
                      className="w-full border border-pink-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                    Alasan Perubahan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan alasan penjadwalan ulang ini..."
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none focus:border-[#C0254A] ${errors.alasan ? "border-red-400" : "border-pink-200"}`}
                  />
                  {errors.alasan && <p className="text-[10px] text-red-400 mt-1">{errors.alasan}</p>}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                <Icon icon="mdi:information-outline" className="text-blue-400 flex-shrink-0 mt-0.5" width={15} />
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Peminjam akan menerima notifikasi perubahan jadwal. Peminjam dapat menerima atau menolak perubahan ini.
                </p>
              </div>
            </div>
          )}

          {/* Form Batalkan */}
          {mode === "batalkan" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setMode(null); setErrors({}); }}
                className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition mb-1 w-fit"
              >
                <Icon icon="mdi:arrow-left" width={14} /> Kembali
              </button>

              <p className="text-[13px] font-bold text-red-600 flex items-center gap-2">
                <Icon icon="mdi:cancel" width={16} />
                Batalkan Peminjaman
              </p>

              <div>
                <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                  Alasan Pembatalan <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan alasan pembatalan peminjaman ini. Alasan ini akan diterima oleh peminjam..."
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none focus:border-[#C0254A] ${errors.alasan ? "border-red-400" : "border-pink-200"}`}
                />
                {errors.alasan && <p className="text-[10px] text-red-400 mt-1">{errors.alasan}</p>}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <Icon icon="mdi:alert-outline" className="text-amber-500 flex-shrink-0 mt-0.5" width={15} />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  {isMenunggu
                    ? "Pengajuan akan ditolak dan peminjam akan diberi tahu."
                    : "Tindakan ini akan membatalkan peminjaman yang sudah disetujui. Peminjam akan menerima notifikasi beserta alasan pembatalan."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode && (
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2.5 text-[12px] font-bold hover:bg-pink-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 rounded-full py-2.5 text-[12px] font-bold transition flex items-center justify-center gap-2 ${
                mode === "batalkan"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
              } disabled:opacity-60`}
            >
              {loading && <Icon icon="mdi:loading" className="animate-spin" width={14} />}
              {mode === "batalkan" ? "Konfirmasi Pembatalan" : "Konfirmasi Penjadwalan Ulang"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-komponen: Kartu Peminjaman ───────────────────────────────────────────

const PeminjamanCard = ({ item, onAksi }) => {
  const isRuangan = item.jenis === "ruangan";
  const canAksi = item.status === "menunggu" || item.status === "disetujui";

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 hover:shadow-lg transition duration-200 hover:-translate-y-0.5">
      {/* Header card */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isRuangan ? "bg-purple-100" : "bg-orange-100"}`}>
            <Icon
              icon={isRuangan ? "mdi:door-sliding" : "mdi:tools"}
              className={isRuangan ? "text-purple-600" : "text-orange-500"}
              width={18}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#2D0A18] truncate">
              {isRuangan ? item.nama_ruangan : item.nama_alat}
            </p>
            <p className="text-[10px] text-gray-400">{isRuangan ? "Ruangan" : "Alat"}</p>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Info peminjam */}
      <div className="flex items-center gap-2 bg-pink-50 rounded-xl px-3 py-2">
        <div className="w-7 h-7 bg-gradient-to-br from-[#C0254A] to-[#3D0C1F] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {(item.nama_peminjam || "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-[#2D0A18] truncate">{item.nama_peminjam}</p>
          <p className="text-[10px] text-gray-400 truncate">{item.unit_peminjam || "—"}</p>
        </div>
      </div>

      {/* Detail waktu */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 flex items-center gap-1">
            <Icon icon="mdi:calendar" className="text-[#C0254A]" width={12} />
            {formatTanggal(item.tanggal_mulai)}
            {item.tanggal_selesai && item.tanggal_selesai !== item.tanggal_mulai
              ? ` – ${formatTanggal(item.tanggal_selesai)}`
              : ""}
          </span>
          <span className="text-gray-400 flex items-center gap-1">
            <Icon icon="mdi:clock-outline" className="text-[#C0254A]" width={12} />
            {formatJam(item.jam_mulai)} – {formatJam(item.jam_selesai)}
          </span>
        </div>
        {item.keperluan && (
          <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg px-2 py-1 line-clamp-2 leading-relaxed">
            <Icon icon="mdi:text" className="inline text-gray-300 mr-1" width={11} />
            {item.keperluan}
          </p>
        )}
      </div>

      {/* Tombol aksi */}
      {canAksi && (
        <button
          onClick={() => onAksi(item)}
          className="mt-1 w-full flex items-center justify-center gap-2 border-2 border-[#C0254A]/20 hover:border-[#C0254A] text-[#C0254A] rounded-xl py-2 text-[12px] font-bold hover:bg-pink-50 transition"
        >
          <Icon icon="mdi:cog-outline" width={14} />
          Kelola Peminjaman
        </button>
      )}

      {/* Alasan pembatalan / reschedule */}
      {(item.status === "dibatalkan" || item.status === "dijadwalkan_ulang") && item.alasan_perubahan && (
        <div className={`rounded-xl p-2.5 text-[10px] leading-relaxed ${
          item.status === "dibatalkan"
            ? "bg-red-50 text-red-600 border border-red-100"
            : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}>
          <Icon icon="mdi:comment-text-outline" className="inline mr-1" width={11} />
          <span className="font-semibold">Alasan: </span>
          {item.alasan_perubahan}
        </div>
      )}
    </div>
  );
};

// ─── Komponen Utama ───────────────────────────────────────────────────────────

const MonitoringPeminjaman = () => {
  const [activeTab, setActiveTab] = useState("semua"); // semua | ruangan | alat
  const [filterStatus, setFilterStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Ambil data dari API
  const fetchData = () => {
    setLoading(true);
    // Sesuaikan endpoint dengan backend Anda
    Promise.all([
      axiosClient.get("/ketua/peminjaman-ruangan"),
      axiosClient.get("/ketua/peminjaman-alat"),
    ])
      .then(([resRuangan, resAlat]) => {
        const mappedRuangan = (resRuangan.data.data || []).map((r) => ({
          ...r,
          jenis: "ruangan",
          nama_ruangan: r.nama_ruangan,
        }));
        const mappedAlat = (resAlat.data.data || []).map((a) => ({
          ...a,
          jenis: "alat",
          nama_alat: a.nama_alat,
        }));
        setData([...mappedRuangan, ...mappedAlat]);
      })
      .catch(() => {
        // Fallback: data dummy untuk development
        setData(DUMMY_DATA);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast notifikasi
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Submit aksi
  const handleSubmitAksi = async ({ id, jenis, mode, alasan, newTanggal, newJamMulai, newJamSelesai, newRuangan }) => {
    // Sesuaikan endpoint dengan backend Anda
    const endpoint =
      mode === "batalkan"
        ? `/ketua/batalkan-peminjaman-${jenis}/${id}`
        : `/ketua/jadwalkan-ulang-${jenis}/${id}`;

    const payload =
      mode === "batalkan"
        ? { alasan_pembatalan: alasan }
        : {
            alasan_perubahan: alasan,
            tanggal_baru: newTanggal,
            jam_mulai_baru: newJamMulai,
            jam_selesai_baru: newJamSelesai,
            ...(jenis === "ruangan" && newRuangan && { ruangan_baru: newRuangan }),
          };

    await axiosClient.post(endpoint, payload);

    setData((prev) =>
      prev.map((item) =>
        item.id === id && item.jenis === jenis
          ? {
              ...item,
              status: mode === "batalkan" ? "dibatalkan" : "dijadwalkan_ulang",
              alasan_perubahan: alasan,
              ...(mode === "jadwalkan_ulang" && {
                tanggal_mulai: newTanggal,
                jam_mulai: newJamMulai,
                jam_selesai: newJamSelesai,
              }),
            }
          : item
      )
    );

    showToast(
      mode === "batalkan"
        ? "Peminjaman berhasil dibatalkan."
        : "Peminjaman berhasil dijadwalkan ulang.",
      "success"
    );
  };

  // Statistik ringkas
  const stats = useMemo(() => ({
    total: data.length,
    menunggu: data.filter((d) => d.status === "menunggu").length,
    disetujui: data.filter((d) => d.status === "disetujui").length,
    ruangan: data.filter((d) => d.jenis === "ruangan").length,
    alat: data.filter((d) => d.jenis === "alat").length,
  }), [data]);

  // Filter + pagination
  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchTab =
        activeTab === "semua" ||
        (activeTab === "ruangan" && item.jenis === "ruangan") ||
        (activeTab === "alat" && item.jenis === "alat");
      const matchStatus = !filterStatus || item.status === filterStatus;
      const keyword = search.toLowerCase();
      const matchSearch =
        !search ||
        (item.nama_peminjam || "").toLowerCase().includes(keyword) ||
        (item.nama_ruangan || "").toLowerCase().includes(keyword) ||
        (item.nama_alat || "").toLowerCase().includes(keyword) ||
        (item.unit_peminjam || "").toLowerCase().includes(keyword);
      return matchTab && matchStatus && matchSearch;
    });
  }, [data, activeTab, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const pageRange = useMemo(() => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
  }, [currentPage, totalPages]);

  const handleSearch = (v) => { setSearch(v); setCurrentPage(1); };
  const handleTab = (t) => { setActiveTab(t); setCurrentPage(1); };
  const handleFilterStatus = (v) => { setFilterStatus(v); setCurrentPage(1); };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-[13px] font-semibold transition-all ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          <Icon
            icon={toast.type === "success" ? "mdi:check-circle" : "mdi:alert-circle"}
            width={18}
          />
          {toast.message}
        </div>
      )}

      {/* Modal Aksi */}
      {selectedItem && (
        <ModalAksi
          peminjaman={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleSubmitAksi}
        />
      )}

      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4 overflow-y-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C0254A] to-[#3D0C1F] rounded-2xl flex items-center justify-center shadow-lg">
              <Icon icon="mdi:monitor-dashboard" className="text-white" width={22} />
            </div>
            <div>
              <h1 className="text-[#2D0A18] text-[28px] lg:mt-0 mt-10 font-extrabold leading-tight">
                Monitoring Peminjaman
              </h1>
              <p className="text-gray-500 text-[13px]">
                Pantau dan kelola seluruh peminjaman alat & ruangan
              </p>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="mdi:clipboard-list-outline" label="Total Peminjaman" value={stats.total} color="bg-gradient-to-br from-[#C0254A] to-[#3D0C1F]" bgColor="bg-white" />
          <StatCard icon="mdi:clock-outline" label="Menunggu Persetujuan" value={stats.menunggu} color="bg-gradient-to-br from-amber-400 to-amber-600" bgColor="bg-amber-50" />
          <StatCard icon="mdi:check-circle-outline" label="Sudah Disetujui" value={stats.disetujui} color="bg-gradient-to-br from-emerald-400 to-emerald-600" bgColor="bg-emerald-50" />
          <StatCard icon="mdi:door-sliding" label="Peminjaman Ruangan" value={stats.ruangan} color="bg-gradient-to-br from-purple-400 to-purple-600" bgColor="bg-purple-50" />
        </div>

        {/* Main panel */}
        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">

          {/* Tabs jenis peminjaman */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {[
              { key: "semua", label: "Semua", icon: "mdi:view-grid-outline" },
              { key: "ruangan", label: "Ruangan", icon: "mdi:door-sliding" },
              { key: "alat", label: "Alat", icon: "mdi:tools" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white shadow-md"
                    : "bg-white text-[#C0254A] border border-pink-200 hover:bg-pink-50"
                }`}
              >
                <Icon icon={tab.icon} width={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <input
                type="text"
                placeholder="Cari nama peminjam, ruangan, atau alat..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 outline-none text-[14px] text-gray-600 bg-transparent"
              />
              {search && (
                <button onClick={() => handleSearch("")} className="text-gray-300 hover:text-gray-500 mr-1">
                  <Icon icon="mdi:close" width={16} />
                </button>
              )}
              <button className="bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition flex-shrink-0">
                <Icon icon="mdi:magnify" />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <Dropdown
                label="Status"
                icon="mdi:filter-outline"
                options={[
                  { value: "menunggu", label: "Menunggu" },
                  { value: "disetujui", label: "Disetujui" },
                  { value: "ditolak", label: "Ditolak" },
                  { value: "dibatalkan", label: "Dibatalkan" },
                  { value: "dijadwalkan_ulang", label: "Dijadwalkan Ulang" },
                ]}
                value={filterStatus}
                onChange={handleFilterStatus}
              />
              <button
                onClick={fetchData}
                className="flex items-center gap-1.5 border border-pink-200 text-[#C0254A] rounded-full px-4 py-1.5 text-[13px] font-semibold hover:bg-pink-50 transition"
              >
                <Icon icon="mdi:refresh" width={14} />
                Refresh
              </button>
              <span className="ml-auto text-[12px] text-gray-400">
                {filtered.length} peminjaman ditemukan
              </span>
            </div>
          </div>

          {/* Konten */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Icon icon="mdi:loading" width={48} className="mb-3 opacity-50 animate-spin" />
              <p className="text-[14px] font-semibold">Memuat data peminjaman...</p>
            </div>
          ) : paginated.length > 0 ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6">
              {paginated.map((item, i) => (
                <PeminjamanCard
                  key={`${item.jenis}-${item.id}-${i}`}
                  item={item}
                  onAksi={setSelectedItem}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Icon icon="mdi:magnify-close" width={52} className="mb-3 opacity-30" />
              <p className="text-[14px] font-semibold">Tidak ada data peminjaman</p>
              <p className="text-[12px] mt-1 text-center">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-double-left" />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-left" />
              </button>

              {pageRange[0] > 1 && <span className="text-[#C0254A] font-semibold">...</span>}

              {pageRange.map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${
                    currentPage === p ? "bg-[#C0254A] text-white shadow-md" : "text-[#C0254A] hover:bg-pink-100"
                  }`}>
                  {p}
                </button>
              ))}

              {pageRange[pageRange.length - 1] < totalPages && <span className="text-[#C0254A] font-semibold">...</span>}

              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-right" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-double-right" />
              </button>

              <span className="text-[#3D0C1F] text-[13px] font-semibold ml-2">Go To</span>
              <input
                type="number" min={1} max={totalPages}
                className="w-16 rounded-full bg-[#3D0C1F] text-white text-center text-[13px] px-2 py-1 outline-none shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt(e.target.value, 10);
                    if (val >= 1 && val <= totalPages) setCurrentPage(val);
                  }
                }}
              />
              <span className="text-[#3D0C1F] text-[13px] font-semibold">Page</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Data Dummy (hapus jika API sudah siap) ───────────────────────────────────

const DUMMY_DATA = [
  { id: 1, jenis: "ruangan", nama_ruangan: "Aula Utama Lt. 3", nama_peminjam: "Budi Santoso", unit_peminjam: "Divisi Marketing", tanggal_mulai: "2026-06-25", tanggal_selesai: "2026-06-25", jam_mulai: "09:00", jam_selesai: "12:00", keperluan: "Rapat koordinasi bulanan divisi", status: "menunggu" },
  { id: 2, jenis: "ruangan", nama_ruangan: "Ruang Rapat B", nama_peminjam: "Siti Rahayu", unit_peminjam: "Divisi SDM", tanggal_mulai: "2026-06-26", tanggal_selesai: "2026-06-26", jam_mulai: "13:00", jam_selesai: "15:00", keperluan: "Wawancara kandidat karyawan baru", status: "disetujui" },
  { id: 3, jenis: "alat", nama_alat: "Proyektor Epson EB-X41", nama_peminjam: "Ahmad Fauzi", unit_peminjam: "Divisi IT", tanggal_mulai: "2026-06-24", tanggal_selesai: "2026-06-24", jam_mulai: "08:00", jam_selesai: "10:00", keperluan: "Presentasi laporan bulanan", status: "disetujui" },
  { id: 4, jenis: "alat", nama_alat: "Kamera DSLR Canon EOS", nama_peminjam: "Dewi Permata", unit_peminjam: "Divisi Humas", tanggal_mulai: "2026-06-27", tanggal_selesai: "2026-06-28", jam_mulai: "07:00", jam_selesai: "17:00", keperluan: "Dokumentasi acara pelantikan pengurus", status: "menunggu" },
  { id: 5, jenis: "ruangan", nama_ruangan: "Lab Komputer A", nama_peminjam: "Eko Prasetyo", unit_peminjam: "Divisi Pendidikan", tanggal_mulai: "2026-06-23", tanggal_selesai: "2026-06-23", jam_mulai: "14:00", jam_selesai: "17:00", keperluan: "Pelatihan penggunaan software baru", status: "dibatalkan", alasan_perubahan: "Ada agenda mendadak dari pimpinan pusat" },
  { id: 6, jenis: "ruangan", nama_ruangan: "Ruang Seminar GD-B", nama_peminjam: "Rina Wijayanti", unit_peminjam: "Divisi Riset", tanggal_mulai: "2026-06-30", tanggal_selesai: "2026-06-30", jam_mulai: "08:00", jam_selesai: "16:00", keperluan: "Seminar hasil penelitian triwulan", status: "dijadwalkan_ulang", alasan_perubahan: "Narasumber tidak bisa hadir, dijadwalkan minggu berikutnya" },
  { id: 7, jenis: "alat", nama_alat: "Mikrofon Wireless Set", nama_peminjam: "Hendra Gunawan", unit_peminjam: "Divisi Acara", tanggal_mulai: "2026-07-01", tanggal_selesai: "2026-07-01", jam_mulai: "18:00", jam_selesai: "22:00", keperluan: "Malam keakraban karyawan", status: "menunggu" },
  { id: 8, jenis: "ruangan", nama_ruangan: "Ruang VIP Lt. 5", nama_peminjam: "Maya Anggraini", unit_peminjam: "Divisi Keuangan", tanggal_mulai: "2026-07-02", tanggal_selesai: "2026-07-02", jam_mulai: "10:00", jam_selesai: "12:00", keperluan: "Meeting dengan auditor eksternal", status: "disetujui" },
];

export default MonitoringPeminjaman;