import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Check cookies first
    let token = req.cookies.token;

    // Check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user from DB (temp tokens use `userId`, normal tokens use `id`)
    const user = await User.findById(decoded.userId || decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Attach full user object
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};