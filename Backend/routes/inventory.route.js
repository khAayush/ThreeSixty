import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin, requireManager } from "../middlewares/admin.middleware.js";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  browseInventory,
  getUnitsByCategory, createUnit, addStock,
  getAssetsByUnit, getAssetDetails, updateAssetStatus, updateAssetLocation,
  deleteAsset, markAssetLost, getAllAssetLogs,
} from "../controllers/inventory.controller.js";

const router = express.Router();

// Employee browse
router.get("/browse", verifyToken, browseInventory);

// Categories - read: all roles; write: admin only
router.get("/categories", verifyToken, getCategories);
router.post("/categories", verifyToken, requireAdmin, createCategory);
router.put("/categories/:id", verifyToken, requireAdmin, updateCategory);
router.delete("/categories/:id", verifyToken, requireAdmin, deleteCategory);

// Units
router.get("/categories/:categoryId/units", verifyToken, getUnitsByCategory);
router.post("/units", verifyToken, requireAdmin, createUnit);
router.post("/units/:unitId/stock", verifyToken, requireAdmin, addStock);

// Asset logs - manager only
router.get("/logs", verifyToken, requireManager, getAllAssetLogs);

// Assets
router.get("/units/:unitId/assets", verifyToken, getAssetsByUnit);
router.get("/assets/:id", verifyToken, getAssetDetails);
router.patch("/assets/:id/status", verifyToken, requireAdmin, updateAssetStatus);
router.patch("/assets/:id/location", verifyToken, requireAdmin, updateAssetLocation);
router.patch("/assets/:id/lost", verifyToken, requireAdmin, markAssetLost);
router.delete("/assets/:id", verifyToken, requireAdmin, deleteAsset);

export default router;
