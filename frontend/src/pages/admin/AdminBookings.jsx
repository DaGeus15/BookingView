import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";

const AdminBookings = () => {
  const { getToken } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const deleteBooking = async (bookingId) => {
    const token = await getToken();
    try {
      await axios.delete(`/api/admin/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">User</th>
            <th className="py-2 px-4 text-left">Hotel</th>
            <th className="py-2 px-4 text-left">Room</th>
            <th className="py-2 px-4 text-left">Check-In</th>
            <th className="py-2 px-4 text-left">Check-Out</th>
            <th className="py-2 px-4 text-left">Total Price</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b._id} className="border-b">
              <td className="py-2 px-4">{b.user?.username || "N/A"}</td>
              <td className="py-2 px-4">{b.hotel?.name || "N/A"}</td>
              <td className="py-2 px-4">{b.room?.roomType || "N/A"}</td>
              <td className="py-2 px-4">{new Date(b.checkInDate).toLocaleDateString()}</td>
              <td className="py-2 px-4">{new Date(b.checkOutDate).toLocaleDateString()}</td>
              <td className="py-2 px-4">{b.totalPrice}</td>
              <td className="py-2 px-4">
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => deleteBooking(b._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;
