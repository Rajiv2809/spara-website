import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

const Notifikasi = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get("/notifications")
      .then(({ data }) => setNotifs(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = (id) => {
    axiosClient.post(`/notifications/${id}/read`).then(() => {
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    });
  };

  const markAllRead = () => {
    axiosClient.post("/notifications/read-all").then(() => {
      setNotifs((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const badgeType = (type) => {
    const styles = {
      disetujui: "bg-green-100 text-green-700",
      ditolak: "bg-red-100 text-red-700",
      dibatalkan: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${styles[type] || "bg-gray-100 text-gray-500"}`}>
        {((type || "").charAt(0).toUpperCase() + (type || "").slice(1)).toUpperCase()}
      </span>
    );
  };

  const unreadCount = notifs.filter((n) => !n.read_at).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />
      <div className="lg:ml-[300px] flex-1 lg:p-10 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 mt-12 lg:mt-2">
          <div>
            <h1 className="text-[#2D0A18] text-[32px] font-extrabold">Notifikasi</h1>
            <p className="text-gray-500 text-[14px] mt-1">Daftar seluruh notifikasi dan aktivitas</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="bg-[#862440] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a1c32] transition-colors"
            >
              Tandai Semua Dibaca ({unreadCount})
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#C0254A] text-white text-sm">
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Pesan</th>
                <th className="px-5 py-3.5 font-semibold">Waktu</th>
                <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-[#C92B58] text-sm">
                    <Icon icon="mdi:loading" className="animate-spin inline mr-2" width={20} />
                    Memuat data...
                  </td>
                </tr>
              ) : notifs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-400 text-sm">Belum ada notifikasi.</td>
                </tr>
              ) : (
                notifs.map((n) => (
                  <tr
                    key={n.id}
                    className={`border-b border-[#F0D0DA] text-sm ${!n.read_at ? "bg-[#FFF5F7] font-semibold" : "text-gray-500"}`}
                  >
                    <td className="px-5 py-4">{badgeType(n.type)}</td>
                    <td className={`px-5 py-4 max-w-[400px] ${!n.read_at ? "text-[#481020]" : ""}`}>{n.pesan}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{formatDate(n.created_at)}</td>
                    <td className="px-5 py-4 text-center">
                      {!n.read_at ? (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-[11px] font-semibold bg-[#862440] text-white px-4 py-1.5 rounded-full hover:bg-[#6a1c32] transition-colors"
                        >
                          Tandai Dibaca
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Terbaca</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notifikasi;
