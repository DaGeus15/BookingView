import React, { useCallback, useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../hooks/useAppContext"
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";

const ListRoom = () => {
  const { axios, getToken, user, currency } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    roomType: "",
    pricePerNight: 0,
    amenities: {
      "Free Wifi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
    imagesData: [], // ahora dinámico
  });

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/rooms/owner", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setRooms(data.rooms);
    } catch (error) {
      toast.error("Error fetching rooms");
      console.error(error)
    } finally {
      setLoading(false);
    }
  }, [axios, getToken]);

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
      console.error(error)
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);

    const safeImages = (room.images || []).filter(
      (url) => typeof url === "string" && url.trim() !== ""
    );

    const imagesData = [
      ...safeImages.map((url) => ({ file: null, url })),
      ...Array.from({ length: Math.max(0, 4 - safeImages.length) }, () => ({
        file: null,
        url: null,
      })),
    ];

    setFormData({
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      amenities: {
        "Free Wifi": room.amenities.includes("Free Wifi"),
        "Free Breakfast": room.amenities.includes("Free Breakfast"),
        "Room Service": room.amenities.includes("Room Service"),
        "Mountain View": room.amenities.includes("Mountain View"),
        "Pool Access": room.amenities.includes("Pool Access"),
      },
      imagesData,
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updated = prev.imagesData.filter((_, i) => i !== index);
      while (updated.length < 4) {
        updated.push({ file: null, url: null });
      }
      return { ...prev, imagesData: updated };
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("roomType", formData.roomType);
      fd.append("pricePerNight", formData.pricePerNight);

      const selectedAmenities = Object.keys(formData.amenities).filter(
        (a) => formData.amenities[a]
      );
      fd.append("amenities", JSON.stringify(selectedAmenities));

      // Subir solo nuevas imágenes válidas
      formData.imagesData.forEach((img) => {
        if (img.file instanceof File) {
          fd.append("images", img.file);
        }
      });

      // Mantener solo URLs limpias (no null, undefined o placeholders)
      const existingImages = formData.imagesData
        .filter(
          (img) =>
            typeof img.url === "string" &&
            img.url.trim() !== "" &&
            !img.url.startsWith("blob:") &&
            img.url !== "/placeholder.png"
        )
        .map((img) => img.url);

      fd.append("existingImages", JSON.stringify(existingImages));

      const { data } = await axios.put(
        `/api/rooms/owner/${editingRoom._id}`,
        fd,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchRooms();
        setEditingRoom(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error updating room");
      console.error(error)
    }
  };

  useEffect(() => {
    if (user) fetchRooms();
  }, [fetchRooms, user]);

  return (
    <div className="mt-10">
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="Manage all your rooms, toggle availability, and edit details easily."
      />

      {/* Tabla Desktop */}
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 mt-4 hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Amenities
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Price / Night
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Availability
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
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
                    <input
                      type="checkbox"
                      checked={room.isAvailable}
                      onChange={() => toggleAvailability(room._id)}
                      className="w-5 h-5 accent-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEdit(room)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
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

      {/* Modal de Edición */}
      {editingRoom && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white shadow-2xl rounded-xl p-6 border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Room</h2>

            <form onSubmit={handleSubmitEdit}>
              {/* Imágenes */}
              <p className="text-gray-800 mb-2 font-semibold">Room Images</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.imagesData.map((img, i) => {
                  const fileInputRef = React.createRef();

                  return (
                    <div key={i} className="relative group">
                      <div
                        className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-primary transition cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <img
                          className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                          src={img.url ? img.url : assets.uploadArea}
                          alt={`Room ${i}`}
                        />
                        {img.url !== "/placeholder.png" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // Evita abrir el input al borrar
                              handleRemoveImage(i);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            X
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          setFormData((prev) => ({
                            ...prev,
                            imagesData: prev.imagesData.map((image, idx) =>
                              idx === i
                                ? { file, url: URL.createObjectURL(file) }
                                : image
                            ),
                          }));
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Room Details */}
              <div className="flex flex-col sm:flex-row gap-6 mt-6">
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
              <p className="text-gray-800 mt-6 mb-2 font-semibold">Amenities</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(formData.amenities).map((amenity, index) => (
                  <label
                    key={index}
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

              <div className="flex justify-end mt-6 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Save Changes
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
