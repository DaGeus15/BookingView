import React, { useCallback, useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { currency, user, getToken, axios } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/bookings/hotel", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios, getToken]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [fetchDashboardData, user]);

  return (
    <div className="space-y-10">
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Monitor your room listings, track bookings and analyze revenue—all in one place. Stay updated with real-time insights."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-center bg-gradient-to-r from-cyan-100 to-blue-50 shadow-md rounded-lg p-4 transition hover:shadow-xl">
          <img
            src={assets.totalBookingIcon}
            alt=""
            className="h-12 w-12 mr-4"
          />
          <div className="flex flex-col">
            <p className="text-blue-600 font-semibold text-lg">
              Total Bookings
            </p>
            <p className="text-gray-600 font-medium text-xl">
              {dashboardData.totalBookings}
            </p>
          </div>
        </div>

        <div className="flex items-center bg-gradient-to-r from-green-100 to-teal-50 shadow-md rounded-lg p-4 transition hover:shadow-xl">
          <img
            src={assets.totalRevenueIcon}
            alt=""
            className="h-12 w-12 mr-4"
          />
          <div className="flex flex-col">
            <p className="text-green-600 font-semibold text-lg">
              Total Revenue
            </p>
            <p className="text-gray-600 font-medium text-xl">
              {currency} {dashboardData.totalRevenue}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Recent Bookings
        </h2>
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 hidden sm:table-cell">
                  Room Name
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.bookings.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    {item.room.roomType}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {currency} {item.totalPrice}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${item.isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {item.isPaid ? "Completed" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
