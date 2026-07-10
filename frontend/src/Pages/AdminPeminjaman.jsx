import { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import Sidebar from "../Components/Sidebar";
import axiosClient from "../axios";
import TimePicker24 from "../Components/TimePicker24";

/* ─── helpers ───────────────────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, "0");
const today = () => new Date().toISOString().split("T")[0];

const formatTgl = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};
const formatRentang = (item) => {
  const m = item.tanggal_mulai || item.hari_tanggal;
  const s = item.tanggal_selesai || item.hari_tanggal;
  if (!m) return "-";
  if (m === s) return formatTgl(m);
  return `${formatTgl(m)} – ${formatTgl(s)}`;
};

const STATUS_STYLE = {
  disetujui:  "bg-green-100 text-green-700",
  menunggu:   "bg-yellow-100 text-yellow-700",
  ditolak:    "bg-red-100 text-red-700",
  dibatalkan: "bg-gray-200 text-gray-500",
};

/* ─── Modal Form Booking ────────────────────────────────────────────────── */
function ModalBooking({ onClose, onSuccess }) {
  const [tab, setTab] = useState("ruangan"); // "ruangan" | "alat"
  const [ruanganList, setRuanganList] = useState([]);
  const [alatList, setAlatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const minDate = today();
  const [form, setForm] = useState({
    name_kegiatan: "",
    jenis_kegiatan: "akademik",
    hari_tanggal: "",
    tanggal_selesai: "",
    multi: false,
    jam_mulai: "",
    jam_selesai: "",
    keterangan: "",
    id_ruangan: "",
    id_alat: "",
  });

  // Hitung durasi
  const durasi = (() => {
    if (!form.hari_tanggal || !form.multi || !form.tanggal_selesai) return 1;
    const d = Math.round((new Date(form.tanggal_selesai) - new Date(form.hari_tanggal)) / 86400000) + 1;
    return d > 0 ? d : 0;
  })();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get("/get-ruangan"),
      axiosClient.get("/get-alat"),
    ]).then(([r, a]) => {
      setRuanganList((r.data?.data || []).filter(x => x.status_ruangan === "tersedia"));
      setAlatList((a.data?.data || []).filter(x => x.status_alat === "tersedia"));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name_kegiatan.trim()) e.name_kegiatan = "Wajib diisi.";
    if (!form.hari_tanggal)         e.hari_tanggal  = "Wajib diisi.";
    if (form.multi && !form.tanggal_selesai) e.tanggal_selesai = "Wajib diisi.";
    if (form.multi && form.tanggal_selesai < form.hari_tanggal) e.tanggal_selesai = "Tidak boleh sebelum tanggal mulai.";
    if (form.multi && durasi > 30) e.tanggal_selesai = "Maksimal 30 hari.";
    if (!form.jam_mulai)  e.jam_mulai  = "Wajib diisi.";
    if (!form.jam_selesai) e.jam_selesai = "Wajib diisi.";
    if (tab === "ruangan" && !form.id_ruangan) e.id_ruangan = "Pilih ruangan.";
    if (tab === "alat"    && !form.id_alat)    e.id_alat    = "Pilih alat.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name_kegiatan:   form.name_kegiatan,
      jenis_kegiatan:  form.jenis_kegiatan,
      hari_tanggal:    form.hari_tanggal,
      tanggal_mulai:   form.hari_tanggal,
      tanggal_selesai: form.multi ? form.tanggal_selesai : form.hari_tanggal,
      jam_mulai:       form.jam_mulai,
      jam_selesai:     form.jam_selesai,
      keterangan:      form.keterangan || null,
      ...(tab === "ruangan" ? { id_ruangan: form.id_ruangan } : { id_alat: form.id_alat }),
    };
    axiosClient.post("/booking-admin", payload)
      .then(() => { onSuccess(); onClose(); })
      .catch(err => {
        const msg = err?.response?.data?.message || "Gagal menyimpan.";
        alert(msg);
      })
      .finally(() => setSaving(false));
  };

  const inp = "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#C0254A]";
  const err = "text-red-500 text-[10px] mt-0.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#C0254A] to-[#7A0B28] px-6 pt-5 pb-4 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-white font-extrabold text-[16px] m-0">Booking Langsung</h2>
            <p className="text-white/70 text-[11px] mt-0.5">Peminjaman otomatis disetujui</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white cursor-pointer border-none">
            <Icon icon="ph:x-bold" width={14} />
          </button>
        </div>

        {/* Tab */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          {["ruangan", "alat"].map(t => (
            <button key={t} onClick={() => { setTab(t); setErrors({}); set("id_ruangan",""); set("id_alat",""); }}
              className={`flex-1 py-3 text-sm font-bold capitalize transition border-b-2 cursor-pointer
                ${tab === t ? "border-[#C0254A] text-[#C0254A]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t === "ruangan" ? "Ruangan" : "Alat"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Icon icon="mdi:loading" className="animate-spin mr-2" width={18} /> Memuat data...
            </div>
          ) : (
            <>
              {/* Pilih item */}
              <div>
                <label className="text-[12px] font-semibold text-[#3D0C1F] mb-1 block">
                  {tab === "ruangan" ? "Ruangan" : "Alat"} <span className="text-red-500">*</span>
                </label>
                <select value={tab === "ruangan" ? form.id_ruangan : form.id_alat}
                  onChange={e => set(tab === "ruangan" ? "id_ruangan" : "id_alat", e.target.value)}
                  className={`${inp} ${errors[tab === "ruangan" ? "id_ruangan" : "id_alat"] ? "border-red-400" : ""}`}>
                  <option value="">— Pilih {tab} —</option>
                  {(tab === "ruangan" ? ruanganList : alatList).map(item => (
                    <option key={item.id || item.id_alat} value={item.id || item.id_alat}>
                      {item.name_ruangan || item.name_alat}
                      {tab === "ruangan" ? ` (${item.name_gedung || ""})` : ` (${item.kode_alat || ""})`}
                    </option>
                  ))}
                </select>
                {errors[tab === "ruangan" ? "id_ruangan" : "id_alat"] && (
                  <p className={err}>{errors[tab === "ruangan" ? "id_ruangan" : "id_alat"]}</p>
                )}
              </div>

              {/* Nama kegiatan */}
              <div>
                <label className="text-[12px] font-semibold text-[#3D0C1F] mb-1 block">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input value={form.name_kegiatan} onChange={e => set("name_kegiatan", e.target.value)}
                  placeholder="Contoh: Rapat Koordinasi"
                  className={`${inp} ${errors.name_kegiatan ? "border-red-400" : ""}`} />
                {errors.name_kegiatan && <p className={err}>{errors.name_kegiatan}</p>}
              </div>

              {/* Jenis kegiatan */}
              <div>
                <label className="text-[12px] font-semibold text-[#3D0C1F] mb-1 block">Jenis Kegiatan</label>
                <select value={form.jenis_kegiatan} onChange={e => set("jenis_kegiatan", e.target.value)} className={inp}>
                  <option value="akademik">Akademik</option>
                  <option value="non-akademik">Non-Akademik</option>
                </select>
              </div>

              {/* Tanggal mulai */}
              <div>
                <label className="text-[12px] font-semibold text-[#3D0C1F] mb-1 block">
                  {form.multi ? "Tanggal Mulai" : "Tanggal"} <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.hari_tanggal} min={minDate}
                  onChange={e => { set("hari_tanggal", e.target.value); set("tanggal_selesai", ""); }}
                  className={`${inp} ${errors.hari_tanggal ? "border-red-400" : ""}`} />
                {errors.hari_tanggal && <p className={err}>{errors.hari_tanggal}</p>}
              </div>

              {/* Toggle multi-hari */}
              <div className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => { set("multi", !form.multi); set("tanggal_selesai", ""); }}>
                <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${form.multi ? "bg-[#C0254A]" : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.multi ? "translate-x-4" : ""}`} />
                </div>
                <span className="text-sm text-gray-600 font-medium">Lebih dari 1 hari</span>
              </div>

              {/* Tanggal selesai */}
              {form.multi && (
                <div>
                  <label className="text-[12px] font-semibold text-[#3D0C1F] mb-1 block">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={form.tanggal_selesai} min={form.hari_tanggal || minDate}
                    onChange={e => set("tanggal_selesai", e.target.value)}
                    className={`${inp} ${errors.tanggal_selesai ? "border-red-400" : ""}`} />
                  {form.hari_tanggal && form.tanggal_selesai && durasi > 0 && (
                    <p className="text-[11px] text-[#C0254A] mt-1 font-medium">
                      Durasi: {durasi} hari {durasi > 30 && <span className="text-red-600">(Maks. 30 hari)</span>}
                    </p>
                  )}
                  {errors.tanggal_selesai && <p className={err}>{errors.tanggal_selesai}</p>}
                </div>
              )}

              {/* Jam */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <TimePicker24 label="Jam Mulai" required value={form.jam_mulai} onChange={v => set("jam_mulai", v)} />
                  {errors.jam_mulai && <p className={err}>{errors.jam_mulai}</p>}
                </div>
                <div>
                  <TimePicker24 label="Jam Selesai" required value={form.jam_selesai}
                    minTime={form.jam_mulai} onChange={v => set("jam_selesai", v)} />
                  {errors.jam_selesai && <p className={err}>{errors.jam_selesai}</p>}
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="text-[12px] font-semibold text-[#3D0C1F] mb-1 block">Keterangan</label>
                <textarea value={form.keterangan} onChange={e => set("keterangan", e.target.value)}
                  rows={2} placeholder="Opsional..." className={`${inp} resize-none`} />
              </div>

              {/* Info badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                <Icon icon="mdi:check-circle-outline" className="text-emerald-600 flex-shrink-0 mt-0.5" width={15} />
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Peminjaman ini akan langsung berstatus <strong>Disetujui</strong> tanpa melalui alur persetujuan.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition cursor-pointer disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving || loading}
            className="flex-[2] py-2.5 rounded-xl bg-gradient-to-br from-[#C0254A] to-[#7A0B28] text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer disabled:opacity-60 border-none">
            {saving
              ? <><Icon icon="mdi:loading" width={14} className="animate-spin" /> Menyimpan...</>
              : <><Icon icon="mdi:check-circle-outline" width={15} /> Booking Sekarang</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Halaman Utama ─────────────────────────────────────────────────────── */
export default function AdminPeminjaman() {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [page, setPage]           = useState(1);
  const PER_PAGE = 9;

  const fetchData = () => {
    setLoading(true);
    axiosClient.get("/booking-admin")
      .then(res => setData(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => data.filter(d => {
    const matchStatus = !statusFilter || d.status_persetujuan === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (d.ruangan || "").toLowerCase().includes(q)
      || (d.alat    || "").toLowerCase().includes(q)
      || (d.name_kegiatan || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [data, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => setPage(1), [statusFilter, search]);

  const stats = useMemo(() => ({
    total:     data.length,
    disetujui: data.filter(d => d.status_persetujuan === "disetujui").length,
    menunggu:  data.filter(d => d.status_persetujuan === "menunggu").length,
    ditolak:   data.filter(d => ["ditolak","dibatalkan"].includes(d.status_persetujuan)).length,
  }), [data]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />
      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4 overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-[#2D0A18] text-[28px] lg:mt-0 mt-12 font-extrabold">Peminjaman Admin</h1>
            <p className="text-gray-500 text-[14px] mt-1">Booking ruangan & alat langsung disetujui</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-br from-[#C0254A] to-[#7A0B28] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition cursor-pointer border-none mt-12 lg:mt-0">
            <Icon icon="mdi:plus-circle-outline" width={18} />
            Booking Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total",     value: stats.total,     color: "text-gray-800",   bg: "bg-white",          icon: "mdi:clipboard-list-outline" },
            { label: "Disetujui", value: stats.disetujui, color: "text-emerald-700",bg: "bg-emerald-50",     icon: "mdi:check-circle-outline" },
            { label: "Menunggu",  value: stats.menunggu,  color: "text-amber-700",  bg: "bg-amber-50",       icon: "mdi:clock-outline" },
            { label: "Ditolak",   value: stats.ditolak,   color: "text-red-700",    bg: "bg-red-50",         icon: "mdi:close-circle-outline" },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-2xl p-4 shadow-sm flex items-center justify-between`}>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{loading ? "…" : c.value}</p>
              </div>
              <Icon icon={c.icon} width={26} className={`${c.color} opacity-60`} />
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-3 mb-5 items-center">
            <div className="flex-1 min-w-[200px] flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <Icon icon="mdi:magnify" className="text-gray-400 mr-2" width={16} />
              <input placeholder="Cari kegiatan, ruangan, atau alat..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none text-[13px] text-gray-600 bg-transparent" />
              {search && <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500"><Icon icon="mdi:close" width={16} /></button>}
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { key: "",           label: "Semua" },
                { key: "disetujui",  label: "Disetujui" },
                { key: "menunggu",   label: "Menunggu" },
                { key: "ditolak",    label: "Ditolak" },
                { key: "dibatalkan", label: "Dibatalkan" },
              ].map(s => (
                <button key={s.key} onClick={() => setStatus(s.key)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition cursor-pointer border
                    ${statusFilter === s.key ? "bg-[#3D0C1F] text-white border-[#3D0C1F]" : "bg-white text-gray-500 border-gray-200 hover:border-pink-200"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="text-center py-16 text-[#C92B58] text-sm">
              <Icon icon="mdi:loading" className="animate-spin inline mr-2" width={20} />Memuat data...
            </div>
          ) : pageData.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Tidak ada data ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {pageData.map((item, i) => (
                <div key={i} className="bg-white border border-[#F0D0DA] rounded-[18px] shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Card header */}
                  <div className="flex items-start gap-3 px-4 pt-4 pb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FDEAF0] border border-[#F5C6D8] flex items-center justify-center flex-shrink-0">
                      <Icon icon={item.id_ruangan ? "ph:door-open-bold" : "ph:wrench-bold"} width={20} color="#C92B58" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#481020] truncate">{item.ruangan || item.alat || "-"}</p>
                      <p className="text-[11px] text-[#C92B58] opacity-60 mt-0.5">{item.name_kegiatan}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${STATUS_STYLE[item.status_persetujuan] || "bg-gray-100 text-gray-500"}`}>
                      {(item.status_persetujuan || "").toUpperCase()}
                    </span>
                  </div>
                  {/* Card info */}
                  <div className="px-4 pb-4 space-y-1.5">
                    {[
                      { icon: "ph:calendar-blank", value: formatRentang(item) },
                      { icon: "ph:clock",          value: `${item.jam_mulai?.slice(0,5) ?? "-"} – ${item.jam_selesai?.slice(0,5) ?? "-"}` },
                      { icon: "ph:tag",            value: item.jenis_kegiatan || "-" },
                    ].map(({ icon, value }) => (
                      <div key={icon} className="flex items-center gap-2 text-[11px] text-gray-500">
                        <Icon icon={icon} width={13} color="#C92B58" className="opacity-70 flex-shrink-0" />
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button onClick={() => setPage(1)} disabled={page===1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40 border-none cursor-pointer">
                <Icon icon="mdi:chevron-double-left" />
              </button>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40 border-none cursor-pointer">
                <Icon icon="mdi:chevron-left" />
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-semibold transition cursor-pointer border-none
                    ${page===p ? "bg-[#C0254A] text-white shadow-md" : "text-[#C0254A] hover:bg-pink-100"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40 border-none cursor-pointer">
                <Icon icon="mdi:chevron-right" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page===totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40 border-none cursor-pointer">
                <Icon icon="mdi:chevron-double-right" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ModalBooking onClose={() => setShowModal(false)} onSuccess={fetchData} />
      )}
    </div>
  );
}
