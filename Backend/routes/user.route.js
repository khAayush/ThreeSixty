import express from "express";
import { getAllUsers, getUserProfile, updateUserProfile, updateProfileImage, changePassword } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/", verifyToken, getAllUsers);
userRouter.get("/:id", verifyToken, getUserProfile);
userRouter.put("/:id", verifyToken, updateUserProfile);
userRouter.patch("/:id/profile-image", verifyToken, updateProfileImage);
userRouter.patch("/:id/password", verifyToken, changePassword);

export default userRouter;