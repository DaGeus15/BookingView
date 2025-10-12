import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const { axios, getToken, user, currency } = useAppContext();
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/rooms/owner", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setRooms(data.rooms);
    } catch (error) {
      toast.error("Error fetching rooms");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post(
        "/api/rooms/toggle-availability",
        { roomId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        fetchRooms();
        toast.success(data.message);
      } else toast.error(data.message);
    } catch (error) {
      toast.error("Error updating availability");
    }
  };

  useEffect(() => {
    if (user) fetchRooms();
  }, [user]);

  return (
    <div className="mt-10">
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="Manage all your rooms, toggle availability, and keep information up-to-date for guests."
      />

      {/* Desktop Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 mt-4 hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Facility
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Price / Night
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Availability
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  No rooms found.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {room.roomType}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {room.amenities.join(", ")}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">
                    {currency} {room.pricePerNight}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="inline-flex items-center cursor-pointer relative">
                      <input
                        type="checkbox"
                        checked={room.isAvailable}
                        onChange={() => toggleAvailability(room._id)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-6"></div>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 sm:hidden gap-4 mt-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No rooms found.</div>
        ) : (
          rooms.map((room) => (
            <div
              key={room._id}
              className="p-4 bg-white shadow-md rounded-lg border border-gray-200"
            >
              <p className="font-semibold text-gray-800">{room.roomType}</p>
              <p className="text-gray-600 text-sm">{room.amenities.join(", ")}</p>
              <p className="text-gray-700 font-medium mt-1">
                {currency} {room.pricePerNight}
              </p>
              <div className="flex justify-end mt-2">
                <label className="inline-flex items-center cursor-pointer relative">
                  <input
                    type="checkbox"
                    checked={room.isAvailable}
                    onChange={() => toggleAvailability(room._id)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-6"></div>
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListRoom;
