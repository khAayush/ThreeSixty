import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import lostAndFoundRouter from "./routes/lostandfound.route.js";
import messageRoutes from "./routes/message.route.js";
import inventoryRouter from "./routes/inventory.route.js";
import assignmentRouter from "./routes/assignment.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import notificationRouter from "./routes/notification.route.js";
import { createServer } from "http";
import { initSocket } from "./utils/socket.js";

dotenv.config();

const app = express();

const httpServer = createServer(app);
initSocket(httpServer);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/tickets", ticketRoutes);
app.use("/api/chat", messageRoutes);
app.use("/api/lostandfound", lostAndFoundRouter);
app.use("/api/inventory",   inventoryRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/dashboard",   dashboardRouter);
app.use("/api/notifications", notificationRouter);

// server.listen(process.env.PORT, async () => {
//   connectDB();
//   console.log(`Server started at http://localhost:${process.env.PORT}`);
// });

httpServer.listen(process.env.PORT, async () => {
  connectDB();
  console.log(`Server started at http://localhost:${process.env.PORT}`);
});
