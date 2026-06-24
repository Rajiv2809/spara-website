import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import ModalPengajuan from "../Components/ModalPengajuanroom";
import building_utama from '../assets/gu601.jpeg';
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

const Filtercapacity = ({ value, onChange }) => {
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
        {value !== null && value !== undefined ? `≥ ${value} orang` : "capacity"}
        <Icon icon={open ? "mdi:chevron-up" : "mdi:chevron-down"} width={14} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-pink-100 rounded-2xl shadow-xl p-4 min-w-[220px]">
          <p className="text-[11px] text-gray-400 mb-2">
            Tampilkan room dengan capacity minimal:
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

const ModalDetail = ({ room, onClose, onAjukan }) => {
  if (!room) return null;
  const canApply = room.status === "TERSEDIA";
  const statusStyles = {
    TERSEDIA: { bg: "bg-green-500", text: "TERSEDIA" },
    MAINTENANCE: { bg: "bg-yellow-500", text: "MAINTENANCE" },
    "TIDAK TERSEDIA": { bg: "bg-red-500", text: "TIDAK TERSEDIA" },
  };
  const s = statusStyles[room.status] || statusStyles["TERSEDIA"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden w-[400px] max-w-[100vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#3D0C1F] p-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-[18px] leading-snug max-w-[270px]">{room.name}</h2>
            <p className="text-pink-300 text-[15px] mt-0.5">Kode: {room.kode}</p>
          </div>
          <button onClick={onClose} className="text-white bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-lg leading-none hover:bg-white/30 transition">
            ×
          </button>
        </div>

        <div className="relative h-[240px] bg-gradient-to-br from-sky-300 to-blue-500 flex items-end justify-center pb-2 overflow-hidden">
          <img src={building_utama} className="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div className="p-4 flex flex-col gap-2.5">
          <div>
            <span className={`${s.bg} text-white text-[10px] font-bold px-3 py-1 rounded-full`}>{s.text}</span>
          </div>

          {[
            { icon: "mdi:stairs", label: "floor", value: room.floor },
            { icon: "mdi:office-building", label: "building", value: room.building },
            { icon: "mdi:account-group", label: "capacity", value: `${room.capacity} orang` },
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
              facility
            </span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
              {room.facility.map((f) => (
                <span key={f} className="bg-pink-100 text-[#C0254A] text-[10px] px-2 py-0.5 rounded-full font-semibold">{f}</span>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed bg-pink-50 rounded-lg p-2.5">{room.deskripsi}</p>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2 text-[12px] font-bold hover:bg-pink-50 transition">
            Tutup
          </button>
          <button
            disabled={!canApply}
            onClick={() => onAjukan(room)}
            className={`flex-1 rounded-full py-2 text-[12px] font-bold transition ${
              canApply ? "bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white hover:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Ajukan loan
          </button>
        </div>
      </div>
    </div>
  );
};

const buildingCard = ({ room, onDetail, onAjukan }) => {
  const { name, building, floor, status } = room;
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
          <img src={building_utama} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${s.bg} text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap`}>
          {s.text}
        </div>
      </div>

      <div className="bg-[#3D0C1F] p-3 flex-1 flex flex-col gap-2">
        <h3 className="text-white font-bold text-[12px] leading-tight line-clamp-2">{name}</h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-pink-200 text-[10px]">
            <Icon icon="mdi:office-building" width={11} />
            <span className="truncate">{building}</span>
          </div>
          <div className="flex items-center gap-1 text-pink-200 text-[10px]">
            <Icon icon="mdi:stairs" width={11} />
            <span>{floor}</span>
          </div>
        </div>

        <div className="flex gap-1.5 mt-1">
          <button
            onClick={() => onDetail(room)}
            className="flex items-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2.5 py-1 rounded-full hover:bg-pink-800/30 transition"
          >
            <Icon icon="mdi:information-outline" width={11} />
            Detail
          </button>

          {canApply ? (
            <button
              onClick={() => onAjukan(room)}
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

const loanroom = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModalPengajuan, setShowModalPengajuan] = useState(false);
  const [selectedPengajuanRoom, setSelectedPengajuanRoom] = useState(null);
  const [filterbuilding, setFilterbuilding] = useState(null);
  const [filterfloor, setFilterfloor] = useState(null);
  const [filtercapacity, setFiltercapacity] = useState(null);
  const [roomData, setroomData] = useState([]);
  const [buildingList, setbuildingList] = useState([]);
  const [floorPerbuilding, setfloorPerbuilding] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/get-room')
      .then(({ data }) => {
        const mapped = data.data.map((r) => ({
          id         : r.id,
          room_id : r.id,
          kode       : r.room_code,
          name       : r.room_name,
          building     : r.building_name,
          floor     : `floor ${r.floor_number}`,
          capacity  : r.capacity,
          facility  : r.facility.split(', '),
          deskripsi  : r.room_description,
          status     : r.room_status.toUpperCase().replace('_', ' '),
          path_foto  : r.path_foto,
          name_pic   : r.id_number_pic,
        }));
        
        
        const buildingSet = [...new Set(mapped.map((r) => r.building))];

        const floorMap = {};
        buildingSet.forEach((building) => {
          floorMap[building] = [
            ...new Set(
              mapped
                .filter((r) => r.building === building)
                .map((r) => r.floor)
            ),
          ].sort((a, b) => parseInt(a.replace('floor ', '')) - parseInt(b.replace('floor ', '')));
        });

        setroomData(mapped);
        setbuildingList(buildingSet);
        setfloorPerbuilding(floorMap);
      })
      .catch(({ res }) => {
        console.log(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFilterbuilding = (val) => {
    setFilterbuilding(val);
    setFilterfloor(null);
    setCurrentPage(1);
  };

  const handleFilterfloor = (val) => {
    setFilterfloor(val);
    setCurrentPage(1);
  };

  const handleFiltercapacity = (val) => {
    setFiltercapacity(val);
    setCurrentPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return roomData.filter((r) => {
      const matchSearch    = r.name.toLowerCase().includes(search.toLowerCase());
      const matchbuilding    = !filterbuilding || r.building === filterbuilding;
      const matchfloor    = !filterfloor || r.floor === filterfloor;
      const matchcapacity = filtercapacity === null || filtercapacity === undefined || r.capacity >= filtercapacity;
      return matchSearch && matchbuilding && matchfloor && matchcapacity;
    });
  }, [roomData, search, filterbuilding, filterfloor, filtercapacity]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const floorOptions = filterbuilding ? floorPerbuilding[filterbuilding] ?? [] : [];

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
          room={selectedRoom}
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
          room={selectedPengajuanRoom}
          onClose={() => setShowModalPengajuan(false)}
        />
      )}

      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-[#2D0A18] text-[32px] lg:mt-2 mt-12 font-extrabold">Daftar room</h1>
          <p className="text-gray-500 text-[14px] mt-1">
            Memilih room yang tersedia berdasarkan jadwal dan capacity
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">

          <div className="flex items-center mb-5">
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <input
                type="text"
                placeholder="Telusuri name room..."
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
              label="building"
              icon="mdi:office-building"
              options={buildingList}
              value={filterbuilding}
              onChange={handleFilterbuilding}
            />
            <Dropdown
              label="floor"
              icon="mdi:stairs"
              options={floorOptions}
              value={filterfloor}
              onChange={handleFilterfloor}
              disabled={!filterbuilding}
            />
            <Filtercapacity value={filtercapacity} onChange={handleFiltercapacity} />

            <span className="ml-auto text-[12px] text-gray-400">
              {filtered.length} room ditemukan
            </span>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Icon icon="mdi:loading" width={48} className="mb-3 opacity-50 animate-spin" />
              <p className="text-[14px] font-semibold">Memuat data room...</p>
            </div>
          ) : paginated.length > 0 ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6">
              {paginated.map((r, i) => (
                <buildingCard
                  key={i}
                  room={r}
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
              <p className="text-[14px] font-semibold">Tidak ada room yang cocok</p>
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

export default loanroom;