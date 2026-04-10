import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getIO } from "./socket.js";

/** Create a persisted notification and emit it in real-time to the recipient. */
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

/**
 * Notify all active users with the given roles.
 * @param {string[]} roles
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {object} data
 * @param {string|null} excludeId - skip this user ID (e.g. the actor)
 */
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
