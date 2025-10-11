import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      console.warn("Intento de acceso sin userId desde Clerk");
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    let user = await User.findById(userId);

    if (!user) {
      let clerkUser;
      try {
        clerkUser = await clerkClient.users.getUser(userId);
      } catch (err) {
        console.error("Error al obtener usuario de Clerk:", err.message);
        return res.status(500).json({ success: false, message: "No se pudo obtener usuario de Clerk" });
      }

      if (!clerkUser) {
        console.warn("Usuario no encontrado en Clerk");
        return res.status(404).json({ success: false, message: "Usuario no encontrado en Clerk" });
      }

      try {
        user = await User.create({
          _id: clerkUser.id,
          username: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Sin nombre",
          email: clerkUser.emailAddresses[0]?.emailAddress || "sinemail@correo.com",
          image: clerkUser.imageUrl || "",
          isActive: true,
          recentSearchedCities: [],
        });
        console.log(`Usuario ${user.email} creado en la BD automáticamente.`);
      } catch (err) {
        if (err.code === 11000) {
          user = await User.findOne({ email: clerkUser.emailAddresses[0]?.emailAddress });
        } else {
          return res.status(500).json({ success: false, message: "No se pudo crear usuario en la BD" });
        }
      }
    }

    if (user.isActive) {
      const clerkUser = await clerkClient.users.getUser(userId);
      user.username = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || user.username;
      user.image = clerkUser.imageUrl || user.image;
      await user.save();
    } else {
      return res.status(403).json({ success: false, message: "Tu cuenta está inactiva" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error general en protect:", error);
    res.status(500).json({ success: false, message: "Error en autenticación" });
  }
};
