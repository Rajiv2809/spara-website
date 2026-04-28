import React, { useState, useMemo } from "react";
import Sidebar from "../Components/sidebar";
import { Icon } from "@iconify/react";
import ModalPengajuan from "../Components/ModalPengajuanRuangan";
import gedung_utama from '../assets/gu601.jpeg';

const ruanganData = [
  { nama: "Workspace Multimedia", kode: "GU-604", gedung: "Gedung Utama", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 30, fasilitas: ["Proyektor", "AC", "Whiteboard", "WiFi", "TV LED"], deskripsi: "Ruangan multifungsi yang dilengkapi perangkat multimedia lengkap, cocok untuk workshop, presentasi, dan rapat tim kreatif." },
  { nama: "Lab Motion Capture", kode: "GU-607", gedung: "Gedung Utama", status: "TERSEDIA", lantai: "Lantai 3", kapasitas: 20, fasilitas: ["Kamera Motion Capture", "AC", "PC Workstation", "WiFi", "Green Screen"], deskripsi: "Lab khusus motion capture dengan peralatan profesional untuk penelitian dan produksi animasi 3D." },
  { nama: "Workspace Software Development", kode: "GU-704", gedung: "Gedung Utama", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 40, fasilitas: ["Proyektor", "AC", "Whiteboard", "WiFi", "32 PC"], deskripsi: "Ruang kerja pengembangan perangkat lunak dengan workstation berperforma tinggi dan koneksi internet dedicated." },
  { nama: "Cyber Physical System Security Lab", kode: "TA-X-3", gedung: "Gedung Utama", status: "MAINTENANCE", lantai: "Lantai 4", kapasitas: 25, fasilitas: ["Server Rack", "AC", "Whiteboard", "WiFi", "Firewall Hardware"], deskripsi: "Laboratorium keamanan sistem cyber-physical dengan perangkat penelitian keamanan siber mutakhir." },
  { nama: "Workspace Cyber Forensic", kode: "TA-XI-5A", gedung: "Gedung Utama", status: "TERSEDIA", lantai: "Lantai 4", kapasitas: 15, fasilitas: ["PC Forensik", "AC", "Whiteboard", "WiFi", "Write Blocker"], deskripsi: "Ruang kerja forensik digital dengan perangkat lunak dan keras khusus investigasi kejahatan siber." },
  { nama: "Lab Clay Modeling", kode: "GT-L1-006", gedung: "Gedung Utama", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 20, fasilitas: ["Meja Kerja", "AC", "Rak Penyimpanan", "Wastafel", "Oven Keramik"], deskripsi: "Laboratorium pemodelan clay dengan fasilitas lengkap untuk desain produk dan eksplorasi seni kreatif." },
  { nama: "Workspace Remote Sensing", kode: "GT-L3-007", gedung: "Gedung Utama", status: "TIDAK TERSEDIA", lantai: "Lantai 3", kapasitas: 30, fasilitas: ["Proyektor", "AC", "Whiteboard", "WiFi", "GPS Tools", "Drone"], deskripsi: "Ruang kerja penginderaan jauh dengan perangkat analisis data geospasial dan citra satelit." },
  { nama: "Hydrographic Survey Lab", kode: "GT-L1-008", gedung: "Gedung Technopreneur", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 18, fasilitas: ["Proyektor", "AC", "Whiteboard", "WiFi", "Peralatan Survey", "Sonar"], deskripsi: "Ruang survei hidrografi lengkap dengan peralatan pemetaan dan pengukuran kedalaman bawah air." },
  { nama: "Studio Podcast & Broadcasting", kode: "GT-L3-009", gedung: "Gedung Technopreneur", status: "TERSEDIA", lantai: "Lantai 3", kapasitas: 8, fasilitas: ["Mic Condenser", "Mixing Board", "AC", "Kedap Suara", "Kamera DSLR", "Lighting Kit"], deskripsi: "Studio siaran profesional kedap suara untuk produksi podcast, wawancara, dan konten video berkualitas tinggi." },
  { nama: "Ruang Inkubator Startup", kode: "GT-L4-010", gedung: "Gedung Technopreneur", status: "TERSEDIA", lantai: "Lantai 4", kapasitas: 35, fasilitas: ["Proyektor", "AC", "Whiteboard", "WiFi Cepat", "Sofa", "Standing Desk"], deskripsi: "Ruang inkubator startup modern dengan fasilitas co-working premium untuk mendukung pengembangan bisnis rintisan." },
  { nama: "Lab Augmented Reality", kode: "GT-L2-011", gedung: "Gedung Technopreneur", status: "MAINTENANCE", lantai: "Lantai 2", kapasitas: 22, fasilitas: ["AR Headset", "PC Workstation", "AC", "WiFi", "Proyektor"], deskripsi: "Laboratorium augmented reality dengan perangkat AR terkini untuk pengembangan aplikasi dan konten interaktif." },
  { nama: "Workspace IoT Development", kode: "GT-L1-012", gedung: "Gedung Technopreneur", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 28, fasilitas: ["Arduino Kit", "Raspberry Pi", "AC", "Whiteboard", "WiFi", "Oscilloscope"], deskripsi: "Ruang pengembangan Internet of Things lengkap dengan berbagai komponen elektronik dan alat ukur." },
  { nama: "GDS Rempang - Workspace Multimedia", kode: "GU-L1-013", gedung: "Gedung Utama", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 50, fasilitas: ["Proyektor", "AC", "Whiteboard", "WiFi", "TV LED", "Sound System"], deskripsi: "Workspace multimedia berkapasitas besar di gedung utama untuk kegiatan kolaborasi skala menengah." },
  { nama: "VRS Setokok", kode: "GU-L2-014", gedung: "Gedung Utama", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 35, fasilitas: ["VR Headset", "AC", "PC Workstation", "WiFi", "Green Screen", "Motion Controller"], deskripsi: "Ruang virtual reality dengan perangkat VR terkini untuk penelitian dan pengembangan konten immersif." },
  { nama: "AS Galang - Workspace Animasi", kode: "GU-L2-015", gedung: "Gedung Utama", status: "MAINTENANCE", lantai: "Lantai 2", kapasitas: 28, fasilitas: ["Drawing Tablet", "AC", "PC Workstation", "WiFi", "Proyektor", "Cintiq Display"], deskripsi: "Workspace animasi dengan tablet grafis dan perangkat lunak animasi profesional untuk produksi konten digital." },
  { nama: "Mini Theatre", kode: "GU-L3-016", gedung: "Gedung Tower A", status: "TIDAK TERSEDIA", lantai: "Lantai 3", kapasitas: 80, fasilitas: ["Proyektor 4K", "Sound System", "AC", "Kursi Theatre", "Lighting", "Layar Lebar"], deskripsi: "Mini teater berkapasitas 80 orang dengan sistem audio-visual profesional untuk pemutaran film dan presentasi." },
  { nama: "Aula Serbaguna", kode: "GU-L1-017", gedung: "Gedung Tower A", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 150, fasilitas: ["Stage", "Sound System", "AC", "Kursi Lipat", "Podium", "Proyektor Ganda"], deskripsi: "Aula berkapasitas besar yang dapat digunakan untuk seminar, wisuda, dan berbagai acara resmi kampus." },
  { nama: "Ruang Seminar A", kode: "GU-L3-018", gedung: "Gedung Tower A", status: "TERSEDIA", lantai: "Lantai 3", kapasitas: 60, fasilitas: ["Proyektor Ganda", "AC", "Sound System", "Kursi Seminar", "WiFi", "Podium"], deskripsi: "Ruang seminar representatif dengan dua proyektor dan sistem suara berkualitas tinggi untuk acara akademik." },
  { nama: "Lab Komputer Terapan", kode: "GU-L2-019", gedung: "Gedung Tower A", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 45, fasilitas: ["45 PC", "Proyektor", "AC", "Printer", "WiFi", "Scanner"], deskripsi: "Lab komputer lengkap dengan 45 unit PC berperforma tinggi untuk praktikum pemrograman dan pengolahan data." },
  { nama: "Ruang Rapat Eksekutif", kode: "GU-L4-020", gedung: "Gedung Tower A", status: "TERSEDIA", lantai: "Lantai 4", kapasitas: 12, fasilitas: ["TV Conference", "AC", "Meja Oval", "WiFi", "Teleconference System", "Mini Bar"], deskripsi: "Ruang rapat premium untuk pertemuan pimpinan dan tamu VIP dengan fasilitas konferensi video terkini." },
  { nama: "Co-Working Space Premium", kode: "GU-L1-021", gedung: "Gedung Tower A", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 60, fasilitas: ["Meja Panjang", "AC", "WiFi Cepat", "Sofa", "Colokan Banyak", "Loker", "Pantry"], deskripsi: "Area kerja bersama premium dengan suasana modern, cocok untuk pekerjaan individual maupun kolaborasi tim besar." },
  { nama: "Ruang Diskusi Terbuka", kode: "GU-L3-022", gedung: "Gedung Tower A", status: "TIDAK TERSEDIA", lantai: "Lantai 3", kapasitas: 16, fasilitas: ["TV LED", "Whiteboard", "AC", "WiFi", "Bean Bag"], deskripsi: "Ruang diskusi santai dengan konsep terbuka dan furnitur fleksibel, cocok untuk brainstorming informal." },
  { nama: "Laboratorium Bahasa", kode: "GU-L4-023", gedung: "Gedung Tower A", status: "TERSEDIA", lantai: "Lantai 4", kapasitas: 36, fasilitas: ["Headset Audio", "PC", "AC", "Proyektor", "WiFi", "Bilik Rekam"], deskripsi: "Lab bahasa modern dengan bilik rekaman individual dan sistem audio terpusat untuk pembelajaran bahasa asing." },
  { nama: "Studio Foto & Video", kode: "GU-L2-024", gedung: "Gedung Tower A", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 15, fasilitas: ["Lighting Studio", "Green Screen", "Kamera Mirrorless", "AC", "Backdrop", "Reflector"], deskripsi: "Studio foto dan video profesional dengan pencahayaan lengkap untuk produksi konten visual berkualitas tinggi." },
  { nama: "Ruang Seminar B", kode: "GU-L4-025", gedung: "Gedung Tower A", status: "MAINTENANCE", lantai: "Lantai 4", kapasitas: 55, fasilitas: ["Proyektor", "AC", "Sound System", "Kursi Seminar", "WiFi", "Whiteboard Digital"], deskripsi: "Ruang seminar berkapasitas menengah dengan whiteboard digital interaktif dan sistem tata suara modern." },
  { nama: "Workspace Data Science", kode: "GB-L1-026", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 32, fasilitas: ["PC High-End", "AC", "Proyektor", "WiFi", "Server Lokal", "Whiteboard"], deskripsi: "Ruang kerja data science dengan workstation berperforma tinggi dan akses server lokal untuk komputasi intensif." },
  { nama: "Lab Robotika", kode: "GB-L2-027", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 24, fasilitas: ["Robot Kit", "AC", "Meja Kerja Luas", "WiFi", "Proyektor", "3D Printer"], deskripsi: "Laboratorium robotika lengkap dengan berbagai kit robot dan printer 3D untuk prototyping dan penelitian." },
  { nama: "Ruang Presentasi Interaktif", kode: "GB-L1-028", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 42, fasilitas: ["Layar Sentuh Besar", "AC", "Sound System", "WiFi", "Kursi Lipat", "Podium Digital"], deskripsi: "Ruang presentasi modern dengan layar sentuh interaktif berukuran besar untuk sesi pembelajaran dan pitching." },
  { nama: "Lab Kecerdasan Buatan", kode: "GB-L3-029", gedung: "Gedung Teaching Factory", status: "TIDAK TERSEDIA", lantai: "Lantai 3", kapasitas: 20, fasilitas: ["GPU Workstation", "AC", "Proyektor", "WiFi", "Whiteboard", "Server GPU"], deskripsi: "Lab AI dengan workstation GPU untuk pelatihan model machine learning dan deep learning skala besar." },
  { nama: "Ruang Kolaborasi Kreatif", kode: "GB-L2-030", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 38, fasilitas: ["Meja Modular", "AC", "TV LED Ganda", "WiFi", "Whiteboard Magnetik", "Proyektor"], deskripsi: "Ruang kolaborasi fleksibel dengan furnitur modular yang dapat dikonfigurasi sesuai kebutuhan tim kreatif." },
  { nama: "Studio Musik Digital", kode: "GB-L1-031", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 1", kapasitas: 10, fasilitas: ["DAW Workstation", "MIDI Controller", "AC", "Kedap Suara", "Monitor Speaker", "Synthesizer"], deskripsi: "Studio musik digital profesional dengan perangkat audio terlengkap untuk produksi musik dan sound design." },
  { nama: "Lab Bioinformatika", kode: "GB-L3-032", gedung: "Gedung Teaching Factory", status: "MAINTENANCE", lantai: "Lantai 3", kapasitas: 26, fasilitas: ["PC Workstation", "AC", "Proyektor", "WiFi", "Server Bioinformatika", "Whiteboard"], deskripsi: "Laboratorium bioinformatika dengan infrastruktur komputasi untuk analisis data genomik dan penelitian hayati digital." },
  { nama: "Ruang Workshop Desain", kode: "GB-L2-033", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 2", kapasitas: 30, fasilitas: ["Drawing Tablet", "AC", "Proyektor", "WiFi", "Meja Gambar", "Printer A3"], deskripsi: "Workshop desain grafis dan UI/UX dengan tablet digital dan printer format besar untuk produksi materi visual." },
  { nama: "Ruang Mediasi & Negosiasi", kode: "GB-L4-034", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 4", kapasitas: 14, fasilitas: ["AC", "Meja Oval", "WiFi", "TV Conference", "Whiteboard", "Kamera PTZ"], deskripsi: "Ruang formal untuk mediasi, negosiasi, dan rapat penting dengan fasilitas rekam dan konferensi video." },
  { nama: "Lab Jaringan Komputer", kode: "GB-L1-035", gedung: "Gedung Teaching Factory", status: "TIDAK TERSEDIA", lantai: "Lantai 1", kapasitas: 30, fasilitas: ["Rack Switch", "AC", "PC", "WiFi", "Kabel Patch", "Network Analyzer"], deskripsi: "Laboratorium jaringan komputer dengan perangkat Cisco dan infrastruktur simulasi jaringan skala enterprise." },
  { nama: "Ruang Pelatihan SDM", kode: "GB-L4-036", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 4", kapasitas: 48, fasilitas: ["Proyektor", "AC", "Kursi Pelatihan", "WiFi", "Sound System", "Whiteboard"], deskripsi: "Ruang pelatihan berkapasitas besar untuk kegiatan pengembangan sumber daya manusia dan training internal." },
  { nama: "Studio Desain Produk", kode: "GB-L3-037", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 3", kapasitas: 22, fasilitas: ["3D Printer", "Laser Cutter", "AC", "Meja Kerja", "WiFi", "Proyektor"], deskripsi: "Studio desain produk dengan fasilitas fabrikasi digital termasuk 3D printer dan laser cutter untuk prototyping." },
  { nama: "Ruang Seminar C", kode: "GB-L2-038", gedung: "Gedung Teaching Factory", status: "MAINTENANCE", lantai: "Lantai 2", kapasitas: 70, fasilitas: ["Proyektor Ganda", "AC", "Sound System", "Kursi Seminar", "WiFi", "Panggung Mini"], deskripsi: "Ruang seminar besar dengan panggung mini dan sistem audio-visual profesional untuk acara akademik dan industri." },
  { nama: "Lab Keamanan Jaringan", kode: "GB-L3-039", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 3", kapasitas: 18, fasilitas: ["PC Penetration Testing", "AC", "WiFi Isolated", "Whiteboard", "Server Honeypot"], deskripsi: "Lab keamanan jaringan dengan environment terisolasi untuk praktikum ethical hacking dan penetration testing." },
  { nama: "Ruang Konferensi Internasional", kode: "GB-L4-040", gedung: "Gedung Teaching Factory", status: "TERSEDIA", lantai: "Lantai 4", kapasitas: 100, fasilitas: ["Layar LED Besar", "Sound System Premium", "AC", "Kursi Konferensi", "WiFi", "Simultaneous Interpreter Booth"], deskripsi: "Ruang konferensi internasional berkapasitas besar dengan fasilitas interpretasi simultan dan sistem AV premium." },
];

const gedungList = ["Gedung Technopreneur", "Gedung Utama", "Gedung Teaching Factory", "Gedung Tower A"];

const lantaiPerGedung = {
  "Gedung Technopreneur": ["Lantai 1", "Lantai 2", "Lantai 3", "Lantai 4"],
  "Gedung Utama": ["Lantai 1", "Lantai 2", "Lantai 3", "Lantai 4", "Lantai 5", "Lantai 6", "Lantai 7"],
  "Gedung Teaching Factory": ["Lantai 1", "Lantai 2", "Lantai 3", "Lantai 4", "Lantai 5", "Lantai 6", "Lantai 7", "Lantai 8", "Lantai 9", "Lantai 10"],
  "Gedung Tower A": ["Lantai 1", "Lantai 2", "Lantai 3", "Lantai 4", "Lantai 5", "Lantai 6", "Lantai 7", "Lantai 8", "Lantai 9", "Lantai 10", "Lantai 11", "Lantai 12"]
};

const ITEMS_PER_PAGE = 10;

const Dropdown = ({ label, icon, options, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-[13px] font-semibold transition shadow-sm ${
          disabled
            ? "border-pink-100 text-pink-200 bg-white cursor-not-allowed"
            : value
            ? "border-[#C0254A] text-white bg-[#C0254A]"
            : "border-pink-300 text-[#C0254A] bg-white hover:bg-pink-50"
        }`}
      >
        <Icon icon={icon} width={14} />
        {value || label}
        <Icon icon={open ? "mdi:chevron-up" : "mdi:chevron-down"} width={14} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-pink-100 rounded-2xl shadow-xl min-w-[180px] py-1 overflow-hidden">
          {value && (
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:bg-red-50 flex items-center gap-2"
            >
              <Icon icon="mdi:close-circle" width={13} /> Hapus filter
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-[12px] hover:bg-pink-50 ${
                value === opt ? "text-[#C0254A] font-bold" : "text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterKapasitas = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value ?? "");

  const handleApply = () => {
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange(num);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setInput("");
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-[13px] font-semibold transition shadow-sm ${
          value !== null && value !== undefined
            ? "border-[#C0254A] text-white bg-[#C0254A]"
            : "border-pink-300 text-[#C0254A] bg-white hover:bg-pink-50"
        }`}
      >
        <Icon icon="mdi:account-group" width={14} />
        {value !== null && value !== undefined ? `≥ ${value} orang` : "Kapasitas"}
        <Icon icon={open ? "mdi:chevron-up" : "mdi:chevron-down"} width={14} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-pink-100 rounded-2xl shadow-xl p-4 min-w-[220px]">
          <p className="text-[11px] text-gray-400 mb-2">
            Tampilkan ruangan dengan kapasitas minimal:
          </p>
          <div className="flex items-center gap-2 mb-1">
            <input
              type="number"
              min={0}
              max={100}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: 65"
              className="flex-1 border border-pink-200 rounded-full px-3 py-1.5 text-[13px] outline-none focus:border-[#C0254A] text-center"
            />
            <span className="text-[12px] text-gray-400">orang</span>
          </div>
          <p className="text-[10px] text-gray-300 mb-3">Maks. input: 100</p>
          <div className="flex gap-2">
            <button onClick={handleClear} className="flex-1 border border-pink-300 text-[#C0254A] text-[12px] font-semibold rounded-full py-1.5 hover:bg-pink-50 transition">
              Hapus
            </button>
            <button onClick={handleApply} className="flex-1 bg-[#C0254A] text-white text-[12px] font-semibold rounded-full py-1.5 hover:opacity-90 transition">
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalDetail = ({ ruangan, onClose, onAjukan }) => {
  if (!ruangan) return null;
  const canApply = ruangan.status === "TERSEDIA";
  const statusStyles = {
    TERSEDIA: { bg: "bg-green-500", text: "TERSEDIA" },
    MAINTENANCE: { bg: "bg-yellow-500", text: "MAINTENANCE" },
    "TIDAK TERSEDIA": { bg: "bg-red-500", text: "TIDAK TERSEDIA" },
  };
  const s = statusStyles[ruangan.status] || statusStyles["TERSEDIA"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden w-[400px] max-w-[100vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#3D0C1F] p-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-[18px] leading-snug max-w-[270px]">{ruangan.nama}</h2>
            <p className="text-pink-300 text-[15px] mt-0.5">Kode: {ruangan.kode}</p>
          </div>
          <button onClick={onClose} className="text-white bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-lg leading-none hover:bg-white/30 transition">
            ×
          </button>
        </div>

        <div className="relative h-[240px] bg-gradient-to-br from-sky-300 to-blue-500 flex items-end justify-center pb-2 overflow-hidden">
          <img src={gedung_utama} className="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div className="p-4 flex flex-col gap-2.5">
          <div>
            <span className={`${s.bg} text-white text-[10px] font-bold px-3 py-1 rounded-full`}>{s.text}</span>
          </div>

          {[
            { icon: "mdi:stairs", label: "Lantai", value: ruangan.lantai },
            { icon: "mdi:office-building", label: "Gedung", value: ruangan.gedung },
            { icon: "mdi:account-group", label: "Kapasitas", value: `${ruangan.kapasitas} orang` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex justify-between items-center border-b border-pink-100 pb-2">
              <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Icon icon={icon} className="text-[#C0254A]" />
                {label}
              </span>
              <span className="text-[#2D0A18] text-[12px] font-semibold text-right max-w-[55%]">{value}</span>
            </div>
          ))}

          <div className="flex justify-between items-start border-b border-pink-100 pb-2">
            <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Icon icon="mdi:star-check" className="text-[#C0254A]" />
              Fasilitas
            </span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
              {ruangan.fasilitas.map((f) => (
                <span key={f} className="bg-pink-100 text-[#C0254A] text-[10px] px-2 py-0.5 rounded-full font-semibold">{f}</span>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed bg-pink-50 rounded-lg p-2.5">{ruangan.deskripsi}</p>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-pink-300 text-[#C0254A] rounded-full py-2 text-[12px] font-bold hover:bg-pink-50 transition">
            Tutup
          </button>
          <button
            disabled={!canApply}
            onClick={() => onAjukan(ruangan)}
            className={`flex-1 rounded-full py-2 text-[12px] font-bold transition ${
              canApply ? "bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white hover:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Ajukan Peminjaman
          </button>
        </div>
      </div>
    </div>
  );
};

const GedungCard = ({ ruangan, onDetail, onAjukan }) => {
  const { nama, gedung, lantai, status } = ruangan;
  const canApply = status === "TERSEDIA";

  const statusStyles = {
    TERSEDIA: { bg: "bg-green-500", text: "TERSEDIA" },
    MAINTENANCE: { bg: "bg-yellow-500", text: "MAINTENANCE" },
    "TIDAK TERSEDIA": { bg: "bg-red-500", text: "TIDAK TERSEDIA" },
  };
  const s = statusStyles[status] || statusStyles["TERSEDIA"];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-[0_6px_20px_rgba(0,0,0,0.07)] flex flex-col hover:scale-[1.02] hover:shadow-xl transition duration-300">
      <div className="relative h-[155px] bg-gradient-to-br from-sky-300 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center pb-3">
          <img src={gedung_utama} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${s.bg} text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap`}>
          {s.text}
        </div>
      </div>

      <div className="bg-[#3D0C1F] p-3 flex-1 flex flex-col gap-2">
        <h3 className="text-white font-bold text-[12px] leading-tight line-clamp-2">{nama}</h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-pink-200 text-[10px]">
            <Icon icon="mdi:office-building" width={11} />
            <span className="truncate">{gedung}</span>
          </div>
          <div className="flex items-center gap-1 text-pink-200 text-[10px]">
            <Icon icon="mdi:stairs" width={11} />
            <span>{lantai}</span>
          </div>
        </div>

        <div className="flex gap-1.5 mt-1">
          <button
            onClick={() => onDetail(ruangan)}
            className="flex items-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2.5 py-1 rounded-full hover:bg-pink-800/30 transition"
          >
            <Icon icon="mdi:information-outline" width={11} />
            Detail
          </button>

          {canApply ? (
            <button 
              onClick={() => onAjukan(ruangan)}
              className="flex items-center gap-1 border border-pink-300 text-pink-200 text-[10px] px-2.5 py-1 rounded-full hover:bg-pink-800/30 transition">
              <Icon icon="mdi:plus" width={11} />
              Ajukan
            </button>
          ) : (
            <button disabled className="flex items-center gap-1 border border-pink-300/30 text-pink-200/30 text-[10px] px-2.5 py-1 rounded-full cursor-not-allowed">
              <Icon icon="mdi:cancel" width={11} />
              {status === "MAINTENANCE" ? "Maintenance" : "Tidak Tersedia"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PeminjamanRuangan = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModalPengajuan, setShowModalPengajuan] = useState(false);
  const [selectedPengajuanRoom, setSelectedPengajuanRoom] = useState(null);
  const [filterGedung, setFilterGedung] = useState(null);
  const [filterLantai, setFilterLantai] = useState(null);
  const [filterKapasitas, setFilterKapasitas] = useState(null);

  const handleFilterGedung = (val) => {
    setFilterGedung(val);
    setFilterLantai(null);
    setCurrentPage(1);
  };

  const handleFilterLantai = (val) => {
    setFilterLantai(val);
    setCurrentPage(1);
  };

  const handleFilterKapasitas = (val) => {
    setFilterKapasitas(val);
    setCurrentPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return ruanganData.filter((r) => {
      const matchSearch = r.nama.toLowerCase().includes(search.toLowerCase());
      const matchGedung = !filterGedung || r.gedung === filterGedung;
      const matchLantai = !filterLantai || r.lantai === filterLantai;
      const matchKapasitas = filterKapasitas === null || filterKapasitas === undefined || r.kapasitas >= filterKapasitas;
      return matchSearch && matchGedung && matchLantai && matchKapasitas;
    });
  }, [search, filterGedung, filterLantai, filterKapasitas]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const lantaiOptions = filterGedung ? lantaiPerGedung[filterGedung] : [];

  const pageRange = useMemo(() => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF6F1] via-[#FFE4E6] to-[#FFD1D1]">
      <Sidebar />

      {selectedRoom && (
        <ModalDetail 
        ruangan={selectedRoom} 
        onClose={() => setSelectedRoom(null)}
        onAjukan={(room) => {
          setSelectedRoom(null);
          setSelectedPengajuanRoom(room);
          setShowModalPengajuan(true);
        }}
        />
      )}

      {showModalPengajuan && (
        <ModalPengajuan
          ruangan={selectedPengajuanRoom}
          onClose={() => setShowModalPengajuan(false)}/>
      )}

      <div className="ml-[300px] flex-1 p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-[#2D0A18] text-[32px] font-extrabold">Daftar Ruangan</h1>
          <p className="text-gray-500 text-[14px] mt-1">
            Memilih ruangan yang tersedia berdasarkan jadwal dan kapasitas
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-lg">

          <div className="flex items-center mb-5">
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 shadow-inner border border-pink-100">
              <input
                type="text"
                placeholder="Telusuri nama ruangan..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 outline-none text-[14px] text-gray-600 bg-transparent"
              />
              {search && (
                <button onClick={() => handleSearch("")} className="text-gray-300 hover:text-gray-500 mr-1">
                  <Icon icon="mdi:close" width={16} />
                </button>
              )}
              <button className="bg-gradient-to-r from-[#C0254A] to-[#E11D48] text-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition flex-shrink-0">
                <Icon icon="mdi:magnify" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-5 flex-wrap items-center">
            <Dropdown
              label="Gedung"
              icon="mdi:office-building"
              options={gedungList}
              value={filterGedung}
              onChange={handleFilterGedung}
            />
            <Dropdown
              label="Lantai"
              icon="mdi:stairs"
              options={lantaiOptions}
              value={filterLantai}
              onChange={handleFilterLantai}
              disabled={!filterGedung}
            />
            <FilterKapasitas value={filterKapasitas} onChange={handleFilterKapasitas} />

            <span className="ml-auto text-[12px] text-gray-400">
              {filtered.length} ruangan ditemukan
            </span>
          </div>

          {paginated.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {paginated.map((r, i) => (
                <GedungCard key={i}
                ruangan={r}
                onDetail={setSelectedRoom} 
                onAjukan={(room) => {
                  setSelectedPengajuanRoom(room);
                  setShowModalPengajuan(true);
                }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Icon icon="mdi:magnify-close" width={48} className="mb-3 opacity-30" />
              <p className="text-[14px] font-semibold">Tidak ada ruangan yang cocok</p>
              <p className="text-[12px] mt-1">Coba ubah kata kunci atau filter</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-double-left" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-left" />
              </button>

              {pageRange[0] > 1 && <span className="text-[#C0254A] font-semibold">...</span>}

              {pageRange.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-semibold transition ${
                    currentPage === p ? "bg-[#C0254A] text-white shadow-md" : "text-[#C0254A] hover:bg-pink-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              {pageRange[pageRange.length - 1] < totalPages && <span className="text-[#C0254A] font-semibold">...</span>}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full bg-[#C0254A] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
              >
                <Icon icon="mdi:chevron-double-right" />
              </button>

              <span className="text-[#3D0C1F] text-[13px] font-semibold ml-2">Go To</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                className="w-16 rounded-full bg-[#3D0C1F] text-white text-center text-[13px] px-2 py-1 outline-none shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt(e.target.value, 10);
                    if (val >= 1 && val <= totalPages) setCurrentPage(val);
                  }
                }}
              />
              <span className="text-[#3D0C1F] text-[13px] font-semibold">Page</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeminjamanRuangan;