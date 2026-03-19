import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  createRequest,
  getMyAssignments,
  getAssignments,
  getAvailableAssets,
  approveRequest,
  rejectRequest,
  processReturn,
  requestReturn,
} from "../controllers/assignment.controller.js";

const router = express.Router();

// Employee routes
router.post("/request", verifyToken, createRequest);
router.get("/my", verifyToken, getMyAssignments);

// Admin routes
router.get("/", verifyToken, requireAdmin, getAssignments);
router.get("/available/:unitId", verifyToken, requireAdmin, getAvailableAssets);
router.patch("/:id/approve", verifyToken, requireAdmin, approveRequest);
router.patch("/:id/reject", verifyToken, requireAdmin, rejectRequest);
router.patch("/:id/return", verifyToken, requireAdmin, processReturn);
router.post("/:id/request-return", verifyToken, requireAdmin, requestReturn);

export default router;
