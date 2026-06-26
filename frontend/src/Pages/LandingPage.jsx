import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import bekgron from "../assets/bg.jpg";
import logo from "../assets/logo.png";
import githap from "../assets/githap.png";
import ige from "../assets/ige.png";

const sosmetLink = [
  { img: githap, url: "https://github.com/spara-209/spara.polibatam", label: "GitHub" },
  { img: ige,    url: "https://www.instagram.com/sparadotid",          label: "Instagram" },
];

const features = [
  {
    icon: "📋",
    title: "Peminjaman Terstruktur",
    desc: "Proses yang cepat dan terstruktur untuk meminjam alat atau ruangan hingga alat atau ruangan dapat digunakan.",
  },
  {
    icon: "🔍",
    title: "Pencarian CETAR",
    desc: "Pencarian Cepat dan Pintar (CETAR) untuk memudahkan pengguna menemukan alat atau ruangan yang ingin dipinjam.",
  },
  {
    icon: "🕐",
    title: "Akses Penuh 24 Jam",
    desc: "Peminjaman dapat dilakukan dengan mudah dan penuh selama 24 jam tanpa batasan waktu.",
  },
  {
    icon: "📊",
    title: "Riwayat dan Monitoring",
    desc: "Riwayat peminjaman yang telah dilakukan dapat dengan mudah diakses dan di-monitoring secara real-time.",
  },
  {
    icon: "⭐",
    title: "Rekomendasi Terbaik",
    desc: "Memberikan rekomendasi alat atau ruangan terbaik sesuai dengan kebutuhan dan preferensi pengguna.",
  },
  {
    icon: "✅",
    title: "Persetujuan Resmi",
    desc: "Setiap peminjaman diverifikasi oleh penanggung jawab ruangan dan sub bagian umum universitas.",
  },
];

const steps = [
  { label: "Ajukan",    desc: "Isi data dan ajukan peminjaman",          icon: "📝" },
  { label: "Disetujui", desc: "Pengajuan diverifikasi petugas",          icon: "👍" },
  { label: "Terjadwal", desc: "Jadwal dikonfirmasi sesuai pengajuan",    icon: "📅" },
  { label: "Gunakan",   desc: "Alat atau ruangan siap digunakan",        icon: "🎉" },
];

