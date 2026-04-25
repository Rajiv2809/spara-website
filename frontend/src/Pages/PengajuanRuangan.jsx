import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";

const BuildingCard = ({ name, type, building, status }) => {
  const statusStyles = {
    TERSEDIA: { bg: "bg-green-500", text: "TERSEDIA" },
    MAINTENANCE: { bg: "bg-yellow-500", text: "MAINTENANCE" },
    "TIDAK TERSEDIA": { bg: "bg-red-500", text: "TIDAK TERSEDIA" },
  };

  const s = statusStyles[status] || statusStyles["TERSEDIA"];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col hover:scale-[1.02] hover:shadow-xl transition duration-300">
      
      <div className="relative h-[140px] bg-gradient-to-br from-sky-300 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="flex items-end gap-1">
            <div className="w-6 h-16 bg-white/30 rounded-t-sm" />
            <div className="w-10 h-24 bg-white/40 rounded-t-sm" />
            <div className="w-8 h-20 bg-white/35 rounded-t-sm" />
            <div className="w-6 h-14 bg-white/30 rounded-t-sm" />
          </div>
        </div>

        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${s.bg} text-white text-[10px] font-bold px-3 py-0.5 rounded-full`}>
          {s.text}
        </div>
      </div>

      <div className="bg-[#3D0C1F] p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-white font-bold text-[15px]">{name}</h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-pink-200 text-[12px]">
            <Icon icon="mdi:monitor" />
            <span>{type}</span>
          </div>
          <div className="flex items-center gap-1 text-pink-200 text-[12px]">
            <Icon icon="mdi:office-building" />
            <span>{building}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button className="flex items-center gap-1 border border-pink-300 text-pink-200 text-[11px] px-3 py-1 rounded-full hover:bg-pink-800/30 transition">
            <Icon icon="mdi:information-outline" />
            Detail
          </button>
          <button className="flex items-center gap-1 border border-pink-300 text-pink-200 text-[11px] px-3 py-1 rounded-full hover:bg-pink-800/30 transition">
            <Icon icon="mdi:plus" />
            Ajukan
          </button>
        </div>
      </div>
    </div>
  );
};

const rooms = [
  { name: "Technopreneur", type: "Workspace Multimedia", building: "Gedung Utama", status: "TERSEDIA" },
  { name: "GU604", type: "Workspace Multimedia", building: "Gedung Utama", status: "MAINTENANCE" },
  { name: "Technopreneur", type: "Workspace Multimedia", building: "Gedung Utama", status: "TIDAK TERSEDIA" },
  { name: "Technopreneur", type: "Workspace Multimedia", building: "Gedung Technopreneur", status: "MAINTENANCE" },
  { name: "Technopreneur", type: "Workspace Multimedia", building: "Gedung Utama", status: "TERSEDIA" },
  { name: "Technopreneur", type: "Workspace Multimedia", building: "Gedung Utama", status: "TIDAK TERSEDIA" },
];

const PeminjamnRuangan = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      
      <Sidebar />

      <div className="ml-[300px] flex-1 p-10 overflow-y-auto">

        <div className="mb-8">
          <h1 className="text-[#2D0A18] text-[32px] font-extrabold">
            Daftar Ruangan
          </h1>
          <p className="text-gray-500 text-[14px] mt-1">
            Memilih ruangan yang tersedia berdasarkan jadwal dan kapasitas
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">

          <div className="flex items-center mb-6">
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <input
                type="text"
                placeholder="Telusuri ruangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-[14px] text-gray-600 bg-transparent"
              />
              <button className="bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition">
                <Icon icon="mdi:magnify" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {["Gedung", "Kapasitas", "Status"].map((filter) => (
              <button
                key={filter}
                className="flex items-center gap-2 border border-pink-300 text-[#C0254A] bg-white rounded-full px-5 py-2 text-[13px] font-semibold hover:bg-pink-50 transition shadow-sm"
              >
                {filter}
                <Icon icon="mdi:chevron-down" />
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5 mb-6">
            {rooms.map((room, i) => (
              <BuildingCard key={i} {...room} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition">
              <Icon icon="mdi:chevron-double-left" />
            </button>

            {[1, 2, 3, 4, 5].map((p) => (
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

            <span className="text-[#C0254A] font-semibold">...</span>

            <button className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition">
              <Icon icon="mdi:chevron-double-right" />
            </button>

            <span className="text-[#3D0C1F] text-[13px] font-semibold ml-2">
              Go To
            </span>

            <input
              type="number"
              className="w-16 rounded-full bg-[#3D0C1F] text-white text-center text-[13px] px-2 py-1 outline-none shadow-inner"
              min={1}
              max={totalPages}
            />

            <span className="text-[#3D0C1F] text-[13px] font-semibold">
              Page
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeminjamnRuangan;