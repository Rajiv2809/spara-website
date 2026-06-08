import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import gedung_utama from "../assets/gu601.jpeg";
import axiosClient from "../axios";

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
      <div className="relative rounded-xl overflow-hidden h-[200px]">
        <img
          src={room.path_foto || gedung_utama}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-3 right-3 ${statusStyles[room.status_ruangan]} text-white text-[11px] px-4 py-1 rounded-full font-semibold`}
        >
          {statusText[room.status_ruangan]}
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

        <div className="space-y-2">
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account" className="text-pink-500 mt-[2px]" />
            <span>
              <b>PIC</b> : {room.pic} ({room.nomor_induk_pic}) {/* nanti disesuaiin lagi*/}
            </span>
          </div>
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account-group" className="text-pink-500 mt-[2px]" />
            <span>
              <b>Kapasitas</b> : {room.kapasitas} Orang
            </span>
          </div>
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:office-building" className="text-pink-500 mt-[2px]" />
            <span>
              <b>Fasilitas</b> : {room.fasilitas}
            </span>
          </div>
        </div>

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

const ModalRuangan = ({ onClose, onSave, editData }) => {

  const picMap = {
    22001: "Noper Ardi, S.T., M.Eng",
    22002: "Budi Santoso",
    22003: "Andi Wijaya",
  };

  const [form, setForm] = useState(
    editData || {
      kode_ruangan: "",
      nama: "",
      id_gedung: "",
      nomor_lantai: "",
      kapasitas: "",
      fasilitas: "",
      status: "tersedia",
      pic: "",
      foto: null,
    }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-[480px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#3D0C1F] p-4 text-white flex justify-between">
          <h2 className="font-bold text-[18px]">
            {editData ? "Edit Ruangan" : "Tambah Ruangan"}
          </h2>
          <button onClick={onClose}>×</button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          <label className="text-[12px] font-semibold">Kode Ruangan</label>
          <input
            name="kode_ruangan"
            value={form.kode_ruangan}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />

          <label className="text-[12px] font-semibold">Nama Ruangan</label>
          <input
            name="nama_ruangan"
            value={form.nama_ruangan}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />

          <label className="text-[12px] font-semibold">Gedung</label>
          <input
            name="id_gedung"
            value={form.id_gedung}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />

          <label className="text-[12px] font-semibold">Nomor Lantai</label>
          <input
            name="nomor_lantai"
            value={form.nomor_lantai}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />

          <label className="text-[12px] font-semibold">Kapasitas</label>
          <input
            type="number"
            name="kapasitas"
            value={form.kapasitas}
            onChange={handleChange}
            className="border p-2 rounded text-[12px]"
          />

          <label className="text-[12px] font-semibold">PIC</label>
          <select
            name="nomor_induk_pic"
            value={form.nomor_induk_pic}
            onChange={(e) => {
              const nomorPIC = Number(e.target.value);

              setForm({
                ...form,
                nomor_induk_pic: nomorPIC,
                pic: picMap[nomorPIC],
              });
            }}
            className="border p-2 rounded text-[12px]"
          />

          <label className="text-[12px] font-semibold">Status</label>
          <select
            name="status_ruangan"
            value={form.status_ruangan}
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
            className="border p-2 rounded text-[12px] min-h-[100px] resize"
          />

          <label className="text-[12px] font-semibold">Foto Ruangan</label>
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 transition">
            <Icon icon="mdi:cloud-upload-outline" className="text-3xl text-gray-400 mb-2" />
            <p className="text-[12px] text-gray-500">Klik untuk upload foto</p>
            <p className="text-[10px] text-gray-400">PNG / JPG</p>
            <input
              type="file"
              onChange={(e) =>
                setForm({ ...form, foto: URL.createObjectURL(e.target.files[0]) })
              }
              className="hidden"
            />
            {form.foto && (
              <img src={form.foto} className="mt-2 h-20 rounded-lg object-cover" />
            )}
          </label>
        </div>

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

const KelolaRuangan = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    axiosClient
      .get("/get-ruangan")
      .then(({ data }) => {
        const mapped = data.data.map((item) => ({
          id: item.id,
          nama: item.nama_ruangan,
          kode_ruangan: item.kode_ruangan,
          id_gedung: item.id_gedung,
          nomor_lantai: item.nomor_lantai,
          status: item.status_ruangan,
          kapasitas: item.kapasitas,
          fasilitas: item.fasilitas,
          pic: item.pic,
          foto: item.path_foto || null,
        }));
        setRooms(mapped);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = (data) => {
    if (editData) {
      setRooms(rooms.map((r) => (r.id === editData.id ? { ...data, id: r.id } : r)));
    } else {
      setRooms([...rooms, { ...data, id: Date.now() }]);
    }
    setShowModal(false);
    setEditData(null);
  };

  const handleDelete = (id) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  const tersedia = rooms.filter((r) => r.status === "tersedia").length;
  const dipinjam = rooms.filter((r) => r.status === "dipinjam").length;
  const perbaikan = rooms.filter((r) => r.status === "perbaikan").length;
  const totalPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);

  const paginatedRooms = rooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center h-40 text-[#C0254A] font-semibold text-lg">
            Memuat data ruangan...
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm">
            Tidak ada data ruangan.
          </div>
        ) : (
          <>
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
                        p === currentPage + 1
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          </>
        )}
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