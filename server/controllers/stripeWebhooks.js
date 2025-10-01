import stripe from "stripe";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import transporter from "../config/nodemailer.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("❌ Webhook signature error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;

    // Get the Checkout Session tied to this intent
    const sessions = await stripeInstance.checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    if (!sessions.data.length) {
      console.error("❌ No session found for payment:", paymentIntentId);
      return res.json({ received: true });
    }

    const session = sessions.data[0];
    const { bookingId } = session.metadata;

    // Mark booking as paid
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { isPaid: true, paymentMethod: "Stripe" },
      { new: true }
    );

    if (booking) {
      const roomData = await Room.findById(booking.room).populate("hotel");
      const roomId = roomData?._id || "N/A";
      const hotelOwner = await User.findById(roomData.hotel.owner);

      if (hotelOwner?.email) {
        console.log("📨 Sending email to:", hotelOwner.email);

        try {
          await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: hotelOwner.email,
            subject: "New Booking Confirmed - Payment Received",
            html: `
              <h2>Your room has been booked and paid</h2>
              <p>Hello Owner,</p>
              <p>A payment has been confirmed for your hotel <strong>${roomData.hotel.name}</strong>.</p>
              <ul>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Room:</strong> ${roomId}</li>
                <li><strong>Check-in:</strong> ${booking.checkInDate.toDateString()}</li>
                <li><strong>Check-out:</strong> ${booking.checkOutDate.toDateString()}</li>
                <li><strong>Amount Paid:</strong> $${booking.totalPrice}</li>
              </ul>
            `,
          });
          console.log("✅ Email sent!");
        } catch (err) {
          console.error("❌ Error sending email:", err.message);
        }
      }
    }
  } else {
    console.log("⚠️ Unhandled event:", event.type);
  }

  res.json({ received: true });
};
