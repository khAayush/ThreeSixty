import express from 'express';
import { register, login, logout, resetPassword, changePassword, deleteAccount, googleAuth, getPendingUsers, approveUser, rejectUser, reinitializeUser, forgotPassword, verifyOtp } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/google", googleAuth);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword)
authRouter.patch("/:id", verifyToken, changePassword);
authRouter.delete("/:id", verifyToken, deleteAccount);

// Admin approval routes
authRouter.get("/admin/pending-users", verifyToken, requireAdmin, getPendingUsers);
authRouter.patch("/admin/approve/:userId", verifyToken, requireAdmin, approveUser);
authRouter.patch("/admin/reject/:userId", verifyToken, requireAdmin, rejectUser);
authRouter.patch("/admin/reinitialize/:userId", verifyToken, requireAdmin, reinitializeUser);

export default authRouter;