import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import AktivitasTerbaru from "../Components/AktivitasTerbaru";
import { Icon } from "@iconify/react";
import axiosClient from "../axios"

const Dashboard = () => {
  const navigate = useNavigate();
  const [peminjaman, setPeminjaman] = useState([]);
  const [stats, setStats] = useState({ total_alat: 0, total_ruangan: 0, alat_dipinjam: 0, ruangan_dipinjam: 0, perlu_disetujui: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosClient.get("/peminjaman"),
      axiosClient.get("/dashboard-stats"),
    ])
      .then(([peminjamanRes, statsRes]) => {
        setPeminjaman(peminjamanRes.data.peminjaman || []);
        setStats(statsRes.data);
      })
      .catch((err) => {
        console.error("Gagal mengambil data dashboard:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "disetujui":
        return { bg: "bg-[#8BB166]", label: "DISETUJUI" };
      case "ditolak":
        return { bg: "bg-[#B16666]", label: "DITOLAK" };
      default:
        return { bg: "bg-[#999999]", label: "MENUNGGU" };
    }
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      <Sidebar />
      <div className="min-w-[300px] min-h-screen text-white flex flex-col px-3">
        <div className="dasboard md:p-[50px] p-4 lg:ml-[300px]">
          <h1 className="text-[#481020] text-[36px] font-extrabold font-poppins">
            Halaman Dasbor
          </h1>
          <h1 className="text-[#666666] text-[20px] font-regular font-poppins">
            Lihat ringkasan data secara keseluruhan dalam aplikasi
          </h1>

          {/* Stats Cards */}
          <div className="grid lg:grid-cols-3 grid-rows-3 lg:grid-rows-1 mt-8 gap-12">
            {/* Card 1 — Total Peralatan */}
            <div className="bg-gradient-to-r relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
              <Icon
                icon="mingcute:projector-line"
                className="absolute -top-4 -right-0 text-[#E75072]/50 z-0"
                width="160"
              />
              <div className="relative z-10">
                <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                  TOTAL PERALATAN
                </h3>
                <h1 className="text-[#EEEEEE] text-[64px] font-extrabold font-poppins leading-none mt-2">
                  {loading ? "..." : stats.total_alat}
                </h1>
                <h1 className="text-[#EEEEEE] text-[14px] italic font-thin font-poppins text-end leading-none">
                  {stats.alat_dipinjam} Dalam peminjaman
                </h1>
              </div>
            </div>

            {/* Card 2 — Total Ruangan */}
            <div className="bg-gradient-to-b relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
              <Icon
                icon="ph:door-open-bold"
                className="absolute -top-2 -right-0 text-[#E75072]/50 z-0"
                width="160"
              />
              <div className="relative z-10">
                <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                  TOTAL RUANGAN
                </h3>
                <h1 className="text-[#EEEEEE] text-[64px] font-extrabold font-poppins leading-none mt-2">
                  {loading ? "..." : stats.total_ruangan}
                </h1>
                <h1 className="text-[#EEEEEE] text-[14px] italic font-thin font-poppins text-end leading-none">
                  {stats.ruangan_dipinjam} Dalam peminjaman
                </h1>
              </div>
            </div>

            {/* Card 3 — Perlu Disetujui */}
            <div className="bg-gradient-to-l relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
              <Icon
                icon="streamline-ultimate:task-list-approve-bold"
                className="absolute top-1 right-2 text-[#FF6386]/40 z-0"
                width="130"
              />
              <div className="relative z-10">
                <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                  PERLU DISETUJUI
                </h3>
                <h1 className="text-[#EEEEEE] text-[64px] font-extrabold font-poppins leading-none mt-2">
                  {loading ? "..." : stats.perlu_disetujui}
                </h1>
                <h1 className="text-[#EEEEEE] text-[14px] italic font-thin font-poppins text-end leading-none">
                  Menunggu Disetujui
                </h1>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-[3fr_2fr] grid-cols-1 gap-6 mt-8">
            {/* Peminjaman yang Diajukan */}
            <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl">
              <div className="relative z-10">
                <h3 className="text-[#471020] text-[24px] font-bold">
                  Peminjaman yang Diajukan
                </h3>
                <button onClick={() => navigate("/riwayat")} className="absolute top-2 right-2 border-2 border-[#F2A31A] text-[#F2A31A] px-4 py-1 rounded-xl font-semibold hover:bg-[#F2A31A] hover:text-white transition duration-300">
                  Lihat Semua
                </button>
                <h2 className="text-[#BC8D9B] text-[14px] font-regular">
                  Beberapa peminjaman yang baru-baru ini diajukan
                </h2>

                <div className="custom-scroll bg-[#EEEEEE] relative p-4 rounded-2xl mt-4 max-h-[324px] overflow-y-auto pr-3 space-y-3">
                  {loading ? (
                    <p className="text-center text-[#999] py-8">Memuat data...</p>
                  ) : peminjaman.length === 0 ? (
                    <p className="text-center text-[#999] py-8">Belum ada peminjaman.</p>
                  ) : (
                    peminjaman.map((item, index) => {
                      const { bg, label } = getStatusStyle(item.status_persetujuan);
                      const isAlat = item.id_alat !== null && item.id_ruangan === null;

                      return (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 rounded-xl bg-[#ECDFE3] shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-[#7A2E3A] text-white p-2 rounded-lg">
                              <Icon
                                icon={isAlat ? "la:tools" : "ph:door-open-bold"}
                                width="28"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#471020]">
                                {item.ruangan || item.alat || (item.id_ruangan ? "Ruangan #" + item.id_ruangan : item.id_alat ? "Alat #" + item.id_alat : "-")}
                              </h4>
                              <p className="text-[12px] text-[#606060]">
                                PIC: {item.pic ?? "-"}
                              </p>
                              <p className="text-[12px] text-[#606060] mt-1">
                                {item.nama_kegiatan}
                              </p>
                              <p className="text-[12px] text-[#606060]">
                                {formatTanggal(item.hari_tanggal)} · {item.jam_mulai?.slice(0, 5)} - {item.jam_selesai?.slice(0, 5)}
                              </p>
                            </div>
                          </div>
                          <span className={`${bg} text-white px-3 py-1 rounded-full text-xs font-semibold min-w-[90px] text-center`}>
                            {label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <AktivitasTerbaru />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;