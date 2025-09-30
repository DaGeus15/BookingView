import User from "../models/User.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const protect = async (req, res, next) => {
  try {
    console.log("=== Clerk auth data ===");
    console.log(req.auth());

    const { userId } = req.auth();
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    let user = await User.findById(userId);

    if (!user) {
      console.log(`❌ Usuario con id ${userId} no encontrado en DB. Creando...`);

      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        _id: userId,
        username: clerkUser.username || "User",
        email: clerkUser.emailAddresses[0]?.emailAddress || `user-${userId}@example.com`,
        image: clerkUser.profileImageUrl || "",
        role: "user",
        recentSearchedCities: [],
      });

      console.log(`✅ Usuario creado en DB: ${user.email}`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("🔥 Error en middleware protect:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
