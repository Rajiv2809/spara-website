import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

const Input = ({ label, name, type = "text", required = false, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[13px] font-medium text-[#3D0C1F]">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#C0254A]"
    />
  </div>
);

const Textarea = ({ label, name, required = false, value, onChange, placeholder = "" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[13px] font-medium text-[#3D0C1F]">
      {label} {required && "*"}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#C0254A] resize-none"
    />
  </div>
);

const Select = ({ label, name, options, required = false, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[13px] font-medium text-[#3D0C1F]">
      {label} {required && "*"}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#C0254A]"
    >
      <option value="">-pilih</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const SearchableSelect = ({ label, name, value, onChange, required }) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/penanggung-jawab")
      .then(({ data }) => {
        setOptions(data.penanggung_jawab ?? []);
        setFiltered(data.penanggung_jawab ?? []);
      })
      .catch((err) => console.error("Gagal memuat penanggung jawab:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      options.filter((o) =>
        o.nama.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, options]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item) => {
    setSelectedLabel(item.nama);
    setQuery("");
    setOpen(false);
    onChange({ target: { name, value: item.nomor_induk } });
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (!e.target.value) {
      setSelectedLabel("");
      onChange({ target: { name, value: "" } });
    }
  };

  const handleClear = () => {
    setSelectedLabel("");
    setQuery("");
    setOpen(false);
    onChange({ target: { name, value: "" } });
  };

  return (
    <div className="flex flex-col gap-1" ref={wrapperRef}>
      <label className="text-[13px] font-medium text-[#3D0C1F]">
        {label} {required && "*"}
      </label>

      <div
        className={`flex items-center border rounded-md px-3 py-2 bg-white transition-all ${
          open ? "border-[#C0254A]" : "border-gray-300"
        }`}
      >
        <Icon icon="mdi:magnify" className="text-gray-400 mr-2 text-base flex-shrink-0" />

        <input
          type="text"
          className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
          placeholder={selectedLabel || "Cari penanggung jawab..."}
          value={selectedLabel ? selectedLabel : query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />

        {(selectedLabel || query) && (
          <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 ml-1">
            <Icon icon="mdi:close" className="text-base" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="text-gray-400 hover:text-gray-600 ml-1"
        >
          <Icon
            icon="mdi:chevron-down"
            className={`text-base transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="relative z-50">
          <div className="absolute top-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-5 text-sm text-gray-400">
                <Icon icon="mdi:loading" className="animate-spin mr-2" />
                Memuat data...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-5 text-center text-sm text-gray-400">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.nomor_induk}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center hover:bg-pink-50 transition-colors ${
                    value === item.nomor_induk
                      ? "bg-pink-50 text-[#A3264C] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>{item.nama}</span>
                  <span className="text-xs text-gray-400 font-mono">{item.nomor_induk}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModalPengajuan = ({ ruangan, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [jadwalTerpakai, setJadwalTerpakai] = useState([]);
  const [isLoadingJadwal, setIsLoadingJadwal] = useState(false);
  const [tanggalCek, setTanggalCek] = useState("");

  const [form, setForm] = useState({
    nama_kegiatan: "",
    jenis_kegiatan: "",
    hari_tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    id_ruangan: "",
    nomor_induk_penanggungjawab: "",
    keterangan: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, id_ruangan: ruangan?.id_ruangan || "" }));
  }, [ruangan]);

  useEffect(() => {
    if (!tanggalCek) return;
    const ruanganId = ruangan?.id_ruangan;
    if (!ruanganId) return;

    setIsLoadingJadwal(true);
    setJadwalTerpakai([]);

    axiosClient
      .get(`/jadwal-ruangan/${ruanganId}/${tanggalCek}`)
      .then(({ data }) => setJadwalTerpakai(data.data ?? []))
      .catch((err) => {
        console.error("Gagal mengambil jadwal:", err);
        setJadwalTerpakai([]);
      })
      .finally(() => setIsLoadingJadwal(false));
  }, [tanggalCek, ruangan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatJamDisplay = (jam) => (!jam ? "-" : jam.slice(0, 5));

  const handleSubmit = () => {
    if (
      !form.nama_kegiatan ||
      !form.jenis_kegiatan ||
      !form.nomor_induk_penanggungjawab ||
      !form.hari_tanggal ||
      !form.jam_mulai ||
      !form.jam_selesai
    ) {
      alert("Harap lengkapi data wajib");
      return;
    }

    const payload = {
      nama_kegiatan: form.nama_kegiatan,
      jenis_kegiatan: form.jenis_kegiatan,
      hari_tanggal: form.hari_tanggal,
      jam_mulai: form.jam_mulai.slice(0, 5),
      jam_selesai: form.jam_selesai.slice(0, 5),
      id_ruangan: form.id_ruangan,
      nomor_induk_penanggungjawab: form.nomor_induk_penanggungjawab,
      keterangan: form.keterangan || null,
    };

    setShowConfirm(false);
    setIsSubmitting(true);
    setStep(3);

    axiosClient
      .post("/peminjaman", payload)
      .then(() => {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          setIsSuccess(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 1800);
      })
      .catch((err) => {
        console.error("Gagal submit:", err);
        setIsSubmitting(false);
        setStep(2);
        alert("Gagal mengirim pengajuan, coba lagi.");
      });
  };

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-2xl px-10 py-8 shadow-xl flex flex-col items-center gap-4 min-w-[320px]">
            {!isSuccess ? (
              <>
                <div className="w-10 h-10 border-4 border-[#C0254A] border-t-transparent rounded-full animate-spin" />
                <p className="font-semibold text-[#3D0C1F]">Pengajuan sedang diproses...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-green-600">✓</span>
                </div>
                <p className="font-bold text-[#3D0C1F]">Pengajuan berhasil diajukan!</p>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center pl-[300px] pr-6"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#A3264C] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="font-semibold text-lg">Form Pengajuan Peminjaman Ruangan</h2>
            <button onClick={onClose}>✕</button>
          </div>

          {/* Stepper */}
          <div className="px-10 pt-6 pb-2">
            <div className="flex justify-between relative">
              <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200" />
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 text-center relative z-10">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= s ? "bg-[#E84D7A] text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s}
                  </div>
                  <p className="text-xs mt-2 text-gray-500">
                    {s === 1 && "Cek Jadwal"}
                    {s === 2 && "Isi Form"}
                    {s === 3 && "Konfirmasi"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-8 pt-6 pb-8">

            {/* Step 1 - Cek Jadwal */}
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold text-[#3D0C1F] mb-4">
                  Jadwal Pemakaian Ruangan
                </h3>
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-5">
                  <p className="font-semibold text-[#A3264C] text-lg">{ruangan?.nama}</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Pilih tanggal untuk mengecek ketersediaan ruangan
                  </p>
                  <Input
                    label="Cek Ketersediaan Ruangan"
                    type="date"
                    value={tanggalCek}
                    onChange={(e) => setTanggalCek(e.target.value)}
                  />
                  <div className="mt-4 space-y-2">
                    {isLoadingJadwal ? (
                      <p className="text-sm text-gray-400">Memuat jadwal...</p>
                    ) : jadwalTerpakai.length > 0 ? (
                      jadwalTerpakai.map((item, i) => (
                        <div
                          key={i}
                          className="bg-white border rounded-lg px-4 py-3 flex justify-between items-center"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {item.jam_mulai && item.jam_selesai
                              ? `${formatJamDisplay(item.jam_mulai)} - ${formatJamDisplay(item.jam_selesai)}`
                              : "Jam belum ditentukan"}
                          </span>
                          <div className="text-right">
                            <p className="text-sm text-gray-700">{item.nama_kegiatan}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                item.jenis_kegiatan === "akademik"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {item.jenis_kegiatan}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        {tanggalCek
                          ? "Tidak ada peminjaman pada tanggal ini"
                          : "Pilih tanggal untuk melihat jadwal"}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 2 - Isi Form */}
            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold text-[#3D0C1F] mb-4">Detail Pengajuan</h3>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Jenis Kegiatan"
                    name="jenis_kegiatan"
                    value={form.jenis_kegiatan}
                    onChange={handleChange}
                    required
                    options={["akademik", "non akademik"]}
                  />
                  <Input
                    label="Nama Kegiatan"
                    name="nama_kegiatan"
                    value={form.nama_kegiatan}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mt-4">
                  <SearchableSelect
                    label="Penanggung Jawab"
                    name="nomor_induk_penanggungjawab"
                    value={form.nomor_induk_penanggungjawab}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Tanggal"
                    name="hari_tanggal"
                    type="date"
                    value={form.hari_tanggal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Jam Mulai"
                    name="jam_mulai"
                    type="time"
                    value={form.jam_mulai}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Jam Selesai"
                    name="jam_selesai"
                    type="time"
                    value={form.jam_selesai}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mt-4">
                  <Textarea
                    label="Keterangan"
                    name="keterangan"
                    value={form.keterangan}
                    onChange={handleChange}
                    placeholder="Tuliskan keterangan tambahan jika diperlukan..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t bg-white rounded-b-2xl">
            <div className="flex justify-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border rounded-lg text-sm"
                >
                  Kembali
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 1) setStep(2);
                  else setShowConfirm(true);
                }}
                className="bg-[#3D0C1F] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
              >
                <Icon icon="mdi:arrow-right" />
                {step === 1 ? "Lanjut Isi Form" : "Kirim Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-[400px] text-center shadow-xl">
            <h2 className="text-xl font-bold text-[#3D0C1F]">Konfirmasi Pengajuan</h2>
            <p className="text-sm text-gray-500 mt-3">
              Apakah Anda yakin ingin mengirim pengajuan ini?
            </p>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Ruangan:</span> {ruangan?.nama}</p>
              <p><span className="font-medium">ID Ruangan:</span> {form.id_ruangan}</p>
              <p><span className="font-medium">Kegiatan:</span> {form.nama_kegiatan}</p>
              <p><span className="font-medium">Jenis:</span> {form.jenis_kegiatan}</p>
              <p><span className="font-medium">Tanggal:</span> {form.hari_tanggal}</p>
              <p><span className="font-medium">Jam:</span> {form.jam_mulai.slice(0, 5)} - {form.jam_selesai.slice(0, 5)}</p>
              {form.keterangan && (
                <p><span className="font-medium">Keterangan:</span> {form.keterangan}</p>
              )}
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 border rounded-lg text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#A3264C] text-white rounded-lg text-sm font-semibold"
              >
                Ya, Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalPengajuan;