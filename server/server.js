import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import { clerkMiddleware } from "@clerk/express";

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import { syncUsers } from "./controllers/userController.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
connectCloudinary();

app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.post("/api/clerk", express.raw({ type: "*/*" }), clerkWebhooks);

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:8081",
      "http://192.168.100.22:8081",
      "exp://192.168.100.22:8081"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('exp://')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(cookieParser());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("API funcionando ✅"));

app.use("/api/user", userRouter);
app.use("/api/hotel", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use('/api/admin', adminRouter);


syncUsers()
  .then(() => console.log("✅ Sincronización inicial completa"))
  .catch((err) => console.error("Error al sincronizar usuarios:", err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Local: http://localhost:${PORT}`);
});