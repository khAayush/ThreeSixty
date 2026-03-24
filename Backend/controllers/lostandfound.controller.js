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


    // CRITICAL: Use req.user._id (from JWT), not req.user.id
    const userId = req.user._id || req.user.id;
    const userName = req.user.name || "Unknown";

    const resolvedCode = assetCode || (type === "lost" ? "NO-TAG" : "-");

    // Duplicate check: same user, same type, open status, same asset
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

    // Mark the physical asset as lost
    if (type === "lost" && resolvedCode && resolvedCode !== "NO-TAG") {
      await Asset.findOneAndUpdate({ tag: resolvedCode }, { isLost: true });
    }

    // Notify all admins/managers of the new lost/found report
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

    // CRITICAL: Always use req.user._id (from JWT)
    const userId = req.user._id || req.user.id;

    // Filter by type if provided
    if (type) query.type = type;

    // Filter by status if provided (e.g., ?status=open or ?status=open,resolved)
    if (status) {
      const statuses = status.split(",");
      query.status = { $in: statuses };
    }

    // If myReports=true, show only items created by this user
    if (myReports === "true") {
      query.createdBy = userId;
    }

    // Search across assetName, assetCode, or createdByName
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
    // CRITICAL: Use req.user._id (from JWT)
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

    // Clear isLost on the asset
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

// Soft delete: Mark as cancelled (employees can cancel their own items)
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

    // Check: Must be the report creator or admin
    const isOwner = report.createdBy.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this report",
      });
    }

    // Soft delete: Change status to cancelled
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

    // Clear isLost on the asset
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
