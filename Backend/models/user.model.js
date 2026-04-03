import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "employee", "manager"],
      default: "employee",
    },
    profileImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "terminated"],
      default: "active",
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiresAt: {
      type: Date,
      default: null,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    isGoogleAccount: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;