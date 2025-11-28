import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AdminRooms = () => {
  const { getToken, currency } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

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

  const handleDeleteRoom = (room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const confirmDeleteRoom = async () => {
    const token = await getToken();
    try {
      await axios.delete(`/api/admin/rooms/${selectedRoom._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRooms(prev => prev.filter(r => r._id !== selectedRoom._id));
      toast.success("Room deleted successfully");
    } catch (error) {
      toast.error("Error deleting room");
      console.error("Error deleting room:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedRoom(null);
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
                    onClick={() => handleDeleteRoom(r)}
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
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Delete Room</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this room?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>Room Type:</strong> {selectedRoom?.roomType}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRoom}
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

export default AdminRooms;
