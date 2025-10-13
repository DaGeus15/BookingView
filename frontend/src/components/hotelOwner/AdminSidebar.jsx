import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const sideBarLinks = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Establishments", path: "/admin/hotels", icon: "🏨" },
    { name: "Rooms", path: "/admin/rooms", icon: "🛏️" },
    { name: "Bookings", path: "/admin/bookings", icon: "📖" },
  ];

  return (
    <div className="md:w-64 w-20 bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-center md:justify-start p-4 border-b border-gray-200">
        <span className="hidden md:inline ml-2 font-bold text-xl text-primary">Admin Panel</span>
      </div>

      <nav className="flex-1 mt-4 flex flex-col">
        {sideBarLinks.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            end
            className={({ isActive }) =>
              `flex items-center py-3 px-4 md:px-6 gap-3 rounded-lg mx-2 my-1 transition-all duration-300
              ${isActive 
                ? 'bg-blue-100 text-blue-600 font-semibold shadow-inner' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`
            }
          >
            <span className="text-xl md:text-base">{item.icon}</span>
            <span className="md:block hidden">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
