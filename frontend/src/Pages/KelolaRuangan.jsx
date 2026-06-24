import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import building_utama from "../assets/gu601.jpeg";
import axiosClient from "../axios";

// STATUS CONFIG
const STATUS_STYLES = {
  tersedia:       { badge: "bg-emerald-500", label: "Tersedia" },
  dipinjam:       { badge: "bg-orange-400",  label: "Dalam loan" },
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
const RoomCard = ({ room, onEdit, onDelete }) => {
  const statusCfg = STATUS_STYLES[room.room_status] ?? STATUS_STYLES.tersedia;

  return (
    <div className="bg-[#F5EDED] rounded-2xl shadow-md border border-pink-100 flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={room.path_foto || building_utama}
          alt={room.room_name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = building_utama; }}
        />
        <span className={`absolute top-3 right-3 ${statusCfg.badge} text-white text-[10px] px-3 py-1 rounded-full font-bold shadow`}>
          {statusCfg.label}
        </span>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-3 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h2 className="font-bold text-[15px] leading-tight truncate">{room.room_name}</h2>
          <div className="flex items-center gap-1 text-[11px] opacity-90 mt-0.5">
            <Icon icon="mdi:map-marker" width={12} />
            <span className="truncate">{room.building_name} - floor {room.floor_number}</span>
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 text-[12px] text-[#3D0C1F]">
        <span className="inline-block self-start border border-gray-400 rounded-full px-3 py-0.5 text-[10px] font-semibold mb-2 truncate max-w-full">
          {room.room_code}
        </span>

        <div className="space-y-1.5 flex-1">
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account" className="text-pink-500 shrink-0 mt-[1px]" width={14} />
            <p className="leading-snug line-clamp-1"><b>PIC</b>: {room.pic || "-"}</p>
          </div>
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account-group" className="text-pink-500 shrink-0 mt-[1px]" width={14} />
            <p className="leading-snug"><b>capacity</b>: {room.capacity} Orang</p>
          </div>
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:office-building" className="text-pink-500 shrink-0 mt-[1px]" width={14} />
            <p className="leading-snug line-clamp-2"><b>facility</b>: {room.facility || "-"}</p>
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
          <button
            onClick={() => onDelete(room)}
            className="bg-[#862440] text-white p-2 rounded-lg hover:bg-[#6e1d35] hover:scale-105 transition-all"
            title="Hapus room"
          >
            <Icon icon="mdi:delete-outline" width={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// MODAL FORM
const EMPTY_FORM = {
  room_code:      "",
  room_name:      "",
  building_id:         "",
  floor_number:      "",
  capacity:         "",
  facility:         "",
  room_description: "",
  room_status:    "tersedia",
  id_number_pic:   "",
};

const Modalroom = ({ onClose, onSave, editData, saving }) => {
  const [form, setForm] = useState(
    editData ? {
      room_code:      editData.room_code      ?? "",
      room_name:      editData.room_name      ?? "",
      building_id:         String(editData.building_id  ?? ""),
      floor_number:      String(editData.floor_number ?? ""),
      capacity:         editData.capacity          ?? "",
      facility:         editData.facility          ?? "",
      room_description: editData.room_description ?? "",
      room_status:    editData.room_status    ?? "tersedia",
      id_number_pic:   editData.id_number_pic != null ? String(editData.id_number_pic) : "",
    } : { ...EMPTY_FORM }
  );

  const [errors, setErrors]         = useState({});
  const [fotoFile, setFotoFile]     = useState(null);
  const [fotoPreview, setFotoPreview] = useState(editData?.path_foto ?? null);

  // Dropdown states
  const [picList,       setPicList]       = useState([]);
  const [buildingList,    setbuildingList]    = useState([]);
  const [floorList,    setfloorList]    = useState([]);
  const [picLoading,    setPicLoading]    = useState(true);
  const [buildingLoading, setbuildingLoading] = useState(true);
  const [floorLoading, setfloorLoading] = useState(true);
  const [picError,      setPicError]      = useState(false);
  const [buildingError,   setbuildingError]   = useState(false);
  const [floorError,   setfloorError]   = useState(false);

  const fetchPic = useCallback(() => {
    setPicLoading(true); setPicError(false);
    axiosClient.get("/penanggung-jawab")
      .then(({ data }) => setPicList(data.penanggung_jawab ?? []))
      .catch(() => setPicError(true))
      .finally(() => setPicLoading(false));
  }, []);

  const fetchbuilding = useCallback(() => {
    setbuildingLoading(true); setbuildingError(false);
    axiosClient.get("/get-building")
      .then(({ data }) => setbuildingList(data.data ?? []))
      .catch(() => setbuildingError(true))
      .finally(() => setbuildingLoading(false));
  }, []);

  const fetchfloor = useCallback(() => {
    setfloorLoading(true); setfloorError(false);
    axiosClient.get("/get-floor")
      .then(({ data }) => setfloorList(data.data ?? []))
      .catch(() => setfloorError(true))
      .finally(() => setfloorLoading(false));
  }, []);

  useEffect(() => {
    fetchPic();
    fetchbuilding();
    fetchfloor();
  }, [fetchPic, fetchbuilding, fetchfloor]);

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
    if (!form.room_code.trim())  e.room_code   = "Kode room wajib diisi.";
    if (!form.room_name.trim())  e.room_name   = "name room wajib diisi.";
    if (!form.building_id)            e.building_id      = "building wajib dipilih.";
    if (!form.floor_number)         e.floor_number   = "floor wajib dipilih.";
    if (!form.capacity)            e.capacity      = "capacity wajib diisi.";
    if (!form.facility.trim())     e.facility      = "facility wajib diisi.";
    if (!form.id_number_pic)      e.id_number_pic = "PIC wajib dipilih.";
    if (!form.room_status)       e.room_status = "Status wajib dipilih.";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#3D0C1F] px-5 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Icon icon={editData ? "mdi:pencil-circle-outline" : "mdi:plus-circle-outline"} width={20} />
            <h2 className="font-bold text-[17px]">{editData ? "Edit room" : "Tambah room Baru"}</h2>
          </div>
          <button onClick={onClose} disabled={saving} className="hover:bg-white/20 rounded-full p-1 transition disabled:opacity-50">
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">

          {/* Kode room */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Kode room <span className="text-red-500">*</span>
            </label>
            <input
              name="room_code" value={form.room_code} onChange={handleChange}
              placeholder="Contoh: GU-601"
              className={`${inputBase} ${errors.room_code ? "border-red-400" : ""}`}
            />
            {errors.room_code && <p className={errorText}>{errors.room_code}</p>}
          </div>

          {/* name room */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              name room <span className="text-red-500">*</span>
            </label>
            <input
              name="room_name" value={form.room_name} onChange={handleChange}
              placeholder="Contoh: Ruang Rapat Utama"
              className={`${inputBase} ${errors.room_name ? "border-red-400" : ""}`}
            />
            {errors.room_name && <p className={errorText}>{errors.room_name}</p>}
          </div>

          {/* building & floor — 2 kolom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                building <span className="text-red-500">*</span>
              </label>
              <DropdownField loading={buildingLoading} error={buildingError} onRetry={fetchbuilding}>
                <select
                  name="building_id" value={form.building_id} onChange={handleChange}
                  className={`${selectBase} ${errors.building_id ? "border-red-400" : ""}`}
                >
                  <option value="">— Pilih building —</option>
                  {buildingList.map((g) => (
                    <option key={g.building_id} value={g.building_id}>{g.building_name}</option>
                  ))}
                </select>
              </DropdownField>
              {errors.building_id && <p className={errorText}>{errors.building_id}</p>}
            </div>

            <div>
              <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
                floor <span className="text-red-500">*</span>
              </label>
              <DropdownField loading={floorLoading} error={floorError} onRetry={fetchfloor}>
                <select
                  name="floor_number" value={form.floor_number} onChange={handleChange}
                  className={`${selectBase} ${errors.floor_number ? "border-red-400" : ""}`}
                >
                  <option value="">— Pilih floor —</option>
                  {floorList.map((l) => (
                    <option key={l.floor_number} value={l.floor_number}>
                      {l.floor_name ? `${l.floor_name} (${l.floor_number})` : `floor ${l.floor_number}`}
                    </option>
                  ))}
                </select>
              </DropdownField>
              {errors.floor_number && <p className={errorText}>{errors.floor_number}</p>}
            </div>
          </div>

          {/* capacity */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number" name="capacity" value={form.capacity} onChange={handleChange}
              placeholder="Jumlah orang" min={1}
              className={`${inputBase} ${errors.capacity ? "border-red-400" : ""}`}
            />
            {errors.capacity && <p className={errorText}>{errors.capacity}</p>}
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

          {/* Status */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="room_status" value={form.room_status} onChange={handleChange}
                className={`${selectBase} ${errors.room_status ? "border-red-400" : ""}`}
              >
                <option value="tersedia">Tersedia</option>
                <option value="maintenance">Maintenance</option>
                <option value="tidak_tersedia">Tidak Tersedia</option>
              </select>
              <Icon icon="mdi:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={16} />
            </div>
            {errors.room_status && <p className={errorText}>{errors.room_status}</p>}
          </div>

          {/* facility */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              facility <span className="text-red-500">*</span>
            </label>
            <textarea
              name="facility" value={form.facility} onChange={handleChange}
              placeholder="Contoh: AC, Proyektor, Whiteboard"
              rows={2}
              className={`${inputBase} resize-none ${errors.facility ? "border-red-400" : ""}`}
            />
            {errors.facility && <p className={errorText}>{errors.facility}</p>}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              name="room_description" value={form.room_description} onChange={handleChange}
              placeholder="Deskripsi tambahan tentang room..."
              rows={2}
              className={`${inputBase} resize-none`}
            />
          </div>

          {/* Foto Upload */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Foto room <span className="text-gray-400 font-normal">(opsional)</span>
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
const Kelolaroom = () => {
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
  const fetchroom = useCallback(() => {
    setLoading(true);
    axiosClient.get("/get-room")
      .then(({ data }) => {
        const mapped = data.data.map((item) => ({
          id:                item.id,
          room_code:      item.room_code,
          room_name:      item.room_name,
          capacity:         item.capacity,
          facility:         item.facility,
          room_description: item.room_description,
          room_status:    item.room_status,
          path_foto:         item.path_foto ?? null,
          floor_number:      item.floor_number,
          building_id:         item.building_id,
          building_name:       item.building_name ?? "-",
          pic:               item.pic ?? "-",
          id_number_pic:   item.id_number_pic != null ? String(item.id_number_pic) : "",
        }));
        setRooms(mapped);
      })
      .catch((err) => {
        console.error("Gagal memuat data room:", err);
        showToast("Gagal memuat data room. Silakan muat ulang halaman.", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { fetchroom(); }, [fetchroom]);

  // ── Save (Create / Update) ───────────────────
  const handleSave = (formData, fotoFile) => {
    const payload = new FormData();
    payload.append("room_code",      formData.room_code.trim());
    payload.append("room_name",      formData.room_name.trim());
    payload.append("capacity",         Number(formData.capacity));
    payload.append("facility",         formData.facility.trim());
    payload.append("room_description", formData.room_description?.trim() ?? "");
    payload.append("room_status",    formData.room_status);
    payload.append("floor_number",      Number(formData.floor_number));
    payload.append("building_id",         Number(formData.building_id));
    payload.append("id_number_pic",   Number(formData.id_number_pic));
    if (fotoFile) {
      payload.append("foto", fotoFile);
    }
    if (editData) {
      payload.append("_method", "PUT");
    }

    setSaving(true);

    const url     = editData ? `/room/${editData.id}` : "/room";
    const request = axiosClient.post(url, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    request
      .then(() => {
        showToast(
          editData ? "room berhasil diperbarui." : "room berhasil ditambahkan.",
          "success"
        );
        fetchroom();
        closeModal();
      })
      .catch((err) => {
        console.error("Gagal menyimpan room:", err);
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
    const { id, room_name } = confirmDelete;
    setConfirmDelete(null);

    axiosClient.delete(`/room/${id}`)
      .then(() => {
        setRooms((prev) => {
          const updated = prev.filter((r) => r.id !== id);
          const maxPage = Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE));
          setCurrentPage((p) => Math.min(p, maxPage));
          return updated;
        });
        showToast(`room "${room_name}" berhasil dihapus.`, "success");
      })
      .catch((err) => {
        console.error("Gagal menghapus room:", err);
        showToast("Gagal menghapus room. Silakan coba lagi.", "error");
      });
  };

  // ── Modal helpers ────────────────────────────
  const openEdit  = (data) => { setEditData(data); setShowModal(true); };
  const closeModal = () => { if (!saving) { setShowModal(false); setEditData(null); } };

  // ── Search & Pagination ──────────────────────
  const filtered = rooms.filter((r) =>
    r.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.room_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.pic ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.building_name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalPages     = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRooms = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pageNumbers    = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  // ── Stats ────────────────────────────────────
  const tersedia      = rooms.filter((r) => r.room_status === "tersedia").length;
  const dipinjam      = rooms.filter((r) => r.room_status === "dipinjam").length;
  const tidakTersedia = rooms.filter((r) => r.room_status === "maintenance" || r.room_status === "tidak_tersedia").length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      <div className="ml-[300px] flex flex-col flex-1 p-6 lg:p-10 min-w-0">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight">
              Kelola room
            </h1>
            <p className="text-gray-500 text-[13px] mt-1">
              Lihat dan kelola seluruh room yang dapat dipinjam dalam sistem
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="self-start sm:self-auto flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-md hover:shadow-lg"
          >
            <Icon icon="mdi:plus" width={16} />
            Tambah room
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "room Tersedia",  value: tersedia,      sub: "Dapat dipinjam",              from: "#8B1E3F", to: "#C0254A", icon: "mdi:check-circle-outline" },
            { label: "Dalam loan",  value: dipinjam,      sub: "Sedang digunakan",             from: "#C0254A", to: "#FF4D8D", icon: "mdi:clock-outline" },
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
            placeholder="Cari name, kode, building, atau PIC..."
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
            <p className="text-[#C0254A] font-semibold text-[14px]">Memuat data room...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 gap-2 text-gray-400">
            <Icon icon="mdi:door-open" width={40} />
            <p className="text-[14px]">
              {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada data room."}
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
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} room
            </p>
          </>
        )}
      </div>

      {showModal && (
        <Modalroom onClose={closeModal} onSave={handleSave} editData={editData} saving={saving} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Apakah kamu yakin ingin menghapus room "${confirmDelete.room_name}"? Tindakan ini tidak dapat dibatalkan.`}
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

export default Kelolaroom;