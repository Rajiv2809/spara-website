import React, { useState, useMemo } from "react";
import Sidebar from "../Components/sidebar";
import { Icon } from "@iconify/react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const LOAN_DATA = [
  {
    id: 1, name: "Total Station Topcon ES-105", code: "PJ-067", type: "Peralatan",
    user: "Angelica Sun", role: "Mahasiswi", nim: "434250518",
    email: "anngelicaaa00@gmail.com", phone: "089823769781", dept: "Teknik Informatika",
    date: "Selasa, 6 April 2027", time: "08.00 s/d 14.00", status: "Menunggu",
    activity: "Memasuki bulan suci ramadan, saya mewakili segenap keluarga besar teropela mengucapkan minal aidin wal faizin mohon maaf lahir dan batin",
  },
  {
    id: 2, name: "Total Station Topcon ES-105", code: "PJ-067", type: "Peralatan",
    user: "Budi Santoso", role: "Mahasiswa", nim: "434250519",
    email: "budi.santoso@gmail.com", phone: "089812345678", dept: "Teknik Mesin",
    date: "Selasa, 6 April 2027", time: "08.00 s/d 14.00", status: "Disetujui",
    activity: "Mengerjakan tugas akhir semester untuk pengukuran area lapangan",
  },
  {
    id: 3, name: "Total Station Topcon ES-105", code: "PJ-067", type: "Peralatan",
    user: "Citra Dewi", role: "Mahasiswi", nim: "434250520",
    email: "citra.dewi@gmail.com", phone: "089823456789", dept: "Teknik Elektro",
    date: "Selasa, 6 April 2027", time: "09.00 s/d 15.00", status: "Ditolak",
    activity: "Praktikum lapangan geodesi semester 5 bersama kelompok",
  },
  {
    id: 4, name: "Total Station Topcon ES-105", code: "PJ-067", type: "Peralatan",
    user: "Deni Pratama", role: "Mahasiswa", nim: "434250521",
    email: "deni.pratama@gmail.com", phone: "089834567890", dept: "Teknik Sipil",
    date: "Rabu, 7 April 2027", time: "07.00 s/d 13.00", status: "Menunggu",
    activity: "Pengukuran topografi untuk kerja praktek lapangan",
  },
  {
    id: 5, name: "Waterpass Topcon AT-B4", code: "PJ-068", type: "Peralatan",
    user: "Eka Putri", role: "Mahasiswi", nim: "434250522",
    email: "eka.putri@gmail.com", phone: "089845678901", dept: "Teknik Informatika",
    date: "Rabu, 7 April 2027", time: "10.00 s/d 16.00", status: "Menunggu",
    activity: "Riset tugas akhir pengukuran area kampus politeknik",
  },
  {
    id: 6, name: "Theodolite Sokkia DT740L", code: "PJ-069", type: "Peralatan",
    user: "Faris Rizki", role: "Mahasiswa", nim: "434250523",
    email: "faris.rizki@gmail.com", phone: "089856789012", dept: "Teknik Mesin",
    date: "Kamis, 8 April 2027", time: "08.00 s/d 12.00", status: "Disetujui",
    activity: "Pengambilan data untuk Program Kreativitas Mahasiswa bidang teknologi",
  },
  {
    id: 7, name: "Total Station Topcon ES-105", code: "PJ-067", type: "Peralatan",
    user: "Gita Lestari", role: "Mahasiswi", nim: "434250524",
    email: "gita.lestari@gmail.com", phone: "089867890123", dept: "Teknik Sipil",
    date: "Kamis, 8 April 2027", time: "13.00 s/d 17.00", status: "Menunggu",
    activity: "Pengukuran untuk proyek akhir semester bersama tim",
  },
  {
    id: 8, name: "Ruang Seminar A", code: "RU-012", type: "Ruangan",
    user: "Hendra Wijaya", role: "Mahasiswa", nim: "434250525",
    email: "hendra.wijaya@gmail.com", phone: "089878901234", dept: "Teknik Elektro",
    date: "Jumat, 9 April 2027", time: "08.00 s/d 12.00", status: "Menunggu",
    activity: "Seminar proposal tugas akhir dihadiri dosen pembimbing",
  },
  {
    id: 9, name: "Ruang Lab Komputer B", code: "RU-024", type: "Ruangan",
    user: "Indah Permata", role: "Mahasiswi", nim: "434250526",
    email: "indah.permata@gmail.com", phone: "089889012345", dept: "Teknik Informatika",
    date: "Jumat, 9 April 2027", time: "13.00 s/d 17.00", status: "Disetujui",
    activity: "Latihan ujian kompetensi nasional bersama kelas",
  },
  {
    id: 10, name: "Ruang Rapat C", code: "RU-031", type: "Ruangan",
    user: "Joko Susilo", role: "Mahasiswa", nim: "434250527",
    email: "joko.susilo@gmail.com", phone: "089890123456", dept: "Teknik Mesin",
    date: "Sabtu, 10 April 2027", time: "09.00 s/d 14.00", status: "Ditolak",
    activity: "Rapat koordinasi panitia acara wisuda angkatan 2027",
  },
];

