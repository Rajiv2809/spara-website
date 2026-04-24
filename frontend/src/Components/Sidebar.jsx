import React from 'react';
import logo2 from '../Pages/Assets/logo2.png';
import { Icon } from "@iconify/react";
import pakari from '../Pages/Assets/pakari.png';
const Sidebar = () => {

    return (
        <div className='min-w-[300px] h-screen bg-[#862440] text-white absolute flex flex-col  px-3 '>
            <div className='headline flex flex-row items-center '>
                <div className="logo">
                    <img src={logo2} className='w-[88px]' alt="Logo" />
                </div>
                <div className="text ">
                    <h1 className='text-xl font-bold'>SPARA</h1>

                    <h3 className='text-[#B1B1B1] text-[12px]'> Politeknik Negeri Batam</h3>
                </div>
            </div>
            <div className="line w-full h-[1px] bg-white    ">

            </div>
            <div className="menu flex flex-col gap-4 mt-4 bg-[#682B3C] rounded-lg   pl-2 text-[#FFEDDD] ">
                <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
                    <Icon icon="mdi:view-dashboard" width="30" />
                    <a className='text-[20px] font-bold' href="/dashboard">Dashboard</a>
                </div>
            </div>
            <div className="menu flex flex-col gap-4 mt-4  rounded-lg   pl-2 text-[#FFEDDD] ">
                <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
                    <Icon icon="octicon:checklist-16" width="30" />
                    <a className='text-[20px] font-bold' href="/peminjaman-ruangan">Peminjaman Ruangan</a>
                </div>
            </div>
            <div className="menu flex flex-col gap-4 mt-4  rounded-lg   pl-2 text-[#FFEDDD] ">
                <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
                    <Icon icon="material-symbols:monitor-outline" width="30" />
                    <a className='text-[20px] font-bold' href="/peminjaman-peralatan">Peminjaman Peralatan</a>
                </div>
            </div>
            <div className="menu flex flex-col gap-4 mt-4  rounded-lg   pl-2 text-[#FFEDDD] ">
                <div className="list-menu flex flex-row gap-2 p-4  item-center text-center ">
                    <Icon icon="material-symbols:history" width="30" />
                    <a className='text-[20px] font-bold' href="/dashboard">Riwayat</a>
                </div>
            </div>
            
            <div className="logout align-bottom mt-auto flex flex-row gap-2 p-2 flex  item-center text-center border-1 border-[#eeeeee] ">
                <img src={pakari} alt="Profile" />
                <div className="name text-left">
                    <h1 className='text-[15px]'>Ari Wibowo, S.T, M.T</h1>
                    <h3 className='text-[8px]'>ariwibowo.geming@gmail.com</h3>
                </div>
                <Icon icon="uil:signout" width="30" />
            </div>

        </div>
    );
}

export default Sidebar;
