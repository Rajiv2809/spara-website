import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

const Badge = ({ status }) => {
  const styles = {
    disetujui: "bg-green-100 text-green-700",
    menunggu: "bg-yellow-100 text-yellow-700",
    ditolak: "bg-red-100 text-red-700",
    dibatalkan: "bg-gray-200 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {(status || "").toUpperCase()}
    </span>
  );
};

const ModalBatal = ({ item, onClose, onConfirm, loading }) => {
  if (!item) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(72,16,32,0.45)] backdrop-blur-sm animate-fadeIn">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        <div className="relative bg-gradient-to-br from-gray-600 to-gray-700 px-7 pt-6 pb-5">
          <button onClick={onClose} className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition-colors border-none cursor-pointer">
            <Icon icon="ph:x-bold" width={14} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon icon="ph:prohibit-bold" width={28} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight m-0">Batalkan Peminjaman</h2>
              <p className="text-xs text-white/75 mt-1 font-medium">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
        </div>
        <div className="px-7 pt-6 pb-2">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Apakah Anda yakin ingin <strong className="text-gray-700">membatalkan</strong> peminjaman berikut?
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <Icon icon={item.alat ? "ph:wrench-bold" : "ph:door-open-bold"} width={16} className="text-gray-600" />
              <span className="text-sm font-bold text-gray-900">{item.ruangan || item.alat || "-"}</span>
              <span className="ml-auto text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                {item.alat ? "Peralatan" : "Ruangan"}
              </span>
            </div>
            {[
              { icon: "ph:calendar-blank", text: new Date(item.hari_tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { icon: "ph:clock",          text: `${item.jam_mulai?.slice(0,5)} s/d ${item.jam_selesai?.slice(0,5)}` },
              { icon: "ph:note-pencil",    text: item.name_kegiatan },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-2 mb-1.5">
                <Icon icon={icon} width={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-500 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2.5 px-7 py-5">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-bold cursor-pointer hover:border-gray-400 hover:text-gray-700 transition-all">
            Batal
          </button>
          <button onClick={() => onConfirm(item)} disabled={loading} className={`flex-[2] py-2.5 rounded-xl border-none text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity shadow-lg shadow-gray-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-gray-600 to-gray-700 cursor-pointer hover:opacity-90"}`}>
            {loading
              ? <><Icon icon="mdi:loading" width={15} className="animate-spin" /> Memproses...</>
              : <><Icon icon="ph:prohibit-bold" width={15} /> Ya, Batalkan</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

const formatTanggal = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

const formatJam = (jam) => jam?.slice(0, 5) ?? "-";

const Riwayat = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ruangan");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalBatal, setModalBatal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/riwayat")
      .then((res) => {
        setData(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => console.error("Gagal mengambil riwayat:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const scope = filterType === "ruangan"
      ? data.filter((d) => d.ruangan != null)
      : data.filter((d) => d.alat != null);
    return {
      approved: scope.filter((d) => d.status_persetujuan === "disetujui").length,
      waiting: scope.filter((d) => d.status_persetujuan === "menunggu").length,
      rejected: scope.filter((d) => d.status_persetujuan === "ditolak" || d.status_persetujuan === "dibatalkan").length,
    };
  }, [data, filterType]);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const isRuangan = d.ruangan != null;
      const matchType = filterType === "ruangan" ? isRuangan : !isRuangan;
      const matchStatus = !statusFilter || d.status_persetujuan === statusFilter;
      const searchTerm = search.toLowerCase();
      const matchSearch = !searchTerm
        || (d.name_kegiatan || "").toLowerCase().includes(searchTerm)
        || (d.ruangan || "").toLowerCase().includes(searchTerm)
        || (d.alat || "").toLowerCase().includes(searchTerm);
      return matchType && matchStatus && matchSearch;
    });
  }, [data, filterType, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
      .catch((err) => {
        const msg = err?.response?.data?.message || "Gagal membatalkan";
        alert(msg);
      })
      .finally(() => setActionLoading(false));
  };

  const tabs = [
    { key: "ruangan", label: "Ruangan", icon: "ph:door-open-bold" },
    { key: "peralatan", label: "Peralatan", icon: "ph:wrench-bold" },
  ];

  const statusTabs = [
    { key: "", label: "Semua" },
    { key: "disetujui", label: "Disetujui" },
    { key: "menunggu", label: "Menunggu" },
    { key: "ditolak", label: "Ditolak" },
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
          {/* Tab Ruangan / Peralatan */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold transition ${
                  filterType === tab.key
                    ? "bg-[#C0254A] text-white shadow"
                    : "bg-white text-[#C0254A] border border-pink-200 hover:bg-pink-50"
                }`}
              >
                <Icon icon={tab.icon} width={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-5 text-sm">
            <span className="text-green-600 font-semibold">✓ {stats.approved} Disetujui</span>
            <span className="text-yellow-600 font-semibold">⏳ {stats.waiting} Menunggu</span>
            <span className="text-red-600 font-semibold">✕ {stats.rejected} Ditolak</span>
          </div>

          {/* Search + Status Filter */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <Icon icon="mdi:magnify" className="text-gray-400 mr-2" width={16} />
              <input
                placeholder="Cari kegiatan, ruangan, atau alat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-[13px] text-gray-600 bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500">
                  <Icon icon="mdi:close" width={16} />
                </button>
              )}
            </div>

            <div className="flex gap-1">
              {statusTabs.map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStatusFilter(st.key)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition ${
                    statusFilter === st.key
                      ? "bg-[#3D0C1F] text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-pink-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
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
                <div key={idx} className="bg-white border border-[#F0D0DA] rounded-[18px] shadow-sm flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex items-start gap-3 px-4 pt-4 pb-2.5">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-[#FDEAF0] border border-[#F5C6D8] flex items-center justify-center">
                      <Icon
                        icon={item.id_ruangan ? "ph:door-open-bold" : item.id_alat ? "ph:wrench-bold" : "ph:question"}
                        width={20} color="#C92B58"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#481020] leading-tight m-0">
{item.ruangan || item.alat || (item.id_ruangan ? "Ruangan #" + item.id_ruangan : item.id_alat ? "Alat #" + item.id_alat : "-")}
                      </p>
                      <p className="text-[11px] text-[#C92B58] opacity-60 mt-0.5 font-medium">
                        {item.name_kegiatan}
                      </p>
                    </div>
                    <Badge status={item.status_persetujuan} />
                  </div>

                  {/* Info */}
                  <div className="px-4 pb-3">
                    <div className="flex gap-2 items-start mb-1.5">
                      <Icon icon="ph:calendar-blank" width={13} color="#C92B58" className="opacity-70 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-gray-300 min-w-[65px] flex-shrink-0 font-medium">Tanggal</span>
                      <span className="text-[10px] text-gray-500 font-medium">: {formatTanggal(item.hari_tanggal)}</span>
                    </div>
                    <div className="flex gap-2 items-start mb-1.5">
                      <Icon icon="ph:clock" width={13} color="#C92B58" className="opacity-70 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-gray-300 min-w-[65px] flex-shrink-0 font-medium">Waktu</span>
                      <span className="text-[10px] text-gray-500 font-medium">: {formatJam(item.jam_mulai)} s/d {formatJam(item.jam_selesai)}</span>
                    </div>
                    <div className="flex gap-2 items-start mb-1.5">
                      <Icon icon="ph:tag" width={13} color="#C92B58" className="opacity-70 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-gray-300 min-w-[65px] flex-shrink-0 font-medium">Jenis</span>
                      <span className="text-[10px] text-gray-500 font-medium">: {item.jenis_kegiatan || "-"}</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Icon icon="ph:user-circle-fill" width={13} color="#C92B58" className="opacity-70 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-gray-300 min-w-[65px] flex-shrink-0 font-medium">Peminjam</span>
                      <span className="text-[10px] text-gray-500 font-medium">: {item.peminjam || "-"}</span>
                    </div>
                    {item.status_persetujuan === "ditolak" && item.persetujuans && (
                      <div className="flex gap-2 items-start mt-1.5">
                        <Icon icon="ph:prohibit" width={13} color="#C92B58" className="opacity-70 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-gray-300 min-w-[65px] flex-shrink-0 font-medium">Ditolak oleh</span>
                        <span className="text-[10px] text-gray-500 font-medium">: {item.persetujuans.find((p) => p.status_persetujuan === "ditolak")?.penyetuju || item.persetujuans.find((p) => p.status_persetujuan === "ditolak")?.role_penyetuju || "-"}</span>
                      </div>
                    )}
                  </div>

                  {/* Cancel Button (only for menunggu) */}
                  {item.status_persetujuan === "menunggu" && (
                    <div className="px-4 pb-4 mt-auto">
                      <button
                        onClick={() => setModalBatal(item)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-300 bg-white text-gray-500 text-[12px] font-bold cursor-pointer hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Icon icon="ph:prohibit-bold" width={14} />
                        Batalkan Peminjaman
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              ><Icon icon="mdi:chevron-double-left" /></button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              ><Icon icon="mdi:chevron-left" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${
                    page === p ? "bg-[#C0254A] text-white shadow-md" : "text-[#C0254A] hover:bg-pink-100"
                  }`}
                >{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              ><Icon icon="mdi:chevron-right" /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              ><Icon icon="mdi:chevron-double-right" /></button>
            </div>
          )}
        </div>
      </div>

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