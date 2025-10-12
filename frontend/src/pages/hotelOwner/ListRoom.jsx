import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const { axios, getToken, user, currency } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomType: "",
    pricePerNight: 0,
    amenities: {},
    images: [],
    imagesPreview: [],
  });

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
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setEditingRoom(room);
                        setFormData({
                          roomType: room.roomType,
                          pricePerNight: room.pricePerNight,
                          amenities: room.amenities.reduce(
                            (acc, a) => ({ ...acc, [a]: true }),
                            {}
                          ),
                          images: [], // archivos nuevos
                          imagesPreview: room.images || [], // URLs existentes
                        });
                      }}
                      className="px-3 py-1 bg-yellow-400 text-white rounded"
                    >
                      Edit
                    </button>
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
              <p className="text-gray-600 text-sm">
                {room.amenities.join(", ")}
              </p>
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
      {/* Modal de edición */}
      {editingRoom && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Room</h2>

            {/* Copia de AddRoom pero con formData */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const fd = new FormData();
                  fd.append("roomType", formData.roomType);
                  fd.append("pricePerNight", formData.pricePerNight);
                  const selectedAmenities = Object.keys(
                    formData.amenities
                  ).filter((a) => formData.amenities[a]);
                  fd.append("amenities", JSON.stringify(selectedAmenities));

                  // imágenes
                  for (let i = 0; i < (formData.images?.length || 0); i++) {
                    fd.append("images", formData.images[i]);
                  }

                  const { data } = await axios.put(
                    `/api/rooms/owner/${editingRoom._id}`,
                    fd,
                    { headers: { Authorization: `Bearer ${await getToken()}` } }
                  );

                  if (data.success) {
                    toast.success(data.message);
                    fetchRooms();
                    setEditingRoom(null);
                  } else toast.error(data.message);
                } catch (error) {
                  toast.error("Error updating room");
                }
              }}
            >
              {/* Images */}
              <p className="text-gray-800 mt-2 mb-2 font-semibold">
                Room Images
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <label key={index} className="cursor-pointer group">
                    <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-primary transition">
                      <img
                        className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                        src={
                          formData.images[index]
                            ? URL.createObjectURL(formData.images[index]) // nuevo archivo
                            : formData.imagesPreview[index] ||
                              "/placeholder.png" // URL existente
                        }
                        alt={`Room ${index + 1}`}
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index] = e.target.files[0];
                        setFormData({ ...formData, images: newImages });
                      }}
                    />
                  </label>
                ))}
              </div>

              {/* Room details */}
              <div className="flex flex-col sm:flex-row gap-6 mt-4">
                <div className="flex-1">
                  <label className="text-gray-800 font-semibold">
                    Room Type
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) =>
                      setFormData({ ...formData, roomType: e.target.value })
                    }
                    className="mt-1 w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">Select Room Type</option>
                    <option value="Single Bed">Single Bed</option>
                    <option value="Double Bed">Double Bed</option>
                    <option value="Luxury Room">Luxury Room</option>
                    <option value="Family Suite">Family Suite</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-gray-800 font-semibold">
                    Price per Night
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pricePerNight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerNight: e.target.value,
                      })
                    }
                    className="mt-1 w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              </div>

              {/* Amenities */}
              <p className="text-gray-800 mt-4 mb-2 font-semibold">Amenities</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(formData.amenities).map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-primary transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities[amenity]}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          amenities: {
                            ...formData.amenities,
                            [amenity]: !formData.amenities[amenity],
                          },
                        })
                      }
                      className="w-5 h-5 accent-primary"
                    />
                    {amenity}
                  </label>
                ))}
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListRoom;
