import Notification from "../models/notification.model.js";

const uid = (req) => req.user._id;

export const getNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit = 20, page = 1 } = req.query;
    const filter = { userId: uid(req) };
    if (unreadOnly === "true") filter.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: uid(req), isRead: false });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: uid(req) },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: uid(req), isRead: false },
      { isRead: true, readAt: new Date() },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
