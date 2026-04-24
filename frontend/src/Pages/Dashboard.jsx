import React from "react";
import Sidebar from "../Components/Sidebar";

import { Icon } from "@iconify/react";

const Dashboard = () => {
  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      <div className="min-w-[300px] h-screen bg-[#862440] text-white absolute flex flex-col  px-3 ">
        <div className="headline flex flex-row items-center ">
          <div className="logo">
            <img src={logo2} className="w-[88px]" alt="Logo" />
          </div>
          <div className="text ">
            <h1 className="text-xl font-bold">SPARA</h1>

            <h3 className="text-[#B1B1B1] text-[12px]">
              {" "}
              Politeknik Negeri Batam
            </h3>
          </div>
        </div>
        <div className="line w-full h-[1px] bg-white    "></div>
        <div className="menu flex flex-col gap-4 mt-4 bg-[#682B3C] rounded-lg pl-2 text-[#FFEDDD] ">
          <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
            <Icon icon="mdi:view-dashboard" width="30" />
            <a className="text-[20px] font-bold" href="/dashboard">
              Dashboard
            </a>
          </div>
        </div>
        <div className="menu flex flex-col gap-4 mt-4 rounded-lg pl-2 text-[#FFEDDD] ">
          <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
            <Icon icon="mdi:view-dashboard" width="30" />
            <a className="text-[20px] font-bold" href="/dashboard">
              Dashboard
            </a>
          </div>
        </div>
        <div className="menu flex flex-col gap-4 mt-4 rounded-lg pl-2 text-[#FFEDDD] ">
          <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
            <Icon icon="mdi:view-dashboard" width="30" />
            <a className="text-[20px] font-bold" href="/dashboard">
              Dashboard
            </a>
          </div>
        </div>
        <div className="menu flex flex-col gap-4 mt-4 rounded-lg pl-2 text-[#FFEDDD] ">
          <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
            <Icon icon="mdi:view-dashboard" width="30" />
            <a className="text-[20px] font-bold" href="/dashboard">
              Dashboard
            </a>
          </div>
        </div>
        <div className="menu flex flex-col gap-4 mt-4 rounded-lg pl-2 text-[#FFEDDD] ">
          <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
            <Icon icon="mdi:view-dashboard" width="30" />
            <a className="text-[20px] font-bold" href="/dashboard">
              Dashboard
            </a>
          </div>
        </div>
      </div>
      <div className="dasboard p-[50px] ml-[300px]">
        <h1 className="text-[#481020] text-[36px] font-extrabold font-poppins">
          Halaman Dasbor
        </h1>
        <h1 className="text-[#666666] text-[20px] font-regular font-poppins">
          Lihat ringkasan data secara keseluruhan dalam aplikasi
        </h1>
        <div className="grid lg:grid-cols-3 grid-rows-3 lg:grid-rows-1 mt-8 gap-12">
          <div className="bg-gradient-to-r relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
            <Icon
              icon="mingcute:projector-line"
              className="absolute -top-4 -right-0 text-[#E75072]/50 z-0"
              width="160"
            />
            <div className="relative z-10">
              <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                TOTAL PERALATAN
              </h3>
              <h1 className="text-[#EEEEEE] text-[64px] font-extrabold font-poppins leading-none mt-2">
                67
              </h1>
              <h1 className="text-[#EEEEEE] text-[14px] italic font-thin font-poppins text-end leading-none">
                11 Dalam peminjaman
              </h1>
            </div>
          </div>
          <div className="bg-gradient-to-b relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
            <Icon
              icon="material-symbols:meeting-room-outline-rounded"
              className="absolute -top-2 -right-0 text-[#E75072]/50 z-0"
              width="160"
            />
            <div className="relative z-10">
              <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                TOTAL PERALATAN
              </h3>
              <h1 className="text-[#EEEEEE] text-[64px] font-extrabold font-poppins leading-none mt-2">
                67
              </h1>
              <h1 className="text-[#EEEEEE] text-[14px] italic font-thin font-poppins text-end leading-none">
                11 Dalam peminjaman
              </h1>
            </div>
          </div>
          <div className="bg-gradient-to-l relative h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
            <Icon
              icon="streamline-ultimate:task-list-approve-bold"
              className="absolute top-1 right-2 text-[#FF6386]/40 z-0"
              width="130"
            />
            <div className="relative z-10">
              <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">
                TOTAL PERALATAN
              </h3>
              <h1 className="text-[#EEEEEE] text-[64px] font-extrabold font-poppins leading-none mt-2">
                4
              </h1>
              <h1 className="text-[#EEEEEE] text-[14px] italic font-thin font-poppins text-end leading-none">
                Menunggu Disetujui
              </h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[3fr_2fr] gap-6 mt-8">
          <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl">
            <div className="relative z-10">
              <h3 className="text-[#471020] text-[24px] font-bold">
                Peminjaman yang Diajukan
              </h3>
              <button className="absolute top-1 right-2 border-2 border-[#F2A31A] text-[#F2A31A] px-4 py-1 rounded-xl font-semibold hover:bg-[#F2A31A] hover:text-white transition duration-300">
                Lihat Semua
              </button>
              <h2 className="text-[#BC8D9B] text-[14px] font-regular">
                Beberapa peminjaman yang baru-baru ini diajukan
              </h2>
              <h1 className="text-[#EEEEEE] text-[64px] font-extrabold leading-none mt-2">
                67
              </h1>
              <h1 className="text-[#EEEEEE] text-[14px] italic text-end leading-none">
                11 Dalam peminjaman
              </h1>
            </div>
          </div>

          <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl">
            <div className="relative z-10">
              <h3 className="text-[#471020] text-[24px] font-bold">
                Aktivitas Terbaru
              </h3>
              <h1 className="text-[#BC8D9B] text-[14px] font-regular">
                Beberapa aktivitas terkini dalam sistem
              </h1>
              <h1 className="text-[#EEEEEE] text-[14px] italic text-end leading-none">
                11 Dalam peminjaman
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
