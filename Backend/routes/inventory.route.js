import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  browseInventory,
  getUnitsByCategory, createUnit, addStock,
  getAssetsByUnit, getAssetDetails, updateAssetStatus, updateAssetLocation,
} from "../controllers/inventory.controller.js";

const router = express.Router();

// Employee browse
router.get("/browse", verifyToken, browseInventory);

// Categories — read: all roles; write: admin only
router.get("/categories", verifyToken, getCategories);
router.post("/categories", verifyToken, requireAdmin, createCategory);
router.put("/categories/:id", verifyToken, requireAdmin, updateCategory);
router.delete("/categories/:id", verifyToken, requireAdmin, deleteCategory);

// Units
router.get("/categories/:categoryId/units", verifyToken, getUnitsByCategory);
router.post("/units", verifyToken, requireAdmin, createUnit);
router.post("/units/:unitId/stock", verifyToken, requireAdmin, addStock);

// Assets
router.get("/units/:unitId/assets", verifyToken, getAssetsByUnit);
router.get("/assets/:id", verifyToken, getAssetDetails);
router.patch("/assets/:id/status", verifyToken, requireAdmin, updateAssetStatus);
router.patch("/assets/:id/location", verifyToken, requireAdmin, updateAssetLocation);

export default router;
