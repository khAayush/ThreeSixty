import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/unread-count", verifyToken, getUnreadCount);
router.patch("/mark-all-read", verifyToken, markAllRead);
router.get("/", verifyToken, getNotifications);
router.patch("/:id/read", verifyToken, markRead);

export default router;
