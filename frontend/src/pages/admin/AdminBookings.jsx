import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AdminBookings = () => {
  const { getToken, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data.bookings);
    } catch (error) {
      toast.error("Error fetching bookings");
      console.error(error);
    }
  }, [getToken]);

  const handleDeleteBooking = (booking) => {
    setSelectedBooking(booking);
    setShowDeleteModal(true);
  };

  const confirmDeleteBooking = async () => {
    const token = await getToken();
    try {
      await axios.delete(`/api/admin/bookings/${selectedBooking._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings((prev) => prev.filter(b => b._id !== selectedBooking._id));
      toast.success("Booking deleted successfully");
    } catch (error) {
      toast.error("Error deleting booking");
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setSelectedBooking(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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
                    onClick={() => handleDeleteBooking(b)}
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

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Delete Booking</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this booking?
            </p>
            <div className="text-sm text-gray-500 mb-6 space-y-1">
              <p><strong>User:</strong> {selectedBooking?.user?.username || "N/A"}</p>
              <p><strong>Establishment:</strong> {selectedBooking?.hotel?.name || "N/A"}</p>
              <p><strong>Total:</strong> {currency} {selectedBooking?.totalPrice}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
