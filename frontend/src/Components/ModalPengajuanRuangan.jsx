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

const ModalPengajuan = ({ ruangan, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [jadwalTerpakai] = useState([
    {
      tanggal: "2026-04-30",
      mulai: "08:00",
      selesai: "10:00",
      kegiatan: "Seminar Fakultas",
    },
    {
      tanggal: "2026-04-30",
      mulai: "13:00",
      selesai: "15:00",
      kegiatan: "Rapat Dosen",
    },
    {
      tanggal: "2026-05-01",
      mulai: "09:00",
      selesai: "12:00",
      kegiatan: "Workshop",
    },
  ]);

  const [tanggalCek, setTanggalCek] = useState("");

  const [form, setForm] = useState({
    jenisKegiatan: "",
    namaKegiatan: "",
    penanggungJawab: "",
    ruangan: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    jamMulai: "",
    jamSelesai: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ruangan: ruangan?.nama || "",
    }));
  }, [ruangan]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const jadwalHariIni = jadwalTerpakai.filter(
    (item) => item.tanggal === tanggalCek
  );

  const handleSubmit = () => {
    if (
      !form.jenisKegiatan ||
      !form.namaKegiatan ||
      !form.penanggungJawab ||
      !form.tanggalMulai ||
      !form.tanggalSelesai ||
      !form.jamMulai ||
      !form.jamSelesai
    ) {
      alert("Harap lengkapi data wajib");
      return;
    }

    setShowConfirm(false);
    setIsSubmitting(true);
    setStep(3);

    setTimeout(() => setIsSuccess(true), 1800);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 3500);
  };

  return (
    <>
      {/* Loading */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-2xl px-10 py-8 shadow-xl flex flex-col items-center gap-4 min-w-[320px]">
            {!isSuccess ? (
              <>
                <div className="w-10 h-10 border-4 border-[#C0254A] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-semibold text-[#3D0C1F]">
                  Pengajuan sedang diproses...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-green-600">✓</span>
                </div>
                <p className="font-bold text-[#3D0C1F]">
                  Pengajuan berhasil diajukan!
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
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
            <h2 className="font-semibold text-lg">
              Form Pengajuan Peminjaman Ruangan
            </h2>

            <button onClick={onClose}>✕</button>
          </div>

          {/* Stepper */}
          <div className="px-10 pt-6 pb-2">
            <div className="flex justify-between relative">
              <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200"></div>

              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 text-center relative z-10">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= s
                        ? "bg-[#E84D7A] text-white"
                        : "bg-gray-200 text-gray-500"
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

          {/* Body */}
          <div className="overflow-y-auto px-8 pt-6 pb-8">
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold text-[#3D0C1F] mb-4">
                  Jadwal Pemakaian Ruangan
                </h3>

                <div className="bg-pink-50 border border-pink-100 rounded-xl p-5">
                  <p className="font-semibold text-[#A3264C] text-lg">
                    {ruangan?.nama}
                  </p>

                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Pilih tanggal untuk mengecek apakah ruangan sedang dipinjam
                  </p>

                  <Input
                    label="Cek Ketersediaan Ruangan"
                    type="date"
                    value={tanggalCek}
                    onChange={(e) => setTanggalCek(e.target.value)}
                  />

                  <div className="mt-4 space-y-2">
                    {jadwalHariIni.length > 0 ? (
                      jadwalHariIni.map((item, i) => (
                        <div
                          key={i}
                          className="bg-white border rounded-lg px-4 py-3 flex justify-between"
                        >
                          <span>
                            {item.mulai} - {item.selesai}
                          </span>

                          <span className="text-gray-500">
                            {item.kegiatan}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        Belum ada peminjaman
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold text-[#3D0C1F] mb-4">
                  Detail Pengajuan
                </h3>

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
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t bg-white rounded-b-2xl">
            <div className="flex justify-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border rounded-lg"
                >
                  Kembali
                </button>
              )}

              <button
                onClick={() => {
                  if (step === 1) {
                    setStep(2);
                  } else {
                    setShowConfirm(true);
                  }
                }}
                className="bg-[#3D0C1F] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <Icon icon="mdi:arrow-right" />
                {step === 1 ? "Lanjut Isi Form" : "Kirim Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm */}
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
                onClick={handleSubmit}
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