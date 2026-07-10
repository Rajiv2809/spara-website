import React, { useState, useEffect } from "react";
import logo2 from "../Pages/Assets/logo2.png";
import { Icon } from "@iconify/react";
import { useStateContext } from "../Contexts/context.jsx";
import axiosClient from "../axios";
import { useNavigate } from "react-router-dom";
import ModalProfile from "../Components/ModalProfile";

const menuByRole = {
  mahasiswa: [
    { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
    {
      icon: "octicon:checklist-16",
      label: "Peminjaman Ruangan",
      href: "/pengajuan-ruangan",
    },
    {
      icon: "material-symbols:monitor-outline",
      label: "Peminjaman Peralatan",
      href: "/peminjaman-peralatan",
    },
    { icon: "material-symbols:history", label: "Riwayat", href: "/riwayat" },
    { icon: "mdi:calendar-month", label: "Kalender", href: "/kalender" },
  ],
  pic: [
    { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
    {
      icon: "octicon:checklist-16",
      label: "Peminjaman Ruangan",
      href: "/pengajuan-ruangan",
    },
    {
      icon: "material-symbols:monitor-outline",
      label: "Peminjaman Peralatan",
      href: "/peminjaman-peralatan",
    },
    { icon: "material-symbols:history", label: "Riwayat", href: "/riwayat" },
    { icon: "mdi:calendar-month", label: "Kalender", href: "/kalender" },
    {
      icon: "material-symbols:meeting-room-outline",
      label: "Kelola Ruangan",
      href: "/kelola-ruangan",
    },
    {
      icon: "material-symbols:devices-outline",
      label: "Kelola Peralatan",
      href: "/kelola-peralatan",
    },
    {
      icon: "material-symbols:check-circle-outline",
      label: "Persetujuan",
      href: "/persetujuan-peminjaman",
    },
  ],
  admin: [
    { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
    {
      icon: "material-symbols:devices-outline",
      label: "Kelola Alat",
      href: "/kelola-peralatan",
    },
    {
      icon: "material-symbols:meeting-room-outline",
      label: "Kelola Ruangan",
      href: "/kelola-ruangan",
    },
    {
      icon: "mdi:calendar-month",
      label: "Kalender",
      href: "/kalender-peminjaman",
    },
    {
      icon: "octicon:checklist-16",
      label: "Peminjaman",
      href: "/peminjaman-kepala",
    },
    {
      icon: "mdi:bookmark-plus-outline",
      label: "Booking Langsung",
      href: "/admin/peminjaman",
    },
    {
      icon: "material-symbols:check-circle-outline",
      label: "Persetujuan",
      href: "/persetujuan-peminjaman",
    },
  ],
  lecturer: [
    { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
    {
      icon: "octicon:checklist-16",
      label: "Peminjaman Ruangan",
      href: "/pengajuan-ruangan",
    },
    {
      icon: "material-symbols:monitor-outline",
      label: "Peminjaman Peralatan",
      href: "/peminjaman-peralatan",
    },
    { icon: "material-symbols:history", label: "Riwayat", href: "/riwayat" },
    { icon: "mdi:calendar-month", label: "Kalender", href: "/kalender" },
    {
      icon: "material-symbols:check-circle-outline",
      label: "Persetujuan",
      href: "/persetujuan-peminjaman",
    },
  ],
  kepala: [
    { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
    {
      icon: "octicon:checklist-16",
      label: "Peminjaman",
      href: "/peminjaman-kepala",
    },
    {
      icon: "mdi:calendar-month",
      label: "Kalender",
      href: "/kalender-peminjaman",
    },
    {
      icon: "mdi:account-cog-outline",
      label: "Kelola Admin",
      href: "/kelola-admin",
    },
  ],
  loading: [{ label: "loading" }],
};

const Sidebar = () => {
  const { currentUser, setUserToken } = useStateContext();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const role = currentUser?.role?.toLowerCase() || "loading";
  const menus = menuByRole[role] || menuByRole["loading"];
  const currentPath = window.location.pathname;

  // Tutup sidebar saat resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogoutClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    axiosClient
      .post("/logout")
      .then(() => {
        navigate("/login");
        setUserToken(null);
        setCurrentUser(null);
      })
      .catch(({ res }) => {
        console.log(res);
      });
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Konten sidebar — dipakai ulang untuk desktop & mobile drawer
  const SidebarContent = () => (
    <div className="flex flex-col h-full px-3">
      {/* Header / Logo */}
      <div className="flex flex-row items-center justify-between pt-3 pb-2">
        <div className="flex flex-row items-center">
          <img src={logo2} className="w-[88px]" alt="Logo" />
          <div>
            <h1 className="text-xl font-bold">SPARA</h1>
            <h3 className="text-[#B1B1B1] text-[12px]">
              Politeknik Negeri Batam
            </h3>
          </div>
        </div>
        {/* Tombol tutup — hanya tampil di mobile */}
        <button
          className="lg:hidden p-1 rounded-md hover:bg-[#682B3C] transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label="Tutup menu"
        >
          <Icon icon="mdi:close" width="26" />
        </button>
      </div>

      <div className="w-full h-[1px] bg-white/20" />

      {/* ── Profile Card (di bawah logo, di atas menu) ── */}
      <div
        onClick={() => { setShowProfileModal(true); setIsOpen(false); }}
        className="mx-1 mt-3 flex flex-row items-center gap-3 p-3 rounded-xl cursor-pointer
                   transition-all duration-200 hover:bg-[#6d1c30] bg-[#6d1c3055]
                   border border-white/10 group"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full ring-2 ring-white/30 bg-gray-200 flex items-center justify-center overflow-hidden">
            {currentUser?.profile_picture ? (
              <img
                src={currentUser.profile_picture}
                alt="Profil"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Icon icon="fa6-solid:user" className="text-gray-400" width="16" />
            )}
          </div>
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#862440] rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] font-semibold truncate text-white leading-tight group-hover:text-[#FFEDDD] transition-colors">
            {currentUser?.name || "Nama Pengguna"}
          </h1>
          <span className="inline-block mt-0.5 bg-[#682B3C] text-[#FFEDDD] text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
            {role}
          </span>
        </div>

        <Icon icon="mdi:chevron-right" width="16" className="text-white/40 shrink-0 group-hover:text-white/70 transition-colors" />
      </div>

      <div className="w-full h-[1px] bg-white/20 mt-3" />

      {/* Menu Items */}
      <div className="flex flex-col gap-1 mt-2">
        {menus.map((menu) => {
          const isActive = currentPath === menu.href;
          return (
            <a
              key={menu.href + menu.label}
              href={menu.href}
              onClick={() => setIsOpen(false)}
              className={`flex flex-row gap-3 items-center p-4 rounded-lg text-[#FFEDDD] transition-colors
                ${isActive ? "bg-[#682B3C] font-bold" : "hover:bg-[#682B3C]"}`}
            >
              <Icon icon={menu.icon} width="28" height="28" />
              <span className="text-[18px] font-semibold">{menu.label}</span>
            </a>
          );
        })}
      </div>

      {/* Logout — tetap di bawah */}
      <div className="mt-auto mb-5 px-1">
        <button
          onClick={handleLogoutClick}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/15
                     text-white/70 text-[13px] font-medium
                     hover:bg-red-700/30 hover:text-white hover:border-red-400/40 transition-all duration-200"
        >
          <Icon icon="material-symbols:logout-rounded" width="18" />
          Keluar Aplikasi
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (lg ke atas) ── */}
      <div className="hidden lg:flex min-w-[300px] w-[300px] h-screen fixed top-0 left-0 overflow-y-auto bg-[#862440] text-white flex-col ">
        <SidebarContent />
      </div>

      {/* ── MOBILE: TOPBAR dengan tombol hamburger ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#862440] text-white flex flex-row items-center px-4 py-2 shadow-md h-[56px]">
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 rounded-md hover:bg-[#682B3C] transition-colors"
          aria-label="Buka menu"
        >
          <Icon icon="mdi:menu" width="30" />
        </button>
        <div className="flex flex-row items-center ml-3 gap-1">
          <img src={logo2} className="w-[44px]" alt="Logo" />
          <div>
            <h1 className="text-[15px] font-bold leading-tight">SPARA</h1>
            <h3 className="text-[#B1B1B1] text-[9px] leading-tight">
              Politeknik Negeri Batam
            </h3>
          </div>
        </div>
      </div>

      {/* Spacer agar konten halaman tidak tertimpa topbar di mobile */}
      <div className="lg:hidden h-[56px]" />

      {/* ── MOBILE: BACKDROP ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black transition-opacity duration-300
                    ${isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── MOBILE: DRAWER PANEL ── */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-[300px] bg-[#862440] text-white overflow-y-auto
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </div>

      {/* ── MODAL KONFIRMASI LOGOUT ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={cancelLogout}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-[320px] mx-4 flex flex-col items-center gap-4 z-10">
            <div className="bg-[#FFF0F3] rounded-full p-4">
              <Icon icon="uil:signout" width="40" color="#862440" />
            </div>
            <h2 className="text-[18px] font-bold text-gray-800 text-center">
              Konfirmasi Keluar
            </h2>
            <p className="text-gray-500 text-center text-[14px]">
              Apakah anda yakin ingin keluar dari aplikasi?
            </p>
            <div className="flex flex-row gap-3 w-full mt-2">
              <button
                onClick={cancelLogout}
                className="flex-1 py-2 rounded-lg border border-[#862440] text-[#862440] font-semibold hover:bg-[#FFF0F3] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2 rounded-lg bg-[#862440] text-white font-semibold hover:bg-[#6a1c32] transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
      {showProfileModal && (
        <ModalProfile onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
