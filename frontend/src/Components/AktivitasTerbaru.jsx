import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

const AktivitasTerbaru = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get("/notifications")
      .then(({ data }) => setNotifs(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const getIcon = (type) => {
    switch (type) {
      case "disetujui": return { icon: "zondicons:exclamation-outline", color: "text-[#4DB04A]" };
      case "ditolak": return { icon: "zondicons:exclamation-outline", color: "text-[#B16666]" };
      case "dibatalkan": return { icon: "zondicons:exclamation-outline", color: "text-[#f59e0b]" };
      default: return { icon: "zondicons:exclamation-outline", color: "text-[#999999]" };
    }
  };

  return (
    <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[#471020] text-[24px] font-bold">Aktivitas Terbaru</h3>
          <button onClick={() => navigate("/notifikasi")} className="border-2 border-[#F2A31A] text-[#F2A31A] px-4 py-1 rounded-xl font-semibold text-sm hover:bg-[#F2A31A] hover:text-white transition duration-300">
            Lihat Semua
          </button>
        </div>
        <h1 className="text-[#BC8D9B] text-[14px] font-regular">Beberapa aktivitas terkini dalam sistem</h1>
        <div className="space-y-0">
          {loading ? (
            <p className="text-center text-[#999] py-8">Memuat data...</p>
          ) : notifs.length === 0 ? (
            <p className="text-center text-[#999] py-8">Belum ada aktivitas.</p>
          ) : (
            notifs.slice(0, 5).map((item) => {
              const { icon, color } = getIcon(item.type);
              return (
                <div key={item.id} className="flex items-start justify-between p-3 bg-[#EEEEEE]">
                  <div className="flex items-start gap-2">
                    <Icon icon={icon} width="28" className={color} />
                    <div>
                      <h4 className="font-semibold text-[#471020]">{item.judul}</h4>
                      <p className="text-[12px] text-[#606060]">{item.pesan}</p>
                      <div className="flex items-center gap-[2px] mt-1">
                        <Icon icon="mingcute:time-fill" className="text-[#A3A3A3]" />
                        <p className="text-[12px] text-[#A3A3A3]">{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AktivitasTerbaru;
