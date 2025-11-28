import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AdminHotels = () => {
  const { getToken } = useAppContext();
  const [hotels, setHotels] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const fetchHotels = useCallback(async () => {
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
  }, [getToken]);

  const handleDeleteHotel = (hotel) => {
    setSelectedHotel(hotel);
    setShowDeleteModal(true);
  };

  const confirmDeleteHotel = async () => {
    const token = await getToken();
    try {
      await axios.delete(`/api/admin/hotels/${selectedHotel._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels((prev) => prev.filter((h) => h._id !== selectedHotel._id));
      toast.success("Establishment deleted successfully");
    } catch (error) {
      toast.error("Error deleting establishment");
      console.error("Error deleting establishment:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedHotel(null);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

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
                    onClick={() => handleDeleteHotel(h)}
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
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Delete Establishment
            </h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this establishment?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>Name:</strong> {selectedHotel?.name}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHotel}
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

export default AdminHotels;
