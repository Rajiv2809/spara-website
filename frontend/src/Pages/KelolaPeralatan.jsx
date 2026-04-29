import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import gedung_utama from "../assets/gu601.jpeg";
import peralatanImg from "../assets/peralatan.jpg";

/* =========================
   DATA AWAL
========================= */
const initialAlat = [
  {
    id: 1,
    nama: "Kamera Luminux",
    kode: "KMR-001",
    deskripsi: "Kamera Lumix GH5 Lensa Kit (FOTOGRAFI) - Stok: 2",
    status: "tersedia",
    pic: "Nanda Putra",
  },
  {
    id: 2,
    nama: "Kamera Sony FX 3",
    kode: "KMR-002",
    deskripsi: "Kamera Sony FX 3 Body Only (FOTOGRAFI) - Stok: 1",
    status: "tersedia",
    pic: "Nanda Putra",
  },
  {
    id: 3,
    nama: "GPS Handheld 73",
    kode: "GPS-001",
    deskripsi: "Alat Survey Terestris (PROG PK) - Stok: 2",
    status: "maintenance",
    pic: "Nanda Putra",
  },
  {
    id: 4,
    nama: "GPS Geodetik Topcon GR-5",
    kode: "GPS-002",
    deskripsi: "Alat Survey Terestris (PROG PK) - Stok: 0",
    status: "dipinjam",
    pic: "Nanda Putra",
  },
  {
    id: 5,
    nama: "Lightstick",
    kode: "LI-001",
    deskripsi: "Light stick portable RGB (FOTOGRAFI) - Stok: 0",
    status: "rusak",
    pic: "Nanda Putra",
  },
  {
    id: 6,
    nama: "Lighting SL 60W",
    kode: "LI-002",
    deskripsi: "Lighting SL 60W dengan light stand (FOTOGRAFI) - Stok: 2",
    status: "tersedia",
    pic: "Nanda Putra",
  },
  {
    id: 7,
    nama: "USB to HDMI Cable",
    kode: "USB-001",
    deskripsi: "Menghubungkan USB ke HDMI (PROG PK) - Stok: 2",
    status: "tersedia",
    pic: "Nanda Putra",
  },
  {
    id: 8,
    nama: "USB Cable",
    kode: "USB-002",
    deskripsi: "Menghubungkan USB ke komputer (PROG PK) - Stok: 2",
    status: "maintenance",
    pic: "Nanda Putra",
  },
  {
    id: 9,
    nama: "Solder Sucker",
    kode: "SLDR-001",
    deskripsi: "Menyedot timah solder (PROG PK) - Stok: 0",
    status: "rusak",
    pic: "Nanda Putra",
  },
  {
    id: 10,
    nama: "Soldering Stand",
    kode: "SLDR-002",
    deskripsi: "Penopang solder (PROG PK) - Stok: 4",
    status: "tersedia",
    pic: "Nanda Putra",
  },
  {
    id: 11,
    nama: "Wacom Intuos Pro Large",
    kode: "WCM-001",
    deskripsi: "Pen Tablet PTH-851 (WACOM) - Stok: 1",
    status: "tersedia",
    pic: "Nanda Putra",
  },
];

