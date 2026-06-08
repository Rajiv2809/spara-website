import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import gedung_utama from "../assets/gu601.jpeg";

const initialRooms = [
  {
    id: 1,
    nama_ruangan: "Workspace Multimedia",
    kode_ruangan: "GU-604",
    id_gedung: "Gedung Utama",
    nomor_lantai: "1",
    status_ruangan: "tersedia",
    kapasitas: 30,
    fasilitas: "Proyektor, AC, Whiteboard, WiFi, TV LED",
    nomor_induk_pic: 22001,
    pic: "Noper Ardi, S.T, M.Eng",
    path_foto: "",
  },
  {
    id: 2,
    nama_ruangan: "Lab Motion Capture",
    kode_ruangan: "GU-607",
    lokasi: "Gedung Utama - Lantai 3",
    status: "tersedia",
    kapasitas: 20,
    fasilitas: "Motion Capture, PC, Green Screen",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 3,
    nama: "Workspace Software Development",
    kode: "GU-704",
    lokasi: "Gedung Utama - Lantai 2",
    status: "dipinjam",
    kapasitas: 40,
    fasilitas: "32 PC, Proyektor, WiFi",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 4,
    nama: "Cyber Physical Security Lab",
    kode: "TA-X-3",
    lokasi: "Gedung Utama - Lantai 4",
    status: "perbaikan",
    kapasitas: 25,
    fasilitas: "Server Rack, Firewall",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 5,
    nama: "Workspace Cyber Forensic",
    kode: "TA-XI-5A",
    lokasi: "Gedung Utama - Lantai 4",
    status: "tersedia",
    kapasitas: 15,
    fasilitas: "PC Forensik, Write Blocker",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 6,
    nama: "Lab Clay Modeling",
    kode: "GT-L1-006",
    lokasi: "Gedung Utama - Lantai 1",
    status: "tersedia",
    kapasitas: 20,
    fasilitas: "Oven Keramik, Meja Kerja",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 7,
    nama: "Workspace Remote Sensing",
    kode: "GT-L3-007",
    lokasi: "Gedung Utama - Lantai 3",
    status: "dipinjam",
    kapasitas: 30,
    fasilitas: "Drone, GPS Tools",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 8,
    nama: "Hydrographic Survey Lab",
    kode: "GT-L1-008",
    lokasi: "Gedung Technopreneur - Lantai 1",
    status: "tersedia",
    kapasitas: 18,
    fasilitas: "Sonar, Survey Tools",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 9,
    nama: "Studio Podcast & Broadcasting",
    kode: "GT-L3-009",
    lokasi: "Gedung Technopreneur - Lantai 3",
    status: "tersedia",
    kapasitas: 8,
    fasilitas: "Mic, Kamera, Lighting",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 10,
    nama: "Ruang Inkubator Startup",
    kode: "GT-L4-010",
    lokasi: "Gedung Technopreneur - Lantai 4",
    status: "tersedia",
    kapasitas: 35,
    fasilitas: "Sofa, Standing Desk",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 11,
    nama: "Lab Augmented Reality",
    kode: "GT-L2-011",
    lokasi: "Gedung Technopreneur - Lantai 2",
    status: "perbaikan",
    kapasitas: 22,
    fasilitas: "AR Headset, PC",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 12,
    nama: "Workspace IoT Development",
    kode: "GT-L1-012",
    lokasi: "Gedung Technopreneur - Lantai 1",
    status: "tersedia",
    kapasitas: 28,
    fasilitas: "Arduino, Raspberry Pi",
    pic: "Noper Ardi, S.T, M.Eng",
  },
  {
    id: 13,
    nama: "GDS Rempang Multimedia",
    kode: "GU-L1-013",
    lokasi: "Gedung Utama - Lantai 1",
    status: "tersedia",
    kapasitas: 50,
    fasilitas: "Sound System, TV LED",
    pic: "Noper Ardi, S.T, M.Eng",
  },
];

