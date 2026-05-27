import LostAndFound from "../models/lostandfound.model.js";
import Asset from "../models/asset.model.js";
import { notifyRole } from "../utils/createNotification.js";

const formatReport = (report) => ({
  id: report._id,
  assetCode: report.assetCode,
  assetName: report.assetName,
  description: report.description,
  location: report.location,
  type: report.type,
  status: report.status,
  createdByName: report.createdByName,
  createdAt: report.createdAt
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    .toUpperCase(),
  resolvedByName: report.resolvedByName,
  resolvedAt: report.resolvedAt ? report.resolvedAt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).toUpperCase() : null,
});

export const createReport = async (req, res) => {
  try {
    const { assetCode, assetName, description, location, type } = req.body;

    if (!assetName || !location || !type) {
      return res.status(400).json({
        success: false,
        message: "assetName, location and type are required",
      });
    }


    const userId = req.user._id || req.user.id;
    const userName = req.user.name || "Unknown";

    const resolvedCode = assetCode || (type === "lost" ? "NO-TAG" : "-");

    const dupeQuery = { createdBy: userId, type, status: "open" };
    if (type === "lost" && resolvedCode && resolvedCode !== "NO-TAG") {
      dupeQuery.assetCode = resolvedCode;
    } else {
      dupeQuery.assetName = assetName;
    }
    const existing = await LostAndFound.findOne(dupeQuery);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: type === "lost"
          ? "You already have an open lost report for this item"
          : "You already have an open found report for this item",
      });
    }

    const newReport = await LostAndFound.create({
      assetCode: resolvedCode,
      assetName,
      description: description || "",
      location,
      type,
      status: "open",
      createdBy: userId,
      createdByName: userName,
    });

    if (type === "lost" && resolvedCode && resolvedCode !== "NO-TAG") {
      await Asset.findOneAndUpdate({ tag: resolvedCode }, { isLost: true });
    }

    await notifyRole(
      ["admin", "manager"],
      "lostfound:new",
      `New ${newReport.type.charAt(0).toUpperCase() + newReport.type.slice(1)} Report`,
      `${newReport.createdByName} reported a ${newReport.type}: "${newReport.assetName}".`,
      { reportId: newReport._id.toString() },
    );

    const formattedReport = formatReport(newReport);
    res.status(201).json({ success: true, data: formattedReport });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { type, myReports, search, status } = req.query;
    let query = {};

    const userId = req.user._id || req.user.id;

    if (type) query.type = type;

    if (status) {
      const statuses = status.split(",");
      query.status = { $in: statuses };
    }

    if (myReports === "true") {
      query.createdBy = userId;
    }

    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: "i" } },
        { assetCode: { $regex: search, $options: "i" } },
        { createdByName: { $regex: search, $options: "i" } },
      ];
    }

    const reports = await LostAndFound.find(query).sort({ createdAt: -1 });

    const formattedReports = reports.map((report) => formatReport(report));

    res.status(200).json({ success: true, data: formattedReports });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userName = req.user.name || "Unknown";

    const existing = await LostAndFound.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const report = await LostAndFound.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        resolvedBy: userId,
        resolvedByName: userName,
        resolvedAt: new Date(),
      },
      { new: true },
    );

    if (existing.type === "lost" && existing.assetCode && existing.assetCode !== "NO-TAG") {
      await Asset.findOneAndUpdate({ tag: existing.assetCode }, { isLost: false });
    }

    const formattedReport = formatReport(report);
    res.status(200).json({ success: true, data: formattedReport });
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelReport = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userName = req.user.name || "Unknown";

    const report = await LostAndFound.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    const isOwner = report.createdBy.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this report",
      });
    }

    const updatedReport = await LostAndFound.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        resolvedBy: userId,
        resolvedByName: userName,
        resolvedAt: new Date(),
      },
      { new: true },
    );

    if (report.type === "lost" && report.assetCode && report.assetCode !== "NO-TAG") {
      await Asset.findOneAndUpdate({ tag: report.assetCode }, { isLost: false });
    }

    const formattedReport = formatReport(updatedReport);
    res.status(200).json({
      success: true,
      message: "Report cancelled successfully",
      data: formattedReport,
    });
  } catch (error) {
    console.error("Error cancelling report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
