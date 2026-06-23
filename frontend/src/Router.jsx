import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "./Layout/DefaultLayout.jsx";
import GuestLayout from "./Layout/GuestLayout.jsx";
import Login from "./Pages/Login.jsx";
import Home from "./Pages/Home.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import PengajuanRuangan from "./Pages/PengajuanRuangan.jsx";
import PengajuanPeralatan from "./Pages/PengajuanPeralatan.jsx";
import TentangKami from "./Pages/TentangKami.jsx";
import KelolaRuangan from "./Pages/KelolaRuangan.jsx";
import PersetujuanPeminjaman from "./Pages/PersetujuanPeminjaman.jsx";
import Riwayat from "./Pages/Riwayat.jsx";
import KelolaPeralatan from "./Pages/KelolaPeralatan.jsx";
import KelolaAdmin from "./Pages/KelolaAdmin";
import AllListPeminjaman from "./Pages/AllLlistPeminjman.jsx";
import Register from "./Pages/Register.jsx";
import Laporan from "./Pages/Laporan.jsx";
import PeminjamanKepala from "./Pages/PeminjamanKepala.jsx";
import KalenderPeminjaman from "./Pages/KalenderPeminjaman.jsx";
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
        path: "/pengajuan-ruangan",
        element: <PengajuanRuangan />,
      },
      {
        path: "/peminjaman-peralatan",
        element: <PengajuanPeralatan />,
      },
      {
        path: "/kelola-ruangan",
        element: <KelolaRuangan />,
      },
      {
        path: "/riwayat",
        element: <Riwayat />,
      },
      {
        path: "/persetujuan-peminjaman",
        element: <PersetujuanPeminjaman />,
      },
      {
        path: "/kelola-peralatan",
        element: <KelolaPeralatan />,
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
        path:"/kalender-peminjaman",
        element: <KalenderPeminjaman/>
      },
      {
        path:"/peminjaman-kepala",
        element: <PeminjamanKepala/>
      },
      // {
      //     path: "/semua-peminjaman",
      //     element: <AllListPeminjaman />
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
