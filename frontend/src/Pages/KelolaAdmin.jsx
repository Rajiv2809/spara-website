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

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[500px] shadow-xl">
        <div className="bg-[#862440] text-white p-4 rounded-t-2xl flex justify-between">
          <h2 className="font-bold">
            {editData ? "Edit Admin" : "Tambah Admin"}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          <input
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Nama Admin"
            className="border p-2 rounded w-full"
          />

          <input
            name="nomorInduk"
            value={form.nomorInduk}
            onChange={handleChange}
            placeholder="Nomor Induk"
            className="border p-2 rounded w-full"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded w-full"
          />

          <input
            name="telepon"
            value={form.telepon}
            onChange={handleChange}
            placeholder="No Telepon"
            className="border p-2 rounded w-full"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        <div className="p-4 flex gap-2">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2">
            Batal
          </button>

          <button
            onClick={() => onSave(form)}
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
          a.id === editData.id ? { ...data, id: editData.id } : a
        )
      );
    } else {
      setAdmins((prev) => [
        ...prev,
        { ...data, id: Date.now() },
      ]);
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      <div className="ml-[300px] flex-1 p-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#2D0A18]">
              Kelola Admin
            </h1>
            <p className="text-gray-500">
              Kelola akun administrator sistem
            </p>
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
        <div className="grid lg:grid-cols-3 gap-12 mt-8">

          <div className="bg-gradient-to-r from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow h-[140px] relative">
            <Icon icon="mdi:account-group-outline" className="absolute top-0 right-0 text-white/20" width="140" />
            <h3 className="text-white font-bold">TOTAL ADMIN</h3>
            <h1 className="text-white text-5xl font-bold mt-2">{totalAdmin}</h1>
          </div>

          <div className="bg-gradient-to-r from-[#FF7A00] to-[#FFB347] p-4 rounded-2xl shadow h-[140px] relative">
            <Icon icon="mdi:account-check-outline" className="absolute top-0 right-0 text-white/20" width="140" />
            <h3 className="text-white font-bold">ADMIN AKTIF</h3>
            <h1 className="text-white text-5xl font-bold mt-2">{aktif}</h1>
          </div>

          <div className="bg-gradient-to-r from-[#8B1E3F] to-[#5C0F24] p-4 rounded-2xl shadow h-[140px] relative">
            <Icon icon="mdi:account-off-outline" className="absolute top-0 right-0 text-white/20" width="140" />
            <h3 className="text-white font-bold">ADMIN NONAKTIF</h3>
            <h1 className="text-white text-5xl font-bold mt-2">{nonaktif}</h1>
          </div>

        </div>

        {/* =========================
            TABLE ADMIN (REPLACE CARD)
        ========================= */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mt-10">

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
                <span className={`text-white text-xs px-3 py-1 rounded-full ${
                  admin.status === "aktif"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}>
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
  );
};

export default KelolaAdmin;