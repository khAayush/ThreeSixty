import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import promptSync from "prompt-sync";

dotenv.config();

import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";

const prompt = promptSync({ sigint: true });

const seedManager = async () => {
  const name = prompt("Manager name: ");
  const email = prompt("Manager email: ");
  const password = prompt("Manager password: ", { echo: "*" });

  try {
    await connectDB();

    // Only one manager is allowed in the entire system
    const existingManager = await User.findOne({ role: "manager" });
    if (existingManager) {
      console.log(`Manager already exists: ${existingManager.email}`);
      return;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("A user with that email already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const managerUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "manager",
    });

    await managerUser.save();
    console.log("Manager user created successfully.");
  } catch (error) {
    console.error("Error creating manager user:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedManager();
