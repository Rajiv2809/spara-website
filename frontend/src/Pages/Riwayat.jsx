import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

/* ─── helpers ───────────────────────────────────────────────────────────── */
const formatTanggal = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};
const formatJam = (jam) => jam?.slice(0, 5) ?? "-";

const formatWA = (phone) => {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("62")) return cleaned;
  return "62" + cleaned;
};

/* ─── Badge ─────────────────────────────────────────────────────────────── */
const Badge = ({ status }) => {
  const styles = {
    disetujui: "bg-green-100 text-green-700",
    menunggu:  "bg-yellow-100 text-yellow-700",
    ditolak:   "bg-red-100 text-red-700",
    dibatalkan:"bg-gray-200 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {(status || "").toUpperCase()}
    </span>
  );
};

/* ─── StepBadge untuk alur persetujuan ──────────────────────────────────── */
const roleLabel = (role, penyetuju) => {
  if (!penyetuju && !role) return "Admin";
  if (role === "lecturer") return "Penanggung Jawab";
  if (role === "pic") return "PIC";
  if (role === "admin") return "Admin";
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "Admin";
};

const stepColor = (status) => {
  if (status === "disetujui") return { ring: "ring-green-400", bg: "bg-green-50", dot: "bg-green-500", text: "text-green-700" };
  if (status === "ditolak")   return { ring: "ring-red-400",   bg: "bg-red-50",   dot: "bg-red-500",   text: "text-red-700" };
  return { ring: "ring-yellow-300", bg: "bg-yellow-50", dot: "bg-yellow-400", text: "text-yellow-700" };
};

