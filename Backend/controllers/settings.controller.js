import Settings from "../models/settings.model.js";

// Returns the single settings document, seeding from env vars on first run
const getOrInit = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      organizationName: process.env.INSTITUTION_NAME || "ThreeSixty",
      allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS || "")
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      filteredEmailNames: (process.env.FILTERED_EMAIL_NAMES || "")
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
    });
  }
  return settings;
};

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrInit();
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSettings = async (req, res) => {
  const { organizationName, allowedEmailDomains, filteredEmailNames, brandColor } = req.body;
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    if (organizationName !== undefined) settings.organizationName = organizationName;
    if (allowedEmailDomains !== undefined) settings.allowedEmailDomains = allowedEmailDomains;
    if (filteredEmailNames !== undefined) settings.filteredEmailNames = filteredEmailNames;
    if (brandColor !== undefined) settings.brandColor = brandColor;
    await settings.save();
    res.status(200).json({ message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
