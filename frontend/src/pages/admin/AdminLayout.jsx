import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AdminLayout = () => {
  const { user, navigate } = useAppContext();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold cursor-pointer" onClick={() => navigate("/admin")}>
          Admin Panel
        </div>
        <nav className="flex flex-col mt-6 gap-2">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `px-4 py-2 hover:bg-gray-700 rounded ${isActive ? "bg-gray-700" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `px-4 py-2 hover:bg-gray-700 rounded ${isActive ? "bg-gray-700" : ""}`
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/admin/hotels"
            className={({ isActive }) =>
              `px-4 py-2 hover:bg-gray-700 rounded ${isActive ? "bg-gray-700" : ""}`
            }
          >
            Properties
          </NavLink>
          <NavLink
            to="/admin/rooms"
            className={({ isActive }) =>
              `px-4 py-2 hover:bg-gray-700 rounded ${isActive ? "bg-gray-700" : ""}`
            }
          >
            Rooms
          </NavLink>
          <NavLink
            to="/admin/bookings"
            className={({ isActive }) =>
              `px-4 py-2 hover:bg-gray-700 rounded ${isActive ? "bg-gray-700" : ""}`
            }
          >
            Bookings
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
