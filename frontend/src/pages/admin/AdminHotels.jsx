import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AdminHotels = () => {
  const { getToken } = useAppContext();
  const [hotels, setHotels] = useState([]);

  const fetchHotels = async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/hotels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(res.data.hotels);
    } catch (error) {
      toast.error("Error fetching hotels");
      console.error("Error fetching hotels:", error);
    }
  };

  const deleteHotel = async (hotelId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this establishment?"
    );
    if (!confirmDelete) {
      toast("Deletion cancelled", { icon: "❌" });
      return;
    }

    const token = await getToken();
    try {
      await axios.delete(`/api/admin/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels((prev) => prev.filter((h) => h._id !== hotelId));
      toast.success("Establishment deleted successfully");
    } catch (error) {
      toast.error("Error deleting establishment");
      console.error("Error deleting establishment:", error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Properties</h1>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Address
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                City
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Owner
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hotels.map((h) => (
              <tr key={h._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{h.name}</td>
                <td className="px-6 py-4">{h.address}</td>
                <td className="px-6 py-4">{h.city}</td>
                <td className="px-6 py-4">{h.owner?.username || "N/A"}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteHotel(h._id)}
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

export default AdminHotels;
