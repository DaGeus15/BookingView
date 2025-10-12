import React from 'react';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const sideBarLinks = [
    { name: "Dashboard", path: "/owner", icon: assets.dashboardIcon },
    { name: "Add Room", path: "/owner/add-room", icon: assets.addIcon },
    { name: "List Room", path: "/owner/list-room", icon: assets.listIcon }
  ];

  return (
    <div className="md:w-64 w-20 bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-center md:justify-start p-4 border-b border-gray-200">
        <span className="hidden md:inline ml-2 font-bold text-xl text-primary">Owner Panel</span>
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
            <img src={item.icon} alt={item.name} className="h-6 w-6 md:h-5 md:w-5" />
            <span className="md:block hidden">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-100 hover:text-red-600 text-gray-700 transition">
          <img src={assets.logoutIcon} alt="Logout" className="h-5 w-5" />
          <span className="md:block hidden font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
