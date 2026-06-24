import React from "react";
import { Icon } from "@iconify/react";
import { useStateContext } from "../Contexts/context.jsx";
import pakari from "../Pages/Assets/pakari.png";

const ModalProfile = ({ onClose }) => {
  const { currentUser } = useStateContext();

  // Proteksi jika data currentUser belum siap
  if (!currentUser) return null;

  const role = currentUser.role?.toLowerCase() || "user";

  return (
    <div
     className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center px-4 transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Kartu Modal  */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[360px] flex flex-col items-center z- [10] transform transition-all animate-in zoom-in-95 duration-200"
      > 
        {/* Tombol Close Pojok Kanan Atas */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Tutup"
        >
          <Icon icon="mdi:close" width="22" />
        </button>

        {/* Header Profil / Lingkaran Foto */}
        <div className="relative mt-2 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-[#862440] p-0.5 shadow-md overflow-hidden">
            <img
              src={currentUser.foto_profil || pakari}
              alt="Profil"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {/* Badge Role Mengambang di Bawah Foto */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#862440] text-[#FFEDDD] text-[11px] font-bold px-3 py-0.5 rounded-full capitalize shadow-sm tracking-wide">
            {role}
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="text-center w-full px-2 mb-6">
          <h2 className="text-lg font-bold text-gray-800 truncate">
            {currentUser.name || "name Pengguna"}
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5 tracking-wider">
            {currentUser.id_number || "-"}
          </p>
        </div>

        {/* Garis Pembatas Tipis */}
        <div className="w-full h-[1px] bg-gray-100 mb-4" />

        {/* Detail Data Profil (Sistem Baris Grid) */}
        <div className="w-full space-y-4 px-1 mb-6">
          {/* Baris 1: Email */}
          <div className="flex items-center gap-3 text-gray-700">
            <Icon icon="material-symbols:mail-outline" width="20" className="text-[#862440] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Email</span>
              <span className="text-[13px] font-semibold text-gray-700 truncate">{currentUser.email || "-"}</span>
            </div>
          </div>

          {/* Baris 2: Nomor Telepon */}
          <div className="flex items-center gap-3 text-gray-700">
            <Icon icon="material-symbols:call-outline" width="20" className="text-[#862440] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">No. Telepon</span>
              <span className="text-[13px] font-semibold text-gray-700 truncate">{currentUser.no_hp || "-"}</span>
            </div>
          </div>

          {/* Baris Kondisional 3: Program Studi ( jika mahasiswa) */}
          {role === "mahasiswa" && currentUser.prodi && (
            <div className="flex items-center gap-3 text-gray-700">
              <Icon icon="academicons:education" width="20" className="text-[#862440] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Program Studi</span>
                <span className="text-[13px] font-semibold text-gray-700 truncate">{currentUser.prodi}</span>
              </div>
            </div>
          )}

          {/* Baris Kondisional 4: Jurusan */}
          {currentUser.jurusan && (
            <div className="flex items-center gap-3 text-gray-700">
              <Icon icon="teal:building-columns" width="20" className="text-[#862440] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Jurusan</span>
                <span className="text-[13px] font-semibold text-gray-700 truncate">{currentUser.jurusan}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tombol Aksi di bagian bawah */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-600 font-semibold border border-gray-200 hover:bg-gray-100 transition-all text-[14px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <Icon icon="material-symbols:arrow-back-ios-new-rounded" width="14" />
          Tutup Profil
        </button>
      </div>
    </div>
  );
};

export default ModalProfile;