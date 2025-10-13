import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";

export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const hotel = await Hotel.findOne({ owner: req.auth.userId });

    if (!hotel) return res.json({ success: false, message: "No hotel found" });

    //upload images to cloudinary
    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });
    //wait for all uploads to complete
    const images = await Promise.all(uploadImages);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });
    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image",
        },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotelData)
      return res.json({
        success: false,
        message: "No hotel found for this owner",
      });

    const rooms = await Room.find({ hotel: hotelData._id.toString() }).select(
      "roomType pricePerNight amenities isAvailable images"
    );

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const roomData = await Room.findById(roomId);
    if (!roomData) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();

    res.json({
      success: true,
      message: "Room availability updated",
      room: roomData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Editar habitación de owner
export const updateRoomOwner = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { roomType, pricePerNight, amenities, existingImages } = req.body;

    const room = await Room.findById(roomId);
    if (!room)
      return res.status(404).json({ success: false, message: "Room not found" });

    const hotel = await Hotel.findById(room.hotel);
    if (!hotel || hotel.owner.toString() !== req.auth.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Actualizar datos básicos
    if (roomType) room.roomType = roomType;
    if (pricePerNight) room.pricePerNight = +pricePerNight;
    if (amenities) room.amenities = JSON.parse(amenities);

    // Manejar imágenes
    let images = existingImages ? JSON.parse(existingImages) : []; // imágenes existentes desde el frontend

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path).then((r) => r.secure_url)
        )
      );
      images = [...images, ...uploadedImages]; // combinar existentes + nuevas
    }

    room.images = images;

    await room.save();

    res.json({ success: true, message: "Room updated successfully", room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
