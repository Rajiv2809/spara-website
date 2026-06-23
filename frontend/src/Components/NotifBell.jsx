import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

const NotifBell = () => {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnread = () => {
    axiosClient.get("/notifications/unread-count")
      .then(({ data }) => setUnread(data.count))
      .catch(() => {});
  };

  const openDropdown = () => {
    setOpen(true);
    axiosClient.get("/notifications")
      .then(({ data }) => setNotifs(data.data || []))
      .catch(() => {});
  };

  const markRead = (id) => {
    axiosClient.post(`/notifications/${id}/read`)
      .then(() => {
        setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        fetchUnread();
      })
      .catch(() => {});
  };

  const markAllRead = () => {
    axiosClient.post("/notifications/read-all")
      .then(() => {
        setNotifs((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
        setUnread(0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const typeIcon = (type) => {
    switch (type) {
      case "disetujui": return { icon: "ph:check-circle-fill", color: "#22c55e" };
      case "ditolak": return { icon: "ph:x-circle-fill", color: "#ef4444" };
      case "dibatalkan": return { icon: "ph:prohibit", color: "#f59e0b" };
      default: return { icon: "ph:clock", color: "#6b7280" };
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openDropdown}
        className="relative p-2 rounded-lg hover:bg-[#682B3C] transition-colors"
      >
        <Icon icon="ph:bell-bold" width="22" color="#FFEDDD" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[#862440]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Notifikasi</h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-[#C92B58] hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Belum ada notifikasi.</p>
            ) : (
              notifs.map((n) => {
                const { icon, color } = typeIcon(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.read_at && markRead(n.id)}
                    className={`w-full text-left flex gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read_at ? "bg-[#FFF5F7]" : ""}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <Icon icon={icon} width={18} color={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${!n.read_at ? "font-bold text-gray-800" : "text-gray-500"}`}>
                        {n.pesan}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                    </div>
                    {!n.read_at && (
                      <span className="w-2 h-2 rounded-full bg-[#C92B58] flex-shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotifBell;
