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
  cancelRequest,
  cancelRequestsByUnit,
  importAssignments,
} from "../controllers/assignment.controller.js";

const router = express.Router();

router.post("/request", verifyToken, createRequest);
router.get("/my", verifyToken, getMyAssignments);
router.patch("/cancel-unit/:unitId", verifyToken, cancelRequestsByUnit);
router.patch("/:id/cancel", verifyToken, cancelRequest);

router.get("/", verifyToken, requireAdmin, getAssignments);
router.get("/available/:unitId", verifyToken, requireAdmin, getAvailableAssets);
router.post("/import", verifyToken, requireAdmin, importAssignments);
router.patch("/:id/approve", verifyToken, requireAdmin, approveRequest);
router.patch("/:id/reject", verifyToken, requireAdmin, rejectRequest);
router.patch("/:id/return", verifyToken, requireAdmin, processReturn);
router.post("/:id/request-return", verifyToken, requireAdmin, requestReturn);

export default router;
