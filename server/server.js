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

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
connectCloudinary();

const allowedOrigins = ["http://localhost:5173"];

app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.post("/api/clerk", express.raw({ type: "*/*" }), clerkWebhooks);

app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("API funcionando ✅"));

app.use("/api/user", userRouter);
app.use("/api/hotel", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

syncUsers()
  .then(() => console.log("✅ Sincronización inicial completa"))
  .catch((err) => console.error("Error al sincronizar usuarios:", err));

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
