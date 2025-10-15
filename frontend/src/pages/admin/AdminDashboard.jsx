import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const AdminDashboard = () => {
  const { getToken } = useAppContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const [bookingsByMonth, setBookingsByMonth] = useState([]);
  const [bookingsByHotel, setBookingsByHotel] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = await getToken();
      try {
        const [usersRes, hotelsRes, roomsRes, bookingsRes] = await Promise.all([
          axios.get("/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/hotels", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/rooms", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { bookings, stats: bookingStats } = bookingsRes.data;

        // 📊 Agrupar reservas por mes
        const bookingsPerMonth = {};
        bookings.forEach((b) => {
          if (!b.checkInDate) return;
          const date = new Date(b.checkInDate);
          const month = date.toLocaleString("default", { month: "short" });
          bookingsPerMonth[month] = (bookingsPerMonth[month] || 0) + 1;
        });

        const monthsOrdered = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const bookingsByMonthData = monthsOrdered
          .filter((m) => bookingsPerMonth[m])
          .map((m) => ({
            month: m,
            bookings: bookingsPerMonth[m],
          }));

        setBookingsByMonth(bookingsByMonthData);

        // 🏨 Agrupar reservas por hotel
        const hotelMap = {};
        bookings.forEach((b) => {
          const hotelName = b.hotel?.name || "Unknown";
          hotelMap[hotelName] = (hotelMap[hotelName] || 0) + 1;
        });
        const bookingsByHotelData = Object.keys(hotelMap).map((hotel) => ({
          name: hotel,
          bookings: hotelMap[hotel],
        }));

        setBookingsByHotel(bookingsByHotelData);

        // 📈 KPI principales
        setStats({
          totalUsers: usersRes.data.users.length,
          totalHotels: hotelsRes.data.hotels.length,
          totalRooms: roomsRes.data.rooms.length,
          totalBookings: bookingStats.totalBookings,
          totalRevenue: bookingStats.totalRevenue,
        });
      } catch (error) {
        toast.error("Error fetching admin stats");
        console.error(error);
      }
    };

    fetchStats();
  }, [getToken]);

  return (
    <div className="space-y-10">
      <Title
        align="left"
        font="outfit"
        title="Admin Dashboard"
        subTitle="Monitor users, establishments, rooms, and bookings with live insights."
      />

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-cyan-100 to-blue-50 shadow-md rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-100 to-pink-50 shadow-md rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-500">Total Establishments</p>
          <p className="text-2xl font-bold">{stats.totalHotels}</p>
        </div>
        <div className="bg-gradient-to-r from-green-100 to-teal-50 shadow-md rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-500">Total Rooms</p>
          <p className="text-2xl font-bold">{stats.totalRooms}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-100 to-orange-50 shadow-md rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold">{stats.totalBookings}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-100 to-red-50 shadow-md rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold">
            ${stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BOOKINGS PER MONTH */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Bookings Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BOOKINGS BY HOTEL */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Bookings by Establishment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsByHotel}>
              <XAxis
                dataKey="name"
                interval={0}
                angle={-20}
                textAnchor="end"
                height={80}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
