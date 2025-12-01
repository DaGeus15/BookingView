import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../config/nodemailer.js";
import stripe from "stripe";

// Function to Check Availability of Room
const checkAvailability = async ({ startDate, endDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: endDate },
      checkOutDate: { $gte: startDate },
    });

    return bookings.length === 0;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

// API to check availability of room
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, dateRange } = req.body;
    const { startDate, endDate } = dateRange[0];

    if (!startDate || !endDate) {
      return res.json({ success: false, message: "Fechas inválidas" });
    }

    const isAvailable = await checkAvailability({ startDate, endDate, room });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to create a new booking
export const createBooking = async (req, res) => {
  try {
    const { room, dateRange, guests } = req.body;
    const user = req.user._id;

    const { startDate, endDate } = dateRange[0];
    if (!startDate || !endDate) {
      return res.json({ success: false, message: "Selecciona fechas válidas" });
    }

    // Before Booking: Check Availability
    const isAvailable = await checkAvailability({ startDate, endDate, room });
    if (!isAvailable) {
      return res.json({ success: false, message: "Room not available" });
    }

    // Get room data
    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    // Calculate totalPrice
    const checkIn = new Date(startDate);
    const checkOut = new Date(endDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = roomData.pricePerNight * nights * guests;

    // Create booking
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: "Property Booking Details",
      // text: "Hello world?", // plain‑text body
      html: `
  <div style="font-family: 'Arial', sans-serif; background:#f5f7fa; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      
      <div style="background:#4f46e5; padding:20px; color:white; text-align:center;">
        <h1 style="margin:0; font-size:24px;">Booking Confirmed ✔</h1>
      </div>

      <div style="padding:25px; color:#333;">
        <p style="font-size:16px;">Hi <strong>${req.user.username}</strong>,</p>
        <p>Thank you for choosing <strong>${roomData.hotel.name}</strong>!  
        We’re excited to host you. Below are your booking details:</p>

        <div style="margin-top:20px; padding:15px; background:#f0f1f5; border-radius:8px;">
          <p><strong>📌 Booking Identifier:</strong> ${booking._id}</p>
          <p><strong>🏨 Property:</strong> ${roomData.hotel.name}</p>
          <p><strong>📍 Location:</strong> ${roomData.hotel.address}</p>
          <p><strong>🗓 Dates:</strong> ${booking.checkInDate.toDateString()} → ${booking.checkOutDate.toDateString()}</p>
          <p><strong>👥 Guests:</strong> ${booking.guests}</p>
          <p><strong>💵 Total Price:</strong> ${process.env.CURRENCY || "$"} ${
        booking.totalPrice
      }</p>
        </div>

        <p style="margin-top:20px;">If you need anything, feel free to contact us anytime.</p>
        <p style="margin-top:15px; font-size:14px; color:#555;">We look forward to your stay!</p>
      </div>

      <div style="background:#eeeeee; padding:15px; text-align:center; font-size:12px; color:#777;">
        Thank you for booking with us 💛
      </div>
    </div>
  </div>
`,
    };
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error(" Error in createBooking:", error);
    res.json({ success: false, message: "Failed to create booking" });
  }
};
// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    // Total Bookings
    const totalBookings = bookings.length;

    // Total Revenue
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings },
    });
  } catch (error) {
    res.json({ success: false, message: "Failed to get bookings" });
  }
};

export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const roomData = await Room.findById(booking.room).populate("hotel");
    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const totalPrice = booking.totalPrice;
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking price",
      });
    }
    const origin = req.headers.origin;

    const baseUrl_web = process.env.FRONTEND_WEB || "http://localhost:5173";
    const baseUrl_native =
      process.env.FRONTEND_URL_NATIVE ||
      "https://harmonious-stardust-f4e1ff.netlify.app/retorno.html";

    let successUrl, cancelUrl;

    if (origin && origin.includes("localhost:5173")) {
      successUrl = `${baseUrl_web}/loader/my-bookings`;
      cancelUrl = `${baseUrl_web}/my-bookings`;
    } else {
      successUrl = baseUrl_native;
      cancelUrl = baseUrl_native;
    }

    console.log("✅ SUCCESS URL:", successUrl);

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: roomData.hotel.name,
            description: `${roomData.roomType} - Booking ID: ${bookingId}`,
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: bookingId.toString(),
      },
    });

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment Failed",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking",
      });
    }

    await Booking.findByIdAndDelete(bookingId);

    try {
      const roomData = await Room.findById(booking.room).populate("hotel");

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: req.user.email,
        subject: "Booking Cancelled",
        html: `
  <div style="font-family: 'Arial', sans-serif; background:#faf4f4; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      
      <div style="background:#dc2626; padding:20px; color:white; text-align:center;">
        <h1 style="margin:0; font-size:24px;">Booking Cancelled</h1>
      </div>

      <div style="padding:25px; color:#333;">
        <p style="font-size:16px;">Hi <strong>${req.user.username}</strong>,</p>
        <p>Your reservation has been cancelled. Here are the details:</p>

        <div style="margin-top:20px; padding:15px; background:#fdeaea; border-radius:8px;">
          <p><strong>❌ Booking Identifier:</strong> ${booking._id}</p>
          <p><strong>🏨 Property:</strong> ${roomData.hotel.name}</p>
          <p><strong>📍 Location:</strong> ${roomData.hotel.address}</p>
          <p><strong>🗓 Original Date:</strong> ${booking.checkInDate.toDateString()}</p>
          <p><strong>💵 Total Price:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice}</p>
        </div>

        <p style="margin-top:20px;">We hope to see you again soon.</p>
      </div>

      <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
        Need help? Contact us anytime.
      </div>
    </div>
  </div>
`,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.log("⚠ Error sending cancellation email:", emailError.message);
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error in cancelBooking:", error.message);
    res.json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};