/* =========================
   CARD
========================= */
const AlatCard = ({ alat, onEdit, onDelete }) => {
  const statusStyles = {
    tersedia: "bg-green-500",
    dipinjam: "bg-orange-400",
    rusak: "bg-red-500",
    maintenance: "bg-red-500",
  };

  const statusText = {
    tersedia: "Tersedia",
    dipinjam: "Dalam Peminjaman",
    rusak: "Rusak",
    maintenance: "Maintenance",
  };

  return (
    <div className="bg-[#F5EDED] rounded-2xl p-3 shadow-md border border-pink-100">
      {/* IMAGE */}
      <div className="relative rounded-xl overflow-hidden h-[200px]">
        <img
          src={alat.foto || peralatanImg}
          className="w-full h-full object-cover"
        />

        {/* STATUS */}
        <div
          className={`absolute top-3 right-3 ${statusStyles[alat.status]} text-white text-[11px] px-4 py-1 rounded-full font-semibold`}
        >
          {statusText[alat.status]}
        </div>

        {/* OVERLAY TEXT */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h2 className="font-bold text-[18px] leading-tight">{alat.nama}</h2>

          <div className="flex items-center gap-1 text-[12px] opacity-90">
            <Icon icon="mdi:tools" width={14} />
            {alat.deskripsi}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3 text-[13px] text-[#3D0C1F]">
        <div className="inline-block border-2 border-gray-400 rounded-full px-3 py-0.5 text-[11px] mb-3 font-semibold">
          {alat.kode}
        </div>

        {/* DETAIL */}
        <div className="space-y-2">
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account" className="text-pink-500 mt-[2px]" />
            <span>
              <b>PIC</b> : {alat.pic}
            </span>
          </div>

          <div className="flex gap-2 items-start">
            <Icon
              icon="mdi:information-outline"
              className="text-pink-500 mt-[2px]"
            />
            <span>
              <b>Deskripsi</b> : {alat.deskripsi}
            </span>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onEdit(alat)}
            className="flex items-center gap-1 bg-[#862440] text-white px-4 py-2 rounded-lg text-[12px] hover:scale-105 transition"
          >
            <Icon icon="mdi:pencil-outline" width={14} />
            Ubah Informasi
          </button>

          <button
            onClick={() => onDelete(alat.id)}
            className="bg-[#862440] text-white p-2 rounded-lg hover:scale-105 transition"
          >
            <Icon icon="mdi:delete-outline" width={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MODAL
========================= */
const ModalAlat = ({ onClose, onSave, editData }) => {
  const [form, setForm] = useState(
    editData || {
      nama: "",
      deskripsi: "",
      status: "tersedia",
      pic: "",
      foto: null,
    },
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-[480px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#3D0C1F] p-4 text-white flex justify-between">
          <h2 className="font-bold text-[18px]">
            {editData ? "Edit Alat" : "Tambah Alat"}
          </h2>
          <button onClick={onClose}>×</button>
        </div>

        {/* BODY */}
        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          <label className="text-[12px] font-semibold">Nama Peralatan</label>
          <input
            name="nama"
            placeholder="Nama Alat"
            value={form.nama}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <label className="text-[12px] font-semibold">PIC</label>
          <input
            name="pic"
            placeholder="PIC"
            value={form.pic}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <label className="text-[12px] font-semibold">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="tersedia">Tersedia</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="rusak">Rusak</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <label className="text-[12px] font-semibold">Deskripsi</label>
          <textarea
            name="deskripsi"
            placeholder="Deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            className="border p-2 w-full rounded min-h-[80px]"
          />

          <label className="text-[12px] font-semibold">Foto Alat</label>

          <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 transition">
            <Icon
              icon="mdi:cloud-upload-outline"
              className="text-3xl text-gray-400 mb-2"
            />

            <p className="text-[12px] text-gray-500">Klik untuk upload foto</p>

            <p className="text-[10px] text-gray-400">PNG / JPG</p>

            <input
              type="file"
              onChange={(e) =>
                setForm({
                  ...form,
                  foto: URL.createObjectURL(e.target.files[0]),
                })
              }
              className="hidden"
            />

            {form.foto && (
              <img
                src={form.foto}
                className="mt-2 w-full h-32 rounded-lg object-cover border"
              />
            )}
          </label>
        </div>

        {/* FOOTER */}
        <div className="p-4 flex gap-2">
          <button onClick={onClose} className="flex-1 border rounded py-2">
            Batal
          </button>

          <button
            onClick={() => onSave(form)}
            className="flex-1 bg-[#C0254A] text-white rounded py-2"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MAIN PAGE
========================= */
const KelolaPeralatan = () => {
  const [alat, setAlat] = useState(initialAlat);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  /* CRUD */
  const handleSave = (data) => {
    if (editData) {
      setAlat(
        alat.map((a) => (a.id === editData.id ? { ...data, id: a.id } : a)),
      );
    } else {
      setAlat([...alat, { ...data, id: Date.now() }]);
    }

    setShowModal(false);
    setEditData(null);
  };

  const handleDelete = (id) => {
    setAlat(alat.filter((a) => a.id !== id));
  };

  const tersedia = alat.filter((a) => a.status === "tersedia").length;
  const dipinjam = alat.filter((a) => a.status === "dipinjam").length;
  const rusak = alat.filter((a) => a.status === "rusak").length;
  const maintenance = alat.filter((a) => a.status === "maintenance").length;

  const totalPages = Math.ceil(alat.length / ITEMS_PER_PAGE);

  const paginatedAlat = alat.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // opsional (lebih rapi)
  const tidakTersedia = rusak + maintenance;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      <div className="ml-[300px] flex flex-col flex-1 p-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[#2D0A18] text-[32px] font-extrabold">
              Halaman Kelola Peralatan
            </h1>
            <p className="text-gray-500 text-[14px] mt-1">
              Lihat dan kelola seluruh alat yang dapat dipinjam dalam sistem
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-400 text-white px-6 py-2 rounded-lg text-sm"
          >
            + Tambah Alat
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[#8B1E3F] to-[#C0254A] text-white p-6 rounded-3xl flex justify-between items-center shadow-lg">
            <div>
              <p className="text-sm font-semibold">PERALATAN TERSEDIA</p>
              <h2 className="text-5xl font-extrabold">{tersedia}</h2>
              <p className="text-xs opacity-80 italic">Dapat dipinjam</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#C0254A] to-[#FF4D8D] text-white p-6 rounded-3xl flex justify-between items-center shadow-lg">
            <div>
              <p className="text-sm font-semibold">MENUNGGU PERSETUJUAN</p>
              <h2 className="text-5xl font-extrabold">{dipinjam}</h2>
              <p className="text-xs opacity-80 italic">Menunggu disetujui</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#FF4D8D] to-[#F8BFA6] text-white p-6 rounded-3xl flex justify-between items-center shadow-lg">
            <div>
              <p className="text-sm font-semibold">PERALATAN TIDAK TERSEDIA</p>
              <h2 className="text-5xl font-extrabold">{maintenance}</h2>
              <p className="text-xs opacity-80 italic">Dalam perbaikan</p>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedAlat.map((item) => (
            <AlatCard
              key={item.id}
              alat={item}
              onEdit={(data) => {
                setEditData(data);
                setShowModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-8">
          {totalPages > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-double-left" />
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-left" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === currentPage ||
                    p === currentPage - 1 ||
                    p === currentPage + 1,
                )
                .map((p) => (
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

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-right" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-double-right" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <ModalAlat
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
          onSave={handleSave}
          editData={editData}
        />
      )}
    </div>
  );
};

export default KelolaPeralatan;
