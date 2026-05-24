import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

let _io = null;
export const getIO = () => _io;

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // ---------- Auth middleware ----------
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user; // attach user to socket
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  _io = io;

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // Each user joins their own personal room
    socket.join(userId);

    // ---------- Send message ----------
    socket.on("message:send", async ({ receiverId, content, tempId, type }) => {
      const msgType = type === "image" ? "image" : "text";
      if (!receiverId) return;
      if (msgType === "text" && !content?.trim()) return;
      if (msgType === "image" && !content) return;

      try {
        // Save to DB
        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content: msgType === "text" ? content.trim() : content,
          type: msgType,
          status: "sent",
        });

        const msgObj = message.toObject();

        // Confirm to sender (reconcile optimistic UI via tempId)
        socket.emit("message:sent", { ...msgObj, tempId });

        // Deliver to receiver
        io.to(receiverId).emit("message:new", msgObj);

        // Mark delivered after emitting
        await Message.findByIdAndUpdate(message._id, { status: "delivered" });
        const deliveredPayload = { messageId: message._id, status: "delivered" };
        io.to(userId).emit("message:status", deliveredPayload);
        io.to(receiverId).emit("message:status", deliveredPayload);

      } catch (err) {
        socket.emit("message:error", { tempId, error: "Failed to send message" });
      }
    });

    // ---------- Seen ----------
    socket.on("message:seen", async ({ messageIds }) => {
      if (!Array.isArray(messageIds) || !messageIds.length) return;

      try {
        // Only update messages where this socket's user is the receiver
        const messages = await Message.find({
          _id: { $in: messageIds },
          receiver: userId,
          status: { $ne: "seen" },
        });

        const ids = messages.map((m) => m._id);
        if (!ids.length) return;

        await Message.updateMany({ _id: { $in: ids } }, { status: "seen" });

        // Notify both parties for each message
        const senderIds = [...new Set(messages.map((m) => m.sender.toString()))];
        for (const id of ids) {
          const payload = { messageId: id, status: "seen" };
          io.to(userId).emit("message:status", payload);
          senderIds.forEach((sid) => io.to(sid).emit("message:status", payload));
        }
      } catch (err) {
        // silent - non-critical
      }
    });

    // ---------- Typing ----------
    socket.on("typing", ({ toUserId }) => {
      io.to(toUserId).emit("typing", { fromUserId: userId });
    });

    socket.on("stopTyping", ({ toUserId }) => {
      io.to(toUserId).emit("stopTyping", { fromUserId: userId });
    });

    // ---------- Edit ----------
    socket.on("message:edit", async ({ messageId, newContent }) => {
      if (!newContent?.trim()) return;

      try {
        const message = await Message.findOne({ _id: messageId, sender: userId, deleted: false });
        if (!message) return socket.emit("message:error", { error: "Cannot edit this message" });

        message.content = newContent.trim();
        message.edited = true;
        await message.save();

        const updated = message.toObject();
        io.to(userId).emit("message:updated", updated);
        io.to(message.receiver.toString()).emit("message:updated", updated);
      } catch {
        socket.emit("message:error", { error: "Edit failed" });
      }
    });

    // ---------- Delete ----------
    socket.on("message:delete", async ({ messageId }) => {
      try {
        const message = await Message.findOne({ _id: messageId, sender: userId });
        if (!message) return socket.emit("message:error", { error: "Cannot delete this message" });

        message.deleted = true;
        message.content = "This message was deleted";
        await message.save();

        const updated = message.toObject();
        io.to(userId).emit("message:updated", updated);
        io.to(message.receiver.toString()).emit("message:updated", updated);
      } catch {
        socket.emit("message:error", { error: "Delete failed" });
      }
    });

    socket.on("disconnect", () => {
      socket.leave(userId);
    });
  });

  return io;
};