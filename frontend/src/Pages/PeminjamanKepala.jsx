import React, { useState, useMemo, useEffect, useCallback } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

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
};

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

const StatCard = ({ icon, label, value, color, bgColor }) => (
  <div
    className={`${bgColor} rounded-2xl p-4 flex items-center gap-4 border border-white/60 shadow-sm`}
  >
    <div
      className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white shadow-md flex-shrink-0`}
    >
      <Icon icon={icon} width={22} />
    </div>
    <div>
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      <p className="text-[24px] font-extrabold text-[#2D0A18] leading-tight">
        {value ?? "—"}
      </p>
    </div>
  </div>
);

const Dropdown = ({ label, icon, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

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
        {selected?.label || label}
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          width={14}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-pink-100 rounded-2xl shadow-xl min-w-[180px] py-1 overflow-hidden">
          {value && (
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:bg-red-50 flex items-center gap-2"
            >
              <Icon icon="mdi:close-circle" width={13} /> Hapus filter
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-[12px] hover:bg-pink-50 ${
                value === opt.value
                  ? "text-[#C0254A] font-bold"
                  : "text-gray-700"
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

// ==========================================
// ModalAksi — dengan cek ketersediaan real-time
// ==========================================
const ModalAksi = ({ peminjaman, onClose, onSubmit }) => {
  const [mode, setMode] = useState(null);
  const [alasan, setAlasan] = useState("");
  const [newTanggal, setNewTanggal] = useState("");
  const [newJamMulai, setNewJamMulai] = useState("");
  const [newJamSelesai, setNewJamSelesai] = useState("");
  const [idRuanganBaru, setIdRuanganBaru] = useState("");
  const [ruanganList, setRuanganList] = useState([]);
  const [loadingRuangan, setLoadingRuangan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // State cek ketersediaan
  const [ketersediaan, setKetersediaan] = useState({
    loading: false,
    tersedia: true,
    pesan: "",
  });

  const isRuangan = peminjaman?.jenis === "ruangan";
  const isMenunggu = peminjaman?.status_persetujuan === "menunggu";

  useEffect(() => {
    if (peminjaman) {
      setNewTanggal(peminjaman.hari_tanggal || "");
      setNewJamMulai(formatJam(peminjaman.jam_mulai) || "");
      setNewJamSelesai(formatJam(peminjaman.jam_selesai) || "");
      setIdRuanganBaru("");
    }
  }, [peminjaman]);

  useEffect(() => {
    if (mode === "jadwalkan_ulang" && isRuangan && ruanganList.length === 0) {
      setLoadingRuangan(true);
      axiosClient
        .get("/get-ruangan")
        .then(({ data }) => {
          const mapped = (data.data || [])
            .filter((r) => r.status_ruangan?.toLowerCase() === "tersedia")
            .map((r) => ({
              id: r.id_ruangan,
              label: `${r.nama_ruangan} — ${r.nama_gedung} Lt.${r.nomor_lantai}`,
            }));
          setRuanganList(mapped);
        })
        .catch(() => {})
        .finally(() => setLoadingRuangan(false));
    }
  }, [mode, isRuangan, ruanganList.length]);

  useEffect(() => {
    if (mode !== "jadwalkan_ulang") return;
    if (!newTanggal || !newJamMulai || !newJamSelesai) return;

    if (newJamSelesai <= newJamMulai) {
      setKetersediaan({
        loading: false,
        tersedia: false,
        pesan: "Jam selesai harus lebih besar dari jam mulai.",
      });
      return;
    }

    const timer = setTimeout(async () => {
      setKetersediaan({ loading: true, tersedia: true, pesan: "" });

      try {
        const payload = {
          jenis: peminjaman.jenis,
          hari_tanggal: newTanggal,
          jam_mulai: newJamMulai,
          jam_selesai: newJamSelesai,
          exclude_id: peminjaman.id_peminjaman,
        };

        if (isRuangan) {
          payload.id_ruangan = idRuanganBaru
            ? Number(idRuanganBaru)
            : peminjaman.id_ruangan;
        } else {
          payload.id_alat = peminjaman.id_alat;
        }

        const { data } = await axiosClient.post("/kepala/cek-ketersediaan", payload);
        setKetersediaan({
          loading: false,
          tersedia: data.tersedia,
          pesan: data.pesan || "",
        });
      } catch (err) {
        setKetersediaan({
          loading: false,
          tersedia: false,
          pesan: "Gagal memeriksa ketersediaan. Silakan coba lagi.",
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    newTanggal,
    newJamMulai,
    newJamSelesai,
    idRuanganBaru,
    mode,
    peminjaman,
    isRuangan,
  ]);

  if (!peminjaman) return null;

  const validate = () => {
    const e = {};
    if (!alasan.trim()) e.alasan = "Alasan wajib diisi";
    if (mode === "jadwalkan_ulang") {
      if (!newTanggal) e.newTanggal = "Tanggal baru wajib diisi";
      if (!newJamMulai) e.newJamMulai = "Jam mulai wajib diisi";
      if (!newJamSelesai) e.newJamSelesai = "Jam selesai wajib diisi";
      if (newJamSelesai && newJamMulai && newJamSelesai <= newJamMulai) {
        e.newJamSelesai = "Jam selesai harus lebih besar dari jam mulai";
      }
      if (!ketersediaan.tersedia) {
        e.global = ketersediaan.pesan;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        id: peminjaman.id_peminjaman,
        mode,
        alasan_kepala: alasan,
        ...(mode === "jadwalkan_ulang" && {
          hari_tanggal_baru: newTanggal,
          jam_mulai_baru: newJamMulai,
          jam_selesai_baru: newJamSelesai,
          ...(isRuangan && idRuanganBaru && !isNaN(Number(idRuanganBaru))
            ? { id_ruangan_baru: Number(idRuanganBaru) }
            : {}),
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
        className="bg-white rounded-3xl w-[520px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D0C1F] to-[#C0254A] p-5 flex items-start justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-white font-bold text-[17px]">
              Kelola Peminjaman
            </h2>
            <p className="text-pink-200 text-[12px] mt-0.5 truncate max-w-[300px]">
              {peminjaman.nama_peminjam} ·{" "}
              {isRuangan
                ? peminjaman.nama_ruangan
                : peminjaman.nama_alat}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white bg-white/20 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30 transition text-xl leading-none flex-shrink-0 ml-2"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Info ringkas peminjaman */}
          <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon
                  icon="mdi:text-box-outline"
                  className="text-[#C0254A]"
                />
                Kegiatan
              </span>
              <span className="text-[#2D0A18] font-semibold text-right max-w-[60%]">
                {peminjaman.nama_kegiatan}
              </span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon
                  icon="mdi:calendar-range"
                  className="text-[#C0254A]"
                />
                Tanggal
              </span>
              <span className="text-[#2D0A18] font-semibold">
                {formatTanggal(peminjaman.hari_tanggal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon icon="mdi:clock-outline" className="text-[#C0254A]" />
                Waktu
              </span>
              <span className="text-[#2D0A18] font-semibold">
                {formatJam(peminjaman.jam_mulai)} –{" "}
                {formatJam(peminjaman.jam_selesai)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon icon="mdi:tag-outline" className="text-[#C0254A]" />
                Status
              </span>
              <StatusBadge status={peminjaman.status_persetujuan} />
            </div>
          </div>

          {/* Pilih mode */}
          {!mode && (
            <>
              <p className="text-[12px] text-gray-500 mb-3 text-center">
                Pilih tindakan yang akan dilakukan:
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode("jadwalkan_ulang")}
                  className="flex items-center gap-3 border-2 border-blue-200 rounded-2xl p-4 hover:border-blue-400 hover:bg-blue-50 transition text-left group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition flex-shrink-0">
                    <Icon
                      icon="mdi:calendar-refresh"
                      className="text-blue-600"
                      width={20}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-blue-700">
                      Jadwalkan Ulang
                    </p>
                    <p className="text-[11px] text-blue-400">
                      Ubah tanggal, waktu
                      {isRuangan ? ", atau ruangan" : ""} peminjaman
                    </p>
                  </div>
                  <Icon
                    icon="mdi:chevron-right"
                    className="text-blue-300 ml-auto"
                    width={18}
                  />
                </button>

                <button
                  onClick={() => setMode("batalkan")}
                  className="flex items-center gap-3 border-2 border-red-200 rounded-2xl p-4 hover:border-red-400 hover:bg-red-50 transition text-left group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition flex-shrink-0">
                    <Icon
                      icon="mdi:cancel"
                      className="text-red-500"
                      width={20}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-red-600">
                      Batalkan Peminjaman
                    </p>
                    <p className="text-[11px] text-red-400">
                      {isMenunggu
                        ? "Tolak pengajuan yang belum diproses"
                        : "Batalkan peminjaman yang sudah disetujui"}
                    </p>
                  </div>
                  <Icon
                    icon="mdi:chevron-right"
                    className="text-red-300 ml-auto"
                    width={18}
                  />
                </button>
              </div>
            </>
          )}

          {/* Form Jadwalkan Ulang */}
          {mode === "jadwalkan_ulang" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setMode(null);
                  setErrors({});
                  setKetersediaan({ loading: false, tersedia: true, pesan: "" });
                }}
                className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition mb-1 w-fit"
              >
                <Icon icon="mdi:arrow-left" width={14} /> Kembali
              </button>

              <p className="text-[13px] font-bold text-blue-700 flex items-center gap-2">
                <Icon icon="mdi:calendar-refresh" width={16} />
                Jadwalkan Ulang Peminjaman
              </p>

              {/* Tanggal Baru */}
              <div>
                <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                  Tanggal Baru <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={newTanggal}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewTanggal(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A] ${
                    errors.newTanggal ? "border-red-400" : "border-pink-200"
                  }`}
                />
                {errors.newTanggal && (
                  <p className="text-[10px] text-red-400 mt-1">
                    {errors.newTanggal}
                  </p>
                )}
              </div>

              {/* Jam Mulai & Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                    Jam Mulai <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={newJamMulai}
                    onChange={(e) => setNewJamMulai(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A] ${
                      errors.newJamMulai
                        ? "border-red-400"
                        : "border-pink-200"
                    }`}
                  />
                  {errors.newJamMulai && (
                    <p className="text-[10px] text-red-400 mt-1">
                      {errors.newJamMulai}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                    Jam Selesai <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={newJamSelesai}
                    onChange={(e) => setNewJamSelesai(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A] ${
                      errors.newJamSelesai
                        ? "border-red-400"
                        : "border-pink-200"
                    }`}
                  />
                  {errors.newJamSelesai && (
                    <p className="text-[10px] text-red-400 mt-1">
                      {errors.newJamSelesai}
                    </p>
                  )}
                </div>
              </div>

              {/* Ruangan Pengganti */}
              {isRuangan && (
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                    Ruangan Pengganti{" "}
                    <span className="text-gray-300 font-normal">(opsional)</span>
                  </label>
                  {loadingRuangan ? (
                    <div className="flex items-center gap-2 text-[12px] text-gray-400 py-2">
                      <Icon
                        icon="mdi:loading"
                        className="animate-spin"
                        width={14}
                      />
                      Memuat daftar ruangan...
                    </div>
                  ) : (
                    <select
                      value={idRuanganBaru}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIdRuanganBaru(val && !isNaN(Number(val)) ? val : "");
                      }}
                      className="w-full border border-pink-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#C0254A] bg-white"
                    >
                      <option value="">Tetap gunakan {peminjaman?.nama_ruangan ? peminjaman.nama_ruangan : "ruangan saat ini"}</option>
                      {ruanganList.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {idRuanganBaru && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      ID terpilih: {idRuanganBaru}
                    </p>
                  )}
                </div>
              )}

              {/* Banner ketersediaan */}
              {ketersediaan.loading && (
                <div className="flex items-center gap-2 text-[12px] text-blue-500 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <Icon icon="mdi:loading" className="animate-spin" width={14} />
                  Memeriksa ketersediaan...
                </div>
              )}
              {!ketersediaan.loading && !ketersediaan.tersedia && (
                <div className="flex items-start gap-2 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <Icon icon="mdi:alert-circle" className="flex-shrink-0 mt-0.5" width={15} />
                  <span>{ketersediaan.pesan}</span>
                </div>
              )}
              {!ketersediaan.loading && ketersediaan.tersedia && newTanggal && newJamMulai && newJamSelesai && (
                <div className="flex items-start gap-2 text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <Icon icon="mdi:check-circle" className="flex-shrink-0 mt-0.5" width={15} />
                  <span>Slot waktu tersedia.</span>
                </div>
              )}

              {/* Alasan */}
              <div>
                <label className="text-[11px] text-gray-500 font-semibold mb-1 block">
                  Alasan Penjadwalan Ulang{" "}
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan alasan penjadwalan ulang ini kepada peminjam..."
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none focus:border-[#C0254A] ${
                    errors.alasan ? "border-red-400" : "border-pink-200"
                  }`}
                />
                {errors.alasan && (
                  <p className="text-[10px] text-red-400 mt-1">
                    {errors.alasan}
                  </p>
                )}
                {errors.global && (
                  <p className="text-[10px] text-red-400 mt-1">
                    {errors.global}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                <Icon
                  icon="mdi:information-outline"
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                  width={15}
                />
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Jadwal peminjaman akan diperbarui dan persetujuan akan direset ke tahap awal (Penanggungjawab → PIC → Admin SBUM).
                </p>
              </div>
            </div>
          )}

          {/* Form Batalkan */}
          {mode === "batalkan" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setMode(null);
                  setErrors({});
                }}
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
                  placeholder="Jelaskan alasan pembatalan. Alasan ini akan diterima oleh peminjam..."
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none focus:border-[#C0254A] ${
                    errors.alasan ? "border-red-400" : "border-pink-200"
                  }`}
                />
                {errors.alasan && (
                  <p className="text-[10px] text-red-400 mt-1">
                    {errors.alasan}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <Icon
                  icon="mdi:alert-outline"
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                  width={15}
                />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  {isMenunggu
                    ? "Pengajuan akan ditolak dan peminjam akan diberi tahu melalui sistem."
                    : "Tindakan ini membatalkan peminjaman yang sudah disetujui. Peminjam akan menerima notifikasi beserta alasan pembatalan."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer tombol aksi */}
        {mode && (
          <div className="px-5 pb-5 flex gap-2 sticky bottom-0 bg-white pt-2 border-t border-pink-50">
            <button
              onClick={onClose}
              className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2.5 text-[12px] font-bold hover:bg-pink-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                (mode === "jadwalkan_ulang" &&
                  (!ketersediaan.tersedia || ketersediaan.loading))
              }
              className={`flex-1 rounded-full py-2.5 text-[12px] font-bold transition flex items-center justify-center gap-2 ${
                mode === "batalkan"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
              } disabled:opacity-60`}
            >
              {loading && (
                <Icon icon="mdi:loading" className="animate-spin" width={14} />
              )}
              {mode === "batalkan"
                ? "Konfirmasi Pembatalan"
                : "Konfirmasi Jadwal Ulang"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PeminjamanCard = ({ item, onAksi }) => {
  const isRuangan = item.jenis === "ruangan";
  const canAksi =
    item.status_persetujuan === "menunggu" ||
    item.status_persetujuan === "disetujui";

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 hover:shadow-lg transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isRuangan ? "bg-purple-100" : "bg-orange-100"
            }`}
          >
            <Icon
              icon={isRuangan ? "mdi:door-sliding" : "mdi:tools"}
              className={isRuangan ? "text-purple-600" : "text-orange-500"}
              width={18}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#2D0A18] truncate">
              {isRuangan
                ? item.nama_ruangan || "Ruangan"
                : item.nama_alat || "Alat"}
            </p>
            <p className="text-[10px] text-gray-400">
              {isRuangan
                ? item.kode_ruangan || "Ruangan"
                : item.kode_alat || "Alat"}
            </p>
          </div>
        </div>
        <StatusBadge status={item.status_persetujuan} />
      </div>

      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 line-clamp-2 leading-relaxed">
        <Icon
          icon="mdi:text-box-outline"
          className="inline text-gray-300 mr-1"
          width={11}
        />
        {item.nama_kegiatan}
      </p>

      <div className="flex items-center gap-2 bg-pink-50 rounded-xl px-3 py-2">
        <div className="w-7 h-7 bg-gradient-to-br from-[#C0254A] to-[#3D0C1F] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {(item.nama_peminjam || "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-[#2D0A18] truncate">
            {item.nama_peminjam || "—"}
          </p>
          <p className="text-[10px] text-gray-400 truncate">
            {item.unit_peminjam || item.nomor_induk_peminjam || "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-400 flex items-center gap-1">
          <Icon icon="mdi:calendar" className="text-[#C0254A]" width={12} />
          {formatTanggal(item.hari_tanggal)}
        </span>
        <span className="text-gray-400 flex items-center gap-1">
          <Icon icon="mdi:clock-outline" className="text-[#C0254A]" width={12} />
          {formatJam(item.jam_mulai)} – {formatJam(item.jam_selesai)}
        </span>
      </div>

      {canAksi && (
        <button
          onClick={() => onAksi(item)}
          className="mt-0.5 w-full flex items-center justify-center gap-2 border-2 border-[#C0254A]/20 hover:border-[#C0254A] text-[#C0254A] rounded-xl py-2 text-[12px] font-bold hover:bg-pink-50 transition"
        >
          <Icon icon="mdi:cog-outline" width={14} />
          Kelola Peminjaman
        </button>
      )}

      {item.status_persetujuan === "dibatalkan" && item.alasan_kepala && (
        <div className="rounded-xl p-2.5 text-[10px] leading-relaxed bg-red-50 text-red-600 border border-red-100">
          <Icon icon="mdi:comment-text-outline" className="inline mr-1" width={11} />
          <span className="font-semibold">Alasan Ketua: </span>
          {item.alasan_kepala}
        </div>
      )}
    </div>
  );
};

const MonitoringPeminjaman = () => {
  const [activeTab, setActiveTab] = useState("semua");
  const [filterStatus, setFilterStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    axiosClient
      .get("/kepala/monitoring-peminjaman")
      .then(({ data: res }) => {
        setData(res.data || []);
        setStats(res.stats || null);
      })
      .catch((err) => {
        console.error("Gagal mengambil data monitoring:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitAksi = async ({
    id,
    mode,
    alasan_kepala,
    hari_tanggal_baru,
    jam_mulai_baru,
    jam_selesai_baru,
    id_ruangan_baru,
  }) => {
    try {
      if (mode === "batalkan") {
        await axiosClient.post(`/kepala/batalkan-peminjaman/${id}`, {
          alasan_kepala,
        });

        setData((prev) =>
          prev.map((item) =>
            item.id_peminjaman === id
              ? { ...item, status_persetujuan: "dibatalkan", alasan_kepala }
              : item
          )
        );

        const target = data.find((d) => d.id_peminjaman === id);
        setStats((prev) =>
          prev
            ? {
                ...prev,
                total: Math.max(0, prev.total - 1),
                menunggu:
                  target?.status_persetujuan === "menunggu"
                    ? Math.max(0, prev.menunggu - 1)
                    : prev.menunggu,
                disetujui:
                  target?.status_persetujuan === "disetujui"
                    ? Math.max(0, prev.disetujui - 1)
                    : prev.disetujui,
              }
            : prev
        );

        showToast("Peminjaman berhasil dibatalkan.");
      } else {
        const payload = {
          hari_tanggal_baru,
          jam_mulai_baru,
          jam_selesai_baru,
          alasan_kepala,
        };

        if (id_ruangan_baru && !isNaN(Number(id_ruangan_baru))) {
          payload.id_ruangan_baru = Number(id_ruangan_baru);
        }

        await axiosClient.post(`/kepala/jadwalkan-ulang/${id}`, payload);

        const target = data.find((d) => d.id_peminjaman === id);
        const wasDisetujui = target?.status_persetujuan === "disetujui";

        setData((prev) =>
          prev.map((item) =>
            item.id_peminjaman === id
              ? {
                  ...item,
                  hari_tanggal: hari_tanggal_baru,
                  jam_mulai: jam_mulai_baru,
                  jam_selesai: jam_selesai_baru,
                  alasan_kepala,
                  status_persetujuan: "menunggu",
                  ...(id_ruangan_baru
                    ? { id_ruangan: Number(id_ruangan_baru) }
                    : {}),
                }
              : item
          )
        );

        setStats((prev) =>
          prev
            ? {
                ...prev,
                menunggu: prev.menunggu + 1,
                disetujui: wasDisetujui
                  ? Math.max(0, prev.disetujui - 1)
                  : prev.disetujui,
              }
            : prev
        );

        showToast(
          "Jadwal diperbarui. Persetujuan direset ke tahap awal.",
          "success"
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan. Silakan coba lagi.";
      showToast(msg, "error");
      throw err;
    }
  };

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchTab =
        activeTab === "semua" ||
        (activeTab === "ruangan" && item.jenis === "ruangan") ||
        (activeTab === "alat" && item.jenis === "alat");

      const matchStatus =
        !filterStatus || item.status_persetujuan === filterStatus;

      const keyword = search.toLowerCase();
      const matchSearch =
        !search ||
        (item.nama_peminjam || "").toLowerCase().includes(keyword) ||
        (item.nama_ruangan || "").toLowerCase().includes(keyword) ||
        (item.nama_alat || "").toLowerCase().includes(keyword) ||
        (item.nama_kegiatan || "").toLowerCase().includes(keyword) ||
        (item.unit_peminjam || "").toLowerCase().includes(keyword);

      return matchTab && matchStatus && matchSearch;
    });
  }, [data, activeTab, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pageRange = useMemo(() => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  }, [currentPage, totalPages]);

  const handleSearch = (v) => {
    setSearch(v);
    setCurrentPage(1);
  };
  const handleTab = (t) => {
    setActiveTab(t);
    setCurrentPage(1);
  };
  const handleFilterStatus = (v) => {
    setFilterStatus(v);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-[13px] font-semibold animate-pulse ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          <Icon
            icon={
              toast.type === "success"
                ? "mdi:check-circle"
                : "mdi:alert-circle"
            }
            width={18}
          />
          {toast.message}
        </div>
      )}

      {selectedItem && (
        <ModalAksi
          peminjaman={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleSubmitAksi}
        />
      )}

      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4 overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#C0254A] to-[#3D0C1F] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon
                icon="mdi:monitor-dashboard"
                className="text-white"
                width={22}
              />
            </div>
            <div>
              <h1 className="text-[#2D0A18] text-[28px] lg:mt-0 mt-10 font-extrabold leading-tight">
                Monitoring Peminjaman
              </h1>
              <p className="text-gray-500 text-[13px]">
                Pantau dan kelola seluruh peminjaman alat &amp; ruangan yang
                sedang aktif
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="mdi:clipboard-list-outline"
            label="Total Aktif"
            value={loading ? "..." : stats?.total ?? 0}
            color="bg-gradient-to-br from-[#C0254A] to-[#3D0C1F]"
            bgColor="bg-white"
          />
          <StatCard
            icon="mdi:clock-outline"
            label="Menunggu Persetujuan"
            value={loading ? "..." : stats?.menunggu ?? 0}
            color="bg-gradient-to-br from-amber-400 to-amber-600"
            bgColor="bg-amber-50"
          />
          <StatCard
            icon="mdi:check-circle-outline"
            label="Sudah Disetujui"
            value={loading ? "..." : stats?.disetujui ?? 0}
            color="bg-gradient-to-br from-emerald-400 to-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            icon="mdi:door-sliding"
            label="Peminjaman Ruangan"
            value={loading ? "..." : stats?.ruangan ?? 0}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
            bgColor="bg-purple-50"
          />
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">
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

          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <input
                type="text"
                placeholder="Cari nama peminjam, kegiatan, ruangan, atau alat..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 outline-none text-[14px] text-gray-600 bg-transparent"
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  className="text-gray-300 hover:text-gray-500 mr-1"
                >
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

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Icon
                icon="mdi:loading"
                width={48}
                className="mb-3 opacity-50 animate-spin"
              />
              <p className="text-[14px] font-semibold">
                Memuat data peminjaman...
              </p>
            </div>
          ) : paginated.length > 0 ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6">
              {paginated.map((item, i) => (
                <PeminjamanCard
                  key={`${item.jenis}-${item.id_peminjaman}-${i}`}
                  item={item}
                  onAksi={setSelectedItem}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Icon
                icon="mdi:magnify-close"
                width={52}
                className="mb-3 opacity-30"
              />
              <p className="text-[14px] font-semibold">
                Tidak ada data peminjaman
              </p>
              <p className="text-[12px] mt-1 text-center">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-double-left" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-left" />
              </button>

              {pageRange[0] > 1 && (
                <span className="text-[#C0254A] font-semibold">...</span>
              )}

              {pageRange.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${
                    currentPage === p
                      ? "bg-[#C0254A] text-white shadow-md"
                      : "text-[#C0254A] hover:bg-pink-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              {pageRange[pageRange.length - 1] < totalPages && (
                <span className="text-[#C0254A] font-semibold">...</span>
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-double-right" />
              </button>

              <span className="text-[#3D0C1F] text-[13px] font-semibold ml-2">
                Go To
              </span>
              <input
                type="number"
                min={1}
                max={totalPages}
                className="w-16 rounded-full bg-[#3D0C1F] text-white text-center text-[13px] px-2 py-1 outline-none shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt(e.target.value, 10);
                    if (val >= 1 && val <= totalPages) setCurrentPage(val);
                  }
                }}
              />
              <span className="text-[#3D0C1F] text-[13px] font-semibold">
                Page
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringPeminjaman;
