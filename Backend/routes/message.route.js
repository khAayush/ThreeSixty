import express from "express";
import { getConversations, getMessages, searchUsers } from "../controllers/message.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/conversations", getConversations);
router.get("/messages/:userId", getMessages);
router.get("/users/search", searchUsers);

export default router;