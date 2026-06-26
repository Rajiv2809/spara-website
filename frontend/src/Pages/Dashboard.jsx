import React from "react";
import Sidebar from "../Components/Sidebar";
import DashboardPeminjam from "../Components/DashboardPeminjam";
import DashboardAdmin from "../Components/DashboardAdmin";
import { useStateContext } from "../Contexts/context";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { currentUser, userToken } = useStateContext();

  if (!userToken) {
    return <Navigate to="/login" />;
  }

  const role = currentUser?.role?.toLowerCase() || "";

  return (
    <div className="bg-gradient-to-b from-[#FFF6F1] to-[#FFD1D1] min-h-screen">
      <Sidebar />
      <div className="min-w-[300px] min-h-screen flex flex-col px-3">
        <div className="md:p-[50px] p-4 lg:ml-[300px]">
          {role === "admin" || role === "kepala" ? (
            <DashboardAdmin />
          ) : (
            <DashboardPeminjam />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
