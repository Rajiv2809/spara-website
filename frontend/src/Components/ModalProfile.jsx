import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useStateContext } from "../Contexts/context.jsx";
import axiosClient from "../axios";

const ModalProfile = ({ onClose }) => {
  const { currentUser, setCurrentUser } = useStateContext();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phone_number || "",
  );
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Handle ketika user memilih gambar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Harap pilih file berupa gambar (PNG/JPG/JPEG)");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal adalah 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Mengirim file gambar ke Backend (API)
  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("profile_picture", selectedFile);
    setIsUploading(true);
    try {
      const response = await axiosClient.post("/update-profile-photo", formData);
      setCurrentUser(response.data.user);
      alert("Foto profil berhasil diperbarui!");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Gagal mengunggah foto:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  // Mengirim pembaruan nomor telepon ke Backend (API)
  const handleUpdatePhone = async () => {
    if (phoneNumber === currentUser?.phone_number) {
      setIsEditingPhone(false);
      return;
    }
    setIsUpdatingPhone(true);
    try {
      const response = await axiosClient.post("/update-profile-phone", {
        phone_number: phoneNumber,
      });
      setCurrentUser(response.data.user);
      alert("Nomor telepon berhasil diperbarui!");
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Gagal memperbarui nomor telepon:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat memperbarui nomor telepon.");
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Lengkapi semua kolom password terlebih dahulu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi password tidak sama.");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await axiosClient.post("/update-password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      alert("Password berhasil diperbarui.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Gagal memperbarui password:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat memperbarui password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Membatalkan pilihan gambar baru
  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const avatarSrc = previewUrl || currentUser?.profile_picture;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center px-4"
      onClick={onClose}
    >
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-animate { animation: modalSlideIn 0.2s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-animate relative bg-white rounded-3xl shadow-2xl w-full max-w-[390px] max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* ══ HEADER GRADIENT ══ */}
        <div className="relative bg-gradient-to-br from-[#862440] via-[#9e2b4d] to-[#4a0e20] pt-5 pb-8 px-5 flex-shrink-0">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Row: title + close button */}
          <div className="relative flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-white leading-tight">
                {showPasswordForm ? "Ubah Password" : "Profil Saya"}
              </h2>
              <p className="text-white/55 text-[11px] mt-0.5">
                {showPasswordForm
                  ? "Perbarui keamanan akun Anda"
                  : "Kelola informasi akun Anda"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0 ml-3"
              aria-label="Tutup"
            >
              <Icon icon="mdi:close" width="17" />
            </button>
          </div>
        </div>

        {/* ══ AVATAR — di luar header, tidak overlap ══ */}
        {!showPasswordForm && (
          <div className="flex flex-col items-center bg-white pt-5 pb-2 px-6 flex-shrink-0">
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Avatar circle */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full ring-4 ring-[#862440]/20 shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon icon="fa6-solid:user" className="text-gray-300" width="32" />
                )}
              </div>
              {/* Preview badge */}
              {previewUrl && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow leading-tight">
                  PREVIEW
                </span>
              )}
            </div>

            {/* ── TOMBOL FOTO — terpisah jelas di bawah avatar ── */}
            <div className="mt-3 flex items-center gap-2">
              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#862440]/10 hover:bg-[#862440]/20 text-[#862440] border border-[#862440]/20 transition-all"
                >
                  <Icon icon="mdi:camera-outline" width="14" />
                  Ganti Foto Profil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#862440] hover:bg-[#6d1c30] text-white transition-all disabled:opacity-60"
                  >
                    {isUploading ? (
                      <><Icon icon="mdi:loading" width="13" className="animate-spin" /> Mengunggah...</>
                    ) : (
                      <><Icon icon="mdi:check" width="13" /> Simpan Foto</>
                    )}
                  </button>
                  <button
                    onClick={handleCancelSelection}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-gray-300 text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    <Icon icon="mdi:close" width="13" /> Batal
                  </button>
                </>
              )}
            </div>

            {/* Nama & ID */}
            <div className="text-center mt-3">
              <h3 className="text-[17px] font-bold text-gray-800 leading-tight">
                {currentUser?.name || "Nama Pengguna"}
              </h3>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#862440]/10 text-[#862440] text-[11px] font-semibold font-mono tracking-wider">
                {currentUser?.id_number || "—"}
              </span>
            </div>
          </div>
        )}

        {/* ══ SCROLLABLE BODY ══ */}
        <div className="flex-1 overflow-y-auto px-6 pb-5">
          {!showPasswordForm ? (
            <>
              {/* Divider */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Info Akun</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Info Cards */}
              <div className="space-y-3 mb-5">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-[#862440]/10 flex items-center justify-center shrink-0">
                    <Icon icon="material-symbols:mail-outline" width="18" className="text-[#862440]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email</span>
                    <span className="text-[13px] font-semibold text-gray-700 truncate">
                      {currentUser?.email || "—"}
                    </span>
                  </div>
                </div>

                {/* Nomor Telepon */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-[#862440]/10 flex items-center justify-center shrink-0">
                    <Icon icon="material-symbols:call-outline" width="18" className="text-[#862440]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">No. Telepon</span>
                    {isEditingPhone ? (
                      <input
                        type="number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isUpdatingPhone}
                        className="text-[13px] font-semibold text-gray-700 border-b-2 border-[#862440] focus:outline-none bg-transparent py-0.5 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-[13px] font-semibold text-gray-700 truncate">
                        {currentUser?.phone_number || "Belum diatur"}
                      </span>
                    )}
                  </div>

                  {/* Edit actions */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isEditingPhone ? (
                      <>
                        <button
                          onClick={handleUpdatePhone}
                          disabled={isUpdatingPhone}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Simpan"
                        >
                          {isUpdatingPhone
                            ? <Icon icon="mdi:loading" width="16" className="animate-spin" />
                            : <Icon icon="material-symbols:check-circle-rounded" width="18" />
                          }
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPhone(false);
                            setPhoneNumber(currentUser?.phone_number || "");
                          }}
                          disabled={isUpdatingPhone}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                          title="Batal"
                        >
                          <Icon icon="material-symbols:cancel-rounded" width="18" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditingPhone(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#862440]/10 text-[#862440] hover:bg-[#862440]/20 transition-colors"
                        title="Ubah Nomor"
                      >
                        <Icon icon="material-symbols:edit-outline" width="16" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Ganti Password Button */}
              <button
                type="button"
                onClick={() => setShowPasswordForm(true)}
                className="w-full py-3 rounded-xl border-2 border-[#862440] text-[#862440] font-semibold text-[14px] hover:bg-[#FFF0F3] transition-all flex items-center justify-center gap-2"
              >
                <Icon icon="material-symbols:lock-outline" width="18" />
                Ganti Password
              </button>
            </>
          ) : (
            /* ══ PASSWORD FORM ══ */
            <div className="pt-4">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="flex items-center gap-1.5 text-[13px] text-[#862440] font-semibold hover:underline mb-5"
              >
                <Icon icon="mdi:arrow-left" width="16" />
                Kembali ke Profil
              </button>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Password Lama
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-100 focus:border-[#862440] px-4 py-2.5 text-[13px] text-gray-700 outline-none transition-colors pr-10"
                      placeholder="Masukkan password lama"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon icon={showCurrentPw ? "mdi:eye-off-outline" : "mdi:eye-outline"} width="18" />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-100 focus:border-[#862440] px-4 py-2.5 text-[13px] text-gray-700 outline-none transition-colors pr-10"
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon icon={showNewPw ? "mdi:eye-off-outline" : "mdi:eye-outline"} width="18" />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-100 focus:border-[#862440] px-4 py-2.5 text-[13px] text-gray-700 outline-none transition-colors pr-10"
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon icon={showConfirmPw ? "mdi:eye-off-outline" : "mdi:eye-outline"} width="18" />
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${confirmPassword === newPassword ? "text-green-500" : "text-red-400"}`}>
                      <Icon icon={confirmPassword === newPassword ? "mdi:check-circle" : "mdi:close-circle"} width="13" />
                      {confirmPassword === newPassword ? "Password cocok" : "Password tidak cocok"}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  className="w-full rounded-xl bg-[#862440] px-4 py-3 text-[14px] font-bold text-white hover:bg-[#6d1c30] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {isUpdatingPassword ? (
                    <><Icon icon="mdi:loading" width="16" className="animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Icon icon="material-symbols:lock-reset" width="18" /> Simpan Password</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══ FOOTER ══ */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-500 font-semibold border border-gray-200 hover:bg-gray-100 transition-all text-[13px] flex items-center justify-center gap-2"
          >
            <Icon icon="material-symbols:arrow-back-ios-new-rounded" width="13" />
            Tutup Profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProfile;
