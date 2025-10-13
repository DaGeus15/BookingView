// src/layouts/admin/AdminLayout.js
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import AdminSidebar from '../../components/hotelOwner/AdminSidebar'

const AdminLayout = () => {
  const { user, isAdmin, navigate } = useAppContext();

  useEffect(() => {
    // Redirigir si no es admin
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin]);

  return (
    <div className="flex flex-col h-screen">

      <div className="flex flex-1 h-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
