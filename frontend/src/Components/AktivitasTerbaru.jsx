import { useEffect, useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

const POLL_INTERVAL = 15000; // refresh tiap 15 detik

const TYPE_CONFIG = {
  disetujui: {
    icon: "mingcute:check-circle-fill",
    color: "text-[#4DB04A]",
    bg: "bg-[#ecfdf5]",
    dot: "bg-[#4DB04A]",
    label: "Disetujui",
  },
  progress: {
    icon: "mingcute:loading-3-fill",
    color: "text-[#F2A31A]",
    bg: "bg-[#fffbeb]",
    dot: "bg-[#F2A31A]",
    label: "Diproses",
  },
  menunggu: {
    icon: "mingcute:time-fill",
    color: "text-[#999999]",
    bg: "bg-[#f5f5f5]",
    dot: "bg-[#999999]",
    label: "Menunggu",
  },
  ditolak: {
    icon: "mingcute:close-circle-fill",
    color: "text-[#B16666]",
    bg: "bg-[#fef2f2]",
    dot: "bg-[#B16666]",
    label: "Ditolak",
  },
  dibatalkan: {
    icon: "mingcute:warning-fill",
    color: "text-[#f59e0b]",
    bg: "bg-[#fffbeb]",
    dot: "bg-[#f59e0b]",
    label: "Dibatalkan",
  },
};

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

const AktivitasTerbaru = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState(new Set()); // id notif yang baru masuk
  const prevIdsRef = useRef(new Set());
  const intervalRef = useRef(null);

  const fetchNotifs = useCallback((isInitial = false) => {
    axiosClient
      .get("/notifications")
      .then(({ data }) => {
        const fresh = data.data || [];
        const freshIds = new Set(fresh.map((n) => n.id));

        if (!isInitial) {
          // Bandingkan dengan sebelumnya — tandai yang benar-benar baru
          const incoming = new Set(
            fresh.filter((n) => !prevIdsRef.current.has(n.id)).map((n) => n.id)
          );
          if (incoming.size > 0) {
            setNewIds((prev) => new Set([...prev, ...incoming]));
          }
        }

        prevIdsRef.current = freshIds;
        setNotifs(fresh);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Mount: fetch awal
  useEffect(() => {
    fetchNotifs(true);
  }, [fetchNotifs]);

  // Polling tiap POLL_INTERVAL ms
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchNotifs(false), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifs]);

  const handleMarkRead = (id) => {
    // Hapus dari badge baru
    setNewIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    // Tandai dibaca ke backend (fire-and-forget)
    axiosClient.post(`/notifications/${id}/read`).catch(() => {});
    // Update read_at lokal
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const unreadCount = notifs.filter((n) => !n.read_at).length;

  return (
    <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[#471020] text-[24px] font-bold">Aktivitas Terbaru</h3>
            {unreadCount > 0 && (
              <span className="bg-[#FF3A72] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-[#BC8D9B] text-[14px]">Beberapa aktivitas terkini dalam sistem</p>
        </div>
        {/* Indikator live */}
        <div className="flex items-center gap-1 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4DB04A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4DB04A]" />
          </span>
          <span className="text-[11px] text-[#4DB04A] font-medium">Live</span>
        </div>
      </div>

      {/* List */}
      <div className="custom-scroll mt-3 max-h-[324px] overflow-y-auto pr-1 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-[#999]">
            <Icon icon="mingcute:loading-3-fill" className="animate-spin" width="20" />
            <span className="text-sm">Memuat aktivitas...</span>
          </div>
        ) : notifs.length === 0 ? (
          <p className="text-center text-[#999] py-8 text-sm">Belum ada aktivitas.</p>
        ) : (
          notifs.slice(0, 8).map((item) => {
            const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.menunggu;
            const isNew = newIds.has(item.id);
            const isUnread = !item.read_at;

            return (
              <button
                key={item.id}
                onClick={() => handleMarkRead(item.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200
                  ${cfg.bg}
                  ${isNew ? "ring-2 ring-[#FF3A72] ring-offset-1" : ""}
                  ${isUnread ? "shadow-sm" : "opacity-75"}
                  hover:brightness-95 cursor-pointer`}
              >
                {/* Icon */}
                <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                  <Icon icon={cfg.icon} width="22" />
                </div>

                {/* Konten */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-[#471020] text-[13px] truncate ${isUnread ? "font-bold" : ""}`}>
                      {item.judul}
                    </h4>
                    {isUnread && (
                      <span className={`shrink-0 w-2 h-2 rounded-full ${cfg.dot}`} />
                    )}
                    {isNew && (
                      <span className="shrink-0 bg-[#FF3A72] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        BARU
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#606060] mt-0.5 line-clamp-2">{item.pesan}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Icon icon="mingcute:time-fill" className="text-[#A3A3A3]" width="12" />
                    <p className="text-[11px] text-[#A3A3A3]">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AktivitasTerbaru;
