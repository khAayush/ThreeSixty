import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const handleSocketConnection = (socket, io) => {
  const userId = socket.userId;

  // Join user into personal room for targeting
  socket.join(String(userId));
  console.log(`User ${userId} connected and joined room ${userId}`);

  // Notify all clients of online users
  const broadcastOnlineUsers = () => {
    const onlineUserIds = Array.from(io.sockets.sockets.values())
      .map((s) => s.userId)
      .filter((id) => id);
    io.emit("users:online", onlineUserIds);
  };

  broadcastOnlineUsers();

  /**
   * Socket: message:send
   * Payload: { receiverId, content, tempId }
   * Response: message:sent (to sender), message:new (to receiver)
   */
  socket.on("message:send", async (payload) => {
    try {
      const { receiverId, content, tempId } = payload;
      const senderId = userId;

      // Validate
      if (!receiverId || !content?.trim()) {
        socket.emit("message:error", {
          tempId,
          message: "Invalid message data",
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        socket.emit("message:error", {
          tempId,
          message: "Invalid receiver ID",
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(senderId)) {
        socket.emit("message:error", {
          tempId,
          message: "Invalid sender ID",
        });
        return;
      }

      if (String(receiverId) === String(senderId)) {
        socket.emit("message:error", {
          tempId,
          message: "Cannot send message to yourself",
        });
        return;
      }

      // Check receiver exists and is active
      const receiver = await User.findById(receiverId);
      if (!receiver || receiver.status !== "active") {
        socket.emit("message:error", {
          tempId,
          message: "Receiver not found or inactive",
        });
        return;
      }

      // Create message with "sent" status
      const newMessage = await Message.create({
        sender: new mongoose.Types.ObjectId(senderId),
        receiver: new mongoose.Types.ObjectId(receiverId),
        content: content.trim(),
        status: "sent",
      });

      const messageData = {
        _id: newMessage._id,
        sender: newMessage.sender,
        receiver: newMessage.receiver,
        content: newMessage.content,
        status: newMessage.status,
        edited: newMessage.edited,
        deleted: newMessage.deleted,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
        tempId, // For client reconciliation
      };

      // Send to sender (confirmation with tempId)
      socket.emit("message:sent", messageData);

      // Send to receiver
      io.to(String(receiverId)).emit("message:new", messageData);

      // Update to "delivered" after emission
      await Message.findByIdAndUpdate(
        newMessage._id,
        { status: "delivered" },
        { new: true }
      );

      // Notify both users of delivery
      io.to(String(senderId)).emit("message:status", {
        messageId: newMessage._id,
        status: "delivered",
      });
      io.to(String(receiverId)).emit("message:status", {
        messageId: newMessage._id,
        status: "delivered",
      });
    } catch (error) {
      console.error("Error in message:send:", error);
      socket.emit("message:error", {
        message: "Failed to send message",
      });
    }
  });

  /**
   * Socket: message:seen
   * Payload: { messageIds }
   * Updates all messages to "seen" status
   */
  socket.on("message:seen", async (payload) => {
    try {
      const { messageIds } = payload;
      const currentUserId = userId;

      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      // Find messages where current user is receiver and status is not already seen
      const messages = await Message.find({
        _id: { $in: messageIds },
        receiver: currentUserId,
        status: { $ne: "seen" },
      });

      if (messages.length === 0) return;

      const senderIds = new Set(messages.map((m) => String(m.sender)));

      // Update all to "seen"
      await Message.updateMany(
        { _id: { $in: messageIds }, receiver: currentUserId },
        { status: "seen" }
      );

      // Notify both sender and receiver
      messages.forEach((message) => {
        io.to(String(message.sender)).emit("message:status", {
          messageId: message._id,
          status: "seen",
        });
        io.to(String(currentUserId)).emit("message:status", {
          messageId: message._id,
          status: "seen",
        });
      });
    } catch (error) {
      console.error("Error in message:seen:", error);
    }
  });

  /**
   * Socket: typing
   * Payload: { toUserId }
   */
  socket.on("typing", (payload) => {
    const { toUserId } = payload;
    io.to(String(toUserId)).emit("typing", { fromUserId: userId });
  });

  /**
   * Socket: stopTyping
   * Payload: { toUserId }
   */
  socket.on("stopTyping", (payload) => {
    const { toUserId } = payload;
    io.to(String(toUserId)).emit("stopTyping", { fromUserId: userId });
  });

  /**
   * Socket: message:edit
   * Payload: { messageId, newContent }
   */
  socket.on("message:edit", async (payload) => {
    try {
      const { messageId, newContent } = payload;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit("message:error", { message: "Message not found" });
        return;
      }

      // Verify sender
      if (String(message.sender) !== String(userId)) {
        socket.emit("message:error", {
          message: "Not authorized to edit this message",
        });
        return;
      }

      // Cannot edit deleted messages
      if (message.deleted) {
        socket.emit("message:error", {
          message: "Cannot edit a deleted message",
        });
        return;
      }

      // Update message
      message.content = newContent.trim();
      message.edited = true;
      await message.save();

      const updatedMsg = {
        _id: message._id,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        status: message.status,
        edited: message.edited,
        deleted: message.deleted,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };

      // Emit to both sender and receiver
      io.to(String(userId)).emit("message:updated", updatedMsg);
      io.to(String(message.receiver)).emit("message:updated", updatedMsg);
    } catch (error) {
      console.error("Error in message:edit:", error);
      socket.emit("message:error", { message: "Failed to edit message" });
    }
  });

  /**
   * Socket: message:delete
   * Payload: { messageId }
   * Soft delete (mark deleted = true, content = placeholder)
   */
  socket.on("message:delete", async (payload) => {
    try {
      const { messageId } = payload;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit("message:error", { message: "Message not found" });
        return;
      }

      // Verify sender
      if (String(message.sender) !== String(userId)) {
        socket.emit("message:error", {
          message: "Not authorized to delete this message",
        });
        return;
      }

      // Soft delete
      message.deleted = true;
      message.content = "This message was deleted";
      await message.save();

      const deletedMsg = {
        _id: message._id,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        status: message.status,
        edited: message.edited,
        deleted: message.deleted,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };

      // Emit to both
      io.to(String(userId)).emit("message:updated", deletedMsg);
      io.to(String(message.receiver)).emit("message:updated", deletedMsg);
    } catch (error) {
      console.error("Error in message:delete:", error);
      socket.emit("message:error", { message: "Failed to delete message" });
    }
  });

  socket.on("disconnect", () => {
    socket.leave(String(userId));
    console.log(`User ${userId} disconnected`);

    // Broadcast updated online users
    const onlineUserIds = Array.from(io.sockets.sockets.values())
      .map((s) => s.userId)
      .filter((id) => id);
    io.emit("users:online", onlineUserIds);
  });
};