import { Webhook } from "svix";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = req.body.toString("utf8");
    await whook.verify(payload, headers);

    const { data, type } = JSON.parse(payload);

    switch (type) {
      case "user.created": {
        const email = data.email_address || data.email_addresses?.[0]?.email_address;
        let existingUser = await User.findOne({ email });

        if (existingUser) {
          if (!existingUser.isActive) {
            console.log(` Usuario ${email} está inactivo, no se recrea.`);
            return res.status(200).json({ success: false, message: "Usuario inactivo, no creado" });
          } else {
            console.log(`Usuario ${email} ya existe y está activo.`);
            return res.status(200).json({ success: true, message: "Usuario ya existente" });
          }
        }

        await User.create({
          _id: data.id,
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Sin nombre",
          email,
          image: data.image_url,
          isActive: true,
          recentSearchedCities: [],
        });

        console.log(`Usuario ${email} creado correctamente.`);
        break;
      }

      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address || data.email_address;
        const userData = {
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url || "",
        };
        const updatedUser = await User.findOneAndUpdate({ email }, userData, { new: true });

        if (updatedUser) console.log(`Usuario actualizado: ${updatedUser._id}`);
        else console.log(`Usuario no encontrado para actualizar: ${email}`);
        break;
      }

      case "user.deleted": {
        const email = data.email_addresses?.[0]?.email_address || data.email_address;
        let user = await User.findOne({ email });

        if (!user) {
          return res.status(200).json({ success: true, message: "Usuario no existe, nada que hacer" });
        }

        if (!user.isActive) {
          return res.status(200).json({ success: true, message: "Usuario ya estaba inactivo" });
        }

        user.isActive = false;
        await user.save();
        const hotels = await Hotel.find({ owner: user._id });
        for (const hotel of hotels) {
          await Room.updateMany({ hotel: hotel._id }, { $set: { isAvailable: false } });
        }
        break;
      }

      default:
        console.log(`Evento no manejado: ${type}`);
        break;
    }

    res.json({ success: true, message: "Webhook recibido" });
  } catch (error) {
    console.error("Error en webhook:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
