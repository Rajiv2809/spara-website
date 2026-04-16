import { useState } from "react";

const SparaLogo = () => (
  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f9a8c4" />
        <stop offset="100%" stopColor="#e8527a" />
      </linearGradient>
    </defs>
    <text
      x="40" y="58"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fontSize="56"
      fill="url(#sGrad)"
    >
      S
    </text>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-800 flex-shrink-0">
    <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 18c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-800 flex-shrink-0">
    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 via-rose-700 to-rose-900 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-pink-300 opacity-20" />
      <div className="absolute -bottom-12 -left-16 w-56 h-56 rounded-full bg-pink-400 opacity-15" />
      <div className="absolute top-1/2 left-10 w-36 h-36 rounded-full bg-pink-200 opacity-10 -translate-y-1/2" />

      {/* Card */}
      <div className="flex rounded-2xl overflow-hidden w-[540px] max-w-full shadow-2xl relative z-10">

        {/* Left panel */}
        <div className="w-48 flex-shrink-0 bg-rose-950 flex flex-col items-center justify-center relative overflow-hidden px-5 py-10">
          <svg
            viewBox="0 0 192 260"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 left-0 w-full pointer-events-none"
          >
            <path d="M0,160 C40,110 90,200 140,140 C170,110 185,170 192,140 L192,260 L0,260 Z" fill="rgba(255,255,255,0.07)" />
            <path d="M0,210 C50,170 100,230 150,190 C170,175 185,210 192,190 L192,260 L0,260 Z" fill="rgba(255,255,255,0.05)" />
          </svg>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <SparaLogo />
            <span className="text-white font-extrabold text-lg tracking-[6px]">SPARA</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white flex flex-col items-center px-9 py-11 gap-7">
          <h1 className="text-rose-800 text-2xl font-extrabold tracking-[5px]">LOGIN</h1>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            {/* Username */}
            <div className="flex items-center gap-3 border-b border-pink-300 pb-2 focus-within:border-rose-800 transition-colors">
              <UserIcon />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 border-none outline-none text-sm text-rose-950 bg-transparent font-medium placeholder-rose-300"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 border-b border-pink-300 pb-2 focus-within:border-rose-800 transition-colors">
              <LockIcon />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 border-none outline-none text-sm text-rose-950 bg-transparent font-medium placeholder-rose-300"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-rose-500 hover:bg-rose-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-widest rounded-full py-3 transition-all duration-200 shadow-lg shadow-rose-400/40"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center">
            Tidak memiliki akun?{" "}
            <a href="#" className="text-rose-500 font-bold hover:underline">
              Register Disini!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}