import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    organizationName: { type: String, default: "ThreeSixty" },
    allowedEmailDomains: { type: [String], default: [] },
    filteredEmailNames: { type: [String], default: [] },
    brandColor: { type: String, default: "#FF5C00" },
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
