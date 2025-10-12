import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";

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
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500">Total Hotels</p>
          <p className="text-2xl font-bold">{stats.totalHotels}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500">Total Rooms</p>
          <p className="text-2xl font-bold">{stats.totalRooms}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold">{stats.totalBookings}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
