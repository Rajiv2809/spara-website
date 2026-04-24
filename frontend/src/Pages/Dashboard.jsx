import React from 'react';
import Sidebar from '../Components/Sidebar.jsx';

import { Icon } from "@iconify/react";

const Dashboard = () => {
    return (

        <div className=''>
            
            <Sidebar /> 
           
                <div className="dasboard p-[50px] ml-[300px]">
                    <h1 className="text-[#481020] text-[36px] font-extrabold font-poppins">Halaman Dasbor</h1>
                    <h1 className="text-[#666666] text-[20px] font-regular font-poppins">Lihat ringkasan data secara keseluruhan dalam aplikasi</h1>
                    <div className="grid lg:grid-cols-3 grid-rows-3 lg:grid-rows-1 mt-8 ">

                        <div className="bg-gradient-to-r w-[300px] h-[140px] from-[#FF3A72] to-[#C62E4D] p-4 rounded-2xl shadow">
                            <h3 className="text-[#EEEEEE] text-[18px] font-bold font-poppins">TOTAL PERALATAN</h3>
                            <h1 className="text-[#EEEEEE] text-[64px] font-extrabold font-poppins leading-none">67</h1>
                            <h1 className="text-[#EEEEEE] text-[14px] italic font-thin font-poppins text-end leading-none">11 Dalam peminjaman</h1>
                            
                        </div>
                    </div>
                </div>
                
         </div>
    );
}

export default Dashboard;
