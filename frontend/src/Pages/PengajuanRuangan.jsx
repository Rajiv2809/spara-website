import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../Components/sidebar";
import { Icon } from "@iconify/react";
import ModalPengajuan from "../Components/ModalPengajuanRuangan";
import gedung_utama from '../assets/gu601.jpeg';
import axiosClient from "../axios";

const ITEMS_PER_PAGE = 10;

const Dropdown = ({ label, icon, options, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-[13px] font-semibold transition shadow-sm ${
          disabled
            ? "border-pink-100 text-pink-200 bg-white cursor-not-allowed"
            : value
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
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-[12px] hover:bg-pink-50 ${
                value === opt ? "text-[#C0254A] font-bold" : "text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterKapasitas = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value ?? "");

  const handleApply = () => {
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange(num);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setInput("");
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-[13px] font-semibold transition shadow-sm ${
          value !== null && value !== undefined
            ? "border-[#C0254A] text-white bg-[#C0254A]"
            : "border-pink-300 text-[#C0254A] bg-white hover:bg-pink-50"
        }`}
      >
        <Icon icon="mdi:account-group" width={14} />
        {value !== null && value !== undefined ? `≥ ${value} orang` : "Kapasitas"}
        <Icon icon={open ? "mdi:chevron-up" : "mdi:chevron-down"} width={14} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-pink-100 rounded-2xl shadow-xl p-4 min-w-[220px]">
          <p className="text-[11px] text-gray-400 mb-2">
            Tampilkan ruangan dengan kapasitas minimal:
          </p>
          <div className="flex items-center gap-2 mb-1">
            <input
              type="number"
              min={0}
              max={100}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: 65"
              className="flex-1 border border-pink-200 rounded-full px-3 py-1.5 text-[13px] outline-none focus:border-[#C0254A] text-center"
            />
            <span className="text-[12px] text-gray-400">orang</span>
          </div>
          <p className="text-[10px] text-gray-300 mb-3">Maks. input: 100</p>
          <div className="flex gap-2">
            <button onClick={handleClear} className="flex-1 border border-pink-300 text-[#C0254A] text-[12px] font-semibold rounded-full py-1.5 hover:bg-pink-50 transition">
              Hapus
            </button>
            <button onClick={handleApply} className="flex-1 bg-[#C0254A] text-white text-[12px] font-semibold rounded-full py-1.5 hover:opacity-90 transition">
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalDetail = ({ ruangan, onClose, onAjukan }) => {
  if (!ruangan) return null;
  const canApply = ruangan.status === "TERSEDIA";
  const statusStyles = {
    TERSEDIA: { bg: "bg-green-500", text: "TERSEDIA" },
    MAINTENANCE: { bg: "bg-yellow-500", text: "MAINTENANCE" },
    "TIDAK TERSEDIA": { bg: "bg-red-500", text: "TIDAK TERSEDIA" },
  };
  const s = statusStyles[ruangan.status] || statusStyles["TERSEDIA"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden w-[400px] max-w-[100vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#3D0C1F] p-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-[18px] leading-snug max-w-[270px]">{ruangan.nama}</h2>
            <p className="text-pink-300 text-[15px] mt-0.5">Kode: {ruangan.kode}</p>
          </div>
          <button onClick={onClose} className="text-white bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-lg leading-none hover:bg-white/30 transition">
            ×
          </button>
        </div>

        <div className="relative h-[240px] bg-gradient-to-br from-sky-300 to-blue-500 flex items-end justify-center pb-2 overflow-hidden">
          <img src={gedung_utama} className="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div className="p-4 flex flex-col gap-2.5">
          <div>
            <span className={`${s.bg} text-white text-[10px] font-bold px-3 py-1 rounded-full`}>{s.text}</span>
          </div>

          {[
            { icon: "mdi:stairs", label: "Lantai", value: ruangan.lantai },
            { icon: "mdi:office-building", label: "Gedung", value: ruangan.gedung },
            { icon: "mdi:account-group", label: "Kapasitas", value: `${ruangan.kapasitas} orang` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex justify-between items-center border-b border-pink-100 pb-2">
              <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Icon icon={icon} className="text-[#C0254A]" />
                {label}
              </span>
              <span className="text-[#2D0A18] text-[12px] font-semibold text-right max-w-[55%]">{value}</span>
            </div>
          ))}

          <div className="flex justify-between items-start border-b border-pink-100 pb-2">
            <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Icon icon="mdi:star-check" className="text-[#C0254A]" />
              Fasilitas
            </span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
              {ruangan.fasilitas.map((f) => (
                <span key={f} className="bg-pink-100 text-[#C0254A] text-[10px] px-2 py-0.5 rounded-full font-semibold">{f}</span>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed bg-pink-50 rounded-lg p-2.5">{ruangan.deskripsi}</p>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2 text-[12px] font-bold hover:bg-pink-50 transition">
            Tutup
          </button>
          <button
            disabled={!canApply}
            onClick={() => onAjukan(ruangan)}
            className={`flex-1 rounded-full py-2 text-[12px] font-bold transition ${
              canApply ? "bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white hover:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Ajukan Peminjaman
          </button>
        </div>
      </div>
    </div>
  );
};

const GedungCard = ({ ruangan, onDetail, onAjukan }) => {
  const { nama, gedung, lantai, status } = ruangan;
  const canApply = status === "TERSEDIA";

  const statusStyles = {
    TERSEDIA: { bg: "bg-green-500", text: "TERSEDIA" },
    MAINTENANCE: { bg: "bg-yellow-500", text: "MAINTENANCE" },
    "TIDAK TERSEDIA": { bg: "bg-red-500", text: "TIDAK TERSEDIA" },
  };
  const s = statusStyles[status] || statusStyles["TERSEDIA"];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-[0_6px_20px_rgba(0,0,0,0.07)] flex flex-col hover:scale-[1.02] hover:shadow-xl transition duration-300">
      <div className="relative h-[155px] bg-gradient-to-br from-sky-300 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center pb-3">
          <img src={gedung_utama} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${s.bg} text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap`}>
          {s.text}
        </div>
      </div>

      <div className="bg-[#3D0C1F] p-3 flex-1 flex flex-col gap-2">
        <h3 className="text-white font-bold text-[12px] leading-tight line-clamp-2">{nama}</h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-pink-200 text-[10px]">
            <Icon icon="mdi:office-building" width={11} />
            <span className="truncate">{gedung}</span>
          </div>
          <div className="flex items-center gap-1 text-pink-200 text-[10px]">
            <Icon icon="mdi:stairs" width={11} />
            <span>{lantai}</span>
          </div>
        </div>

        <div className="flex gap-1.5 mt-1">
          <button
            onClick={() => onDetail(ruangan)}
            className="flex items-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2.5 py-1 rounded-full hover:bg-pink-800/30 transition"
          >
            <Icon icon="mdi:information-outline" width={11} />
            Detail
          </button>

          {canApply ? (
            <button
              onClick={() => onAjukan(ruangan)}
              className="flex items-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2.5 py-1 rounded-full hover:bg-pink-800/30 transition">
              <Icon icon="mdi:plus" width={11} />
              Ajukan
            </button>
          ) : (
            <button disabled className="flex items-center gap-1 border border-pink-300/30 text-pink-200/30 text-[10px] px-2.5 py-1 rounded-full cursor-not-allowed">
              <Icon icon="mdi:cancel" width={11} />
              {status === "MAINTENANCE" ? "Maintenance" : "Tidak Tersedia"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PeminjamanRuangan = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModalPengajuan, setShowModalPengajuan] = useState(false);
  const [selectedPengajuanRoom, setSelectedPengajuanRoom] = useState(null);
  const [filterGedung, setFilterGedung] = useState(null);
  const [filterLantai, setFilterLantai] = useState(null);
  const [filterKapasitas, setFilterKapasitas] = useState(null);
  const [ruanganData, setRuanganData] = useState([]);
  const [gedungList, setGedungList] = useState([]);
  const [lantaiPerGedung, setLantaiPerGedung] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/get-ruangan')
      .then(({ data }) => {
        const mapped = data.data.map((r) => ({
          id         : r.id,
          id_ruangan : r.id,
          kode       : r.kode_ruangan,
          nama       : r.nama_ruangan,
          gedung     : r.nama_gedung,
          lantai     : `Lantai ${r.nomor_lantai}`,
          kapasitas  : r.kapasitas,
          fasilitas  : r.fasilitas.split(', '),
          deskripsi  : r.deskripsi_ruangan,
          status     : r.status_ruangan.toUpperCase().replace('_', ' '),
          path_foto  : r.path_foto,
          nama_pic   : r.nomor_induk_pic,
        }));
        
        
        const gedungSet = [...new Set(mapped.map((r) => r.gedung))];

        const lantaiMap = {};
        gedungSet.forEach((gedung) => {
          lantaiMap[gedung] = [
            ...new Set(
              mapped
                .filter((r) => r.gedung === gedung)
                .map((r) => r.lantai)
            ),
          ].sort((a, b) => parseInt(a.replace('Lantai ', '')) - parseInt(b.replace('Lantai ', '')));
        });

        setRuanganData(mapped);
        setGedungList(gedungSet);
        setLantaiPerGedung(lantaiMap);
      })
      .catch(({ res }) => {
        console.log(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFilterGedung = (val) => {
    setFilterGedung(val);
    setFilterLantai(null);
    setCurrentPage(1);
  };

  const handleFilterLantai = (val) => {
    setFilterLantai(val);
    setCurrentPage(1);
  };

  const handleFilterKapasitas = (val) => {
    setFilterKapasitas(val);
    setCurrentPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return ruanganData.filter((r) => {
      const matchSearch    = r.nama.toLowerCase().includes(search.toLowerCase());
      const matchGedung    = !filterGedung || r.gedung === filterGedung;
      const matchLantai    = !filterLantai || r.lantai === filterLantai;
      const matchKapasitas = filterKapasitas === null || filterKapasitas === undefined || r.kapasitas >= filterKapasitas;
      return matchSearch && matchGedung && matchLantai && matchKapasitas;
    });
  }, [ruanganData, search, filterGedung, filterLantai, filterKapasitas]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const lantaiOptions = filterGedung ? lantaiPerGedung[filterGedung] ?? [] : [];

  const pageRange = useMemo(() => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      {selectedRoom && (
        <ModalDetail
          ruangan={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onAjukan={(room) => {
            setSelectedRoom(null);
            setSelectedPengajuanRoom(room);
            setShowModalPengajuan(true);
          }}
        />
      )}

      {showModalPengajuan && (
        <ModalPengajuan
          ruangan={selectedPengajuanRoom}
          onClose={() => setShowModalPengajuan(false)}
        />
      )}

      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-[#2D0A18] text-[32px] lg:mt-2 mt-12 font-extrabold">Daftar Ruangan</h1>
          <p className="text-gray-500 text-[14px] mt-1">
            Memilih ruangan yang tersedia berdasarkan jadwal dan kapasitas
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">

          <div className="flex items-center mb-5">
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <input
                type="text"
                placeholder="Telusuri nama ruangan..."
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
          </div>

          <div className="flex gap-2 mb-5 flex-wrap items-center">
            <Dropdown
              label="Gedung"
              icon="mdi:office-building"
              options={gedungList}
              value={filterGedung}
              onChange={handleFilterGedung}
            />
            <Dropdown
              label="Lantai"
              icon="mdi:stairs"
              options={lantaiOptions}
              value={filterLantai}
              onChange={handleFilterLantai}
              disabled={!filterGedung}
            />
            <FilterKapasitas value={filterKapasitas} onChange={handleFilterKapasitas} />

            <span className="ml-auto text-[12px] text-gray-400">
              {filtered.length} ruangan ditemukan
            </span>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Icon icon="mdi:loading" width={48} className="mb-3 opacity-50 animate-spin" />
              <p className="text-[14px] font-semibold">Memuat data ruangan...</p>
            </div>
          ) : paginated.length > 0 ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6">
              {paginated.map((r, i) => (
                <GedungCard
                  key={i}
                  ruangan={r}
                  onDetail={setSelectedRoom}
                  onAjukan={(room) => {
                    setSelectedPengajuanRoom(room);
                    setShowModalPengajuan(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Icon icon="mdi:magnify-close" width={48} className="mb-3 opacity-30" />
              <p className="text-[14px] font-semibold">Tidak ada ruangan yang cocok</p>
              <p className="text-[12px] mt-1">Coba ubah kata kunci atau filter</p>
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

              {pageRange[0] > 1 && <span className="text-[#C0254A] font-semibold">...</span>}

              {pageRange.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${
                    currentPage === p ? "bg-[#C0254A] text-white shadow-md" : "text-[#C0254A] hover:bg-pink-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              {pageRange[pageRange.length - 1] < totalPages && <span className="text-[#C0254A] font-semibold">...</span>}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

              <span className="text-[#3D0C1F] text-[13px] font-semibold ml-2">Go To</span>
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
              <span className="text-[#3D0C1F] text-[13px] font-semibold">Page</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeminjamanRuangan;