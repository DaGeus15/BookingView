import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AdminBookings = () => {
  const { getToken, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data.bookings);
    } catch (error) {
      toast.error("Error fetching bookings");
      console.error(error);
    }
  };

  const deleteBooking = async (bookingId) => {
    const token = await getToken();
    try {
      await axios.delete(`/api/admin/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings((prev) => prev.filter(b => b._id !== bookingId));
      toast.success("Booking deleted successfully");
    } catch (error) {
      toast.error("Error deleting booking");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings</h1>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Establishment</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 hidden sm:table-cell">Room</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Check-In</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Check-Out</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Total</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{b.user?.username || "N/A"}</td>
                <td className="px-6 py-4">{b.hotel?.name || "N/A"}</td>
                <td className="px-6 py-4 hidden sm:table-cell">{b.room?.roomType || "N/A"}</td>
                <td className="px-6 py-4 text-center">{new Date(b.checkInDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center">{new Date(b.checkOutDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center">{currency} {b.totalPrice}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${b.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {b.isPaid ? "Paid" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteBooking(b._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;
