import React, { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";
import {useStateContext} from "../Contexts/context.jsx";

const ITEMS_PER_PAGE = 9;

// ─── BADGE ───────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const normalized = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  const styles = {
    Menunggu:  "bg-yellow-100 text-yellow-700",
    Disetujui: "bg-green-100 text-green-700",
    Ditolak:   "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap ${styles[normalized] ?? "bg-gray-100 text-gray-500"}`}>
      {normalized}
    </span>
  );
};

// ─── MODAL SETUJUI ────────────────────────────────────────────────────────────
const ModalSetujui = ({ item, onClose, onConfirm, loading }) => {
  if (!item) return null;
  const isAlat = item.id_alat !== null && item.id_ruangan === null;
  const nameItem = isAlat ? (item.kode_alat ?? item.id_alat) : (item.name_ruangan ?? item.id_ruangan);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(72,16,32,0.45)] backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-600 to-green-700 px-7 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition-colors border-none cursor-pointer"
          >
            <Icon icon="ph:x-bold" width={14} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon icon="ph:check-circle-fill" width={28} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight m-0">Konfirmasi Persetujuan</h2>
              <p className="text-xs text-white/75 mt-1 font-medium">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pt-6 pb-2">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Apakah Anda yakin ingin <strong className="text-green-600">menyetujui</strong> peminjaman berikut?
          </p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <Icon icon={isAlat ? "ph:wrench-bold" : "ph:door-open-bold"} width={16} className="text-green-600" />
              <span className="text-sm font-bold text-green-900">{nameItem}</span>
              <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                {isAlat ? "Peralatan" : "Ruangan"}
              </span>
            </div>
            {[
              { icon: "ph:user-circle-fill", text: `${item.peminjam} (${item.role_peminjam})` },
              { icon: "ph:calendar-blank",   text: new Date(item.hari_tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { icon: "ph:clock",            text: `${item.jam_mulai?.slice(0,5)} s/d ${item.jam_selesai?.slice(0,5)}` },
              { icon: "ph:note-pencil",      text: item.name_kegiatan },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-2 mb-1.5">
                <Icon icon={icon} width={12} className="text-green-500 opacity-70 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-500 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-7 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-bold cursor-pointer hover:border-gray-400 hover:text-gray-700 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(item)}
            disabled={loading}
            className={`flex-[2] py-2.5 rounded-xl border-none text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity shadow-lg shadow-green-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-green-600 to-green-700 cursor-pointer hover:opacity-90"}`}
          >
            {loading
              ? <><Icon icon="mdi:loading" width={15} className="animate-spin" /> Memproses...</>
              : <><Icon icon="ph:check-circle-fill" width={15} /> Ya, Setujui</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL TOLAK ──────────────────────────────────────────────────────────────
const ModalTolak = ({ item, onClose, onConfirm, loading }) => {
  if (!item) return null;
  const isAlat = item.id_alat !== null && item.id_ruangan === null;
  const nameItem = isAlat ? (item.kode_alat ?? item.id_alat) : (item.name_ruangan ?? item.id_ruangan);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(72,16,32,0.45)] backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-red-600 to-red-700 px-7 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition-colors border-none cursor-pointer"
          >
            <Icon icon="ph:x-bold" width={14} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon icon="ph:x-circle-fill" width={28} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight m-0">Konfirmasi Penolakan</h2>
              <p className="text-xs text-white/75 mt-1 font-medium">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pt-6 pb-2">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Anda akan <strong className="text-red-600">menolak</strong> peminjaman berikut:
          </p>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <Icon icon={isAlat ? "ph:wrench-bold" : "ph:door-open-bold"} width={16} className="text-red-600" />
              <span className="text-sm font-bold text-red-900">{nameItem}</span>
              <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                {isAlat ? "Peralatan" : "Ruangan"}
              </span>
            </div>
            {[
              { icon: "ph:user-circle-fill", text: `${item.peminjam} (${item.role_peminjam})` },
              { icon: "ph:calendar-blank",   text: new Date(item.hari_tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { icon: "ph:clock",            text: `${item.jam_mulai?.slice(0,5)} s/d ${item.jam_selesai?.slice(0,5)}` },
              { icon: "ph:note-pencil",      text: item.name_kegiatan },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-2 mb-1.5">
                <Icon icon={icon} width={12} className="text-red-400 opacity-70 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-500 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-7 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-bold cursor-pointer hover:border-gray-400 hover:text-gray-700 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(item)}
            disabled={loading}
            className={`flex-[2] py-2.5 rounded-xl border-none text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity shadow-lg shadow-red-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-red-600 to-red-700 cursor-pointer hover:opacity-90"}`}
          >
            {loading
              ? <><Icon icon="mdi:loading" width={15} className="animate-spin" /> Memproses...</>
              : <><Icon icon="ph:x-circle-fill" width={15} /> Ya, Tolak</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL DETAIL ─────────────────────────────────────────────────────────────
const ModalDetail = ({ item, onClose }) => {
  if (!item) return null;
  const isAlat = item.id_alat !== null && item.id_ruangan === null;
  const nameItem = isAlat ? (item.kode_alat ?? item.id_alat) : (item.name_ruangan ?? item.id_ruangan);
  const kodeItem = isAlat ? item.kode_alat : item.kode_ruangan;
  const tipeItem = isAlat ? "Peralatan" : "Ruangan";

  const formatTanggal = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };
  const formatJam = (jam) => jam?.slice(0, 5) ?? "-";

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(72,16,32,0.45)] backdrop-blur-sm animate-fadeIn">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#A3264C] to-[#C92B58] px-7 pt-6 pb-5">
          <button onClick={onClose} className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition-colors border-none cursor-pointer">
            <Icon icon="ph:x-bold" width={14} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon icon={isAlat ? "ph:wrench-bold" : "ph:door-open-bold"} width={28} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight m-0">{nameItem}</h2>
              <p className="text-xs text-white/75 mt-1 font-medium">{kodeItem} &middot; {tipeItem}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pt-5 pb-6 max-h-[60vh] overflow-y-auto">
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#3D0C1F]">Status Persetujuan</span>
            <span className={`text-[11px] font-bold px-4 py-1.5 rounded-full ${
              item.status_persetujuan === "disetujui" ? "bg-green-100 text-green-700" :
              item.status_persetujuan === "ditolak" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {(item.status_persetujuan || "").toUpperCase()}
            </span>
          </div>

          {/* Peminjam Info */}
          <div className="bg-[#FFF5F7] rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-[#481020] mb-2 flex items-center gap-1.5">
              <Icon icon="ph:user-circle-fill" width={14} color="#C92B58" />
              Informasi Peminjam
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              <span className="text-gray-400">name</span>
              <span className="text-gray-700 font-medium">{item.peminjam || "-"}</span>
              <span className="text-gray-400">Role</span>
              <span className="text-gray-700 font-medium">{item.role_peminjam || "-"}</span>
              <span className="text-gray-400">Email</span>
              <span className="text-gray-700 font-medium">{item.email_peminjam || "-"}</span>
              <span className="text-gray-400">Telepon</span>
              <span className="text-gray-700 font-medium">{item.nomor_telephone_peminjam || "-"}</span>
              <span className="text-gray-400">PIC</span>
              <span className="text-gray-700 font-medium">{item.pic || "-"}</span>
            </div>
          </div>

          {/* Detail Peminjaman */}
          <div className="bg-[#FFF5F7] rounded-2xl p-4">
            <p className="text-xs font-bold text-[#481020] mb-2 flex items-center gap-1.5">
              <Icon icon="ph:clipboard-text" width={14} color="#C92B58" />
              Detail Peminjaman
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              <span className="text-gray-400">name Kegiatan</span>
              <span className="text-gray-700 font-medium">{item.name_kegiatan || "-"}</span>
              <span className="text-gray-400">Jenis Kegiatan</span>
              <span className="text-gray-700 font-medium">{item.jenis_kegiatan || "-"}</span>
              <span className="text-gray-400">Tanggal</span>
              <span className="text-gray-700 font-medium">{formatTanggal(item.hari_tanggal)}</span>
              <span className="text-gray-400">Jam</span>
              <span className="text-gray-700 font-medium">{formatJam(item.jam_mulai)} s/d {formatJam(item.jam_selesai)}</span>
              <span className="text-gray-400">Keterangan</span>
              <span className="text-gray-700 font-medium">{item.keterangan || "-"}</span>
              {item.status_persetujuan === "ditolak" && item.penyetuju && (
                <>
                  <span className="text-red-500 font-bold text-[11px] col-span-2 mt-1 flex items-center gap-1">
                    <Icon icon="ph:user-x-fill" width={13} color="#C92B58" />
                    Ditolak oleh {item.penyetuju} ({item.role_penyetuju || "-"})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gradient-to-br from-[#A3264C] to-[#C92B58] text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity border-none">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── LOAN CARD ───────────────────────────────────────────────────────────────
const LoanCard = ({ item, onApprove, onReject, onDetail }) => {
  const isAlat = item.id_alat !== null && item.id_ruangan === null;
  const nameItem = isAlat ? (item.kode_alat ?? item.id_alat) : (item.name_ruangan ?? item.id_ruangan);
  const kodeItem = isAlat ? item.kode_alat : item.kode_ruangan;
  const tipeItem = isAlat ? "Peralatan" : "Ruangan";

  const formatTanggal = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };
  const formatJam = (jam) => jam?.slice(0, 5) ?? "-";

  return (
    <div className="bg-white border border-[#F0D0DA] rounded-[18px] shadow-sm flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">

      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2.5">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-[#FDEAF0] border border-[#F5C6D8] flex items-center justify-center">
          <Icon icon={isAlat ? "ph:wrench-bold" : "ph:door-open-bold"} width={20} color="#C92B58" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#481020] leading-tight m-0">{nameItem}</p>
          <p className="text-[11px] text-[#C92B58] opacity-60 mt-0.5 font-medium">{kodeItem} • {tipeItem}</p>
        </div>
        <Badge status={item.status_persetujuan} />
      </div>

      {/* User Section */}
      <div className="bg-[#FFF5F7] mx-3 mb-3 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="ph:user-circle-fill" width={15} color="#C92B58" />
          <span className="text-xs font-bold text-[#481020]">{item.peminjam}</span>
          <span className="text-[10px] font-bold bg-[#FDEAF0] text-[#C92B58] border border-[#F5C6D8] px-2 py-0.5 rounded-full whitespace-nowrap">
            {item.role_peminjam}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {[
            { icon: "ph:envelope", text: item.email_peminjam },
            { icon: "ph:phone",    text: item.nomor_telephone_peminjam },
            { icon: "ph:user",     text: `PIC: ${item.pic ?? "-"}` },
          ].map(({ icon, text }) => (
            <div key={icon + text} className="flex items-center gap-1.5 overflow-hidden">
              <Icon icon={icon} width={10} color="#C92B58" className="opacity-70 flex-shrink-0" />
              <span className="text-[10px] text-gray-500 truncate">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Rows */}
      <div className="px-4 pb-1">
        {[
          { icon: "ph:calendar-blank", label: "Hari/Tanggal", value: formatTanggal(item.hari_tanggal) },
          { icon: "ph:clock",          label: "Waktu",        value: `${formatJam(item.jam_mulai)} s/d ${formatJam(item.jam_selesai)}` },
          { icon: "ph:tag",            label: "Jenis",        value: item.jenis_kegiatan },
          { icon: "ph:note-pencil",    label: "Kegiatan",     value: item.name_kegiatan?.length > 80 ? item.name_kegiatan.slice(0, 80) + "…" : item.name_kegiatan },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex gap-2 items-start mb-1.5">
            <Icon icon={icon} width={13} color="#C92B58" className="opacity-70 flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-gray-300 min-w-[70px] flex-shrink-0 font-medium">{label}</span>
            <span className="text-[10px] text-gray-500 font-medium leading-snug">: {value}</span>
          </div>
        ))}
      </div>

      <hr className="border-0 border-t border-[#F5E0E8] mx-4 my-2" />

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <button
          onClick={() => onApprove(item)}
          className="flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full border-none cursor-pointer shadow-sm shadow-green-200 hover:opacity-85 transition-opacity"
        >
          <Icon icon="ph:check-circle-fill" width={13} color="white" />
          Setujui
        </button>

        <button
          onClick={() => onReject(item)}
          className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full border-none cursor-pointer shadow-sm shadow-red-200 hover:opacity-85 transition-opacity"
        >
          <Icon icon="ph:x-circle-fill" width={13} color="white" />
          Tolak
        </button>

        <button
          onClick={() => onDetail(item)}
          className="ml-auto bg-transparent text-gray-400 text-[11px] font-semibold px-4 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:border-[#C92B58] hover:text-[#C92B58] transition-all"
        >
          Detail
        </button>
      </div>
    </div>
  );
};

// ─── PAGINATION ──────────────────────────────────────────────────────────────
const Pagination = ({ current, total, onChange }) => {
  const [gotoVal, setGotoVal] = useState("");

  const pages = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - current) <= 1) arr.push(i);
      else if (arr[arr.length - 1] !== "…") arr.push("…");
    }
    return arr;
  }, [current, total]);

  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap mt-8">
      <button onClick={() => onChange(1)} className="w-9 h-9 rounded-lg bg-[#FDEAF0] text-[#481020] font-bold text-sm border-none cursor-pointer hover:bg-[#F5C6D8] transition-colors">«</button>
      <button onClick={() => onChange(Math.max(1, current - 1))} className="w-9 h-9 rounded-lg bg-[#FDEAF0] text-[#481020] font-bold text-sm border-none cursor-pointer hover:bg-[#F5C6D8] transition-colors">‹</button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={i} className="text-gray-400 text-sm px-1">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-full font-bold text-sm border-none cursor-pointer transition-all ${p === current ? "bg-[#481020] text-white" : "bg-transparent text-gray-500 hover:bg-gray-100"}`}
          >{p}</button>
        )
      )}

      <button onClick={() => onChange(Math.min(total, current + 1))} className="w-9 h-9 rounded-lg bg-[#FDEAF0] text-[#481020] font-bold text-sm border-none cursor-pointer hover:bg-[#F5C6D8] transition-colors">›</button>
      <button onClick={() => onChange(total)} className="w-9 h-9 rounded-lg bg-[#FDEAF0] text-[#481020] font-bold text-sm border-none cursor-pointer hover:bg-[#F5C6D8] transition-colors">»</button>

      <div className="flex items-center gap-2 ml-2">
        <span className="text-[13px] text-gray-500 font-semibold">Go To</span>
        <input
          type="number" min={1} max={total}
          value={gotoVal}
          onChange={(e) => setGotoVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const n = parseInt(gotoVal);
              if (!isNaN(n)) { onChange(Math.max(1, Math.min(total, n))); setGotoVal(""); }
            }
          }}
          placeholder="#"
          className="w-14 text-center px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none"
        />
        <span className="text-[13px] text-gray-500 font-semibold">Page</span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const PersetujuanPeminjaman = () => {
  const [data, setData]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filterType, setFilterType]       = useState("alat");
  const [statusFilter, setStatusFilter]   = useState("");
  const [statusOpen, setStatusOpen]       = useState(false);
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);

  const [modalSetujui, setModalSetujui]   = useState(null);
  const [modalTolak, setModalTolak]       = useState(null);
  const [modalDetail, setModalDetail]     = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {showToast} = useStateContext();

  const statusRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axiosClient.get("/list-persetujuan")
      .then(({ data: res }) => setData(res.persetujuan_list ?? []))
      .catch((err) => console.error("Gagal memuat data persetujuan:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => { if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const stats = useMemo(() => {
    const scope = filterType === "ruangan"
      ? data.filter((d) => d.id_ruangan !== null)
      : data.filter((d) => d.id_alat !== null);
    return {
      approved: scope.filter((d) => d.status_persetujuan === "disetujui").length,
      waiting:  scope.filter((d) => d.status_persetujuan === "menunggu").length,
      rejected: scope.filter((d) => d.status_persetujuan === "ditolak").length,
    };
  }, [data, filterType]);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const isRuangan   = d.id_ruangan !== null;
      const matchType   = filterType === "ruangan" ? isRuangan : !isRuangan;
      const matchStatus = !statusFilter || d.status_persetujuan === statusFilter.toLowerCase();
      const matchSearch = !search
        || (d.name_ruangan ?? d.kode_alat ?? "").toLowerCase().includes(search.toLowerCase())
        || (d.peminjam ?? "").toLowerCase().includes(search.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [data, filterType, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageData   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleConfirmApprove = (item) => {
    setActionLoading(true);
    axiosClient.post(`/persetujuan-setujui/${item.id_persetujuan}`)
      .then(() => {
        setData((prev) => prev.map((d) =>
          d.id_persetujuan === item.id_persetujuan ? { ...d, status_persetujuan: "disetujui" } : d
        ));
        setModalSetujui(null);
      })
      .catch((err) => {
        setModalSetujui(null);
        showToast
      })
      .finally(() => setActionLoading(false));
  };

  const handleConfirmReject = (item) => {
    setActionLoading(true);
    axiosClient.post(`/persetujuan-tolak/${item.id_persetujuan}`)
      .then(() => {
        setData((prev) => prev.map((d) =>
          d.id_persetujuan === item.id_persetujuan ? { ...d, status_persetujuan: "ditolak" } : d
        ));
        setModalTolak(null);
      })
      .catch((err) => {
        setModalTolak(null);
        const msg = err?.response?.data?.message || "Gagal menolak";
        alert(msg);
      })
      .finally(() => setActionLoading(false));
  };

  const handlePage       = (n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleFilterType = (t) => { setFilterType(t); setPage(1); };

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .animate-fadeIn  { animation: fadeIn  .18s ease; }
        .animate-slideUp { animation: slideUp .22s cubic-bezier(.34,1.56,.64,1); }
      `}</style>

      <div className="min-h-screen flex bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] font-poppins">
        <Sidebar />

        <div className="md:p-[50px] p-4 lg:ml-[300px] flex-1 lg:p-12">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-[#481020] m-0">Halaman Peminjaman</h1>
            <p className="text-lg text-gray-400 mt-1">Pantau dan setujui seluruh peminjaman alat atau ruangan</p>
          </div>

          {/* Stat Card */}
          <div className="bg-white border border-[#F0C0D0] rounded-2xl shadow-sm p-7 mb-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-[#C92B58] m-0 tracking-wide">DATA PERSETUJUAN TERKINI</h3>
              <div className="flex border-2 border-[#C92B58] rounded-full overflow-hidden">
                {["alat", "ruangan"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleFilterType(t)}
                    className={`px-5 py-1.5 text-xs font-bold uppercase border-none cursor-pointer transition-all ${filterType === t ? "bg-[#C92B58] text-white" : "bg-transparent text-[#C92B58] hover:bg-[#FDEAF0]"}`}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3">
              {[
                { key: "approved", label: "Telah Disetujui",    icon: "material-symbols:verified-rounded", gradient: "from-[#7FDA0F] to-[#437408]", labelColor: "text-[#3C5900]", iconColor: "#7FDA0F" },
                { key: "waiting",  label: "Menunggu Disetujui", icon: "subway:time-1",                     gradient: "from-[#FBCE3A] to-[#C2A33E]", labelColor: "text-[#7B651C]", iconColor: "#FBCE3A" },
                { key: "rejected", label: "Telah Ditolak",      icon: "solar:list-cross-outline",          gradient: "from-[#F71519] to-[#AD0F12]", labelColor: "text-[#86090A]", iconColor: "#F71519" },
              ].map(({ key, label, icon, gradient, labelColor, iconColor }, idx) => (
                <div key={key} className={`flex flex-col items-center px-4 py-2 relative ${idx < 2 ? "border-r border-[#F0D0DA]" : ""}`}>
                  <div className="absolute top-1 right-4 opacity-15 pointer-events-none">
                    <Icon icon={icon} width={72} color={iconColor} />
                  </div>
                  <span className={`text-[72px] font-black leading-none bg-gradient-to-b ${gradient} bg-clip-text text-transparent`}>
                    {loading ? "–" : stats[key]}
                  </span>
                  <span className={`text-[13px] italic font-semibold mt-1 ${labelColor}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2.5 flex-wrap mb-5">
            <div className="flex bg-[#6B1028] rounded-full p-[3px]">
              {["alat", "ruangan"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleFilterType(t)}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold uppercase border-none cursor-pointer transition-all ${filterType === t ? "bg-[#E9E9E9] text-[#701A32]" : "bg-transparent text-[#C8909A] hover:text-white"}`}
                >{t}</button>
              ))}
            </div>

            <div className="relative" ref={statusRef}>
              <div
                onClick={() => setStatusOpen(!statusOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#701A32] bg-[#701A32] text-[13px] font-semibold text-[#E9E9E9] cursor-pointer select-none hover:brightness-110 transition-all"
              >
                <Icon icon="ph:funnel" width={13} />
                {statusFilter || "Status"}
                <Icon icon="ph:caret-down-bold" width={11} className={`transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`} />
              </div>
              {statusOpen && (
                <div className="absolute top-full mt-1.5 left-0 min-w-[160px] bg-[#6B1028] rounded-2xl shadow-xl border border-[#8F2A4A] py-1.5 z-20 overflow-hidden animate-fadeIn">
                  {["", "Menunggu", "Disetujui", "Ditolak"].map((val) => (
                    <button
                      key={val}
                      onClick={() => { setStatusFilter(val); setPage(1); setStatusOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold border-none cursor-pointer transition-all flex items-center gap-2 ${
                        statusFilter === val
                          ? "bg-[#8F2A4A] text-white"
                          : "text-[#C8909A] hover:bg-[#80243F] hover:text-white"
                      }`}
                    >
                      <Icon icon="ph:check-bold" width={12} className={statusFilter === val ? "opacity-100" : "opacity-0"} />
                      <span>{val || "Semua Status"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="telusuri peralatan atau name peminjam..."
              className="flex-1 min-w-[180px] px-5 py-2 border-2 border-[#701A32] rounded-full text-[13px] text-gray-500 bg-white outline-none"
            />
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="text-center py-16 text-[#C92B58] text-sm">
              <Icon icon="mdi:loading" className="animate-spin inline mr-2" width={20} />
              Memuat data...
            </div>
          ) : pageData.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Tidak ada data ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {pageData.map((item, idx) => (
                <LoanCard
                  key={idx}
                  item={item}
                  onApprove={(i) => setModalSetujui(i)}
                  onReject={(i) => setModalTolak(i)}
                  onDetail={(i) => setModalDetail(i)}
                />
              ))}
            </div>
          )}

          <Pagination current={page} total={totalPages} onChange={handlePage} />
        </div>
      </div>

      {/* Modals */}
      <ModalSetujui
        item={modalSetujui}
        onClose={() => !actionLoading && setModalSetujui(null)}
        onConfirm={handleConfirmApprove}
        loading={actionLoading}
      />
      <ModalTolak
        item={modalTolak}
        onClose={() => !actionLoading && setModalTolak(null)}
        onConfirm={handleConfirmReject}
        loading={actionLoading}
      />
      <ModalDetail
        item={modalDetail}
        onClose={() => setModalDetail(null)}
      />
    </>
  );
};

export default PersetujuanPeminjaman;