import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";

const AdminHotels = () => {
  const { getToken } = useAppContext();
  const [hotels, setHotels] = useState([]);

  const fetchHotels = async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/hotels", { headers: { Authorization: `Bearer ${token}` } });
      setHotels(res.data.hotels);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const deleteHotel = async (hotelId) => {
    const token = await getToken();
    try {
      await axios.delete(`/api/admin/hotels/${hotelId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchHotels();
    } catch (error) {
      console.error("Error deleting hotel:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Properties</h1>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Address</th>
            <th className="py-2 px-4 text-left">City</th>
            <th className="py-2 px-4 text-left">Owner</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(h => (
            <tr key={h._id} className="border-b">
              <td className="py-2 px-4">{h.name}</td>
              <td className="py-2 px-4">{h.address}</td>
              <td className="py-2 px-4">{h.city}</td>
              <td className="py-2 px-4">{h.owner?.username || "N/A"}</td>
              <td className="py-2 px-4">
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => deleteHotel(h._id)}
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

export default AdminHotels;
