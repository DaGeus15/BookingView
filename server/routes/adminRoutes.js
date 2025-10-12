import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminProtect } from "../middlewares/adminMiddleware.js";
import * as adminController from "../controllers/adminController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();
router.use(protect, adminProtect);

// Usuarios
router.get("/users", adminController.getAllUsers);
router.post("/users/toggle", adminController.toggleUserActive);
router.post("/users/role", adminController.updateUserRole);
router.delete("/users/:userId", adminController.deleteUser);

// Hoteles
router.get("/hotels", adminController.getAllHotels);
router.put("/hotels/:hotelId", adminController.updateHotel);
router.delete("/hotels/:hotelId", adminController.deleteHotel);

// Habitaciones
router.get("/rooms", adminController.getAllRooms);
router.put(
  "/rooms/:roomId",
  upload.array("images", 4),
  adminController.updateRoom
);
router.post("/rooms/toggle", adminController.toggleRoomAvailabilityAdmin);
router.delete("/rooms/:roomId", adminController.deleteRoom);

// Reservas
router.get("/bookings", adminController.getAllBookings);
router.put("/bookings/:bookingId", adminController.updateBooking);
router.delete("/bookings/:bookingId", adminController.deleteBooking);

export default router;
