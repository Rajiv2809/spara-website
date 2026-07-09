import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import gedung_utama from "../assets/gu601.jpeg";
import axiosClient from "../axios";
import { useStateContext } from "../Contexts/context.jsx";

// STATUS CONFIG
const STATUS_STYLES = {
  tersedia:       { badge: "bg-emerald-500", label: "Tersedia" },
  dipinjam:       { badge: "bg-orange-400",  label: "Dalam Peminjaman" },
  maintenance:    { badge: "bg-red-500",     label: "Maintenance" },
  tidak_tersedia: { badge: "bg-red-500",     label: "Tidak Tersedia" },
};

// TOAST
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-emerald-600",
    error:   "bg-red-600",
    info:    "bg-blue-600",
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-2xl text-[13px] font-medium`}>
      <Icon
        icon={type === "success" ? "mdi:check-circle-outline" : type === "error" ? "mdi:alert-circle-outline" : "mdi:information-outline"}
        width={18}
      />
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <Icon icon="mdi:close" width={14} />
      </button>
    </div>
  );
};

// KONFIRMASI
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-2xl w-[340px] shadow-2xl overflow-hidden">
      <div className="bg-red-600 p-4 flex items-center gap-3 text-white">
        <Icon icon="mdi:alert-outline" width={22} />
        <h3 className="font-bold text-[16px]">Konfirmasi Hapus</h3>
      </div>
      <div className="p-5 text-[13px] text-gray-600">{message}</div>
      <div className="px-5 pb-5 flex gap-2">
        <button onClick={onCancel} className="flex-1 border border-gray-300 text-gray-600 rounded-full py-2 text-[12px] hover:bg-gray-50 transition">
          Batal
        </button>
        <button onClick={onConfirm} className="flex-1 bg-red-600 text-white rounded-full py-2 text-[12px] hover:bg-red-700 transition">
          Hapus
        </button>
      </div>
    </div>
  </div>
);

// DROPDOWN
const DropdownField = ({ loading, error, onRetry, children }) => {
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-2 flex items-center gap-2 bg-gray-50">
        <Icon icon="mdi:loading" className="animate-spin text-gray-400" width={14} />
        <span className="text-[12px] text-gray-400">Memuat data...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-2 flex items-center gap-2 bg-red-50">
        <Icon icon="mdi:alert-circle-outline" className="text-red-400" width={14} />
        <span className="text-[12px] text-red-500">Gagal memuat.</span>
        <button onClick={onRetry} className="ml-auto text-[11px] text-red-500 underline hover:text-red-700">
          Coba lagi
        </button>
      </div>
    );
  }
  return (
    <div className="relative">
      {children}
      <Icon icon="mdi:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={16} />
    </div>
  );
};

// ROOM CARD
const RoomCard = ({ room, onEdit, onDelete, canDelete }) => {
  const statusCfg = STATUS_STYLES[room.status_ruangan] ?? STATUS_STYLES.tersedia;

  return (
    <div className="bg-[#F5EDED] rounded-2xl shadow-md border border-pink-100 flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={room.path_foto || gedung_utama}
          alt={room.name_ruangan}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = gedung_utama; }}
        />
        <span className={`absolute top-3 right-3 ${statusCfg.badge} text-white text-[10px] px-3 py-1 rounded-full font-bold shadow`}>
          {statusCfg.label}
        </span>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-3 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h2 className="font-bold text-[15px] leading-tight truncate">{room.name_ruangan}</h2>
          <div className="flex items-center gap-1 text-[11px] opacity-90 mt-0.5">
            <Icon icon="mdi:map-marker" width={12} />
            <span className="truncate">{room.name_gedung} - Lantai {room.nomor_lantai}</span>
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 text-[12px] text-[#3D0C1F]">
        <span className="inline-block self-start border border-gray-400 rounded-full px-3 py-0.5 text-[10px] font-semibold mb-2 truncate max-w-full">
          {room.kode_ruangan}
        </span>

        <div className="space-y-1.5 flex-1">
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account" className="text-pink-500 shrink-0 mt-[1px]" width={14} />
            <p className="leading-snug line-clamp-1"><b>PIC</b>: {room.pic || "-"}</p>
          </div>
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account-group" className="text-pink-500 shrink-0 mt-[1px]" width={14} />
            <p className="leading-snug"><b>Kapasitas</b>: {room.kapasitas} Orang</p>
          </div>
          <div className="flex gap-2 items-start mt-1.5">
            <Icon icon="mdi:star-check-outline" className="text-pink-500 shrink-0 mt-[3px]" width={14} />
            <div className="flex flex-wrap gap-1">
              {(Array.isArray(room.fasilitas) ? room.fasilitas : []).length > 0
                ? (Array.isArray(room.fasilitas) ? room.fasilitas : []).slice(0, 4).map((f) => (
                    <span key={f} className="bg-pink-100 text-[#C0254A] text-[9px] px-1.5 py-0.5 rounded-full font-semibold">{f}</span>
                  ))
                : <span className="text-gray-400 text-[10px]">-</span>
              }
              {(Array.isArray(room.fasilitas) ? room.fasilitas : []).length > 4 && (
                <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded-full font-semibold">+{room.fasilitas.length - 4}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-pink-100">
          <button
            onClick={() => onEdit(room)}
            className="flex-1 flex items-center justify-center gap-1 bg-[#862440] text-white px-3 py-2 rounded-lg text-[11px] hover:bg-[#6e1d35] hover:scale-105 transition-all"
          >
            <Icon icon="mdi:pencil-outline" width={12} />
            Ubah
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(room)}
              className="bg-[#862440] text-white p-2 rounded-lg hover:bg-[#6e1d35] hover:scale-105 transition-all"
              title="Hapus ruangan"
            >
              <Icon icon="mdi:delete-outline" width={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// MODAL FORM
const EMPTY_FORM = {
  kode_ruangan:      "",
  name_ruangan:      "",
  id_gedung:         "",
  nomor_lantai:      "",
  kapasitas:         "",
  fasilitas:         "",
  deskripsi_ruangan: "",
  status_ruangan:    "tersedia",
  id_number_pic:   "",
};

const ModalRuangan = ({ onClose, onSave, editData, saving, isPic }) => {
  const [form, setForm] = useState(
    editData ? {
      kode_ruangan:      editData.kode_ruangan      ?? "",
      name_ruangan:      editData.name_ruangan      ?? "",
      id_gedung:         String(editData.id_gedung  ?? ""),
      nomor_lantai:      String(editData.nomor_lantai ?? ""),
      kapasitas:         editData.kapasitas          ?? "",
      fasilitas:         Array.isArray(editData.fasilitas) ? editData.fasilitas.join(', ') : (editData.fasilitas ?? ""),
      deskripsi_ruangan: editData.deskripsi_ruangan ?? "",
      status_ruangan:    editData.status_ruangan    ?? "tersedia",
      id_number_pic:   editData.id_number_pic != null ? String(editData.id_number_pic) : "",
    } : { ...EMPTY_FORM }
  );

  const [errors, setErrors]         = useState({});
  const [fotoFile, setFotoFile]     = useState(null);
  const [fotoPreview, setFotoPreview] = useState(editData?.path_foto ?? null);

  // Dropdown states
  const [picList,       setPicList]       = useState([]);
  const [gedungList,    setGedungList]    = useState([]);
  const [lantaiList,    setLantaiList]    = useState([]);
  const [picLoading,    setPicLoading]    = useState(true);
  const [gedungLoading, setGedungLoading] = useState(true);
  const [lantaiLoading, setLantaiLoading] = useState(true);
  const [picError,      setPicError]      = useState(false);
  const [gedungError,   setGedungError]   = useState(false);
  const [lantaiError,   setLantaiError]   = useState(false);

  const fetchPic = useCallback(() => {
    setPicLoading(true); setPicError(false);
    axiosClient.get("/penanggung-jawab")
      .then(({ data }) => setPicList(data.penanggung_jawab ?? []))
      .catch(() => setPicError(true))
      .finally(() => setPicLoading(false));
  }, []);

  const fetchGedung = useCallback(() => {
    setGedungLoading(true); setGedungError(false);
    axiosClient.get("/get-gedung")
      .then(({ data }) => setGedungList(data.data ?? []))
      .catch(() => setGedungError(true))
      .finally(() => setGedungLoading(false));
  }, []);

  const fetchLantai = useCallback(() => {
    setLantaiLoading(true); setLantaiError(false);
    axiosClient.get("/get-lantai")
      .then(({ data }) => setLantaiList(data.data ?? []))
      .catch(() => setLantaiError(true))
      .finally(() => setLantaiLoading(false));
  }, []);

  useEffect(() => {
    fetchPic();
    fetchGedung();
    fetchLantai();
  }, [fetchPic, fetchGedung, fetchLantai]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    if (errors.foto) setErrors((prev) => ({ ...prev, foto: "" }));
  };

  const handleRemoveFoto = (e) => {
    e.preventDefault();
    setFotoFile(null);
    setFotoPreview(null);
  };

  const validate = () => {
    const e = {};
    if (isPic && editData) {
      if (!form.status_ruangan) e.status_ruangan = "Status wajib dipilih.";
      return e;
    }

    if (!form.kode_ruangan.trim())  e.kode_ruangan   = "Kode ruangan wajib diisi.";
    if (!form.name_ruangan.trim())  e.name_ruangan   = "name ruangan wajib diisi.";
    if (!form.id_gedung)            e.id_gedung      = "Gedung wajib dipilih.";
    if (!form.nomor_lantai)         e.nomor_lantai   = "Lantai wajib dipilih.";
    if (!form.kapasitas)            e.kapasitas      = "Kapasitas wajib diisi.";
    if (!form.fasilitas.trim())     e.fasilitas      = "Fasilitas wajib diisi.";
    if (!form.id_number_pic)      e.id_number_pic = "PIC wajib dipilih.";
    if (!form.status_ruangan)       e.status_ruangan = "Status wajib dipilih.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form, fotoFile);
  };

  const inputBase  = "border border-gray-200 rounded-lg p-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-white w-full";
  const selectBase = `${inputBase} pr-8 appearance-none cursor-pointer`;
  const errorText  = "text-red-500 text-[10px] mt-0.5";

  const selectedPic = picList.find((p) => String(p.id_number) === String(form.id_number_pic));
  const isPicEditing = isPic && Boolean(editData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#3D0C1F] px-5 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Icon icon={editData ? "mdi:pencil-circle-outline" : "mdi:plus-circle-outline"} width={20} />
            <h2 className="font-bold text-[17px]">{editData ? "Edit Ruangan" : "Tambah Ruangan Baru"}</h2>
          </div>
          <button onClick={onClose} disabled={saving} className="hover:bg-white/20 rounded-full p-1 transition disabled:opacity-50">
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">

          {!isPicEditing && (
            <>
              {/* Kode Ruangan */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                  Kode Ruangan <span className="text-red-500">*</span>
                </label>
                <input
                  name="kode_ruangan" value={form.kode_ruangan} onChange={handleChange}
                  placeholder="Contoh: GU-601"
                  className={`${inputBase} ${errors.kode_ruangan ? "border-red-400" : ""}`}
                />
                {errors.kode_ruangan && <p className={errorText}>{errors.kode_ruangan}</p>}
              </div>

              {/* name Ruangan */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                  name Ruangan <span className="text-red-500">*</span>
                </label>
                <input
                  name="name_ruangan" value={form.name_ruangan} onChange={handleChange}
                  placeholder="Contoh: Ruang Rapat Utama"
                  className={`${inputBase} ${errors.name_ruangan ? "border-red-400" : ""}`}
                />
                {errors.name_ruangan && <p className={errorText}>{errors.name_ruangan}</p>}
              </div>

              {/* Gedung & Lantai — 2 kolom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                    Gedung <span className="text-red-500">*</span>
                  </label>
                  <DropdownField loading={gedungLoading} error={gedungError} onRetry={fetchGedung}>
                    <select
                      name="id_gedung" value={form.id_gedung} onChange={handleChange}
                      className={`${selectBase} ${errors.id_gedung ? "border-red-400" : ""}`}
                    >
                      <option value="">— Pilih Gedung —</option>
                      {gedungList.map((g) => (
                        <option key={g.id_gedung} value={g.id_gedung}>{g.name_gedung}</option>
                      ))}
                    </select>
                  </DropdownField>
                  {errors.id_gedung && <p className={errorText}>{errors.id_gedung}</p>}
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                    Lantai <span className="text-red-500">*</span>
                  </label>
                  <DropdownField loading={lantaiLoading} error={lantaiError} onRetry={fetchLantai}>
                    <select
                      name="nomor_lantai" value={form.nomor_lantai} onChange={handleChange}
                      className={`${selectBase} ${errors.nomor_lantai ? "border-red-400" : ""}`}
                    >
                      <option value="">— Pilih Lantai —</option>
                      {lantaiList.map((l) => (
                        <option key={l.nomor_lantai} value={l.nomor_lantai}>
                          {l.name_lantai ? `${l.name_lantai} (${l.nomor_lantai})` : `Lantai ${l.nomor_lantai}`}
                        </option>
                      ))}
                    </select>
                  </DropdownField>
                  {errors.nomor_lantai && <p className={errorText}>{errors.nomor_lantai}</p>}
                </div>
              </div>

              {/* Kapasitas */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                  Kapasitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" name="kapasitas" value={form.kapasitas} onChange={handleChange}
                  placeholder="Jumlah orang" min={1}
                  className={`${inputBase} ${errors.kapasitas ? "border-red-400" : ""}`}
                />
                {errors.kapasitas && <p className={errorText}>{errors.kapasitas}</p>}
              </div>

              {/* PIC Dropdown */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                  PIC (Penanggung Jawab) <span className="text-red-500">*</span>
                </label>
                <DropdownField loading={picLoading} error={picError} onRetry={fetchPic}>
                  <select
                    name="id_number_pic" value={form.id_number_pic} onChange={handleChange}
                    className={`${selectBase} ${errors.id_number_pic ? "border-red-400" : ""}`}
                  >
                    <option value="">— Pilih PIC —</option>
                    {picList.map((pic) => (
                      <option key={pic.id_number} value={pic.id_number}>{pic.name}</option>
                    ))}
                  </select>
                </DropdownField>
                {errors.id_number_pic && <p className={errorText}>{errors.id_number_pic}</p>}
                {selectedPic && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <Icon icon="mdi:account-check-outline" width={13} />
                    <span>Terpilih: <b>{selectedPic.name}</b></span>
                  </div>
                )}
              </div>

              {/* Fasilitas */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                  Fasilitas <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="fasilitas" value={form.fasilitas} onChange={handleChange}
                  placeholder="Contoh: AC, Proyektor, Whiteboard"
                  rows={2}
                  className={`${inputBase} resize-none ${errors.fasilitas ? "border-red-400" : ""}`}
                />
                {errors.fasilitas && <p className={errorText}>{errors.fasilitas}</p>}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                  Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  name="deskripsi_ruangan" value={form.deskripsi_ruangan} onChange={handleChange}
                  placeholder="Deskripsi tambahan tentang ruangan..."
                  rows={2}
                  className={`${inputBase} resize-none`}
                />
              </div>

              {/* Foto Upload */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                  Foto Ruangan <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 transition group">
                  {fotoPreview ? (
                    <div className="relative w-full">
                      <img src={fotoPreview} alt="Preview" className="w-full h-36 rounded-lg object-cover border border-gray-200" />
                      <button
                        type="button"
                        onClick={handleRemoveFoto}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition shadow"
                      >
                        <Icon icon="mdi:close" width={13} />
                      </button>
                      <p className="text-[10px] text-gray-400 mt-2">Klik untuk ganti foto</p>
                    </div>
                  ) : (
                    <>
                      <Icon icon="mdi:cloud-upload-outline" className="text-3xl text-gray-300 group-hover:text-pink-400 mb-2 transition" />
                      <p className="text-[12px] text-gray-500">Klik untuk upload foto</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">PNG / JPG, maks 2MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          )}

          {/* Status */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="status_ruangan" value={form.status_ruangan} onChange={handleChange}
                className={`${selectBase} ${errors.status_ruangan ? "border-red-400" : ""}`}
              >
                {isPicEditing && !["tersedia", "maintenance"].includes(form.status_ruangan) && (
                  <option value={form.status_ruangan} disabled>
                    {STATUS_STYLES[form.status_ruangan]?.label ?? form.status_ruangan}
                  </option>
                )}
                <option value="tersedia">Tersedia</option>
                <option value="maintenance">Maintenance</option>
                {!isPicEditing && <option value="tidak_tersedia">Tidak Tersedia</option>}
              </select>
              <Icon icon="mdi:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={16} />
            </div>
            {errors.status_ruangan && <p className={errorText}>{errors.status_ruangan}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-2 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose} disabled={saving}
            className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2.5 text-[12px] font-semibold hover:bg-pink-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-[#C0254A] text-white rounded-full py-2.5 text-[12px] font-semibold hover:bg-[#a01e3e] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Icon icon="mdi:loading" className="animate-spin" width={14} />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

// MAIN PAGE
const KelolaRuangan = () => {
  const { currentUser } = useStateContext();
  const isPic = currentUser?.role?.toLowerCase() === "pic";

  const [rooms, setRooms]                 = useState([]);
  const [showModal, setShowModal]         = useState(false);
  const [editData, setEditData]           = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");

  const ITEMS_PER_PAGE = 8;

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // ── Fetch ────────────────────────────────────
  const fetchRuangan = useCallback(() => {
    setLoading(true);
    axiosClient.get("/get-ruangan")
      .then(({ data }) => {
        const mapped = data.data.map((item) => ({
          id:                item.id,
          kode_ruangan:      item.kode_ruangan,
          name_ruangan:      item.name_ruangan,
          kapasitas:         item.kapasitas,
          fasilitas:         Array.isArray(item.fasilitas) ? item.fasilitas : [],
          deskripsi_ruangan: item.deskripsi_ruangan,
          status_ruangan:    item.status_ruangan,
          path_foto:         item.path_foto ?? null,
          nomor_lantai:      item.nomor_lantai,
          id_gedung:         item.id_gedung,
          name_gedung:       item.name_gedung ?? "-",
          pic:               item.pic ?? "-",
          id_number_pic:   item.id_number_pic != null ? String(item.id_number_pic) : "",
        }));
        setRooms(mapped);
      })
      .catch((err) => {
        console.error("Gagal memuat data ruangan:", err);
        showToast("Gagal memuat data ruangan. Silakan muat ulang halaman.", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { fetchRuangan(); }, [fetchRuangan]);

  // ── Save (Create / Update) ───────────────────
  const handleSave = (formData, fotoFile) => {
    const payload = new FormData();
    payload.append("kode_ruangan",      formData.kode_ruangan.trim());
    payload.append("name_ruangan",      formData.name_ruangan.trim());
    payload.append("kapasitas",         Number(formData.kapasitas));
    payload.append("fasilitas",         formData.fasilitas.trim());
    payload.append("deskripsi_ruangan", formData.deskripsi_ruangan?.trim() ?? "");
    // payload.append("status_ruangan",    formData.status_ruangan);
    payload.append("nomor_lantai",      Number(formData.nomor_lantai));
    payload.append("id_gedung",         Number(formData.id_gedung));
    payload.append("id_number_pic",   Number(formData.id_number_pic));
    if (fotoFile) {
      payload.append("foto", fotoFile);
    }
    if (editData) {
      payload.append("_method", "PUT");
    }

    setSaving(true);

    const url     = editData ? `/ruangan/${editData.id}` : "/ruangan";
    const request = axiosClient.post(url, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    request
      .then(() => {
        showToast(
          editData ? "Ruangan berhasil diperbarui." : "Ruangan berhasil ditambahkan.",
          "success"
        );
        fetchRuangan();
        closeModal();
      })
      .catch((err) => {
        console.error("Gagal menyimpan ruangan:", err);
        if (err.response?.data?.errors) {
          const messages = Object.values(err.response.data.errors).flat().join("\n");
          showToast("Validasi gagal: " + messages, "error");
        } else if (err.response?.data?.message) {
          showToast(err.response.data.message, "error");
        } else {
          showToast("Gagal menyimpan data. Silakan coba lagi.", "error");
        }
      })
      .finally(() => setSaving(false));
  };

  // ── Delete ───────────────────────────────────
  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const { id, name_ruangan } = confirmDelete;
    setConfirmDelete(null);

    axiosClient.delete(`/ruangan/${id}`)
      .then(() => {
        setRooms((prev) => {
          const updated = prev.filter((r) => r.id !== id);
          const maxPage = Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE));
          setCurrentPage((p) => Math.min(p, maxPage));
          return updated;
        });
        showToast(`Ruangan "${name_ruangan}" berhasil dihapus.`, "success");
      })
      .catch((err) => {
        console.error("Gagal menghapus ruangan:", err);
        showToast("Gagal menghapus ruangan. Silakan coba lagi.", "error");
      });
  };

  // ── Modal helpers ────────────────────────────
  const openEdit  = (data) => { setEditData(data); setShowModal(true); };
  const closeModal = () => { if (!saving) { setShowModal(false); setEditData(null); } };

  // ── Search & Pagination ──────────────────────
  const filtered = rooms.filter((r) =>
    r.name_ruangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.kode_ruangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.pic ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.name_gedung ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalPages     = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRooms = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pageNumbers    = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  // ── Stats ────────────────────────────────────
  const tersedia      = rooms.filter((r) => r.status_ruangan === "tersedia").length;
  const dipinjam      = rooms.filter((r) => r.status_ruangan === "dipinjam").length;
  const tidakTersedia = rooms.filter((r) => r.status_ruangan === "maintenance" || r.status_ruangan === "tidak_tersedia").length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      <div className="ml-[300px] flex flex-col flex-1 p-6 lg:p-10 min-w-0">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight">
              Kelola Ruangan
            </h1>
            <p className="text-gray-500 text-[13px] mt-1">
              Lihat dan kelola seluruh ruangan yang dapat dipinjam dalam sistem
            </p>
          </div>
          {!isPic && (
            <button
              onClick={() => setShowModal(true)}
              className="self-start sm:self-auto flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-md hover:shadow-lg"
            >
              <Icon icon="mdi:plus" width={16} />
              Tambah Ruangan
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Ruangan Tersedia",  value: tersedia,      sub: "Dapat dipinjam",              from: "#8B1E3F", to: "#C0254A", icon: "mdi:check-circle-outline" },
            { label: "Dalam Peminjaman",  value: dipinjam,      sub: "Sedang digunakan",             from: "#C0254A", to: "#FF4D8D", icon: "mdi:clock-outline" },
            { label: "Tidak Tersedia",    value: tidakTersedia, sub: "Maintenance / Tidak tersedia", from: "#FF4D8D", to: "#F8BFA6", icon: "mdi:tools" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
              className="text-white p-5 rounded-2xl flex justify-between items-center shadow-lg"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide opacity-90">{s.label}</p>
                <h2 className="text-[42px] font-extrabold leading-none my-1">{s.value}</h2>
                <p className="text-[11px] opacity-75 italic">{s.sub}</p>
              </div>
              <Icon icon={s.icon} width={40} className="opacity-30" />
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-pink-100 mb-6 max-w-md">
          <Icon icon="mdi:magnify" className="text-gray-400" width={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari name, kode, gedung, atau PIC..."
            className="flex-1 text-[13px] outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <Icon icon="mdi:close-circle" className="text-gray-400 hover:text-gray-600" width={16} />
            </button>
          )}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 gap-3">
            <Icon icon="mdi:loading" className="animate-spin text-[#C0254A]" width={36} />
            <p className="text-[#C0254A] font-semibold text-[14px]">Memuat data ruangan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 gap-2 text-gray-400">
            <Icon icon="mdi:door-open" width={40} />
            <p className="text-[14px]">
              {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada data ruangan."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={openEdit}
                  onDelete={(r) => setConfirmDelete(r)}
                  canDelete={!isPic}
                />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition">
                    <Icon icon="mdi:chevron-double-left" />
                  </button>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition">
                    <Icon icon="mdi:chevron-left" />
                  </button>

                  {pageNumbers.map((p, idx) => {
                    const prev = pageNumbers[idx - 1];
                    return (
                      <React.Fragment key={p}>
                        {prev && p - prev > 1 && (
                          <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-[13px]">…</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${
                            currentPage === p ? "bg-[#C0254A] text-white shadow" : "text-[#C0254A] hover:bg-pink-100"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition">
                    <Icon icon="mdi:chevron-right" />
                  </button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition">
                    <Icon icon="mdi:chevron-double-right" />
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-[11px] text-gray-400 mt-3">
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} ruangan
            </p>
          </>
        )}
      </div>

      {showModal && (
        <ModalRuangan onClose={closeModal} onSave={handleSave} editData={editData} saving={saving} isPic={isPic} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Apakah kamu yakin ingin menghapus ruangan "${confirmDelete.name_ruangan}"? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default KelolaRuangan;