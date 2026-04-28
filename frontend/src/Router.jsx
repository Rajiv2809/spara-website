import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./Layout/DefaultLayout.jsx";
import GuestLayout from "./Layout/GuestLayout.jsx";
import Login from "./Pages/Login.jsx";
import Home from "./Pages/Home.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import PengajuanRuangan from "./Pages/PengajuanRuangan.jsx";
import PengajuanPeralatan from "./Pages/PengajuanPeralatan.jsx";
import TentangKami from "./Pages/TentangKami.jsx";
import Riwayat from "./Pages/Riwayat.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/home",
                element: <Home />
            },
            {
                path: "/dashboard",
                element: <Dashboard/>
            },
            {
                path: "/pengajuanruangan",
                element: <PengajuanRuangan/>
            },
            {
                path: "/peminjaman-peralatan",
                element: <PengajuanPeralatan/>
            },
            {
                path: "/riwayat",
                element: <Riwayat/>
             },
            
           
        ]
    },
    {
        path: "/",
        element: <GuestLayout />,
        children:[
            {
                path: "/login",
                element: <Login />
                
            },
            {
                path: "/landing-page",
                element: <LandingPage />
                
            },
            {
                path: "/tentangkami",
                element: <TentangKami />
                
            },
        ]
    }
]);

export default router;