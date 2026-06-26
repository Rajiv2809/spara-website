import { useState, useEffect } from "react";
import "./Styles/login.css";
import wave1 from "./Assets/wave1.png";
import wave2 from "./Assets/wave2.png";
import logo1 from "./Assets/logo1.png";
import { Icon } from "@iconify/react";
import axiosClient from "../axios";
import Cookies from "js-cookie";
import { useStateContext } from "../Contexts/context.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setToken, showToast } = useStateContext();
  const [nomorInduk, setNomorInduk] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    setIsLoading(true);

    axiosClient
      .post("/login", {
        id_number: nomorInduk,
        password: password,
      })
      .then(({ data }) => {
        setToken(data.access_token);
        navigate("/dashboard");
        showToast(data.message, "green");
      })
      .catch(( error ) => {
          const message = error.response?.data?.message || "Login gagal. Silakan coba lagi.";
          showToast(message, "red");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const token = Cookies.get("accesstoken");
    console.log(token);
  }, []);

  return (
    <div className="login-container flex items-center justify-center bg-gradient-to-b from-[#DC4C75] to-[#862440] min-h-screen overflow-hidden relative px-4 py-8">
      {/* Waves — hidden on mobile agar tidak berantakan */}
      <img
        src={wave1}
        alt=""
        className="hidden sm:block size-[600px] lg:size-[800px] absolute bottom-0 left-0 pointer-events-none"
      />
      <img
        src={wave2}
        alt=""
        className="hidden sm:block size-[600px] lg:size-[800px] absolute top-0 right-0 pointer-events-none"
      />

      {/* Overlay loading fullscreen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-xl">
            <div className="w-10 h-10 border-4 border-[#DC4C75] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#862440] font-semibold text-sm">Sedang masuk...</span>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="card-login rounded-[32px] bg-white w-full max-w-[900px] z-10 flex flex-col md:grid md:grid-cols-5 shadow-2xl overflow-hidden">
        
        {/* Logo panel — full width di mobile, 2/5 di desktop */}
        <div className="logo md:col-span-2 flex items-center justify-center bg-[#862440] py-10 md:py-0 rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px]">
          <img src={logo1} className="w-[140px] md:w-[200px]" alt="Logo" />
        </div>

        {/* Form panel */}
        <form
          className="md:col-span-3 flex flex-col items-center gap-8 px-8 sm:px-12 py-[80px]"
          method="post"
          onSubmit={login}
        >
          <h1 className="text-[32px] md:text-[40px] font-bold bg-gradient-to-b from-[#DC4C75] to-[#862440] bg-clip-text text-transparent">
            LOGIN
          </h1>

          <div className="w-full relative">
            <Icon
              icon="mdi:account"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[32px] md:text-[38px]"
            />
            <input
              type="text"
              placeholder="Username"
              value={nomorInduk}
              onChange={(e) => setNomorInduk(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50 text-sm md:text-base"
            />
          </div>

          <div className="w-full relative">
            <Icon
              icon="mdi:lock"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[32px] md:text-[38px]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50 text-sm md:text-base"
            />
          </div>

          <button
            className="w-full sm:w-[185px] bg-[#DC4C75] text-white font-bold py-2 rounded-full hover:bg-[#862440] transition duration-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          <div>
            <span className="text-sm font-light text-gray-500">
              Tidak Memiliki Akun?{" "}
              <a href="/register" className="text-[#DC4C75]">
                Register disini
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}