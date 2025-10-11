  import User from "../models/User.js";
  import Hotel from "../models/Hotel.js";
  import Room from "../models/Room.js";
  import { clerkClient } from "@clerk/clerk-sdk-node";

  export const syncUsers = async () => {
    console.log("🔄 Sincronizando usuarios con Clerk...");
    try {
      const clerkUsers = await clerkClient.users.getUserList();
      const clerkIds = clerkUsers.map(u => u.id);

      for (const clerkUser of clerkUsers) {
        await updateActiveUser(clerkUser);
      }

      const inactiveUsers = await User.find({ _id: { $nin: clerkIds }, isActive: true });
      for (const user of inactiveUsers) {
        user.isActive = false;
        await user.save();
        await deactivateUserRooms(user._id);
      }

      console.log(`Usuarios inactivados: ${inactiveUsers.length}`);
      return inactiveUsers.length;
    } catch (error) {
      console.error("Error al sincronizar con Clerk:", error.message || error);
      return 0;
    }
  };

  export const forceSyncUsers = async (req, res) => {
    try {
      const inactiveCount = await syncUsers();
      res.json({ success: true, message: "Sincronización completada", inactive: inactiveCount });
    } catch (error) {
      console.error("Error en sincronización:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  export const reactivateUser = async (req, res) => {
    try {
      const user = req.user;
      if (user.isActive) return res.json({ success: true, message: "Tu cuenta ya está activa" });

      user.isActive = true;
      await user.save();
      await activateUserRooms(user._id);

      res.json({ success: true, message: "Cuenta reactivada correctamente" });
    } catch (error) {
      console.error("Error reactivando usuario:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  export const getUserData = async (req, res) => {
    try {
      const { role, recentSearchedCities } = req.user;
      res.json({ success: true, role, recentSearchedCities });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };

  export const storeRecentSearchedCities = async (req, res) => {
    try {
      const { recentSearchedCity } = req.body;
      const user = req.user;

      if (user.recentSearchedCities.length < 3) {
        user.recentSearchedCities.push(recentSearchedCity);
      } else {
        user.recentSearchedCities.shift();
        user.recentSearchedCities.push(recentSearchedCity);
      }

      await user.save();
      res.json({ success: true, message: "City added" });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };

  export const deactivateUserRooms = async (userId) => {
    const hotels = await Hotel.find({ owner: userId });
    for (const hotel of hotels) {
      await Room.updateMany({ hotel: hotel._id }, { $set: { isAvailable: false } });
    }
  };

  export const activateUserRooms = async (userId) => {
    const hotels = await Hotel.find({ owner: userId });
    for (const hotel of hotels) {
      await Room.updateMany({ hotel: hotel._id }, { $set: { isAvailable: true } });
    }
  };

  const updateActiveUser = async (clerkUser) => {
    const user = await User.findOne({ email: clerkUser.emailAddresses[0]?.emailAddress });
    if (!user) return null;
      user.username = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || user.username;
      user.image = clerkUser.imageUrl || user.image;
      await user.save();  
    return user;
  };
