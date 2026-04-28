const ModalKonfirmasi = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 w-[420px] text-center shadow-xl">
        <div className="text-green-500 text-5xl mb-4">✓</div>

        <h2 className="text-xl font-bold text-[#3D0C1F]">
          Pengajuan Berhasil
        </h2>

        <p className="text-gray-500 mt-2 text-sm">
          Pengajuan ruangan berhasil dikirim dan sedang menunggu persetujuan.
        </p>

        <button
          onClick={onClose}
          className="mt-6 bg-[#3D0C1F] text-white px-6 py-2 rounded-lg"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ModalKonfirmasi;