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

    // Only the user themselves or an admin/manager can update the photo
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
