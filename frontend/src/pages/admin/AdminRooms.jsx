import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AdminRooms = () => {
  const { getToken, currency } = useAppContext();
  const [rooms, setRooms] = useState([]);

  const fetchRooms = useCallback(async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/rooms", { headers: { Authorization: `Bearer ${token}` } });
      setRooms(res.data.rooms);
    } catch (error) {
      toast.error("Error fetching rooms");
      console.error("Error fetching rooms:", error);
    }
  }, [getToken]);

  const toggleAvailability = async (roomId) => {
    const token = await getToken();
    try {
      await axios.post("/api/admin/rooms/toggle", { roomId }, { headers: { Authorization: `Bearer ${token}` } });
      setRooms(prev => prev.map(r => r._id === roomId ? { ...r, isAvailable: !r.isAvailable } : r));
      toast.success("Room availability updated");
    } catch (error) {
      toast.error("Error updating room availability");
      console.error("Error toggling room availability:", error);
    }
  };

  const deleteRoom = async (roomId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    const token = await getToken();
    try {
      await axios.delete(`/api/admin/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      setRooms(prev => prev.filter(r => r._id !== roomId));
      toast.success("Room deleted successfully");
    } catch (error) {
      toast.error("Error deleting room");
      console.error("Error deleting room:", error);
    }
  };


  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rooms</h1>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Room Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Price/Night</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Establishment</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Available</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{r.roomType}</td>
                <td className="px-6 py-4">{currency} {r.pricePerNight}</td>
                <td className="px-6 py-4">{r.hotel?.name || "N/A"}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${r.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {r.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  <button
                    onClick={() => toggleAvailability(r._id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => deleteRoom(r._id)}
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

export default AdminRooms;
