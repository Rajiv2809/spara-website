import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useStateContext } from "../Contexts/context.jsx";
import axiosClient from "../axios";

const ModalProfile = ({ onClose }) => {
  const { currentUser, setCurrentUser } = useStateContext();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle ketika user memilih gambar 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        alert("Harap pilih file berupa gambar (PNG/JPG/JPEG)");
        return;
      }
      // Validasi ukuran file
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal adalah 2MB");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Buat preview URL sementara
    }
  };

  // Mengirim file gambar ke Backend (API)
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("fotoprofil", selectedFile);

    setIsUploading(true);
    try {
      const response = await axiosClient.post(
        "/update-profile-photo",
        formData,
      );

      // Update state user 
      setCurrentUser(response.data.user);

      alert("Foto profil berhasil diperbarui!");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Gagal mengunggah foto:", error);
      alert(
        error.response?.data?.message ||
          "Terjadi kesalahan saat mengunggah foto.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Membatalkan pilihan gambar baru
  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center px-4 transition-opacity duration-300 "
      onClick={onClose}
    >
      {/* Kartu Modal  */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[360px] flex flex-col items-center z-[10] transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Tombol Close Pojok Kanan Atas */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Tutup"
        >
          <Icon icon="mdi:close" width="22" />
        </button>

        {/* Header Profil  */}
        <div className="relative mt-2 mb-4 flex justify-center items-center w-full ">
          <div className="relative w-24 h-24 rounded-full border-4 border-[#862440] p-0.5 shadow-md bg-gray-100 flex items-center justify-center">
            {previewUrl || currentUser?.fotoprofil ? (
              <img
                src={previewUrl || currentUser.fotoprofil}
                alt="Profil"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Icon
                icon="fa6-solid:user"
                className="text-gray-400"
                width="36"
              />
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute -bottom-3  bg-[#862440] text-white w-8 h-8 rounded-full shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Icon icon="mdi:camera" width="14" />
          </button>
        </div>

        {/* Informasi Utama */}
        <div className="text-center w-full px-2 mb-6">
          <h2 className="text-lg font-bold text-gray-800 truncate">
            {currentUser.nama || "Nama Pengguna"}
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5 tracking-wider">
            {currentUser.nomor_induk || "-"}
          </p>
        </div>

        <div className="w-full h-[1px] bg-gray-100 mb-4" />

        {/* Detail Data Profil  */}
        <div className="w-full space-y-4 px-1 mb-6">
          {/* Email */}
          <div className="flex items-center gap-3 text-gray-700">
            <Icon
              icon="material-symbols:mail-outline"
              width="20"
              className="text-[#862440] shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Email
              </span>
              <span className="text-[13px] font-semibold text-gray-700 truncate">
                {currentUser.email || "-"}
              </span>
            </div>
          </div>

          {/* Nomor Telepon */}
          <div className="flex items-center gap-3 text-gray-700">
            <Icon
              icon="material-symbols:call-outline"
              width="20"
              className="text-[#862440] shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                No. Telepon
              </span>
              <span className="text-[13px] font-semibold text-gray-700 truncate">
                {currentUser.no_telepon || "-"}
              </span>
            </div>
          </div>
        </div>
        {selectedFile && (
          <div className="w-full flex gap-2 mb-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-[#862440] text-white py-2 rounded-xl hover:opacity-90"
            >
              {isUploading ? "Mengunggah..." : "Simpan Foto"}
            </button>

            <button
              onClick={handleCancelSelection}
              className="flex-1 border border-gray-300 py-2 rounded-xl"
            >
              Batal
            </button>
          </div>
        )}
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