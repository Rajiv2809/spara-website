import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";

/* =========================
   DATA AWAL
========================= */
const initialAdmin = [
  {
    id: 1,
    nama: "Admin Utama",
    nomorInduk: "10000001",
    email: "admin@kampus.ac.id",
    telepon: "081200000001",
    status: "aktif",
  },
  {
    id: 2,
    nama: "Admin Akademik",
    nomorInduk: "10000002",
    email: "admin2@kampus.ac.id",
    telepon: "081200000002",
    status: "aktif",
  },
];

/* =========================
   MODAL
========================= */
const ModalAdmin = ({ onClose, onSave, editData }) => {
  const [form, setForm] = useState({
    nama: "",
    nomorInduk: "",
    email: "",
    telepon: "",
    status: "aktif",
  });

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !form.nama.trim() ||
      !form.nomorInduk.trim() ||
      !form.email.trim() ||
      !form.telepon.trim()
    ) {
      alert("Semua field wajib diisi!");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[500px] shadow-xl">
        <div className="bg-[#862440] text-white p-4 rounded-t-2xl flex justify-between">
          <h2 className="font-bold">
            {editData ? "Edit Admin" : "Tambah Admin"}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4 text-black">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Admin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama admin"
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#862440]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nomor Induk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nomorInduk"
              value={form.nomorInduk}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm((prev) => ({
                  ...prev,
                  nomorInduk: value,
                }));
              }}
              placeholder="Masukkan nomor induk"
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#862440]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan email"
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#862440]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              No Hp<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="telepon"
              value={form.telepon}
              maxLength={15}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm((prev) => ({
                  ...prev,
                  telepon: value,
                }));
              }}
              placeholder="Masukkan nomor telepon"
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#862440]"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#862440]"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="p-4 flex gap-2">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2">
            Batal
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#862440] text-white rounded-lg py-2"
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
const KelolaAdmin = () => {
  const [admins, setAdmins] = useState(initialAdmin);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleSave = (data) => {
    if (editData) {
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editData.id ? { ...data, id: editData.id } : a,
        ),
      );
    } else {
      setAdmins((prev) => [...prev, { ...data, id: Date.now() }]);
    }

    setShowModal(false);
    setEditData(null);
  };

  const handleDelete = (id) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  const totalAdmin = admins.length;
  const aktif = admins.filter((a) => a.status === "aktif").length;
  const nonaktif = admins.filter((a) => a.status === "nonaktif").length;

  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      <Sidebar />

      <div className="min-w-[300px] min-h-screen flex flex-col px-3">
        <div className="dashboard md:p-[50px] p-4 lg:ml-[300px]">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-[32px] font-extrabold text-[#2D0A18]">
                Kelola Admin
              </h1>
              <p className="text-gray-500">Kelola akun administrator sistem</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-[#862440] text-white px-5 py-2 rounded-lg"
            >
              + Tambah Admin
            </button>
          </div>

          {/* =========================
            STATS CARD 
        ========================= */}
          <div className="grid lg:grid-cols-3 grid-rows-3 lg:grid-rows-1 mt-8 gap-12">
            {/* Card 1 */}
            <div className="bg-gradient-to-r relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
              <Icon
                icon="mingcute:projector-line"
                className="absolute -top-4 -right-0 text-[#E75072]/50 z-0"
                width="160"
              />
              <div className="relative z-10">
                <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                  TOTAL ADMIN
                </h3>
                <h1 className="text-white text-5xl font-bold mt-2">
                  {totalAdmin}
                </h1>
              </div>
            </div>

            <div className="bg-gradient-to-b relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
              <Icon
                icon="material-symbols:meeting-room-outline-rounded"
                className="absolute -top-2 -right-0 text-[#E75072]/50 z-0"
                width="160"
              />
              <div className="relative z-10">
                <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                  ADMIN AKTIF
                </h3>
                <h1 className="text-white text-5xl font-bold mt-2">{aktif}</h1>
              </div>
            </div>

            <div className="bg-gradient-to-l relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
              <Icon
                icon="streamline-ultimate:task-list-approve-bold"
                className="absolute top-1 right-2 text-[#FF6386]/40 z-0"
                width="130"
              />
              <div className="relative z-10">
                <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                  ADMIN NONAKTIF
                </h3>
                <h1 className="text-white text-5xl font-bold mt-2">
                  {nonaktif}
                </h1>
              </div>
            </div>
          </div>

          {/* =========================
            TABLE ADMIN (REPLACE CARD)
        ========================= */}
          <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl mt-8">
            <h2 className="text-xl font-bold mb-4">Daftar Admin</h2>

            {/* HEADER TABLE */}
            <div className="grid grid-cols-6 text-gray-500 text-sm font-semibold border-b pb-3">
              <span>Nama</span>
              <span>Nomor Induk</span>
              <span>Email</span>
              <span>Telepon</span>
              <span className="text-center">Status</span>
              <span className="text-center">Aksi</span>
            </div>

            {/* ROW TABLE */}
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-6 items-center py-4 border-b last:border-none"
              >
                <span className="font-semibold text-[#C0254A]">
                  {admin.nama}
                </span>

                <span>{admin.nomorInduk}</span>
                <span className="truncate">{admin.email}</span>
                <span>{admin.telepon}</span>

                <div className="flex justify-center">
                  <span
                    className={`text-white text-xs px-3 py-1 rounded-full ${
                      admin.status === "aktif" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {admin.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditData(admin);
                      setShowModal(true);
                    }}
                    className="bg-[#862440] text-white p-2 rounded-lg"
                  >
                    <Icon icon="mdi:pencil" />
                  </button>

                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="bg-red-500 text-white p-2 rounded-lg"
                  >
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <ModalAdmin
            editData={editData}
            onClose={() => {
              setShowModal(false);
              setEditData(null);
            }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};

export default KelolaAdmin;
