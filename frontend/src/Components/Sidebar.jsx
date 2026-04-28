import React, { useState } from 'react';
import logo2 from '../Pages/Assets/logo2.png';
import { Icon } from "@iconify/react";
import pakari from '../Pages/Assets/pakari.png';
import { useStateContext } from '../Contexts/context.jsx';
import axiosClient from "../axios";
import { useNavigate } from 'react-router-dom';

// Definisi menu per role
const menuByRole = {
    mahasiswa: [
        { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
        { icon: "octicon:checklist-16", label: "Peminjaman Ruangan", href: "/pengajuanruangan" },
        { icon: "material-symbols:monitor-outline", label: "Peminjaman Peralatan", href: "/peminjaman-peralatan" },
        { icon: "material-symbols:history", label: "Riwayat", href: "/riwayat" },
    ],
    pic: [
        { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
        { icon: "octicon:checklist-16", label: "Peminjaman Ruangan", href: "/pengajuanruangan" },
        { icon: "material-symbols:monitor-outline", label: "Peminjaman Peralatan", href: "/peminjaman-peralatan" },
        { icon: "material-symbols:history", label: "Riwayat", href: "/riwayat" },
        { icon: "material-symbols:meeting-room-outline", label: "Kelola Ruangan", href: "/kelola-ruangan" },
        { icon: "material-symbols:devices-outline", label: "Kelola Peralatan", href: "/kelola-peralatan" },
        { icon: "material-symbols:check-circle-outline", label: "Persetujuan", href: "/persetujuan" },
    ],
    admin: [
        { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
        { icon: "octicon:checklist-16", label: "Peminjaman", href: "/pengajuanruangan" },
        { icon: "material-symbols:devices-outline", label: "Kelola Alat", href: "/kelola-peralatan" },
        { icon: "material-symbols:meeting-room-outline", label: "Kelola Ruangan", href: "/kelola-ruangan" },
        { icon: "mdi:file-chart-outline", label: "Laporan", href: "/laporan" },
        { icon: "material-symbols:check-circle-outline", label: "Persetujuan", href: "/persetujuan" },
    ],
    dosen: [
        { icon: "mdi:view-dashboard", label: "Dashboard", href: "/dashboard" },
        { icon: "octicon:checklist-16", label: "Peminjaman Ruangan", href: "/pengajuanruangan" },
        { icon: "material-symbols:monitor-outline", label: "Peminjaman Peralatan", href: "/peminjaman-peralatan" },
        { icon: "material-symbols:history", label: "Riwayat", href: "/riwayat" },
        { icon: "material-symbols:check-circle-outline", label: "Persetujuan", href: "/persetujuan" },
    ],
};

const Sidebar = () => {
    const { currentUser, setUserToken } = useStateContext();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = (e) => {
        e.preventDefault();
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        axiosClient.post('/logout').then(() => {
            navigate('/login');
            setUserToken(null);
        }).catch(({ res }) => {
            console.log(res);
        });
        setShowLogoutModal(false);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    // Ambil menu berdasarkan role, fallback ke mahasiswa jika role tidak dikenal
    const role = currentUser?.role?.toLowerCase() || 'mahasiswa';
    const menus = menuByRole[role] || menuByRole['mahasiswa'];

    // Tentukan path aktif saat ini
    const currentPath = window.location.pathname;

    return (
        <>
            <div
                style={{ position: 'fixed' }}
                className='min-w-[300px] h-screen fixed top-0 left-0 overflow-y-auto bg-[#862440] text-white flex flex-col px-3'
            >
                {/* Header / Logo */}
                <div className='headline flex flex-row items-center'>
                    <div className="logo">
                        <img src={logo2} className='w-[88px]' alt="Logo" />
                    </div>
                    <div className="text">
                        <h1 className='text-xl font-bold'>SPARA</h1>
                        <h3 className='text-[#B1B1B1] text-[12px]'>Politeknik Negeri Batam</h3>
                    </div>
                </div>

                <div className="line w-full h-[1px] bg-white"></div>

                {/* Role Badge */}
                <div className="mt-3 mb-1 px-2">
                    <span className="inline-block bg-[#682B3C] text-[#FFEDDD] text-[11px] font-semibold px-3 py-1 rounded-full capitalize">
                        {role}
                    </span>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col gap-1 mt-2">
                    {menus.map((menu) => {
                        const isActive = currentPath === menu.href;
                        return (
                            <a
                                key={menu.href + menu.label}
                                href={menu.href}
                                className={`flex flex-row gap-2 items-center p-4 rounded-lg text-[#FFEDDD] transition-colors
                                    ${isActive
                                        ? 'bg-[#682B3C] font-bold'
                                        : 'hover:bg-[#682B3C]'
                                    }`}
                            >
                                <Icon icon={menu.icon} width="26" />
                                <span className='text-[18px] font-semibold'>{menu.label}</span>
                            </a>
                        );
                    })}
                </div>

                {/* Profile & Logout */}
                <div
                    onClick={handleLogoutClick}
                    className="logout align-bottom mt-auto flex flex-row gap-2 items-center p-2 rounded-md mb-8 border border-[#eeeeee] cursor-pointer hover:bg-[#682B3C] transition-colors"
                >
                    <img src={pakari} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
                    <div className="name text-left flex-1 min-w-0">
                        <h1 className='text-[15px] truncate'>{currentUser.nama}</h1>
                        <h3 className='text-[8px] text-[#B1B1B1] truncate'>{currentUser.email}</h3>
                    </div>
                    <Icon className='ml-2 shrink-0' icon="uil:signout" width="36" />
                </div>
            </div>

            {/* Modal Konfirmasi Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={cancelLogout}
                    />

                    {/* Modal Box */}
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-[340px] flex flex-col items-center gap-4 z-10">
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
        </>
    );
};

export default Sidebar;