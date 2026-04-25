import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";

const EquipmentCard = ({ name, location, building, image }) => {
  return (
    <div className="bg-[#DC4C75] rounded-2xl p-3 shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition duration-300">

      <div className="rounded-xl overflow-hidden h-[120px] mb-3">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>

      <div className="bg-[#5A1626] rounded-xl p-3 text-white">
        <h3 className="mb-2">
          <div className="w-full bg-[#3D0C1F] text-white py-2 rounded-lg text-center text-sm font-semibold shadow-sm">
            {name}
          </div>
        </h3>
        <div className="flex flex-col gap-1 text-[12px] text-pink-200">
          <div className="flex items-center gap-1">
            <Icon icon="mdi:monitor" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:office-building" />
            <span>{building}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-1 text-[11px] px-3 py-1 rounded-2xl bg-gray-200 text-[#7A1F33]">
            <Icon icon="mdi:information-outline" />
            Detail
          </button>

          <button className="flex-[2] flex items-center justify-center gap-1 text -[11px] px-3 py-1 rounded-2xl bg-[#3D0C1F] text-white">
            <Icon icon="mdi:plus" />
            Ajukan Peminjaman
          </button>
        </div>
      </div>
    </div>
  );
};

const equipments = [
  {name: "Kamera Luminux",location: "Workspace Multimedia",building: "Gedung Utama",image: "",},
  {name: "Iphone 17 Pro Max",location: "Workspace Multimedia",building: "Gedung Utama",image: "",},
  {name: "Drone",location: "Workspace Multimedia",building: "Gedung Utama",image: "",},
  {name: "Drum",location: "Workspace Multimedia",building: "Gedung Technopreneur",image: "",},
  {name: "Kamera Sony",location: "Workspace Multimedia",building: "Gedung Utama",image: "",},
  {name: "Wacom Intuos",location: "Workspace Multimedia",building: "Gedung Utama",image: "",},
];

const PeminjamanPeralatan = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      <div className="ml-[300px] flex-1 p-10">
        <div className="mb-6">
          <h1 className="text-[32px] font-extrabold text-[#2D0A18]">
            Daftar Peralatan
          </h1>
          <p className="text-gray-500 text-[14px]">
            Memilih Peralatan yang tersedia berdasarkan jadwal dan kapasitas
            yang dibutuhkan
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg">
          {/* SEARCH */}
          <div className="flex items-center mb-5">
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 border border-pink-200 shadow-inner">
              <input
                type="text"
                placeholder="telusuri peralatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              />
              <button className="bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white rounded-full w-9 h-9 flex items-center justify-center">
                <Icon icon="mdi:magnify" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {["Dikelola oleh", "Kapasitas", "Status"].map((item) => (
              <button
                key={item}
                className="w-full flex items-center justify-between border border-pink-300 text-[#C0254A] bg-white rounded-full px-4 py-2 text-sm hover:bg-pink-50"
              >
                {item}
                <Icon icon="mdi:chevron-down" />
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {equipments.map((item, i) => (
              <EquipmentCard key={i} {...item} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button className="w-9 h-9 bg-[#C0254A] text-white rounded-full flex items-center justify-center">
              <Icon icon="mdi:chevron-left" />
            </button>

            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-full ${
                  currentPage === p
                    ? "bg-[#C0254A] text-white"
                    : "text-[#C0254A] hover:bg-pink-100"
                }`}
              >
                {p}
              </button>
            ))}

            <span className="text-[#C0254A]">...</span>

            <button className="w-9 h-9 bg-[#C0254A] text-white rounded-full flex items-center justify-center">
              <Icon icon="mdi:chevron-right" />
            </button>

            <span className="ml-2 text-sm font-semibold">Go To</span>

            <input
              type="number"
              className="w-14 text-center bg-[#3D0C1F] text-white rounded-full px-2 py-1"
            />

            <span className="text-sm font-semibold">Page</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeminjamanPeralatan;