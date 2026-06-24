import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";

const Input = ({ label, name, type = "text", required = false, value, onChange, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[13px] font-medium text-[#3D0C1F]">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      {...props}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#C0254A] ${
      props.disabled
        ? "bg-gray-100 cursor-not-allowed"
        : ""
      }`}
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
        o.name.toLowerCase().includes(query.toLowerCase())
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
    setSelectedLabel(item.name);
    setQuery("");
    setOpen(false);
    onChange({ target: { name, value: item.id_number } });
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
                  key={item.id_number}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center hover:bg-pink-50 transition-colors ${
                    value === item.id_number
                      ? "bg-pink-50 text-[#A3264C] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{item.id_number}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModalPengajuan = ({ room, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [jadwalTerpakai, setJadwalTerpakai] = useState([]);
  const [isLoadingJadwal, setIsLoadingJadwal] = useState(false);
  const [tanggalCek, setTanggalCek] = useState("");

  const [jamMulaiCek, setJamMulaiCek] = useState("");
  const [jamSelesaiCek, setJamSelesaiCek] = useState("");

  const [showPendingWarning, setShowPendingWarning] = useState(false);

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDate = today.toISOString().split("T")[0];

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const isToday = tanggalCek === minDate;

  const [form, setForm] = useState({
    name_kegiatan: "",
    jenis_kegiatan: "",
    hari_tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    room_id: "",
    id_number_penanggungjawab: "",
    keterangan: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, room_id: room?.id || "" }));
  }, [room]);

  useEffect(() => {
    if (!tanggalCek) return;
    const roomId = room?.room_id;
    if (!roomId) return;

    setIsLoadingJadwal(true);
    setJadwalTerpakai([]);

    axiosClient
      .get(`/jadwal-room/${roomId}/${tanggalCek}`)
      .then(({ data }) => setJadwalTerpakai(data.data ?? []))
      .catch((err) => {
        console.error("Gagal mengambil jadwal:", err);
        setJadwalTerpakai([]);
      })
      .finally(() => setIsLoadingJadwal(false));
  }, [tanggalCek, room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatJamDisplay = (jam) => (!jam ? "-" : jam.slice(0, 5));

  const jadwalConfirmed = jadwalTerpakai.filter(
    (item) => !item.status_konfirmasi || item.status_konfirmasi === "disetujui"
  );
  const jadwalPending = jadwalTerpakai.filter(
    (item) => item.status_konfirmasi === "pending"
  );

  const cekBentrok = (list) => {
    if (!jamMulaiCek || !jamSelesaiCek) return false;
    return list.some((item) => jamMulaiCek < item.jam_selesai && jamSelesaiCek > item.jam_mulai);
  };

  const isBentrokConfirmed = cekBentrok(jadwalConfirmed);
  const isBentrokPending = cekBentrok(jadwalPending);

  const handleSubmit = () => {
    if (
      !form.name_kegiatan ||
      !form.jenis_kegiatan ||
      !form.id_number_penanggungjawab ||
      !form.hari_tanggal ||
      !form.jam_mulai ||
      !form.jam_selesai
    ) {
      alert("Harap lengkapi data wajib");
      return;
    }

    const payload = {
      name_kegiatan: form.name_kegiatan,
      jenis_kegiatan: form.jenis_kegiatan,
      hari_tanggal: form.hari_tanggal,
      jam_mulai: form.jam_mulai.slice(0, 5),
      jam_selesai: form.jam_selesai.slice(0, 5),
      room_id: form.room_id,
      id_number_penanggungjawab: form.id_number_penanggungjawab,
      keterangan: form.keterangan || null,
    };

    setShowConfirm(false);
    setIsSubmitting(true);
    setStep(3);

    axiosClient
      .post("/loan", payload)
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
            <h2 className="font-semibold text-lg">Form Pengajuan loan room</h2>
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
                  Jadwal Pemakaian room
                </h3>
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-5">
                  <p className="font-semibold text-[#A3264C] text-lg">{room?.name}</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Pilih tanggal untuk mengecek ketersediaan room
                  </p>
                  <Input
                    label="Cek Ketersediaan room"
                    type="date"
                    value={tanggalCek}
                    min={minDate}
                    onChange={(e) => setTanggalCek(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    
                    <Input
                    label="Jam Mulai"
                    type="time"
                    value={jamMulaiCek}
                    min={isToday ? currentTime : undefined}
                    onChange={(e) => setJamMulaiCek(e.target.value)}
                    />

                    <Input
                    label="Jam Selesai"
                    type="time"
                    value={jamSelesaiCek}
                    min={jamMulaiCek || (isToday ? currentTime : undefined)}
                    onChange={(e) => setJamSelesaiCek(e.target.value)}
                    />

                  </div>
                  {isBentrokConfirmed ? (
                    <p className="text-red-600 text-sm mt-2 font-medium">
                      Jadwal yang dipilih bertabrakan dengan loan lain yang sudah dikonfirmasi.
                    </p>
                  ) : isBentrokPending ? (
                    <p className="text-amber-600 text-sm mt-2 font-medium">
                      Ada loan yang diajukan di jam yang sama (belum disetujui). Anda tetap bisa melanjutkan.
                    </p>
                  ) : (
                    jamMulaiCek &&
                    jamSelesaiCek && (
                      <p className="text-green-600 text-sm mt-2 font-medium">
                        Jadwal tersedia.
                      </p>
                    )
                  )}

                  <div className="mt-4 space-y-2">
                    {isLoadingJadwal ? (
                      <p className="text-sm text-gray-400">Memuat jadwal...</p>
                    ) : jadwalConfirmed.length > 0 ? (
                      <>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jadwal Terkonfirmasi</p>
                        {jadwalConfirmed.map((item, i) => (
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
                              <p className="text-sm text-gray-700">{item.name_kegiatan}</p>
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
                        ))}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">
                        {tanggalCek
                          ? "Tidak ada loan pada tanggal ini"
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
                {/* Jadwal Summary */}
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Jadwal yang Dipilih</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Icon icon="mdi:calendar" className="text-[#A3264C]" />
                      <span>{form.hari_tanggal}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Icon icon="mdi:clock-outline" className="text-[#A3264C]" />
                      <span>{form.jam_mulai.slice(0, 5)} - {form.jam_selesai.slice(0, 5)}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#A3264C] mt-2">{room?.name}</p>
                </div>

                <h3 className="text-xl font-semibold text-[#3D0C1F] mb-4">Detail Pengajuan</h3>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Jenis Kegiatan"
                    name="jenis_kegiatan"
                    value={form.jenis_kegiatan}
                    onChange={handleChange}
                    required
                    options={["akademik", "non-akademik"]}
                  />
                  <Input
                    label="name Kegiatan"
                    name="name_kegiatan"
                    value={form.name_kegiatan}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mt-4">
                  <SearchableSelect
                    label="Penanggung Jawab"
                    name="id_number_penanggungjawab"
                    value={form.id_number_penanggungjawab}
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
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Jam Mulai"
                    name="jam_mulai"
                    type="time"
                    value={form.jam_mulai}
                    disabled
                  />
                  <Input
                    label="Jam Selesai"
                    name="jam_selesai"
                    type="time"
                    value={form.jam_selesai}
                    disabled
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
                  if (step === 1) {
                    if (!tanggalCek || !jamMulaiCek || !jamSelesaiCek) {
                      alert("Silahkan pilih tanggal dan jam terlebih dahulu.");
                      return;
                    }

                    if (jamMulaiCek >= jamSelesaiCek) {
                      alert("Jam selesai harus lebih besar dari jam mulai.");
                      return;
                    }

                    if (tanggalCek === minDate && jamMulaiCek < currentTime) {
                      alert("Jam mulai tidak boleh lebih kecil dari waktu saat ini.");
                      return;
                    }

                    if (isBentrokConfirmed) {
                      alert("Jam yang dipilih sudah digunakan oleh loan yang sudah dikonfirmasi.");
                      return;
                    }

                    if (isBentrokPending) {
                      setShowPendingWarning(true);
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      hari_tanggal: tanggalCek,
                      jam_mulai: jamMulaiCek,
                      jam_selesai: jamSelesaiCek,
                    }));

                    setStep(2);
                  } else {
                    setShowConfirm(true);
                  }
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

      {/* Modal Peringatan Pending */}
      {showPendingWarning && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-[420px] text-center shadow-xl">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl text-amber-600">!</span>
            </div>
            <h2 className="text-xl font-bold text-[#3D0C1F] mt-4">Peringatan</h2>
            <p className="text-sm text-gray-500 mt-3">
              Sudah ada orang lain yang mengajukan loan diwaktu yang sama, apakah anda tetap mau pinjam?
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => setShowPendingWarning(false)}
                className="px-6 py-2 border rounded-lg text-sm"
              >
                Tidak
              </button>
              <button
                onClick={() => {
                  setShowPendingWarning(false);
                  setForm((prev) => ({
                    ...prev,
                    hari_tanggal: tanggalCek,
                    jam_mulai: jamMulaiCek,
                    jam_selesai: jamSelesaiCek,
                  }));
                  setStep(2);
                }}
                className="px-6 py-2 bg-[#A3264C] text-white rounded-lg text-sm font-semibold"
              >
                Ya, Pinjam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-[400px] text-center shadow-xl">
            <h2 className="text-xl font-bold text-[#3D0C1F]">Konfirmasi Pengajuan</h2>
            <p className="text-sm text-gray-500 mt-3">
              Apakah Anda yakin ingin mengirim pengajuan ini?
            </p>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">room:</span> {room?.name}</p>
              <p><span className="font-medium">ID room:</span> {form.room_id}</p>
              <p><span className="font-medium">Kegiatan:</span> {form.name_kegiatan}</p>
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