function useCountUp(target, duration = 1800, inView = false) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current || !target) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return count;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function StatCard({ label, desc, value, suffix = "+" }) {
  const [ref, inView] = useInView(0.3);
  const count = useCountUp(value, 1800, inView);

  return (
    <div
      ref={ref}
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl py-8 px-5 transition-all duration-700 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-pink-900/30 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="text-5xl font-extrabold tracking-tight">
        {value ? `${count}${suffix}` : <span className="inline-block w-16 h-10 bg-white/20 rounded-lg animate-pulse" />}
      </div>
      <p className="mt-2 font-semibold text-sm">{label}</p>
      <p className="text-xs opacity-50 mt-1">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay = 0 }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl p-6 text-left group cursor-default transition-all duration-700 hover:shadow-xl hover:shadow-pink-200 hover:-translate-y-1 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-11 h-11 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl mb-4 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-pink-900 text-sm mb-2">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function FadeIn({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [stats, setStats] = useState({ alat: 0, ruangan: 0, users: 0 });
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/public-stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ alat: 50, ruangan: 20, users: 200 }));
  }, []);

  const heroRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const bg = heroRef.current.querySelector(".parallax-bg");
        if (bg) bg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="font-sans scroll-smooth">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-4 transition-all duration-500 ${
          scrolled
            ? "bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/10 py-3"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2">
          <img src={logo} className="w-14 drop-shadow-lg" alt="SPARA Logo" />
        </div>
        <div className="flex items-center gap-7 text-white text-sm font-medium">
          <a href="#beranda" className="hover:text-pink-300 transition-colors duration-200">Beranda</a>
          <a href="#fitur" className="hover:text-pink-300 transition-colors duration-200">Fitur</a>
          <a href="#cara-pinjam" className="hover:text-pink-300 transition-colors duration-200">Cara Pinjam</a>
          <Link to="/tentangkami" className="hover:text-pink-300 transition-colors duration-200">Tentang Kami</Link>
          <Link to="/login">
            <button className="bg-pink-500 hover:bg-pink-600 active:bg-pink-700 px-5 py-2 rounded-full font-semibold text-sm shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-200 hover:scale-105">
              Masuk
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section id="beranda" ref={heroRef} className="relative min-h-screen overflow-hidden flex items-center">
        <img
          src={bekgron}
          className="parallax-bg absolute inset-0 w-full h-full object-cover scale-110 origin-top"
          alt="Background kampus"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative z-10 px-10 md:px-20 max-w-2xl">
          {/* Value badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["✓ Gratis", "✓ Tanpa Biaya", "✓ Untuk Sivitas Akademika"].map((badge) => (
              <span
                key={badge}
                className="text-xs bg-white/15 backdrop-blur-sm border border-white/25 text-white px-3 py-1 rounded-full font-medium"
              >
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Pinjam{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-300">
              Alat &amp; Ruangan
            </span>
            <br />
            dengan Mudah<br />
            dan Cepat
          </h1>
          <p className="mt-5 text-gray-200 text-sm leading-relaxed max-w-md">
            SPARA Polibatam memberikan solusi peminjaman alat dan ruangan dalam kampus
            untuk mendukung kegiatan Anda. Cepat, mudah, efisien, dan terorganisir!
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login">
              <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-7 py-3 rounded-full font-semibold text-sm shadow-xl shadow-pink-500/40 hover:shadow-pink-500/60 transition-all duration-200 hover:scale-105 active:scale-95">
                Pinjam Sekarang →
              </button>
            </Link>
            <a href="#fitur">
              <button className="border border-white/50 hover:bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium text-white transition-all duration-200 hover:scale-105">
                Pelajari Lebih Lanjut
              </button>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 text-xs animate-bounce">
          <span>Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-pink-800 to-pink-950 text-white py-20 text-center">
        <FadeIn>
          <h2 className="text-2xl font-bold">Fasilitas Kampus dalam Genggaman</h2>
          <p className="text-sm opacity-60 mt-2 max-w-md mx-auto">
            Data statistik terkini sarana, prasarana, dan pengguna terdaftar di SPARA Polibatam
          </p>
        </FadeIn>

        <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto px-6">
          <StatCard label="Peralatan Tersedia" desc="Proyektor, kamera, mikrofon, dll." value={stats.alat} />
          <StatCard label="Pengguna Terdaftar" desc="Mahasiswa, dosen, pegawai, dll." value={stats.users} />
          <StatCard label="Ruangan Tersedia"   desc="Auditorium, kelas, lab, dll."      value={stats.ruangan} />
        </div>

        <FadeIn delay={200}>
          <Link to="/login">
            <button className="mt-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-8 py-3 rounded-full font-semibold text-sm shadow-xl shadow-pink-500/30 transition-all duration-200 hover:scale-105 active:scale-95">
              Pinjam Sekarang →
            </button>
          </Link>
        </FadeIn>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="fitur" className="bg-gradient-to-b from-[#fce4ec] to-[#fad0e4] py-24 text-center">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-500 mb-2">Mengapa SPARA?</p>
          <h2 className="text-3xl font-extrabold text-pink-900">
            Fitur <span className="text-pink-500">Unggulan</span> SPARA
          </h2>
          <p className="text-sm text-pink-700/60 mt-2 max-w-sm mx-auto">
            Dirancang khusus untuk kemudahan sivitas akademika Polibatam
          </p>
        </FadeIn>

        <div className="grid grid-cols-3 gap-5 mt-14 max-w-5xl mx-auto px-6">
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 80} />
          ))}
        </div>
      </section>

      <section id="cara-pinjam" className="bg-[#fce4ec] py-24 text-center overflow-hidden">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-500 mb-2">Mudah & Sederhana</p>
          <h2 className="text-3xl font-extrabold text-pink-900">4 Langkah Peminjaman</h2>
          <p className="text-sm text-pink-700/60 mt-2">Proses peminjaman yang cepat, transparan, dan terorganisir</p>
        </FadeIn>

        <div className="relative mt-16 max-w-3xl mx-auto px-6">
          <div className="absolute top-7 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-pink-400 to-pink-700 z-0 hidden sm:block" />

          <div className="grid grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-[#fce4ec] shadow-lg shadow-pink-300/50 hover:scale-110 transition-transform duration-300 cursor-default">
                    {i + 1}
                  </div>
                  <p className="mt-4 font-bold text-pink-900 text-sm">{s.label}</p>
                  <span className="text-xs text-pink-700/60 mt-1 text-center leading-snug">{s.desc}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-pink-700 via-rose-700 to-pink-900 py-24 text-center text-white">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-200/70 mb-3">Bergabung Sekarang</p>
          <h2 className="text-4xl font-extrabold leading-tight">
            Siap Meminjam Fasilitas<br />
            <span className="text-pink-200">Kampus Dengan Mudah?</span>
          </h2>
          <p className="mt-4 text-pink-100/70 text-sm max-w-sm mx-auto leading-relaxed">
            Daftar sekarang dan nikmati kemudahan peminjaman alat dan ruangan Polibatam.
            Gratis, cepat, dan terorganisir.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link to="/login">
              <button className="bg-white text-pink-700 hover:bg-pink-50 font-semibold px-8 py-3 rounded-full text-sm shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95">
                Pinjam Sekarang →
              </button>
            </Link>
            <Link to="/tentangkami">
              <button className="border border-white/50 hover:bg-white/15 backdrop-blur-sm px-7 py-3 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105">
                Pelajari Lebih Lanjut
              </button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-pink-950 text-white py-14">
        <div className="grid grid-cols-3 max-w-5xl mx-auto gap-12 px-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} className="w-9" alt="SPARA Logo" />
              <span className="font-bold text-base">SPARA Polibatam</span>
            </div>
            <p className="text-xs opacity-50 leading-relaxed">
              Sistem Peminjaman Alat dan Ruangan (SPARA) Polibatam, platform peminjaman
              alat dan ruangan Polibatam yang gratis, mudah, dan terorganisir.
            </p>
            <div className="flex gap-3 mt-5">
              {sosmetLink.map((item, i) => (
                <button
                  key={i}
                  onClick={() => window.open(item.url, "_blank")}
                  aria-label={item.label}
                  className="opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-200"
                >
                  <img src={item.img} className="w-9 h-9 object-contain" alt={item.label} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold mb-5 text-sm text-pink-200">Tautan Cepat</h4>
            <ul className="space-y-3 text-xs opacity-55">
              {[
                { label: "Beranda",           href: "#beranda" },
                { label: "Fitur",             href: "#fitur" },
                { label: "Cara Meminjam",     href: "#cara-pinjam" },
                { label: "Tentang Kami",      href: "/tentangkami" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:opacity-100 hover:text-pink-300 transition-all duration-200 cursor-pointer"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-5 text-sm text-pink-200">Kontak</h4>
            <div className="space-y-4 text-xs opacity-60 leading-relaxed">
              <p>📍 Politeknik Negeri Batam, Jl. Ahmad Yani, Tlk. Tering, Batam Kota, Kota Batam, Kepulauan Riau, Indonesia 29461.</p>
              <p>📞 +62 895 2376 9761 (Ext.1017)</p>
              <p>✉️ sbumtrpl209@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center max-w-5xl mx-auto px-10 mt-10 pt-6 border-t border-white/10 text-xs opacity-30">
          <p>© 2026 SPARA Polibatam. All rights reserved.</p>
          <p>Dikembangkan oleh Tim PBL-TRPL209</p>
        </div>
      </footer>
    </div>
  );
}