/* ─── Modal Detail ──────────────────────────────────────────────────────── */
const ModalDetail = ({ item, onClose }) => {
  if (!item) return null;

  const waNumber = formatWA(item.phone_pic);
  const waMsg = encodeURIComponent(
    `Halo ${item.pic || ""},\nSaya ${item.peminjam} ingin menanyakan status peminjaman ${item.ruangan || item.alat} pada ${formatTanggal(item.hari_tanggal)}.`
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(45,10,24,0.5)] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#C0254A] to-[#7A0B28] px-6 pt-5 pb-5 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition cursor-pointer border-none"
          >
            <Icon icon="ph:x-bold" width={14} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon icon={item.id_ruangan ? "ph:door-open-bold" : "ph:wrench-bold"} width={24} color="white" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-[16px] leading-tight m-0">
                {item.ruangan || item.alat || "-"}
              </h2>
              <p className="text-white/70 text-[11px] mt-0.5">{item.name_kegiatan}</p>
            </div>
            <div className="ml-auto"><Badge status={item.status_persetujuan} /></div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto custom-scroll flex-1 px-6 py-5 space-y-5">
          {/* Info Peminjaman */}
          <section>
            <h3 className="text-[11px] font-bold text-[#C0254A] uppercase tracking-wider mb-2">
              Detail Peminjaman
            </h3>
            <div className="bg-[#FFF6F8] rounded-2xl p-4 space-y-2">
              {[
                { icon: "ph:calendar-blank",     label: "Tanggal",  value: formatTanggal(item.hari_tanggal) },
                { icon: "ph:clock",              label: "Waktu",    value: `${formatJam(item.jam_mulai)} – ${formatJam(item.jam_selesai)}` },
                { icon: "ph:tag",                label: "Jenis",    value: item.jenis_kegiatan || "-" },
                { icon: "ph:note-pencil-bold",   label: "Kegiatan", value: item.name_kegiatan || "-" },
                { icon: "ph:user-circle-fill",   label: "Peminjam", value: item.peminjam || "-" },
                ...(item.keterangan ? [{ icon: "ph:chat-text", label: "Keterangan", value: item.keterangan }] : []),
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex gap-2 items-start">
                  <Icon icon={icon} width={14} color="#C0254A" className="opacity-70 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-gray-400 min-w-[72px] flex-shrink-0 font-medium">{label}</span>
                  <span className="text-[11px] text-gray-700 font-medium">: {value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Kontak PIC */}
          {item.pic && (
            <section>
              <h3 className="text-[11px] font-bold text-[#C0254A] uppercase tracking-wider mb-2">
                Kontak PIC
              </h3>
              <div className="bg-[#FFF6F8] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FDEAF0] flex items-center justify-center flex-shrink-0">
                    <Icon icon="ph:user-circle-fill" width={20} color="#C0254A" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#481020]">{item.pic}</p>
                    <p className="text-[10px] text-gray-400">PIC {item.ruangan ? "Ruangan" : "Alat"}</p>
                    {item.phone_pic && (
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.phone_pic}</p>
                    )}
                  </div>
                </div>
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-bold px-3 py-2 rounded-xl transition flex-shrink-0"
                  >
                    <Icon icon="ic:baseline-whatsapp" width={16} />
                    Chat WA
                  </a>
                )}
                {!waNumber && (
                  <span className="text-[10px] text-gray-400 italic">No. HP tidak tersedia</span>
                )}
              </div>
            </section>
          )}

          {/* Alur Persetujuan */}
          {item.persetujuans && item.persetujuans.length > 0 && (
            <section>
              <h3 className="text-[11px] font-bold text-[#C0254A] uppercase tracking-wider mb-2">
                Alur Persetujuan
              </h3>
              <div className="space-y-2">
                {item.persetujuans.map((ps, i) => {
                  const { ring, bg, dot, text } = stepColor(ps.status_persetujuan);
                  const waPs = formatWA(ps.phone_penyetuju);
                  const waMsgPs = waPs
                    ? encodeURIComponent(`Halo ${ps.penyetuju || ""},\nSaya ${item.peminjam} ingin menanyakan status peminjaman ${item.ruangan || item.alat}.`)
                    : null;

                  return (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ring-1 ${ring} ${bg}`}>
                      {/* Step number */}
                      <div className="w-6 h-6 rounded-full bg-white ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-500">
                        {i + 1}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#481020] truncate">
                          {ps.penyetuju || "Admin"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-gray-400">
                            {roleLabel(ps.role_penyetuju, ps.penyetuju)}
                          </span>
                          {ps.phone_penyetuju && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-[9px] text-gray-400">{ps.phone_penyetuju}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Status dot + label */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className={`text-[10px] font-bold ${text} capitalize`}>
                          {ps.status_persetujuan}
                        </span>
                      </div>
                      {/* Tombol WA kalau ada nomor */}
                      {waPs && (
                        <a
                          href={`https://wa.me/${waPs}?text=${waMsgPs}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center gap-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[10px] font-bold px-2 py-1.5 rounded-lg transition"
                        >
                          <Icon icon="ic:baseline-whatsapp" width={13} />
                          WA
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[13px] font-bold hover:bg-gray-50 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Modal Batal ───────────────────────────────────────────────────────── */
const ModalBatal = ({ item, onClose, onConfirm, loading }) => {
  if (!item) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(72,16,32,0.45)] backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="relative bg-gradient-to-br from-gray-600 to-gray-700 px-7 pt-6 pb-5">
          <button onClick={onClose} className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition border-none cursor-pointer">
            <Icon icon="ph:x-bold" width={14} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon icon="ph:prohibit-bold" width={28} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white m-0">Batalkan Peminjaman</h2>
              <p className="text-xs text-white/75 mt-1">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
        </div>
        <div className="px-7 pt-6 pb-2">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Apakah Anda yakin ingin <strong className="text-gray-700">membatalkan</strong> peminjaman ini?
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1.5">
            {[
              { icon: "ph:calendar-blank", text: formatTanggal(item.hari_tanggal) },
              { icon: "ph:clock",          text: `${formatJam(item.jam_mulai)} s/d ${formatJam(item.jam_selesai)}` },
              { icon: "ph:note-pencil",    text: item.name_kegiatan },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-center gap-2">
                <Icon icon={icon} width={12} className="text-gray-400" />
                <span className="text-[11px] text-gray-500">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2.5 px-7 py-5">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold cursor-pointer hover:bg-gray-50 transition">
            Batal
          </button>
          <button onClick={() => onConfirm(item)} disabled={loading}
            className={`flex-[2] py-2.5 rounded-xl border-none text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-gray-600 to-gray-700 cursor-pointer hover:opacity-90"}`}
          >
            {loading
              ? <><Icon icon="mdi:loading" width={15} className="animate-spin" />Memproses...</>
              : <><Icon icon="ph:prohibit-bold" width={15} />Ya, Batalkan</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Halaman Riwayat ───────────────────────────────────────────────────── */
const Riwayat = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ruangan");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalBatal, setModalBatal] = useState(null);
  const [modalDetail, setModalDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setLoading(true);
    axiosClient.get("/riwayat")
      .then((res) => setData(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch((err) => console.error("Gagal mengambil riwayat:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const scope = filterType === "ruangan"
      ? data.filter((d) => d.ruangan != null)
      : data.filter((d) => d.alat != null);
    return {
      approved: scope.filter((d) => d.status_persetujuan === "disetujui").length,
      waiting:  scope.filter((d) => d.status_persetujuan === "menunggu").length,
      rejected: scope.filter((d) => ["ditolak","dibatalkan"].includes(d.status_persetujuan)).length,
    };
  }, [data, filterType]);

  const filtered = useMemo(() => data.filter((d) => {
    const matchType   = filterType === "ruangan" ? d.ruangan != null : d.alat != null;
    const matchStatus = !statusFilter || d.status_persetujuan === statusFilter;
    const q           = search.toLowerCase();
    const matchSearch = !q
      || (d.name_kegiatan || "").toLowerCase().includes(q)
      || (d.ruangan || "").toLowerCase().includes(q)
      || (d.alat || "").toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  }), [data, filterType, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [filterType, statusFilter, search]);

  const handleCancel = (item) => {
    setActionLoading(true);
    axiosClient.post(`/peminjaman-batal/${item.id_peminjaman}`)
      .then(() => {
        setData((prev) => prev.map((d) =>
          d.id_peminjaman === item.id_peminjaman ? { ...d, status_persetujuan: "dibatalkan" } : d
        ));
        setModalBatal(null);
      })
      .catch((err) => alert(err?.response?.data?.message || "Gagal membatalkan"))
      .finally(() => setActionLoading(false));
  };

  const tabs = [
    { key: "ruangan",   label: "Ruangan",   icon: "ph:door-open-bold" },
    { key: "peralatan", label: "Peralatan", icon: "ph:wrench-bold" },
  ];
  const statusTabs = [
    { key: "",           label: "Semua" },
    { key: "disetujui",  label: "Disetujui" },
    { key: "menunggu",   label: "Menunggu" },
    { key: "ditolak",    label: "Ditolak" },
    { key: "dibatalkan", label: "Dibatalkan" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />
      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4 overflow-y-auto">

        <div className="mb-8">
          <h1 className="text-[#2D0A18] text-[32px] lg:mt-2 mt-12 font-extrabold">Riwayat Peminjaman</h1>
          <p className="text-gray-500 text-[14px] mt-1">Riwayat peminjaman ruangan dan peralatan yang telah diajukan</p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">
          {/* Tab */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setFilterType(tab.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold transition ${
                  filterType === tab.key ? "bg-[#C0254A] text-white shadow" : "bg-white text-[#C0254A] border border-pink-200 hover:bg-pink-50"
                }`}
              >
                <Icon icon={tab.icon} width={16} />{tab.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-5 text-sm">
            <span className="text-green-600 font-semibold">✓ {stats.approved} Disetujui</span>
            <span className="text-yellow-600 font-semibold">⏳ {stats.waiting} Menunggu</span>
            <span className="text-red-600 font-semibold">✕ {stats.rejected} Ditolak</span>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <Icon icon="mdi:magnify" className="text-gray-400 mr-2" width={16} />
              <input
                placeholder="Cari kegiatan, ruangan, atau alat..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-[13px] text-gray-600 bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500">
                  <Icon icon="mdi:close" width={16} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {statusTabs.map((st) => (
                <button key={st.key} onClick={() => setStatusFilter(st.key)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition ${
                    statusFilter === st.key ? "bg-[#3D0C1F] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-pink-200"
                  }`}
                >{st.label}</button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-16 text-[#C92B58] text-sm">
              <Icon icon="mdi:loading" className="animate-spin inline mr-2" width={20} />Memuat data...
            </div>
          ) : pageData.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Tidak ada data ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {pageData.map((item, idx) => (
                <div key={idx} className="bg-white border border-[#F0D0DA] rounded-[18px] shadow-sm flex flex-col overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-start gap-3 px-4 pt-4 pb-2.5">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-[#FDEAF0] border border-[#F5C6D8] flex items-center justify-center">
                      <Icon icon={item.id_ruangan ? "ph:door-open-bold" : "ph:wrench-bold"} width={20} color="#C92B58" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#481020] leading-tight">
                        {item.ruangan || item.alat || "-"}
                      </p>
                      <p className="text-[11px] text-[#C92B58] opacity-60 mt-0.5 font-medium">{item.name_kegiatan}</p>
                    </div>
                    <Badge status={item.status_persetujuan} />
                  </div>

                  {/* Card Info */}
                  <div className="px-4 pb-3 space-y-1.5">
                    {[
                      { icon: "ph:calendar-blank", label: "Tanggal",  value: formatTanggal(item.hari_tanggal) },
                      { icon: "ph:clock",          label: "Waktu",    value: `${formatJam(item.jam_mulai)} – ${formatJam(item.jam_selesai)}` },
                      { icon: "ph:tag",            label: "Jenis",    value: item.jenis_kegiatan || "-" },
                      { icon: "ph:user-circle-fill",label: "PIC",     value: item.pic || "-" },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex gap-2 items-start">
                        <Icon icon={icon} width={13} color="#C92B58" className="opacity-70 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-gray-300 min-w-[52px] flex-shrink-0 font-medium">{label}</span>
                        <span className="text-[10px] text-gray-500 font-medium">: {value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Actions */}
                  <div className="px-4 pb-4 mt-auto flex gap-2">
                    {/* Tombol Detail */}
                    <button
                      onClick={() => setModalDetail(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#F0D0DA] bg-[#FDEAF0] text-[#C92B58] text-[12px] font-bold cursor-pointer hover:bg-[#f9d5e0] transition"
                    >
                      <Icon icon="ph:info-bold" width={14} />
                      Detail
                    </button>
                    {/* Tombol Batalkan */}
                    {item.status_persetujuan === "menunggu" && (
                      <button
                        onClick={() => setModalBatal(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-[12px] font-bold cursor-pointer hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <Icon icon="ph:prohibit-bold" width={14} />
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-double-left" />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-left" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${page === p ? "bg-[#C0254A] text-white shadow-md" : "text-[#C0254A] hover:bg-pink-100"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-right" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40">
                <Icon icon="mdi:chevron-double-right" />
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalDetail item={modalDetail} onClose={() => setModalDetail(null)} />
      <ModalBatal
        item={modalBatal}
        onClose={() => !actionLoading && setModalBatal(null)}
        onConfirm={handleCancel}
        loading={actionLoading}
      />
    </div>
  );
};

export default Riwayat;
