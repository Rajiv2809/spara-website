import React from "react";
import Sidebar from "../Components/sidebar";
import logo2 from "./assets/logo2.png";
import { Icon } from "@iconify/react";
const Dashboard = () => {
  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      {/* Sidebar */}
      <div className="min-w-[300px] h-screen bg-[#862440] text-white absolute flex flex-col px-3">
        {/* Logo & Title */}
        <div className="headline flex flex-row items-center">
          <div className="logo">
            <img src={logo2} className="w-[88px]" alt="Logo" />
          </div>
          <div className="text">
            <h1 className="text-xl font-bold">SPARA</h1>
            <h3 className="text-[#B1B1B1] text-[12px]">
              Politeknik Negeri Batam
            </h3>
          </div>
        </div>

        {/* Main Content */}
        <div className="dasboard p-[50px] ml-[300px]">
          <h1 className="text-[#481020] text-[36px] font-extrabold font-poppins">
            Halaman Dasbor
          </h1>
          <h1 className="text-[#666666] text-[20px] font-regular font-poppins">
            Lihat ringkasan data secara keseluruhan dalam aplikasi
          </h1>

          {/* Stats Cards */}
          <div className="grid lg:grid-cols-3 grid-rows-3 lg:grid-rows-1 mt-8 gap-12">
            {/* Card 1 */}
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

            {/* Card 2 */}
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

            {/* Card 3 */}
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

          {/* Bottom Section */}
          <div className="grid grid-cols-[3fr_2fr] gap-6 mt-8">
            {/* Peminjaman yang Diajukan */}
            <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl">
              <div className="relative z-10">
                <h3 className="text-[#471020] text-[24px] font-bold">
                  Peminjaman yang Diajukan
                </h3>
                <button className="absolute top-2 right-2 border-2 border-[#F2A31A] text-[#F2A31A] px-4 py-1 rounded-xl font-semibold hover:bg-[#F2A31A] hover:text-white transition duration-300">
                  Lihat Semua
                </button>
                <h2 className="text-[#BC8D9B] text-[14px] font-regular">
                  Beberapa peminjaman yang baru-baru ini diajukan
                </h2>

                <div className="custom-scroll bg-[#EEEEEE ] relative p-4 rounded-2xl mt-4 max-h-[324px] overflow-y-auto pr-3 space-y-3">
                  {/* Item 1 */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-[#ECDFE3] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#7A2E3A] text-white p-2 rounded-lg">
                        <Icon icon="la:tools" width="28" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#471020]">
                          Drone Mavic 3 Pro
                        </h4>
                        <p className="text-[12px] text-[#606060]">
                          PIC: Ahmad Saropi
                        </p>
                        <p className="text-[12px] text-[#606060] mt-2">
                          Boneca Ambalabu - Mahasigma
                        </p>
                      </div>
                    </div>

                    <span className="bg-[#8BB166] text-white px-3 py-1 rounded-full text-xs font-semibold min-w-[90px] text-center">
                      DISETUJUI
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-[#ECDFE3] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#7A2E3A] text-white p-2 rounded-lg">
                        <Icon icon="la:tools" width="28" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#471020]">
                          Apple Iphone 14 Pro Max
                        </h4>
                        <p className="text-[12px] text-[#606060]">
                          PIC: Ahmad Saropi
                        </p>
                        <p className="text-[12px] text-[#606060] mt-2">
                          Boneca Ambalabu - Mahasigma
                        </p>
                      </div>
                    </div>

                    <span className="bg-[#B16666] text-white px-3 py-1 rounded-full text-xs font-semibold min-w-[90px] text-center">
                      DITOLAK
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-[#ECDFE3] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#7A2E3A] text-white p-2 rounded-lg">
                        <Icon icon="la:tools" width="28" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#471020]">
                          Apple Iphone 14 Pro Max
                        </h4>
                        <p className="text-[12px] text-[#606060]">
                          PIC: Ahmad Saropi
                        </p>
                        <p className="text-[12px] text-[#606060] mt-2">
                          Boneca Ambalabu - Mahasigma
                        </p>
                      </div>
                    </div>

                    <span className="bg-[#999999] text-white px-3 py-1 rounded-full text-xs font-semibold min-w-[90px] text-center">
                      MENUNGGU
                    </span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-[#ECDFE3] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#7A2E3A] text-white p-2 rounded-lg">
                        <Icon icon="la:tools" width="28" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#471020]">
                          Mini Theatre
                        </h4>
                        <p className="text-[12px] text-[#606060]">
                          PIC: Ahmad Saropi
                        </p>
                        <p className="text-[12px] text-[#606060] mt-2">
                          Boneca Ambalabu - Mahasigma
                        </p>
                      </div>
                    </div>

                    <span className="bg-[#B16666] text-white px-3 py-1 rounded-full text-xs font-semibold min-w-[90px] text-center">
                      DITOLAK
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Aktivitas Terbaru */}
            <div className="bg-[#EEEEEE] p-4 rounded-2xl shadow-xl">
              <div className="relative z-10">
                <h3 className="text-[#471020] text-[24px] font-bold">
                  Aktivitas Terbaru
                </h3>
                <h1 className="text-[#BC8D9B] text-[14px] font-regular">
                  Beberapa aktivitas terkini dalam sistem
                </h1>
                <div className="space-y-0">
                {/* Item 1 */}
  <div className="flex items-start justify-between p-3 bg-[#EEEEEE]">
    <div className="flex items-start gap-2">
      <Icon icon="zondicons:exclamation-outline" width="28" className="text-[#4DB04A]"/>

      <div>
        <h4 className="font-semibold text-[#471020]">
          Peminjaman Wacom Intuos Pro disetujui oleh Penanggung Jawab
        </h4>

        <div className="flex items-center gap-[2px] mt-1">
          <Icon icon="mingcute:time-fill" className="text-[#A3A3A3]" />
          <p className="text-[12px] text-[#A3A3A3]">
            12 jam lalu
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Item 2 */}
  <div className="-mt-1 flex items-start justify-between p-3 bg-[#EEEEEE]">
    <div className="flex items-start gap-2">
      <Icon icon="zondicons:exclamation-outline" width="28" className="text-[#4DB04A]"/>

      <div>
        <h4 className="font-semibold text-[#471020]">
          Peminjaman Wacom Intuos Pro disetujui oleh Penanggung Jawab
        </h4>

        <div className="flex items-center gap-[2px] mt-1">
          <Icon icon="mingcute:time-fill" className="text-[#A3A3A3]" />
          <p className="text-[12px] text-[#A3A3A3]">
            12 jam lalu
          </p>
        </div>
      </div>
    </div>
  </div>
  {/* Item 3 */}
  <div className="-mt-1 flex items-start justify-between p-3 bg-[#EEEEEE]">
    <div className="flex items-start gap-2">
      <Icon icon="zondicons:exclamation-outline" width="28" className="text-[#4DB04A]"/>

      <div>
        <h4 className="font-semibold text-[#471020]">
          Peminjaman Wacom Intuos Pro disetujui oleh Penanggung Jawab
        </h4>

        <div className="flex items-center gap-[2px] mt-1">
          <Icon icon="mingcute:time-fill" className="text-[#A3A3A3]" />
          <p className="text-[12px] text-[#A3A3A3]">
            12 jam lalu
          </p>
        </div>
      </div>
    </div>
  </div>
  {/* Item 4 */}
  <div className="-mt-1 flex items-start justify-between p-3 bg-[#EEEEEE]">
    <div className="flex items-start gap-2">
      <Icon icon="zondicons:exclamation-outline" width="28" className="text-[#4DB04A]"/>

      <div>
        <h4 className="font-semibold text-[#471020]">
          Peminjaman Wacom Intuos Pro disetujui oleh Penanggung Jawab
        </h4>

        <div className="flex items-center gap-[2px] mt-1">
          <Icon icon="mingcute:time-fill" className="text-[#A3A3A3]" />
          <p className="text-[12px] text-[#A3A3A3]">
            12 jam lalu
          </p>
        </div>
      </div>
    </div>
  </div>
  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
    );
  };

  export default Dashboard;
