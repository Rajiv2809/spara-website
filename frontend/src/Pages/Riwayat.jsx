import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import axiosClient from "../axios";

const statusStyles = {
  disetujui: "bg-green-500",
  selesai: "bg-green-500",
  ditolak: "bg-red-500",
  menunggu: "bg-yellow-500",
  dibatalkan: "bg-gray-400",
};

const Riwayat = () => {
  const [ruanganHistory, setRuanganHistory] = useState([]);
  const [alatHistory, setAlatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/riwayat")
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRuanganHistory(data.filter((d) => d.ruangan != null));
        setAlatHistory(data.filter((d) => d.alat != null));
      })
      .catch((err) => {
        console.error("Gagal mengambil riwayat:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F8EDEB] to-[#EAD2CF]">
      <Sidebar />

      <div className="ml-[300px] flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-[34px] font-extrabold text-[#2D0A18]">
          Riwayat Peminjaman
        </h1>

        <p className="text-gray-500 text-[14px] mb-8">
          Melihat riwayat peminjaman ruangan dan peralatan yang telah dilakukan
        </p>

        {/* CONTAINER CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ================= RUANGAN ================= */}
          <div className="bg-white rounded-3xl shadow-lg p-6 w-[450px]">

            {/* HEADER CARD */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-[18px] text-[#3D0C1F]">
                  Peminjaman Ruangan
                </h2>
                <p className="text-gray-400 text-[12px]">
                  Peminjaman Ruangan yang sudah pernah diajukan
                </p>
              </div>

              <button className="text-orange-500 border border-orange-400 px-4 py-1 rounded-full text-[12px] hover:bg-orange-50">
                Lihat Semua
              </button>
            </div>

            {/* HEADER TABLE */}
            <div className="grid grid-cols-3 text-gray-400 text-[12px] font-semibold border-b pb-2 mb-2">
              <span>Ruangan</span>
              <span className="text-center">Tanggal</span>
              <span className="text-center">Status</span>
            </div>

            {/* ROW */}
            {loading ? (
              <div className="py-6 text-center text-gray-500">Memuat riwayat ruangan...</div>
            ) : ruanganHistory.length === 0 ? (
              <div className="py-6 text-center text-gray-500">Belum ada riwayat peminjaman ruangan.</div>
            ) : (
              ruanganHistory.map((item, i) => (
                <div key={i} className="grid grid-cols-3 items-center py-3 border-b last:border-none">
                  <span className="text-[#C0254A] font-semibold">{item.ruangan || "-"}</span>
                  <span className="text-center text-gray-600">{new Date(item.hari_tanggal).toLocaleDateString("id-ID")}</span>
                  <div className="flex justify-center">
                    <span
                      className={`text-white text-[10px] font-bold px-3 py-1 rounded-full w-[110px] text-center tracking-wide ${
                        statusStyles[item.status_persetujuan] || "bg-gray-400"
                      }`}
                    >
                      {(item.status_persetujuan || "").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 w-[450px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-[18px] text-[#3D0C1F]">Peminjaman Peralatan</h2>
                <p className="text-gray-400 text-[12px]">Peminjaman alat yang sudah pernah diajukan</p>
              </div>
              <button className="text-orange-500 border border-orange-400 px-4 py-1 rounded-full text-[12px] hover:bg-orange-50">
                Lihat Semua
              </button>
            </div>

            <div className="grid grid-cols-3 text-gray-400 text-[12px] font-semibold border-b pb-2 mb-2">
              <span>Alat</span>
              <span className="text-center">Tanggal</span>
              <span className="text-center">Status</span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-gray-500">Memuat riwayat peralatan...</div>
            ) : alatHistory.length === 0 ? (
              <div className="py-6 text-center text-gray-500">Belum ada riwayat peminjaman peralatan.</div>
            ) : (
              alatHistory.map((item, i) => (
                <div key={i} className="grid grid-cols-3 items-center py-3 border-b last:border-none">
                  <span className="text-[#C0254A] font-semibold">{item.alat || "-"}</span>
                  <span className="text-center text-gray-600">{new Date(item.hari_tanggal).toLocaleDateString("id-ID")}</span>
                  <div className="flex justify-center">
                    <span
                      className={`text-white text-[10px] font-bold px-3 py-1 rounded-full w-[110px] text-center tracking-wide ${
                        statusStyles[item.status_persetujuan] || "bg-gray-400"
                      }`}
                    >
                      {(item.status_persetujuan || "").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riwayat;