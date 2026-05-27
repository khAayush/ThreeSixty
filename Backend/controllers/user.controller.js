import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const updateProfileImage = async (req, res) => {
  const { profileImage } = req.body;

  try {
    if (!profileImage) {
      return res.status(400).json({ message: "No image provided" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google users: photo is owned by Google
    if (targetUser.isGoogleAccount) {
      return res.status(403).json({
        message: "Profile picture cannot be changed for Google accounts",
      });
    }

    const callerId = String(req.user._id);
    const targetId = String(req.params.id);
    if (callerId !== targetId && !["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile image:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // manager is a system-level account - never expose it in user lists
    const users = await User.find({ role: { $ne: "manager" } }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // only the account owner can change their own password
    if (String(req.user._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isGoogleAccount) {
      return res.status(403).json({ message: "Password cannot be changed for Google accounts" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const pwValid =
      newPassword.length >= 6 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[@$!%*?&]/.test(newPassword);

    if (!pwValid) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and include uppercase, lowercase, a digit, and a special character (@$!%*?&)",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the current one" });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.params.id, { password: hashed });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // manager account is immutable via generic user-update endpoints
    if (targetUser.role === "manager") {
      return res.status(403).json({ message: "Not authorized to modify this account" });
    }

    // prevent promoting anyone to manager via API
    const targetRole = role ? role.toLowerCase() : undefined;
    if (targetRole === "manager") {
      return res.status(400).json({ message: "Cannot assign the manager role" });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;

    // Google accounts: email is owned by Google - reject changes
    if (email !== undefined) {
      if (targetUser.isGoogleAccount) {
        return res.status(403).json({
          message: "Email cannot be changed for Google accounts",
        });
      }
      updateFields.email = email;
    }

    if (targetRole) updateFields.role = targetRole;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
