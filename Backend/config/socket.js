import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { handleSocketConnection } from "../controllers/socket.controller.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  // JWT authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Prefer userId but allow id fallback for compatibility with older tokens
      socket.userId = decoded.userId || decoded.id;
      socket.userRole = decoded.role;
      if (!socket.userId) {
        return next(new Error("Invalid token: missing userId"));
      }
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    handleSocketConnection(socket, io);
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io has not been initialized!");
  return io;
};