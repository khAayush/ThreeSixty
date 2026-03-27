import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { getAdminStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", verifyToken, requireAdmin, getAdminStats);

export default router;
