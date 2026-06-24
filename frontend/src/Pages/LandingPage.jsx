import { Link } from "react-router-dom";
import bekgron from "../assets/bg.jpg";
import logo from "../assets/logo.png";
import githap from "../assets/githap.png";
import ige from "../assets/ige.png";

const sosmetLink = [
  {
    img: githap,
    url: "https://github.com/spara-209/spara.polibatam",
  },
  {
    img: ige,
    url: "https://www.instagram.com/sparadotid",
  },
];
export default function Home() {
  return (
    <div className="font-sans">
      <section className="relative min-h-screen overflow-hidden">
        <img src={bekgron} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60"></div>

        <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 z-20">
          <div className="flex items-center gap-2">
            <img src={logo} className="w-16"/>
          </div>
          <div className="flex items-center gap-6 text-white text-sm">
            <a href="#" className="hover:text-pink-300 transition-colors">Beranda</a>
            <Link to="/tentangkami" className="hover:text-pink-300 transition-colors">Tentang kami</Link>
            <Link to="/login">
              <button className="bg-pink-500 hover:bg-pink-600 px-5 py-1.5 rounded-full font-semibold">
                Masuk
              </button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex items-center min-h-screen px-10">
          <div className="max-w-xl text-white">
            <h1 className="text-5xl font-extrabold leading-tight">
              Pinjam <span className="text-pink-400">Alat &</span><br />
              <span className="text-pink-400">Ruangan</span> dengan<br />
              Mudah dan Cepat
            </h1>
            <p className="mt-4 text-gray-200 text-sm leading-relaxed">
              SPARA Polibatam memberikan solusi peminjaman alat dan ruangan dalam kampus
              untuk mendukung kegiatan anda. Cepat, mudah, dan efisien!
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/login">
                <button className="bg-pink-500 hover:bg-pink-600 px-5 py-1.5 rounded-full font-semibold">
                  Pinjam Sekarang
                </button>
              </Link>
              <button className="border border-white/70 hover:bg-white/10 px-6 py-2.5 rounded-full text-sm transition-colors">
                Pelajari lebih lanjut
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-pink-800 to-pink-900 text-white py-16 text-center">
        <h2 className="text-2xl font-bold">Fasilitas Kampus dalam Genggaman</h2>
        <p className="text-sm opacity-70 mt-2">
          Beberapa data statistik terkait sarana, prasarana, dan pengguna aplikasi ini
        </p>

        <div className="grid grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto">
          {[
            { label: "Peralatan Tersedia", desc: "Termasuk proyektor, kamera, dan lainnya" },
            { label: "Pengguna Terdaftar", desc: "Termasuk mahasiswa, pegawai, dan lainnya" },
            { label: "Ruangan Tersedia",   desc: "Termasuk auditorium, kelas, dan lainnya" },
          ].map((item, i) => (
            <div key={i} className="bg-white/10 border border-white/15 rounded-2xl py-7 px-4">
              <div className="text-5xl font-extrabold">67</div>
              <p className="mt-2 font-semibold text-sm">{item.label}</p>
              <p className="text-xs opacity-50 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <Link to="/login">
          <button className="mt-10 bg-pink-500 hover:bg-pink-600 px-6 py-2.5 rounded-full font-semibold text-sm transition-colors">
            Pinjam sekarang →
          </button>
        </Link>
      </section>

      <section className="bg-gradient-to-b from-[#fce4ec] to-[#f8bbd9] py-20 text-center">
        <h2 className="text-3xl font-extrabold text-pink-900">
          Fitur <span className="text-pink-500">Unggulan</span> SPARA
        </h2>

        <div className="grid grid-cols-3 gap-5 mt-12 max-w-5xl mx-auto px-6">
          {[
            { title: "Peminjaman Terstruktur", desc: "Proses yang cepat dan terstruktur untuk meminjam alat atau ruangan hingga alat atau ruangan dapat digunakan." },
            { title: "Pencarian CETAR",        desc: "Pencarian Cepat dan Pintar (CETAR) untuk memudahkan pengguna menemukan alat atau ruangan yang ingin dipinjam." },
            { title: "Akses Penuh 24 Jam",     desc: "Peminjaman dapat dilakukan dengan mudah dan penuh selama 24 jam." },
            { title: "Riwayat dan Monitoring", desc: "Riwayat peminjaman yang telah dilakukan dapat dengan mudah diakses dan di-monitoring." },
            { title: "Rekomendasi Terbaik",    desc: "Memberikan rekomendasi alat atau ruangan terbaik sesuai dengan kebutuhan pengguna." },
            { title: "Persetujuan Resmi",      desc: "Setiap peminjaman diverifikasi oleh penanggung jawab ruangan dan sub bagian umum universitas." },
          ].map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm text-left">
              <div className="w-9 h-9 bg-pink-100 rounded-xl mb-3 flex items-center justify-center">
                <span className="text-pink-500 text-base">✦</span>
              </div>
              <h3 className="font-bold text-pink-900 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#fce4ec] py-20 text-center">
        <h2 className="text-3xl font-extrabold text-pink-900">4 Langkah Peminjaman</h2>
        <p className="text-sm text-pink-700/60 mt-2">Peminjaman dengan 4 langkah mudah dan sederhana</p>

        <div className="relative grid grid-cols-4 gap-6 mt-14 max-w-3xl mx-auto px-6">
          <div className="absolute top-7 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-pink-500 to-pink-800 z-0" />
          {[
            { label: "Ajukan",    desc: "Isi data dan ajukan peminjaman" },
            { label: "Disetujui", desc: "Pengajuan diverifikasi petugas" },
            { label: "Terjadwal", desc: "Jadwal dikonfirmasi sesuai pengajuan" },
            { label: "Gunakan",   desc: "Alat atau ruangan siap digunakan" },
          ].map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-[#fce4ec]">
                {i + 1}
              </div>
              <p className="mt-3 font-bold text-pink-900 text-sm">{s.label}</p>
              <span className="text-xs text-pink-700/60 mt-1 text-center leading-snug">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-pink-950 text-white py-12">
        <div className="grid grid-cols-3 max-w-5xl mx-auto gap-10 px-10">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} className="w-8" />
              <span className="font-bold">SPARA Polibatam</span>
            </div>
            <p className="text-xs opacity-55 leading-relaxed">
              Sistem Peminjaman Alat dan Ruangan (SPARA) Polibatam, platform peminjaman
              alat dan ruangan Polibatam yang gratis, mudah, dan terorganisir.
            </p>
            <div className="flex gap-3 mt-4">
              {sosmetLink.map((item, i) => (
                <div
                  key={i}
                  onClick={() => window.open(item.url, "_blank")}
                  className="flex items-center justify-center opacity-60 hover:opacity-100 hover:scale-110 cursor-pointer transition-all duration-200"
                >
                  <img src={item.img} className="w-10 h-10 object-contain" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">Tautan Cepat</h4>
            <ul className="space-y-2 text-xs opacity-55">
              {["Beranda", "Tentang Kami", "Katalog Peralatan", "Katalog Ruangan"].map((l) => (
                <li key={l} className="hover:opacity-100 cursor-pointer transition-opacity">{l}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">Kontak</h4>
            <div className="space-y-3 text-xs opacity-60 leading-relaxed">
              <p>📍 Politeknik Negeri Batam, Jl. Ahmad Yani, Tlk. Tering, Batam Kota, Kota Batam, Kepulauan Riau, Indonesia 29461.</p>
              <p>📞 +62 895 2376 9761 (Ext.1017)</p>
              <p>✉️ sbumtrpl209@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center max-w-5xl mx-auto px-10 mt-10 pt-6 border-t border-white/10 text-xs opacity-30">
          <p>© 2026 SPARA Polibatam. Seluruh hak cipta dilindungi.</p>
          <p>Dikembangkan oleh Tim PBL-TRPL209</p>
        </div>
      </footer>
    </div>
  );
}