const STAT_DATA = {
  alat:    { approved: 67, waiting: 67, rejected: 67 },
  ruangan: { approved: 31, waiting: 8,  rejected: 5  },
};

const ITEMS_PER_PAGE = 9;

// ─── BADGE ───────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const styles = {
    Menunggu:  { backgroundColor: "#FFF3CD", color: "#946C00" },
    Disetujui: { backgroundColor: "#DFF2D8", color: "#2E6B1F" },
    Ditolak:   { backgroundColor: "#FFE0E0", color: "#86090A" },
  };
  return (
    <span
      style={{
        ...(styles[status] ?? { backgroundColor: "#f3f4f6", color: "#666" }),
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

// ─── LOAN CARD ───────────────────────────────────────────────────────────────
const LoanCard = ({ item, onApprove, onReject }) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      border: "1.5px solid #F0D0DA",
      borderRadius: 18,
      boxShadow: "0 2px 10px rgba(201,43,88,0.06)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "box-shadow .2s, transform .15s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(201,43,88,0.13)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(201,43,88,0.06)"; e.currentTarget.style.transform = "none"; }}
  >
    {/* ── Card Header ── */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 16px 10px" }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        backgroundColor: "#FDEAF0", border: "1px solid #F5C6D8",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon icon="ph:wrench-bold" width={20} color="#C92B58" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#481020", lineHeight: 1.3, margin: 0 }}>{item.name}</p>
        <p style={{ fontSize: 11, color: "#C92B58", opacity: 0.6, marginTop: 2, fontWeight: 500 }}>{item.code} • {item.type}</p>
      </div>
      <Badge status={item.status} />
    </div>

    {/* ── User Section ── */}
    <div style={{ backgroundColor: "#FFF5F7", margin: "0 12px 12px", borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon icon="ph:user-circle-fill" width={15} color="#C92B58" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#481020" }}>{item.user}</span>
        <span style={{
          marginLeft: "auto", fontSize: 10, fontWeight: 700,
          backgroundColor: "#FDEAF0", color: "#C92B58",
          border: "1px solid #F5C6D8", padding: "2px 8px", borderRadius: 999,
        }}>{item.role}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
        {[
          { icon: "ph:identification-card", text: item.nim },
          { icon: "ph:envelope",            text: item.email },
          { icon: "ph:phone",               text: item.phone },
          { icon: "ph:buildings",           text: item.dept },
        ].map(({ icon, text }) => (
          <div key={icon} style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
            <Icon icon={icon} width={10} color="#C92B58" style={{ opacity: 0.7, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
          </div>
        ))}
      </div>
    </div>

    {/* ── Info Rows ── */}
    <div style={{ padding: "0 16px 4px" }}>
      {[
        { icon: "ph:calendar-blank", label: "Hari/Tanggal", value: item.date },
        { icon: "ph:clock",          label: "Waktu",        value: item.time },
        { icon: "ph:note-pencil",    label: "Kegiatan",     value: item.activity.length > 80 ? item.activity.slice(0, 80) + "…" : item.activity },
      ].map(({ icon, label, value }) => (
        <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
          <Icon icon={icon} width={13} color="#C92B58" style={{ opacity: 0.7, flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 10, color: "#aaa", minWidth: 70, flexShrink: 0, fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 10, color: "#555", fontWeight: 500, lineHeight: 1.4 }}>: {value}</span>
        </div>
      ))}
    </div>

    {/* ── Divider ── */}
    <hr style={{ border: "none", borderTop: "1.5px solid #F5E0E8", margin: "8px 16px 12px" }} />

    {/* ── Actions ── sesuai referensi: pill hijau Setujui + pill merah Tolak + kanan Detail */}
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 16px" }}>
      <button
        onClick={() => onApprove(item.id)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          backgroundColor: "#16A34A", color: "#fff",
          fontSize: 11, fontWeight: 700,
          padding: "7px 16px", borderRadius: 999, border: "none",
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 1px 4px rgba(22,163,74,0.3)",
          transition: "opacity .15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        <Icon icon="ph:check-circle-fill" width={13} color="#fff" />
        Setujui
      </button>

      <button
        onClick={() => onReject(item.id)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          backgroundColor: "#DC2626", color: "#fff",
          fontSize: 11, fontWeight: 700,
          padding: "7px 16px", borderRadius: 999, border: "none",
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 1px 4px rgba(220,38,38,0.3)",
          transition: "opacity .15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        <Icon icon="ph:x-circle-fill" width={13} color="#fff" />
        Tolak
      </button>

      <button
        style={{
          marginLeft: "auto",
          backgroundColor: "transparent",
          color: "#999", fontSize: 11, fontWeight: 600,
          padding: "6px 16px", borderRadius: 999,
          border: "1.5px solid #E5E7EB",
          cursor: "pointer", fontFamily: "inherit",
          transition: "all .15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C92B58"; e.currentTarget.style.color = "#C92B58"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#999"; }}
      >
        Detail
      </button>
    </div>
  </div>
);

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

  const navStyle = {
    width: 36, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
    backgroundColor: "#FDEAF0", color: "#481020", fontWeight: 700, fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit", transition: "all .15s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 32 }}>
      <button style={navStyle} onClick={() => onChange(1)}>«</button>
      <button style={navStyle} onClick={() => onChange(Math.max(1, current - 1))}>‹</button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={i} style={{ color: "#aaa", fontSize: 14, padding: "0 4px" }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
              backgroundColor: p === current ? "#481020" : "transparent",
              color: p === current ? "#fff" : "#666",
              fontWeight: 700, fontSize: 14, fontFamily: "inherit",
              transition: "all .15s",
            }}
          >{p}</button>
        )
      )}

      <button style={navStyle} onClick={() => onChange(Math.min(total, current + 1))}>›</button>
      <button style={navStyle} onClick={() => onChange(total)}>»</button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
        <span style={{ fontSize: 13, color: "#777", fontWeight: 600 }}>Go To</span>
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
          style={{
            width: 56, textAlign: "center", padding: "6px 8px",
            border: "1.5px solid #E5E7EB", borderRadius: 8,
            fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit",
          }}
        />
        <span style={{ fontSize: 13, color: "#777", fontWeight: 600 }}>Page</span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const PersetujuanPeminjaman = () => {
  const [data, setData]                 = useState(LOAN_DATA);
  const [statType, setStatType]         = useState("alat");
  const [filterType, setFilterType]     = useState("alat");
  const [statusFilter, setStatusFilter] = useState("");
  const [waktuFilter, setWaktuFilter]   = useState("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);

  const stats = STAT_DATA[statType];

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchType   = filterType === "ruangan" ? d.type === "Ruangan" : d.type !== "Ruangan";
      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchSearch = !search
        || d.name.toLowerCase().includes(search.toLowerCase())
        || d.user.toLowerCase().includes(search.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [data, filterType, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageData   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleApprove    = (id) => setData((prev) => prev.map((d) => d.id === id ? { ...d, status: "Disetujui" } : d));
  const handleReject     = (id) => setData((prev) => prev.map((d) => d.id === id ? { ...d, status: "Ditolak"   } : d));
  const handlePage       = (n)  => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleFilterType = (t)  => { setFilterType(t); setPage(1); };
  const handleStatType   = (t)  => setStatType(t);

  return (
    <div
      style={{ background: "linear-gradient(180deg, #FFF6F1 0%, #FFD1D1 100%)", minHeight: "100vh", display: "flex" }}
      className="font-poppins"
    >
      <Sidebar />

      <div style={{ marginLeft: 300, flex: 1, padding: 50 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#481020", margin: 0 }}>Halaman Peminjaman</h1>
          <p style={{ fontSize: 18, color: "#888", marginTop: 4 }}>Pantau dan setujui seluruh peminjaman alat atau ruangan</p>
        </div>

        {/* ── Stat Card ── */}
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #F0C0D0",      /* border pink-merah sesuai referensi */
          borderRadius: 20,
          boxShadow: "0 2px 16px rgba(201,43,88,0.09)",
          padding: "24px 28px",
          marginBottom: 28,
        }}>
          {/* Title + Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#C92B58", margin: 0, letterSpacing: 0.5 }}>
              DATA PERSETUJUAN TERKINI
            </h3>
            {/* Toggle pill ALAT | RUANGAN */}
            <div style={{ display: "flex", border: "2px solid #C92B58", borderRadius: 999, overflow: "hidden" }}>
              {["alat", "ruangan"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleStatType(t)}
                  style={{
                    backgroundColor: statType === t ? "#C92B58" : "transparent",
                    color: statType === t ? "#fff" : "#C92B58",
                    padding: "6px 20px", fontSize: 12, fontWeight: 700,
                    border: "none", cursor: "pointer", textTransform: "uppercase",
                    fontFamily: "inherit", transition: "all .2s",
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Numbers row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[
              { key: "approved", label: "Telah Disetujui",    icon: "material-symbols:verified-rounded", from: "#7FDA0F", to: "#437408", labelColor: "#3C5900" },
              { key: "waiting",  label: "Menunggu Disetujui", icon: "subway:time-1",                     from: "#FBCE3A", to: "#C2A33E", labelColor: "#7B651C"},
              { key: "rejected", label: "Telah Ditolak",      icon: "solar:list-cross-outline",          from: "#F71519", to: "#AD0F12", labelColor: "#86090A" },
            ].map(({ key, label, icon, from, to, labelColor }, idx) => (
              <div
                key={key}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "8px 16px", position: "relative",
                  borderRight: idx < 2 ? "1.5px solid #F0D0DA" : "none",
                }}
              >
                <div style={{ position: "absolute", top: 4, right: 16, opacity: 0.15, pointerEvents: "none" }}>
                  <Icon icon={icon} width={72} color={from} />
                </div>
                <span style={{
                  fontSize: 72, fontWeight: 900, lineHeight: 1, fontFamily: "inherit",
                  background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {stats[key]}
                </span>
                <span style={{ fontSize: 13, fontStyle: "italic", fontWeight: 600, color: labelColor, marginTop: 4 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>

          {/* Alat / Ruangan toggle — dark pill sesuai referensi */}
          <div style={{ display: "flex", backgroundColor: "#6B1028", borderRadius: 999, padding: 3 }}>
            {["alat", "ruangan"].map((t) => (
              <button
                key={t}
                onClick={() => handleFilterType(t)}
                style={{
                  backgroundColor: filterType === t ? "#E9E9E9" : "transparent",
                  color: filterType === t ? "#701A32" : "#C8909A",
                  padding: "8px 22px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer", textTransform: "uppercase",
                  fontFamily: "inherit", transition: "all .2s",
                }}
              >{t}</button>
            ))}
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              appearance: "none", padding: "9px 18px", borderRadius: 999,
              border: "1.5px solid #701A32", backgroundColor: "#701A32",
              fontSize: 13, fontWeight: 600, color: "#E9E9E9", cursor: "pointer",
              outline: "none", fontFamily: "inherit",
            }}
          >
            <option value="">Status ▾</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          {/* Waktu dropdown */}
          <select
            value={waktuFilter}
            onChange={(e) => setWaktuFilter(e.target.value)}
            style={{
              appearance: "none", padding: "9px 18px", borderRadius: 999,
              border: "1.5px solid #701A32", backgroundColor: "#701A32",
              fontSize: 13, fontWeight: 600, color: "#E9E9E9", cursor: "pointer",
              outline: "none", fontFamily: "inherit",
            }}
          >
            <option value="">Waktu ▾</option>
            <option value="hari">Hari ini</option>
            <option value="minggu">Minggu ini</option>
            <option value="bulan">Bulan ini</option>
          </select>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="telusuri peralatan..."
            style={{
              flex: 1, minWidth: 180, padding: "9px 20px",
              border: "2.5px solid #701A32", borderRadius: 999,
              fontSize: 13, color: "#555", backgroundColor: "#fff",
              outline: "none", fontFamily: "inherit",
            }}
            onFocus={(e) => e.target.style.borderColor = "#701A32"}
            onBlur={(e) => e.target.style.borderColor = "#701A32"}
          />
        </div>

        {/* ── Cards Grid ── */}
        {pageData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", fontSize: 15 }}>
            Tidak ada data ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pageData.map((item) => (
              <LoanCard key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        <Pagination current={page} total={totalPages} onChange={handlePage} />

      </div>
    </div>
  );
};

export default PersetujuanPeminjaman;
