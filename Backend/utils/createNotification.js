import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getIO } from "./socket.js";

export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({ userId, type, title, message, data });
    const io = getIO();
    if (io) {
      io.to(userId.toString()).emit("notification:new", notification.toObject());
    }
    return notification;
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
};

export const notifyRole = async (roles, type, title, message, data = {}, excludeId = null) => {
  try {
    const query = { role: { $in: roles }, status: { $ne: "terminated" } };
    if (excludeId) query._id = { $ne: excludeId };
    const users = await User.find(query).select("_id");
    await Promise.all(users.map((u) => createNotification(u._id, type, title, message, data)));
  } catch (err) {
    console.error("notifyRole error:", err.message);
  }
};
