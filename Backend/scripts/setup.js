import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import promptSync from "prompt-sync";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Settings from "../models/settings.model.js";

const prompt = promptSync({ sigint: true });

const ask = (question, defaultVal = "") => {
  const answer = prompt(`${question}${defaultVal ? ` (${defaultVal})` : ""}: `);
  return answer?.trim() || defaultVal;
};

const askList = (question) => {
  const raw = prompt(`${question} (comma-separated, leave blank to skip): `);
  if (!raw?.trim()) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
};

const askSecret = (question) => {
  return prompt(`${question}: `, { echo: "*" })?.trim() || "";
};

const printSection = (title) => {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(50));
};

const run = async () => {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║         ThreeSixty  ·  Initial Setup             ║");
  console.log("╚══════════════════════════════════════════════════╝");

  await connectDB();

  printSection("1 / 3  —  Organisation Settings");

  let settings = await Settings.findOne();

  const orgName = ask("Organisation name", settings?.organizationName || "ThreeSixty");

  const allowedDomains = askList(
    "Allowed email domains for Google login\n  e.g.  company.com, org.edu",
  );

  const filteredNames = askList(
    "Blocked email prefixes (deny-list)\n  e.g.  noreply, admin, info",
  );

  const brandColor = ask("Brand colour (hex)", settings?.brandColor || "#FF5C00");

  if (settings) {
    settings.organizationName = orgName;
    if (allowedDomains.length) settings.allowedEmailDomains = allowedDomains;
    if (filteredNames.length) settings.filteredEmailNames = filteredNames;
    settings.brandColor = brandColor;
    await settings.save();
    console.log("\nOrganisation settings updated.");
  } else {
    await Settings.create({
      organizationName: orgName,
      allowedEmailDomains: allowedDomains,
      filteredEmailNames: filteredNames,
      brandColor,
    });
    console.log("\nOrganisation settings created.");
  }

  printSection("2 / 3  —  Manager Account(Super Admin)");

  const existingManager = await User.findOne({ role: "manager" });

  if (existingManager) {
    console.log(`\n  Manager already exists: ${existingManager.email}`);
    const overwrite = ask("  Update manager details? (y/N)", "N").toLowerCase();
    if (overwrite !== "y") {
      console.log("  Skipping manager setup.");
    } else {
      const name = ask("  Manager name", existingManager.name);
      const email = ask("  Manager email", existingManager.email);
      const password = askSecret("  New password (leave blank to keep current)");

      existingManager.name = name;
      existingManager.email = email;
      if (password) {
        existingManager.password = await bcrypt.hash(password, 12);
      }
      existingManager.status = "active";
      await existingManager.save();
      console.log("\nManager account updated.");
    }
  } else {
    console.log("\n  No manager found — creating one now.\n");

    const name = ask("  Manager name");
    const email = ask("  Manager email");

    if (!name || !email) {
      console.error("\nName and email are required. Aborting.");
      process.exit(1);
    }

    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      console.error("\nA user with that email already exists. Aborting.");
      process.exit(1);
    }

    const password = askSecret("  Password");
    const confirmPassword = askSecret("  Confirm password");

    if (!password) {
      console.error("\nPassword cannot be empty. Aborting.");
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error("\nPasswords do not match. Aborting.");
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.create({ name, email, password: hashed, role: "manager", status: "active" });
    console.log("\nManager account created.");
  }

  printSection("3 / 3  —  Summary");

  const finalSettings = await Settings.findOne();
  const manager = await User.findOne({ role: "manager" });

  console.log(`\n  Organisation : ${finalSettings.organizationName}`);
  console.log(`  Brand colour : ${finalSettings.brandColor}`);
  console.log(
    `  Allowed domains : ${finalSettings.allowedEmailDomains.length ? finalSettings.allowedEmailDomains.join(", ") : "(none — all domains allowed)"}`,
  );
  console.log(
    `  Blocked prefixes : ${finalSettings.filteredEmailNames.length ? finalSettings.filteredEmailNames.join(", ") : "(none)"}`,
  );
  console.log(`  Manager : ${manager?.name} <${manager?.email}>`);
  console.log("\nThese settings can be updated at any time through the application.\n");
  console.log("\nSetup complete. You can now start the server.\n");

  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("Setup failed:", err);
  mongoose.connection.close();
  process.exit(1);
});
