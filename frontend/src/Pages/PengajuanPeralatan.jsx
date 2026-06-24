import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import ModalPengajuan from "../Components/ModalPengajuanPertoolan";
import axiosClient from "../axios";
import pertoolanImg from "../assets/pertoolan.jpg";

const statusStyles = {
  tersedia: { bg: "bg-green-500", text: "TERSEDIA" },
  dipinjam: { bg: "bg-blue-500", text: "DIPINJAM" },
  rusak: { bg: "bg-red-500", text: "RUSAK" },
  maintenance: { bg: "bg-yellow-500", text: "MAINTENANCE" },
};


const EquipmentCard = ({ name, deskripsi, status, onDetail, onAjukan }) => {
  const normalizedStatus = status?.toLowerCase();
  const s = statusStyles[normalizedStatus] || statusStyles.tersedia;
  const canApply = normalizedStatus === "tersedia";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-md hover:scale-[1.02] hover:shadow-xl transition duration-300">

      <div className="relative h-[120px] bg-[#DC4C75] overflow-hidden">
        <img
          src={pertoolanImg}
          alt="equipment"
          className="w-full h-full object-cover"
        />

        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${s.bg} text-white text-[9px] font-bold px-3 py-1 rounded-full`}>
          {s.text}
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-[#3D0C1F] p-3 flex flex-col gap-2">

        <h3 className="text-white font-bold text-[12px] leading-tight line-clamp-2">
          {name}
        </h3>

        <div className="flex items-center gap-1 text-pink-200 text-[10px]">
          <Icon icon="mdi:text" width={11} />
          <span className="line-clamp-2">
            {deskripsi || "Tidak ada deskripsi"}
          </span>
        </div>

        {/* ACTION */}
        <div className="flex gap-1.5 mt-1">

          <button
            onClick={onDetail}
            className="flex-1 flex items-center justify-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2 py-1 rounded-full hover:bg-pink-800/30 transition"
          >
            <Icon icon="mdi:information-outline" width={11} />
            Detail
          </button>

          {canApply ? (
            <button
              onClick={onAjukan}
              className="flex-1 flex items-center justify-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2 py-1 rounded-full hover:bg-pink-800/30 transition">
              <Icon icon="mdi:plus" width={11} />
              Ajukan
            </button>
          ) : (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-1 border border-pink-300/30 text-pink-200/30 text-[10px] px-2 py-1 rounded-full cursor-not-allowed"
            >
              <Icon icon="mdi:cancel" width={11} />
              {s.text}
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

/* =========================
   DATA
========================= */
const initialEquipments = [
  { id: 1, name: "Kamera Luminux", kode: "KMR-001", deskripsi: "Kamera Lumix GH5 Lensa Kit dengan 1 baterai", status: "tersedia", jenis: "FOTOGRAFI", stok: 2 },
  { id: 2, name: "Kamera Sony FX 3", kode: "KMR-002", deskripsi: "Kamera Sony FX 3, Body Only - Lensa Terpisah.", status: "tersedia", jenis: "FOTOGRAFI", stok: 1 },
  { id: 3, name: "GPS Handheld 73", kode: "GPS-001", deskripsi: "tool Survey Terestris", status: "maintenance", jenis: "PROG PK", stok: 2 },
  { id: 4, name: "GPS Geodetik Topcon GR-5", kode: "GPS-002", deskripsi: "tool Survey Terestris", status: "dipinjam", jenis: "PROG PK", stok: 0 },
  { id: 5, name: "Lightstick", kode: "LI-001", deskripsi: "Light stick portable RGB", status: "rusak", jenis: "FOTOGRAFI", stok: 0 },
  { id: 6, name: "Lighting SL 60W", kode: "LI-002", deskripsi: "Lighting SL 60W dengan light stand", status: "tersedia", jenis: "FOTOGRAFI", stok: 2 },
  { id: 7, name: "USB to HDMI Cable", kode: "USB-001", deskripsi: "tool untuk Menghubungkan USB ke HDMI", status: "tersedia", jenis: "PROG PK", stok: 2 },
  { id: 8, name: "USB Cable", kode: "USB-002", deskripsi: "tool untuk Menghubungkan USB ke komputer", status: "maintenance", jenis: "PROG PK", stok: 2 },
  { id: 9, name: "Solder Sucker", kode: "SLDR-001", deskripsi: "tool untuk Menyedot timah solder", status: "rusak", jenis: "PROG PK", stok: 0 },
  { id: 10, name: "Soldering Stand", kode: "SLDR-002", deskripsi: "tool untuk Menopang solder", status: "tersedia", jenis: "PROG PK", stok: 4 },
  { id: 11, name: "Wacom Intuos Pro Large", kode: "WCM-001", deskripsi: "Wacom Intuos Pro Large PTH-851 Pen Tablet", status: "tersedia", jenis: "WACOM", stok: 1 },
];

/* MAIN PAGE */
const loanPertoolan = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [equipments, setEquipments] = useState(initialEquipments);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterJenis, setFilterJenis] = useState(null);

  const ITEMS_PER_PAGE = 6;

  /* FILTER */
  const filtered = equipments.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      !filterStatus || item.status.toLowerCase() === filterStatus;

    const matchJenis =
      !filterJenis || item.jenis.toLowerCase() === filterJenis.toLowerCase();


    return matchSearch && matchStatus && matchJenis;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    axiosClient
      .get("/get-tool")
      .then(({ data }) => {
        if (Array.isArray(data.data)) {
          const mapped = data.data.map((item) => ({
            id: item.id,
            name: item.tool_name,
            kode: item.tool_code,
            deskripsi: item.tool_description,
            status: item.tool_status,
            jenis: item.jenis || "Pertoolan",
          }));
          setEquipments(mapped);
        }
      })
      .catch((err) => console.error("Gagal memuat pertoolan:", err));
  }, []);

  const statusOptions = [
    ...new Set(equipments.map((item) => item.status))
  ];

  const jenisOptions = [
    ...new Set(equipments.map((item) => item.jenis || "Pertoolan"))
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      {/* ================= MODAL ================= */}
      {selectedEquipment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedEquipment(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-[380px] max-w-[90vw] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="bg-[#3D0C1F] p-4 flex justify-between">
              <div>
                <h2 className="text-white font-bold text-[15px]">
                  {selectedEquipment.name}
                </h2>
                <p className="text-[11px] text-pink-200">
                  Kode: {selectedEquipment.kode}
                </p>
              </div>

              <button
                onClick={() => setSelectedEquipment(null)}
                className="text-white bg-white/20 rounded-full w-7 h-7 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="relative h-[120px] bg-[#DC4C75] overflow-hidden">
              <img
                src={pertoolanImg}
                alt="equipment"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex flex-col gap-2.5">

              <span className={`text-[10px] px-2 py-1 rounded-full w-fit ${statusStyles[selectedEquipment.status]?.bg || "bg-gray-400"} text-white`}>
                {selectedEquipment.status}
              </span>

              {/* TAMBAHAN STOK */}
              <div className="flex items-center gap-1 text-[11px] text-[#3D0C1F] font-semibold">
                <Icon icon="mdi:package-variant" width={14} className="text-pink-500" />
                <span>
                  Stok: <span className="text-pink-500">{selectedEquipment.stok}</span>
                </span>
              </div>

              <p className="text-[11px] text-gray-500 bg-pink-50 p-2.5 rounded-lg">
                {selectedEquipment.deskripsi}
              </p>
            </div>

            {/* FOOTER */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => setSelectedEquipment(null)}
                className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2 text-[12px]"
              >
                Tutup
              </button>

              <button
                onClick={() => onAjukan?.()}
                className="flex-1 flex items-center justify-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2 py-1 rounded-full hover:bg-pink-800/30 transition"
              >
                <Icon icon="mdi:plus" width={11} />
                Ajukan loan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTENT ================= */}
      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4">

        <h1 className="text-[32px] font-extrabold lg:mt-2 mt-12 text-[#2D0A18]">
          Daftar Pertoolan
        </h1>

        <p className="text-gray-500 text-[14px] mb-6">
          Memilih Pertoolan yang tersedia berdasarkan kebutuhan
        </p>

        {/* SEARCH */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg">

          <div className="flex items-center mb-5">
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 border border-pink-200">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="telusuri pertoolan..."
                className="flex-1 outline-none text-sm"
              />
              <button className="bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white rounded-full w-9 h-9 flex items-center justify-center">
                <Icon icon="mdi:magnify" />
              </button>
            </div>
          </div>

          {/* FILTER */}
          {/* FILTER */}
          <div className="flex gap-3 mb-6">
            <select
              value={filterStatus || ""}
              onChange={(e) => {
                setFilterStatus(e.target.value || null);
                setCurrentPage(1);
              }}
              className="border border-pink-300 text-[#C0254A] bg-white rounded-full px-4 py-2 text-sm outline-none"
            >
              <option value="">Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filterJenis || ""}
              onChange={(e) => {
                setFilterJenis(e.target.value || null);
                setCurrentPage(1);
              }}
              className="border border-pink-300 text-[#C0254A] bg-white rounded-full px-4 py-2 text-sm outline-none"
            >
              <option value="">Jenis tool</option>
              {jenisOptions.map((jenis) => (
                <option key={jenis} value={jenis}>
                  {jenis}
                </option>
              ))}
            </select>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {paginated.map((item) => (
              <EquipmentCard
                key={item.kode}
                {...item}
                onDetail={() => setSelectedEquipment(item)}
                onAjukan={() => {
                  setSelectedItem(item);
                  setShowModal(true);
                }}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">

              {/* FIRST PAGE */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition"
              >
                <Icon icon="mdi:chevron-double-left" />
              </button>

              {/* PREV */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition"
              >
                <Icon icon="mdi:chevron-left" />
              </button>

              {/* LEFT ELLIPSIS */}
              {currentPage > 3 && (
                <span className="text-[#C0254A] font-semibold">...</span>
              )}

              {/* PAGE NUMBERS (dynamic like teman kamu) */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === currentPage ||
                    p === currentPage - 1 ||
                    p === currentPage + 1
                  );
                })
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${currentPage === p
                        ? "bg-[#C0254A] text-white shadow-md"
                        : "text-[#C0254A] hover:bg-pink-100"
                      }`}
                  >
                    {p}
                  </button>
                ))}

              {/* RIGHT ELLIPSIS */}
              {currentPage < totalPages - 2 && (
                <span className="text-[#C0254A] font-semibold">...</span>
              )}

              {/* NEXT */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition"
              >
                <Icon icon="mdi:chevron-right" />
              </button>

              {/* LAST PAGE */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition"
              >
                <Icon icon="mdi:chevron-double-right" />
              </button>

              {/* GO TO */}
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
                    if (val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                    }
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
      {showModal && (
        <ModalPengajuan
          pertoolan={selectedItem}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
          }}
        />
      )}

    </div>
  );
};

export default loanPertoolan;