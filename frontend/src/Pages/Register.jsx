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

export default function Register() {
  const { showToast } = useStateContext();
  const [nomorInduk, setNomorInduk] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [prodi, setProdi] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const jurusanProdi = {
    "Teknik Informatika": [
    { id: 101, nama: "S1 Teknik Informatika" },
    { id: 102, nama: "D3 Teknik Informatika" },
    { id: 201, nama: "S1 Sistem Informasi" },
    ],

    "Teknik Elektro": [
    { id: 301, nama: "S1 Teknik Elektro" },
    ],
  };

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const register = (e) => {
    e.preventDefault();
    setIsLoading(true);

 console.log({
    nomor_induk: nomorInduk,
    nama,
    email,
    no_telepon: telepon,
    id_prodi: prodi,
  });

  setIsLoading(true);

    axiosClient
      .post("/register", {
        nomor_induk: nomorInduk,
        nama,
        email,
        no_telepon: telepon,
        id_prodi: prodi,
        password,
        password_confirmation: confirmPassword,
      })
      .then(({ data }) => {
        showToast(data.message, "green");
        navigate("/register");
      })
      .catch((err) => {
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);

  showToast("Register gagal", "red");
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
    <div className="register-container flex items-center justify-center bg-gradient-to-b from-[#DC4C75] to-[#862440] h-screen overflow-hidden relative">
      <img
        src={wave1}
        alt="Wave 1"
        className="size-[800px] absolute bottom-0 left-0"
      />
      <img
        src={wave2}
        alt="Wave 2"
        className="size-[800px] absolute top-0 right-0"
      />

      {/* Overlay loading fullscreen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-xl">
            <div className="w-10 h-10 border-4 border-[#DC4C75] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#862440] font-semibold text-sm">
              Sedang masuk...
            </span>
          </div>
        </div>
      )}

      <div className="card-register rounded-[44px] h-[70 0px] bg-white min-w-[900px] z-10 grid grid-cols-5">
        <div className="logo col-span-2 flex items-center justify-center bg-[#862440] rounded-l-[44px]">
          <img src={logo1} className="w-[200px]" alt="Logo" />
        </div>

        <form
          className="form-register col-span-3 flex flex-col gap-4 items-center gap-4 px-[50px] py-8 overflow-y-auto"
          method="post"
          onSubmit={register}
        >
          <h1 className="text-[40px] font-bold bg-gradient-to-b from-[#DC4C75] to-[#862440] bg-clip-text text-transparent">
            REGISTER
          </h1>

          <div className="w-full relative">
            <Icon
              icon="mdi:account"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
            />
            <input
              type="text"
              placeholder="NIM"
              value={nomorInduk}
              onChange={(e) => setNomorInduk(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="w-full relative">
            <Icon
              icon="mdi:account-circle"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
            />
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="w-full relative">
            <Icon
              icon="mdi:email"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="w-full relative">
            <Icon
              icon="mdi:phone"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
            />
            <input
              type="text"
              placeholder="No Telepon"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="w-full relative">
            <Icon
              icon="mdi:domain"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
            />
            <select
              value={jurusan}
              onChange={(e) => {
                setJurusan(e.target.value);
                setProdi("");
              }}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50"
            >
              <option value="">Pilih Jurusan</option>

              {Object.keys(jurusanProdi).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {jurusan && (
            <div className="w-full relative">
              <Icon
                icon="mdi:school"
                className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
              />
              <select
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none bg-transparent disabled:opacity-50"
              >
                <option value="">Pilih Program Studi</option>

                {jurusanProdi[jurusan]?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-full relative">
            <Icon
              icon="mdi:lock"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="w-full relative">
            <Icon
              icon="mdi:lock-check"
              className="absolute top-1/2 -translate-y-1/2 text-[#862440] text-[24px]"
            />
            <input
              type="password"
              placeholder="Konfirmasi Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-2 border-b-2 border-[#862440] focus:outline-none disabled:opacity-50"
            />
          </div>

          <button
            className="w-[185px] bg-[#DC4C75] text-white font-bold py-2 rounded-full hover:bg-[#862440] transition duration-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              "Register"
            )}
          </button>

          <div>
            <span className="text-sm font-light text-gray-500">
              Sudah Memiliki Akun?{" "}
              <a href="/login" className="text-[#DC4C75]">
                Login disini
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
