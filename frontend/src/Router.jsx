import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "./Layout/DefaultLayout.jsx";
import GuestLayout from "./Layout/GuestLayout.jsx";
import Login from "./Pages/Login.jsx";
import Home from "./Pages/Home.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import Pengajuanroom from "./Pages/Pengajuanroom.jsx";
import PengajuanPertoolan from "./Pages/PengajuanPertoolan.jsx";
import TentangKami from "./Pages/TentangKami.jsx";
import Kelolaroom from "./Pages/Kelolaroom.jsx";
import Persetujuanloan from "./Pages/Persetujuanloan.jsx";
import Riwayat from "./Pages/Riwayat.jsx";
import KelolaPertoolan from "./Pages/KelolaPertoolan.jsx";
import KelolaAdmin from "./Pages/KelolaAdmin";
import AllListloan from "./Pages/AllLlistPeminjman.jsx";
import Register from "./Pages/Register.jsx";
import Laporan from "./Pages/Laporan.jsx";
import loanKepala from "./Pages/loanKepala.jsx";
import Kalenderloan from "./Pages/Kalenderloan.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/pengajuan-room",
        element: <Pengajuanroom />,
      },
      {
        path: "/loan-pertoolan",
        element: <PengajuanPertoolan />,
      },
      {
        path: "/kelola-room",
        element: <Kelolaroom />,
      },
      {
        path: "/riwayat",
        element: <Riwayat />,
      },
      {
        path: "/persetujuan-loan",
        element: <Persetujuanloan />,
      },
      {
        path: "/kelola-pertoolan",
        element: <KelolaPertoolan />,
      },
      {
        path: "/kelola-admin",
        element: <KelolaAdmin />,
      },
      {
        path:"/laporan",
        element: <Laporan/>
      },
      {
        path:"/kalender-loan",
        element: <Kalenderloan/>
      },
      {
        path:"/loan-kepala",
        element: <loanKepala/>
      },
      // {
      //     path: "/semua-loan",
      //     element: <AllListloan />
      // }
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/landing-page",
        element: <LandingPage />,
      },
      {
        path: "/tentangkami",
        element: <TentangKami />,
      },
    ],
  },
]);

export default router;
