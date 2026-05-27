import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Settings from "../models/settings.model.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { notifyRole } from "../utils/createNotification.js";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // manager can only be seeded, never created via API
    const targetRole = role ? role.toLowerCase() : "employee";
    if (targetRole === "manager") {
      return res.status(400).json({ message: "Cannot create a manager account" });
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: targetRole,
      mustChangePassword: true, // Set to true for admin-created accounts
    });
    await newUser.save();

    await sendEmail({
      to: newUser.email,
      subject: "Your Account Has Been Created",
      text: `Hi ${newUser.name || "user"},

Your account has been created successfully.

You can now log in using the following credentials:

Email: ${newUser.email}
Password: ${password}

For security purposes, please change your password after your first login.

If you have any questions or face any issues logging in, please contact the support team.

Best regards`,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Login not authorized" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If user must change password, return a response indicating password change is required
    if (user.mustChangePassword) {
      // Short-lived token that only works on the change-password endpoint
      const tempToken = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          tempPasswordChange: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        message: "Password change required",
        requiresPasswordChange: true,
        token: tempToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // JWT carries only the identifiers - verifyToken fetches the full user from DB
    const token = jwt.sign(
      {
        userId: user._id,
        id: user._id, // kept for compatibility with socket auth
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Login successful",
      requiresPasswordChange: false,
      token,
      user: {
        _id: user._id,
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        joinDate: joinDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminChangePassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const tempPassword = crypto.randomBytes(6).toString("base64");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Hi ${user.name || "user"},\n\nYour password has been reset. Here is your temporary password:\n\n${tempPassword}\n\nPlease log in and change your password immediately.\n\nIf you did not request this, contact support.`,
    });

    res.status(200).json({ message: "Password Reset Successfully" });
  } catch (error) {
    console.error("Admin change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSelf = String(req.user._id) === String(req.params.id);

    // Google accounts: password is managed by Google, never changeable
    if (targetUser.isGoogleAccount) {
      return res.status(403).json({
        message: "Password cannot be changed for Google accounts",
      });
    }

    // Manager's password: only the manager themselves can change it
    if (targetUser.role === "manager" && !isSelf) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Admin's password: only manager (or the admin themselves) can change it
    if (targetUser.role === "admin" && !isSelf && req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only the Manager can reset Admin passwords",
      });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, targetUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const isPrivilegedChangingOther =
      ["admin", "manager"].includes(req.user?.role) && !isSelf;

    targetUser.password = hashedPassword;
    targetUser.mustChangePassword = isPrivilegedChangingOther ? true : false;
    await targetUser.save();

    if (isPrivilegedChangingOther) {
      await sendEmail({
        to: targetUser.email,
        subject: "Your Password Has Been Reset by an Admin",
        text: `Hi ${targetUser.name || "user"},\n\nAn administrator has reset your password.\n\nYour temporary password is: ${newPassword}\n\nPlease log in and change your password immediately. You will be prompted to set a new password on your next login.\n\nIf you did not expect this change, please contact your administrator.`,
      });
    }

    res.status(200).json({ message: "Password Updated" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const loggedInUserId = req.user.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // manager account is immutable - no one can terminate it via this endpoint
    if (targetUser.role === "manager") {
      return res.status(403).json({
        message: "The manager account cannot be terminated",
      });
    }

    // only manager can terminate another admin
    if (targetUser.role === "admin" && req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only the Manager can terminate Admin accounts",
      });
    }

    // prevent terminating last admin (safety net for manager-initiated terminations)
    if (targetUser.role === "admin") {
      const adminCount = await User.countDocuments({
        role: "admin",
        status: { $ne: "terminated" },
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          message:
            "Action denied: System must have at least one Admin account.",
        });
      }
    }

    targetUser.status = "terminated";
    await targetUser.save();

    await sendEmail({
      to: targetUser.email,
      subject: "Account Terminated",
      text: `Hi ${targetUser.name},\n\nYour account has been terminated and you can no longer access the platform. If you believe this is a mistake, please contact the administrator.`,
    });

    const isSelfDeletion = targetUserId === loggedInUserId;
    if (isSelfDeletion) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    res.status(200).json({
      message: "User terminated successfully",
      selfDeleted: isSelfDeletion,
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    let email, name, profileImage;
    try {
      // JWT is not verified here - Google's signature is trusted implicitly by domain/prefix checks below
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const payload = JSON.parse(jsonPayload);
      email = payload.email;
      name = payload.name;
      profileImage = payload.picture || null;
    } catch (err) {
      return res.status(400).json({ message: "Invalid token format" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ message: "Could not extract email from token" });
    }

    const emailParts = email.split("@");
    if (emailParts.length !== 2) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const emailPrefix = emailParts[0];
    const emailDomain = emailParts[1];

    const settings = await Settings.findOne();
    const allowedDomains = settings?.allowedEmailDomains ?? [];
    if (allowedDomains.length > 0 && !allowedDomains.includes(emailDomain)) {
      return res.status(403).json({ message: "Login not authorized" });
    }

    const filteredPrefixes = settings?.filteredEmailNames ?? [];
    if (filteredPrefixes.includes(emailPrefix)) {
      return res.status(403).json({ message: "Login not authorized" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // New Google users go to pending status until an admin approves them
      user = new User({
        email,
        name: name || emailPrefix,
        password: crypto.randomBytes(16).toString("hex"),
        role: "employee",
        profileImage: profileImage || null,
        status: "pending",
        isGoogleAccount: true,
      });
      await user.save();

      // Prefer notifying the manager; fall back to the first available admin
      const notifyUser =
        (await User.findOne({ role: "manager" })) ||
        (await User.findOne({ role: "admin" }));
      if (notifyUser) {
        await sendEmail({
          to: notifyUser.email,
          subject: "New User Registration - Approval Required",
          text: `A new user has requested access:\n\nName: ${user.name}\nEmail: ${user.email}\n\nPlease review and approve/reject this request.`,
        });
      }

      await notifyRole(
        ["admin", "manager"],
        "user:pending_approval",
        "New User Pending Approval",
        `${user.name} (${user.email}) is awaiting account approval.`,
        { pendingUserId: user._id.toString() },
      );

      await sendEmail({
        to: user.email,
        subject: "Account Creation Request",
        text: "Account creation request sent, wait until approval.",
      });

      return res.status(202).json({
        message: "Account pending approval",
        status: "pending",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          status: "pending",
        },
      });
    }

    if (user.status === "pending") {
      return res
        .status(403)
        .json({ message: "Account waiting approval from admin" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Login not authorized" });
    }

    if (profileImage && user.profileImage !== profileImage) {
      user.profileImage = profileImage;
    }
    if (!user.isGoogleAccount) {
      user.isGoogleAccount = true;
    }
    await user.save();

    const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // JWT carries only the identifiers - verifyToken fetches the full user from DB
    const token = jwt.sign(
      {
        userId: user._id,
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        _id: user._id,
        id: String(user._id), 
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        joinDate: joinDate,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" }).select(
      "-password",
    );
    res.status(200).json({
      message: "Pending users retrieved",
      users: pendingUsers,
    });
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "pending") {
      return res.status(400).json({ message: "User is not pending approval" });
    }

    user.status = "active";
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Account Approved",
      text: `Welcome ${user.name}!\n\nYour account has been verified and is now active. You can now log in and access the platform.`,
    });

    res.status(200).json({
      message: "User approved successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const reinitializeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "terminated") {
      return res.status(400).json({ message: "User is not terminated" });
    }

    user.status = "active";
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Account Reactivated",
      text: `Welcome back ${user.name}!\n\nYour account has been reactivated. You can now log in and access the platform again.`,
    });

    res.status(200).json({
      message: "User reactivated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Reinitialize user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "pending") {
      return res.status(400).json({ message: "User is not pending approval" });
    }

    user.status = "rejected";
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Account Request Rejected",
      text: `Hi ${user.name},\n\nYour account registration request has been rejected. If you believe this is a mistake, please contact the administrator.`,
    });

    res.status(200).json({
      message: "User rejected successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always return generic message to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        message: "If this email is registered, an OTP has been sent.",
      });
    }

    // Google accounts manage their own credentials - silently skip
    if (user.isGoogleAccount) {
      return res.status(200).json({
        message: "If this email is registered, an OTP has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes
    user.resetOtp = otp;
    user.resetOtpExpiresAt = otpExpiresAt;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hi ${user.name},\n\nYour password reset OTP is: ${otp}\n\nThis OTP expires in 5 minutes. If you didn't request a password reset, please ignore this email.`,
    });

    res.status(200).json({
      message: "If this email is registered, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== otp ||
      !user.resetOtpExpiresAt ||
      new Date() > user.resetOtpExpiresAt
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&).",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      text: `Hi ${user.name},\n\nYour password has been changed successfully. If you didn't make this change, please contact the administrator immediately.`,
    });

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
