import React from 'react';
import Sidebar from '../Components/sidebar';
import logo2 from './assets/logo2.png';
import { Icon } from "@iconify/react";

const Dashboard = () => {
    return (

        <div className='max-w-[300px] h-screen bg-[#862440] text-white  flex flex-col  px-3 '>
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
            <div className="menu flex flex-col gap-4 mt-4">
                <div className="list-menu flex flex-row gap-2 pl-4  item-center text-center">
                    <Icon icon="mdi:view-dashboard" width="30" />
                    <a href="/dasd">Dashboard</a>
                </div>
            </div>
            
        </div>
    );
}

export default Dashboard;