// CARD
const RoomCard = ({ room, onEdit, onDelete }) => {
  const statusStyles = {
    tersedia: "bg-green-500",
    dipinjam: "bg-orange-400",
    perbaikan: "bg-red-500",
  };

  const statusText = {
    tersedia: "Tersedia",
    dipinjam: "Dalam Peminjaman",
    perbaikan: "Perbaikan",
  };

  return (
    <div className="bg-[#F5EDED] rounded-2xl p-3 shadow-md border border-pink-100">
      {/* IMAGE */}
      <div className="relative rounded-xl overflow-hidden h-[200px]">
        <img
          src={room.foto || gedung_utama}
          className="w-full h-full object-cover"
        />

        <div
          className={`absolute top-3 right-3 ${statusStyles[room.status]} text-white text-[11px] px-4 py-1 rounded-full font-semibold`}
        >
          {statusText[room.status]}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h2 className="font-bold text-[18px] leading-tight">{room.nama}</h2>

          <div className="flex items-center gap-1 text-[12px] opacity-90">
            <Icon icon="mdi:map-marker" width={14} />
            {room.id_gedung} - Lantai {room.nomor_lantai}
          </div>
        </div>
      </div>

      <div className="p-3 text-[13px] text-[#3D0C1F]">
        <div className="inline-block border-2 border-gray-400 rounded-full px-3 py-0.5 text-[11px] mb-3 font-semibold">
          {room.kode_ruangan}
        </div>

        {/* DETAIL */}
        <div className="space-y-2">
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account" className="text-pink-500 mt-[2px]" />
            <span>
              <b>PIC</b> : {room.pic}
            </span>
          </div>

          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account-group" className="text-pink-500 mt-[2px]" />
            <span>
              <b>Kapasitas</b> : {room.kapasitas} Orang
            </span>
          </div>

          <div className="flex gap-2 items-start">
            <Icon
              icon="mdi:office-building"
              className="text-pink-500 mt-[2px]"
            />
            <span>
              <b>Fasilitas</b> : {room.fasilitas}
            </span>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onEdit(room)}
            className="flex items-center gap-1 bg-[#862440] text-white px-4 py-2 rounded-lg text-[12px] hover:scale-105 transition"
          >
            <Icon icon="mdi:pencil-outline" width={14} />
            Ubah Informasi
          </button>

          <button
            onClick={() => onDelete(room.id)}
            className="bg-[#862440] text-white p-2 rounded-lg hover:scale-105 transition"
          >
            <Icon icon="mdi:delete-outline" width={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* MODAL */
const ModalRuangan = ({ onClose, onSave, editData }) => {
  const [form, setForm] = useState(
    editData || {
      kode_ruangan: "",
      nama: "",
      lokasi: "",
      kapasitas: "",
      fasilitas: "",
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
            {editData ? "Edit Ruangan" : "Tambah Ruangan"}
          </h2>

          <button onClick={onClose}>×</button>
        </div>

        {/* BODY */}
        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          <label classname="text-[12px] font-semibold">Kode Ruangan</label>
          <input
            name="kode_ruangan"
            value={form.kode_ruangan}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />
          <label className="text-[12px] font-semibold">Nama Ruangan:</label>
          <input
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />
          <label className="text-[12px] font-semibold">Lokasi:</label>
          <input
            name="lokasi"
            value={form.lokasi}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />
          <label className="text-[12px] font-semibold">Kapasitas</label>
          <input
            name="kapasitas"
            value={form.kapasitas}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />
          <label className="text-[12px] font-semibold">PIC</label>
          <input
            name="pic"
            value={form.pic}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />
          <label className="text-[12px] font-semibold">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          >
            <option value="tersedia">Tersedia</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="perbaikan">Perbaikan</option>
          </select>

          <label className="text-[12px] font-semibold">Fasilitas</label>
          <textarea
            name="fasilitas"
            value={form.fasilitas}
            onChange={handleChange}
            className="border p-2 rounded text-[12px] min-h-[100px] resize  "
          />
          <label className="text-[12px] font-semibold">Foto Ruangan</label>
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 transition">
            <Icon
              icon="mdi:cloud-upload-outline"
              className="text-3xl text-gray-400 mb-2"
            />
            <p className="text-[12px] text-gray-500">
              {" "}
              Klik untuk upload foto{" "}
            </p>
            <p className="text-[10px] text-gray-400">PNG / JPG </p>
            <input
              type="file"
              onChange={(e) =>
                setForm({
                  ...form,
                  foto: URL.createObjectURL(e.target.files[0]),
                })
              }
              className="hidden"
            />{" "}
            {form.foto && (
              <img
                src={form.foto}
                className="mt-2 h-20 rounded-lg object-cover"
              />
            )}
          </label>
        </div>

        {/* FOOTER */}
        <div className="p-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2 text-[12px]"
          >
            Batal
          </button>

          <button
            onClick={() => onSave(form)}
            className="flex-1 bg-[#C0254A] text-white rounded-full py-2 text-[12px]"
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
const KelolaRuangan = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // CRUD LOCAL
  const handleSave = (data) => {
    if (editData) {
      setRooms(
        rooms.map((r) => (r.id === editData.id ? { ...data, id: r.id } : r)),
      );
    } else {
      setRooms([...rooms, { ...data, id: Date.now() }]);
    }

    setShowModal(false);
    setEditData(null);
  };

  const handleDelete = (id) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  /* STATS */
  const tersedia = rooms.filter((r) => r.status === "tersedia").length;
  const dipinjam = rooms.filter((r) => r.status === "dipinjam").length;
  const perbaikan = rooms.filter((r) => r.status === "perbaikan").length;
  const totalPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);

  const paginatedRooms = rooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      <div className="ml-[300px] flex flex-col flex-1 p-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[#2D0A18] text-[32px] font-extrabold">
              Halaman Kelola Ruangan
            </h1>
            <p className="text-gray-500 text-[14px] mt-1">
              Lihat dan kelola seluruh ruangan yang dapat dipinjam dalam sistem
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-400 text-white px-6 py-2 rounded-lg text-sm"
          >
            + Tambah Ruangan
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[#8B1E3F] to-[#C0254A] text-white p-6 rounded-3xl flex justify-between items-center shadow-lg">
            <div>
              <p className="text-sm font-semibold">RUANGAN TERSEDIA</p>
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
              <p className="text-sm font-semibold">RUANGAN TIDAK TERSEDIA</p>
              <h2 className="text-5xl font-extrabold">{perbaikan}</h2>
              <p className="text-xs opacity-80 italic">Dalam perbaikan</p>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
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
        <ModalRuangan
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

export default KelolaRuangan;
