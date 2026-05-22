import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireManager } from "../middlewares/admin.middleware.js";

const settingsRouter = express.Router();

// Public: login page reads allowed domains and org name before auth
settingsRouter.get("/", getSettings);

// Manager-only: update settings
settingsRouter.patch("/", verifyToken, requireManager, updateSettings);

export default settingsRouter;
