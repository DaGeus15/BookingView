import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const AdminDashboard = () => {
  const { getToken } = useAppContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = await getToken();
      try {
        const [usersRes, hotelsRes, roomsRes, bookingsRes] = await Promise.all([
          axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/hotels", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/rooms", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setStats({
          totalUsers: usersRes.data.users.length,
          totalHotels: hotelsRes.data.hotels.length,
          totalRooms: roomsRes.data.rooms.length,
          totalBookings: bookingsRes.data.bookings.length,
        });
      } catch (error) {
        toast.error("Error fetching admin stats");
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  const pieData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Establishment", value: stats.totalHotels },
    { name: "Rooms", value: stats.totalRooms },
    { name: "Bookings", value: stats.totalBookings },
  ];

  const COLORS = ["#00BFFF", "#8A2BE2", "#32CD32", "#FFA500"];

  return (
    <div className="space-y-10">
      <Title
        align="left"
        font="outfit"
        title="Admin Dashboard"
        subTitle="Monitor users, Establishment, rooms and bookings all in one place."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-cyan-100 to-blue-50 shadow-md rounded-lg p-4 hover:shadow-xl transition flex flex-col items-center">
          <p className="text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-100 to-pink-50 shadow-md rounded-lg p-4 hover:shadow-xl transition flex flex-col items-center">
          <p className="text-gray-500">Total Establishment</p>
          <p className="text-2xl font-bold">{stats.totalHotels}</p>
        </div>
        <div className="bg-gradient-to-r from-green-100 to-teal-50 shadow-md rounded-lg p-4 hover:shadow-xl transition flex flex-col items-center">
          <p className="text-gray-500">Total Rooms</p>
          <p className="text-2xl font-bold">{stats.totalRooms}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-100 to-orange-50 shadow-md rounded-lg p-4 hover:shadow-xl transition flex flex-col items-center">
          <p className="text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold">{stats.totalBookings}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Overall Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Stats Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#00BFFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
