import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const Input = ({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
}) => (
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

const Select = ({
  label,
  name,
  options,
  required = false,
  value,
  onChange,
}) => (
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
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ModalPengajuan = ({ peralatan, onClose, onSuccess }) => {
  const [step, setStep] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    nim: "",
    nama: "",
    email: "",
    jenisKegiatan: "",
    namaKegiatan: "",
    penanggungJawab: "",
    peralatan: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    jamMulai: "",
    jamSelesai: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      peralatan: peralatan?.nama || "",
    }));
  }, [peralatan]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.nim || !form.nama || !form.email) {
      alert("Harap lengkapi data wajib");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
        alert("Format email tidak valid");
        return;
    }

    console.log(form);

    setIsSubmitting(true); //Munculin Loading
    setIsSuccess(false);
    setStep(3); //Step Konfirmasi

    // loading dulu
    setTimeout(() => {
        setIsSuccess(true);
    }, 1800);

    // steleah suksesm, baru diclose
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(false);

        onClose();
        if (onSuccess) onSuccess();
    }, 3500);
  };

  return (
    <>
    {/* Loading Overlay */}
    {isSubmitting && (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
        <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-xl min-w-[320px]">

        {!isSuccess ? (
            <>
            <div className="w-10 h-10 border-4 border-[#C0254A] border-t-transparent rounded-full animate-spin"></div>

            <span className="text-[#3D0C1F] font-semibold text-sm">
                Pengajuan sedang diproses...
            </span>
            </>
        ) : (
            <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                <span className="text-green-600 text-4xl">✓</span>
            </div>

            <span className="text-[#3D0C1F] font-bold text-base">
                Pengajuan berhasil diajukan!
            </span>
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
        {/* HEADER */}
        <div className="bg-[#A3264C] text-white px-6 py-4 flex items-center rounded-t-lg justify-between shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon icon="mdi:arrow-left" />
            Form Pengajuan Peminjaman Peralatan
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* STEPPER */}
        <div className="px-10 pt-6 pb-2 shrink-0">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 -z-10"></div>

            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex flex-col items-center flex-1 text-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                    step >= s
                      ? "bg-[#E84D7A] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>

                <span className="text-xs mt-2 text-gray-500">
                  {s === 1 && "Pilih Peralatan"}
                  {s === 2 && "Isi Form"}
                  {s === 3 && "Konfirmasi"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="custom-scroll px-8 pt-4 overflow-y-auto">
          {/* SECTION 1 */}
          <h3 className="text-xl font-semibold text-[#3D0C1F] mb-4">
            Detail Peminjaman Peralatan
          </h3>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="NIM / NIK / Unit Pengaju"
                name="nim"
                value={form.nim}
                onChange={handleChange}
                required
              />

              <Input
                label="Nama Pengaju"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-4">
              <Input
                label="Alamat E-Mail Pengaju"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* SECTION 2 */}
          <h3 className="text-xl font-semibold text-[#3D0C1F] mt-8 mb-4">
            Detail Kegiatan dan Penanggung Jawab
          </h3>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Jenis Kegiatan"
                name="jenisKegiatan"
                value={form.jenisKegiatan}
                onChange={handleChange}
                required
                options={[
                  "Akademik",
                  "Non Akademik",
                  "Seminar",
                  "Rapat",
                ]}
              />

              <Input
                label="Nama Kegiatan"
                name="namaKegiatan"
                value={form.namaKegiatan}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-4">
              <Select
                label="Penanggung Jawab"
                name="penanggungJawab"
                value={form.penanggungJawab}
                onChange={handleChange}
                required
                options={["Ketua", "Wakil", "Staff", "Lainnya"]}
              />
            </div>
          </div>

          {/* SECTION 3 */}
          <h3 className="text-xl font-semibold text-[#3D0C1F] mt-8 mb-4">
            Detail Penggunaan Peralatan
          </h3>

          <div className="border-t pt-4">
            <Select
              label="Peralatan"
              name="peralatan"
              value={form.peralatan}
              onChange={handleChange}
              required
              options={[[peralatan]?.nama || "Peralatan Dipilih"]}
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Tanggal Mulai"
                name="tanggalMulai"
                type="date"
                value={form.tanggalMulai}
                onChange={handleChange}
                required
              />

              <Input
                label="Tanggal Selesai"
                name="tanggalSelesai"
                type="date"
                value={form.tanggalSelesai}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Jam Mulai"
                name="jamMulai"
                type="time"
                value={form.jamMulai}
                onChange={handleChange}
                required
              />

              <Input
                label="Jam Selesai"
                name="jamSelesai"
                type="time"
                value={form.jamSelesai}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        {/* BUTTON */}
          <div className="px-8 py-4 bg-white rounded-b-lg shrink-0">
            <div className="flex justify-center">
            <button
              onClick={() =>
                setShowConfirm(true)}
              className="bg-[#3D0C1F] hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              <Icon icon="mdi:arrow-right" />
              Kirim Pengajuan
            </button>
            </div>
          </div>
      </div>
    </div>
    
    {showConfirm && (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-[400px] text-center shadow-xl">
        <h2 className="text-xl font-bold text-[#3D0C1F]">
            Konfirmasi Pengajuan
        </h2>

        <p className="text-sm text-gray-500 mt-3">
            Apakah Anda yakin ingin mengirim pengajuan ini?
        </p>

        <div className="flex gap-3 justify-center mt-6">
            <button
            onClick={() => setShowConfirm(false)}
            className="px-6 py-2 border rounded-lg"
            >
            Batal
            </button>

            <button
            onClick={() => {
                setShowConfirm(false);
                handleSubmit();
            }}
            className="px-6 py-2 bg-[#A3264C] text-white rounded-lg"
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