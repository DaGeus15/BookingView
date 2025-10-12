import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import { deactivateUserRooms, activateUserRooms } from "./userController.js";
import { v2 as cloudinary } from "cloudinary";

// ---------------------- Usuarios ----------------------

// Listar todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cambiar rol
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!["user", "hotelOwner", "admin"].includes(role))
      return res.status(400).json({ success: false, message: "Rol inválido" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    user.role = role;
    await user.save();
    res.json({ success: true, message: "Rol actualizado", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Activar / desactivar usuario
export const toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    user.isActive = !user.isActive;
    await user.save();

    if (user.role === "hotelOwner") {
      if (user.isActive) await activateUserRooms(user._id);
      else await deactivateUserRooms(user._id);
    }

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? "activado" : "desactivado"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    // Opcional: eliminar hoteles y habitaciones asociados
    const hotels = await Hotel.find({ owner: userId });
    for (const hotel of hotels) {
      await Room.deleteMany({ hotel: hotel._id });
      await Hotel.findByIdAndDelete(hotel._id);
    }

    await Booking.deleteMany({ user: userId }); // eliminar reservas del usuario
    await user.deleteOne();

    res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Hoteles ----------------------

// Listar todos los hoteles
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate("owner", "username email role");
    res.json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Editar hotel
export const updateHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const updates = req.body;
    const hotel = await Hotel.findByIdAndUpdate(hotelId, updates, {
      new: true,
    });
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel no encontrado" });
    res.json({ success: true, message: "Hotel actualizado", hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar hotel
export const deleteHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel no encontrado" });

    // Eliminar habitaciones asociadas
    await Room.deleteMany({ hotel: hotelId });

    // Cambiar rol del dueño a 'user'
    const owner = await User.findById(hotel.owner);
    if (owner && owner.role === "hotelOwner") {
      owner.role = "user";
      await owner.save();
    }

    // Eliminar el hotel
    await hotel.deleteOne();

    res.json({
      success: true,
      message:
        "Hotel eliminado correctamente y rol del dueño actualizado a 'user'",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Habitaciones ----------------------

// Listar todas las habitaciones
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("hotel", "name address owner")
      .sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Editar habitación
export const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;

    if (req.files) {
      const uploadedImages = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path).then((r) => r.secure_url)
        )
      );
      updates.images = uploadedImages;
    }

    const room = await Room.findByIdAndUpdate(roomId, updates, { new: true });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room no encontrada" });

    res.json({ success: true, message: "Room actualizada", room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar habitación
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room no encontrada" });

    await room.deleteOne();
    res.json({ success: true, message: "Room eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Activar/desactivar habitación
export const toggleRoomAvailabilityAdmin = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room no encontrada" });

    room.isAvailable = !room.isAvailable;
    await room.save();
    res.json({ success: true, message: "Room availability updated", room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Reservas ----------------------

// Listar todas las reservas
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email role")
      .populate("hotel", "name address owner")
      .populate("room", "roomType pricePerNight")
      .sort({ createdAt: -1 });

    const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
    const totalBookings = bookings.length;

    res.json({
      success: true,
      bookings,
      stats: { totalBookings, totalRevenue },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Editar reserva
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, updates, {
      new: true,
    });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking no encontrada" });

    res.json({ success: true, message: "Booking actualizada", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar reserva
export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking no encontrada" });

    await booking.deleteOne();
    res.json({ success: true, message: "Booking eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
