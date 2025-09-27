import Booking from "../models/Booking.js"
import Room from "../models/Room.js"
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
    const totalPrice = roomData.pricePerNight * nights;

    // Create booking
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
    })

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: req.user.email,
        subject: "Hotels Booking Details",
        // text: "Hello world?", // plain‑text body
        html: `
          <h2>Your Booking Details</h2>
          <p>Dear: ${req.user.username}</p>
          <p> Thank you for your booking! Here are your details:</p>
          <ul>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
            <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
            <li><strong>Location:</strong> ${roomData.hotel.address}</li>
            <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
            <li><strong>Booking Amount:</strong> ${process.env.CURRENCY ||
              '$'} ${booking.totalPrice} /night</li>
          </ul>
          <p>We look forward to hosting you!</p>
          <p>If you need to make any changes, feel free to contact us</p>
        `
      }
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Booking created successfully", booking });
  } catch (error) {
    console.error("🔥 Error in createBooking:", error);
    res.json({ success: false, message: "Failed to create booking" });
  }
};
// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({user}).populate("room hotel").sort({createdAt: -1});
    res.json({success: true, bookings})
  } catch (error) {
    res.json({success: false, message: "Failed to fetch bookings"});
  }
}

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }

    const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });

    // Total Bookings
    const totalBookings = bookings.length;

    // Total Revenue
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

    res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
  } catch (error) {
    res.json({ success: false, message: "Failed to get bookings" });
  }
};

export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    const roomData = await Room.findById(booking.room).populate('hotel');
    const totalPrice = booking.totalPrice;
    const {origin} = req.headers;
    const stripeInstamnce = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items=[
      {
        price_data:{
          currency:"usd",
          product_data:{
            name: roomData.hotel.name,
          },
          unit_amount: totalPrice*100
        },
        quantity:1,
      }
    ]
    //Create Checkout Session
    const session = await stripeInstamnce.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url:`${origin}/loader/my-bookings`,
      cancel_url:`${origin}/my-bookings`,
      metadata:{
        bookingId,
      }
    })
    res.json({success:true, url:session.url})
  } catch (error) {
   res.json({success:false, message : "Payment Failed"})
  }
}