import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";

const AdminRooms = () => {
  const { getToken } = useAppContext();
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/rooms", { headers: { Authorization: `Bearer ${token}` } });
      setRooms(res.data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const toggleAvailability = async (roomId) => {
    const token = await getToken();
    try {
      await axios.post("/api/admin/rooms/toggle", { roomId }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRooms();
    } catch (error) {
      console.error("Error toggling room availability:", error);
    }
  };

  const deleteRoom = async (roomId) => {
    const token = await getToken();
    try {
      await axios.delete(`/api/admin/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Rooms</h1>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">Room Type</th>
            <th className="py-2 px-4 text-left">Price/Night</th>
            <th className="py-2 px-4 text-left">Hotel</th>
            <th className="py-2 px-4 text-left">Available</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r._id} className="border-b">
              <td className="py-2 px-4">{r.roomType}</td>
              <td className="py-2 px-4">{r.pricePerNight}</td>
              <td className="py-2 px-4">{r.hotel?.name || "N/A"}</td>
              <td className="py-2 px-4">{r.isAvailable ? "Yes" : "No"}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => toggleAvailability(r._id)}
                >
                  Toggle
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => deleteRoom(r._id)}
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

export default AdminRooms;
