import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../Components/Sidebar";
import { Icon } from "@iconify/react";
import pertoolanImg from "../assets/pertoolan.jpg";
import axiosClient from "../axios";

const STATUS_STYLES = {
  tersedia:    { badge: "bg-emerald-500",  label: "Tersedia" },
  dipinjam:    { badge: "bg-orange-400",   label: "Dalam loan" },
  rusak:       { badge: "bg-red-500",      label: "Rusak" },
  maintenance: { badge: "bg-red-500",      label: "Maintenance" },
};

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
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-2xl text-[13px] font-medium animate-fade-in`}
    >
      <Icon
        icon={
          type === "success"
            ? "mdi:check-circle-outline"
            : type === "error"
            ? "mdi:alert-circle-outline"
            : "mdi:information-outline"
        }
        width={18}
      />
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <Icon icon="mdi:close" width={14} />
      </button>
    </div>
  );
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-2xl w-[340px] shadow-2xl overflow-hidden">
      <div className="bg-red-600 p-4 flex items-center gap-3 text-white">
        <Icon icon="mdi:alert-outline" width={22} />
        <h3 className="font-bold text-[16px]">Konfirmasi Hapus</h3>
      </div>
      <div className="p-5 text-[13px] text-gray-600">{message}</div>
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 rounded-full py-2 text-[12px] hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 text-white rounded-full py-2 text-[12px] hover:bg-red-700 transition"
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
);

const toolCard = ({ tool, onEdit, onDelete }) => {
  const statusCfg = STATUS_STYLES[tool.status] ?? STATUS_STYLES.tersedia;

  return (
    <div className="bg-[#F5EDED] rounded-2xl shadow-md border border-pink-100 flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={tool.foto || pertoolanImg}
          alt={tool.name}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 ${statusCfg.badge} text-white text-[10px] px-3 py-1 rounded-full font-bold shadow`}
        >
          {statusCfg.label}
        </span>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-3 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h2 className="font-bold text-[15px] leading-tight truncate">{tool.name}</h2>
          <div className="flex items-center gap-1 text-[11px] opacity-90 mt-0.5">
            <Icon icon="mdi:tools" width={12} />
            <span className="truncate">{tool.kode}</span>
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 text-[12px] text-[#3D0C1F]">
        <span className="inline-block self-start border border-gray-400 rounded-full px-3 py-0.5 text-[10px] font-semibold mb-2 truncate max-w-full">
          {tool.kode}
        </span>

        <div className="space-y-1.5 flex-1">
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:account" className="text-pink-500 shrink-0 mt-[1px]" width={14} />
            <p className="leading-snug line-clamp-1">
              <b>PIC</b>: {tool.pic || "-"}
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <Icon icon="mdi:information-outline" className="text-pink-500 shrink-0 mt-[1px]" width={14} />
            <p className="leading-snug line-clamp-2">
              <b>Deskripsi</b>: {tool.deskripsi || "-"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-pink-100">
          <button
            onClick={() => onEdit(tool)}
            className="flex-1 flex items-center justify-center gap-1 bg-[#862440] text-white px-3 py-2 rounded-lg text-[11px] hover:bg-[#6e1d35] hover:scale-105 transition-all"
          >
            <Icon icon="mdi:pencil-outline" width={12} />
            Ubah
          </button>
          <button
            onClick={() => onDelete(tool)}
            className="bg-[#862440] text-white p-2 rounded-lg hover:bg-[#6e1d35] hover:scale-105 transition-all"
            title="Hapus tool"
          >
            <Icon icon="mdi:delete-outline" width={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const EMPTY_FORM = {
  kode: "",
  name: "",
  deskripsi: "",
  status: "tersedia",
  id_number_pic: "",
};

const Modaltool = ({ onClose, onSave, editData, saving }) => {
  const [form, setForm] = useState(
    editData
      ? {
          kode:            editData.kode ?? "",
          name:            editData.name ?? "",
          deskripsi:       editData.deskripsi ?? "",
          status:          editData.status ?? "tersedia",
          id_number_pic: editData.id_number_pic ?? "",
        }
      : { ...EMPTY_FORM }
  );

  const [errors, setErrors]         = useState({});
  const [picList, setPicList]       = useState([]);
  const [picLoading, setPicLoading] = useState(true);
  const [picError, setPicError]     = useState(false);

  useEffect(() => {
    setPicLoading(true);
    setPicError(false);
    axiosClient
      .get("/penanggung-jawab")
      .then(({ data }) => {
        setPicList(data.penanggung_jawab ?? []);
      })
      .catch((err) => {
        console.error("Gagal memuat daftar PIC:", err);
        setPicError(true);
      })
      .finally(() => setPicLoading(false));
  }, []);

  const [fotoFile, setFotoFile]       = useState(null);
  const [fotoPreview, setFotoPreview] = useState(editData?.foto ?? null);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleRemoveFoto = (e) => {
    e.preventDefault();
    setFotoFile(null);
    setFotoPreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.kode.trim()) e.kode = "Kode tool wajib diisi.";
    if (!form.name.trim()) e.name = "name tool wajib diisi.";
    if (!form.status)      e.status = "Status wajib dipilih.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form, fotoFile);
  };

  const inputBase =
    "border border-gray-200 rounded-lg p-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-white";
  const errorText = "text-red-500 text-[10px] mt-0.5";

  const selectedPic = picList.find(
    (p) => String(p.id_number) === String(form.id_number_pic)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#3D0C1F] px-5 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Icon
              icon={editData ? "mdi:pencil-circle-outline" : "mdi:plus-circle-outline"}
              width={20}
            />
            <h2 className="font-bold text-[17px]">
              {editData ? "Edit tool" : "Tambah tool Baru"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="hover:bg-white/20 rounded-full p-1 transition disabled:opacity-50"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Kode tool <span className="text-red-500">*</span>
            </label>
            <input
              name="kode"
              value={form.kode}
              onChange={handleChange}
              placeholder="Contoh: ALT-001"
              className={`${inputBase} w-full ${errors.kode ? "border-red-400" : ""}`}
            />
            {errors.kode && <p className={errorText}>{errors.kode}</p>}
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              name Pertoolan <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Obeng Set Philips"
              className={`${inputBase} w-full ${errors.name ? "border-red-400" : ""}`}
            />
            {errors.name && <p className={errorText}>{errors.name}</p>}
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              PIC (Penanggung Jawab){" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>

            {picLoading ? (
              <div className="border border-gray-200 rounded-lg p-2 flex items-center gap-2 bg-gray-50">
                <Icon icon="mdi:loading" className="animate-spin text-gray-400" width={14} />
                <span className="text-[12px] text-gray-400">Memuat daftar PIC...</span>
              </div>
            ) : picError ? (
              <div className="border border-red-200 rounded-lg p-2 flex items-center gap-2 bg-red-50">
                <Icon icon="mdi:alert-circle-outline" className="text-red-400" width={14} />
                <span className="text-[12px] text-red-500">Gagal memuat daftar PIC.</span>
                <button
                  onClick={() => {
                    setPicError(false);
                    setPicLoading(true);
                    axiosClient
                      .get("/penanggung-jawab")
                      .then(({ data }) => setPicList(data.penanggung_jawab ?? []))
                      .catch(() => setPicError(true))
                      .finally(() => setPicLoading(false));
                  }}
                  className="ml-auto text-[11px] text-red-500 underline hover:text-red-700"
                >
                  Coba lagi
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  name="id_number_pic"
                  value={form.id_number_pic}
                  onChange={handleChange}
                  className={`${inputBase} w-full pr-8 appearance-none cursor-pointer`}
                >
                  <option value="">— Tidak ada PIC —</option>
                  {picList.map((pic) => (
                    <option key={pic.id_number} value={pic.id_number}>
                      {pic.name} ({pic.id_number})
                    </option>
                  ))}
                </select>
                <Icon
                  icon="mdi:chevron-down"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  width={16}
                />
              </div>
            )}

            {selectedPic && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-600">
                <Icon icon="mdi:account-check-outline" width={13} />
                <span>Terpilih: <b>{selectedPic.name}</b></span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`${inputBase} w-full pr-8 appearance-none cursor-pointer ${
                  errors.status ? "border-red-400" : ""
                }`}
              >
                <option value="tersedia">Tersedia</option>
                <option value="dipinjam">Dipinjam</option>
                <option value="rusak">Rusak</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <Icon
                icon="mdi:chevron-down"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width={16}
              />
            </div>
            {errors.status && <p className={errorText}>{errors.status}</p>}
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsi singkat tentang tool ini..."
              rows={3}
              className={`${inputBase} w-full resize-none`}
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-gray-700 mb-1 block">
            Foto tool{" "}
            <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 transition group">
            {fotoPreview ? (
              <div className="relative w-full">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-full h-36 rounded-lg object-cover border border-gray-200"
                />
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

        <div className="px-5 py-4 flex gap-2 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2.5 text-[12px] font-semibold hover:bg-pink-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-[#C0254A] text-white rounded-full py-2.5 text-[12px] font-semibold hover:bg-[#a01e3e] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && (
              <Icon icon="mdi:loading" className="animate-spin" width={14} />
            )}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

const KelolaPertoolan = () => {
  const [tool, settool]               = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [editData, setEditData]       = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]             = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const ITEMS_PER_PAGE = 8;

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const fetchtool = useCallback(() => {
    setLoading(true);
    axiosClient
      .get("/get-tool")
      .then(({ data }) => {
        const mapped = data.data.map((item) => ({
          id:              item.id,
          kode:            item.tool_code,
          name:            item.tool_name,
          deskripsi:       item.tool_description,
          status:          item.tool_status,
          pic:             item.pic ?? "-",
          id_number_pic: item.id_number_pic != null ? String(item.id_number_pic) : "",
          foto:            item.path_foto ?? null,
        }));
        settool(mapped);
      })
      .catch((err) => {
        console.error("Gagal memuat data tool:", err);
        showToast("Gagal memuat data pertoolan. Silakan muat ulang halaman.", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    fetchtool();
  }, [fetchtool]);

  const handleSave = (formData, fotoFile) => {
    const payload = new FormData();
    payload.append("tool_code",       formData.kode.trim());
    payload.append("tool_name",       formData.name.trim());
    payload.append("tool_description",  formData.deskripsi.trim());
    payload.append("tool_status",     formData.status);
    payload.append("id_number_pic", formData.id_number_pic || "");
    if (fotoFile) {
      payload.append("foto", fotoFile);
    }
    if (editData) {
      payload.append("_method", "PUT");
    }

    setSaving(true);

    const url = editData ? `/tool/${editData.id}` : "/tool";
    axiosClient.post(url, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        showToast(editData ? "tool berhasil diperbarui." : "tool berhasil ditambahkan.", "success");
        fetchtool();
        closeModal();
      })
      .catch((err) => {
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

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    setConfirmDelete(null);

    axiosClient
      .delete(`/tool/${id}`)
      .then(() => {
        settool((prev) => {
          const updated = prev.filter((a) => a.id !== id);
          const maxPage = Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE));
          setCurrentPage((p) => Math.min(p, maxPage));
          return updated;
        });
        showToast(`tool "${name}" berhasil dihapus.`, "success");
      })
      .catch((err) => {
        console.error("Gagal menghapus tool:", err);
        showToast("Gagal menghapus tool. Silakan coba lagi.", "error");
      });
  };

  const openEdit = (data) => {
    setEditData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setEditData(null);
    }
  };

  const filtered = tool.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.pic ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages    = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedtool = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const tersedia    = tool.filter((a) => a.status === "tersedia").length;
  const dipinjam    = tool.filter((a) => a.status === "dipinjam").length;
  const maintenance = tool.filter(
    (a) => a.status === "maintenance" || a.status === "rusak"
  ).length;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      <div className="ml-[300px] flex flex-col flex-1 p-6 lg:p-10 min-w-0">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-[#2D0A18] text-[26px] lg:text-[32px] font-extrabold leading-tight">
              Kelola Pertoolan
            </h1>
            <p className="text-gray-500 text-[13px] mt-1">
              Lihat dan kelola seluruh tool yang dapat dipinjam dalam sistem
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="self-start sm:self-auto flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-md hover:shadow-lg"
          >
            <Icon icon="mdi:plus" width={16} />
            Tambah tool
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Pertoolan Tersedia",
              value: tersedia,
              sub: "Dapat dipinjam",
              from: "#8B1E3F",
              to: "#C0254A",
              icon: "mdi:check-circle-outline",
            },
            {
              label: "Dalam loan",
              value: dipinjam,
              sub: "Sedang dipinjam",
              from: "#C0254A",
              to: "#FF4D8D",
              icon: "mdi:clock-outline",
            },
            {
              label: "Tidak Tersedia",
              value: maintenance,
              sub: "Rusak / Maintenance",
              from: "#FF4D8D",
              to: "#F8BFA6",
              icon: "mdi:tools",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
              className="text-white p-5 rounded-2xl flex justify-between items-center shadow-lg"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide opacity-90">
                  {s.label}
                </p>
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
            placeholder="Cari name, kode, atau PIC..."
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
            <p className="text-[#C0254A] font-semibold text-[14px]">
              Memuat data pertoolan...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 gap-2 text-gray-400">
            <Icon icon="mdi:tool-off-outline" width={40} />
            <p className="text-[14px]">
              {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada data pertoolan."}
            </p>
          </div>
        ) : (
          <>
            {/* Responsive grid: 1 → 2 → 3 → 4 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedtool.map((item) => (
                <toolCard
                  key={item.id}
                  tool={item}
                  onEdit={openEdit}
                  onDelete={(a) => setConfirmDelete(a)}
                />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* First */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition"
                  >
                    <Icon icon="mdi:chevron-double-left" />
                  </button>
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition"
                  >
                    <Icon icon="mdi:chevron-left" />
                  </button>

                  {/* Page numbers with ellipsis */}
                  {pageNumbers.map((p, idx) => {
                    const prev = pageNumbers[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-[13px]">
                            …
                          </span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${
                            currentPage === p
                              ? "bg-[#C0254A] text-white shadow"
                              : "text-[#C0254A] hover:bg-pink-100"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition"
                  >
                    <Icon icon="mdi:chevron-right" />
                  </button>
                  {/* Last */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a01e3e] transition"
                  >
                    <Icon icon="mdi:chevron-double-right" />
                  </button>
                </div>
              </div>
            )}

            {/* Result info */}
            <p className="text-center text-[11px] text-gray-400 mt-3">
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari{" "}
              {filtered.length} tool
            </p>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <Modaltool
          onClose={closeModal}
          onSave={handleSave}
          editData={editData}
          saving={saving}
        />
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <ConfirmDialog
          message={`Apakah kamu yakin ingin menghapus tool "${confirmDelete.name}"? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default KelolaPertoolan;