import Assignment from "../models/assignment.model.js";
import Asset from "../models/asset.model.js";
import ItemUnit from "../models/itemunit.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createNotification, notifyRole } from "../utils/createNotification.js";

const uid = (req) => req.user._id || req.user.id;

const populate = (q) =>
  q
    .populate("unitId",      "name baseTag")
    .populate("assetId",     "tag status isLost")
    .populate("requestedBy", "name email")
    .populate("assignedTo",  "name email")
    .populate("assignedBy",  "name")
    .populate("receivedBy",  "name");

// ── Employee ──────────────────────────────────────────────────────────────────

export const createRequest = async (req, res) => {
  try {
    const { unitId, note } = req.body;
    if (!unitId) return res.status(400).json({ success: false, message: "unitId is required" });

    const unit = await ItemUnit.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    // Block duplicate pending request for the same unit
    const dupe = await Assignment.findOne({ unitId, requestedBy: uid(req), status: "Pending" });
    if (dupe) return res.status(409).json({ success: false, message: "You already have a pending request for this item" });

    // Pick first available asset as suggestion (not yet locked)
    const suggested = await Asset.findOne({ unitId, status: "Healthy", isAssigned: { $ne: true } });
    if (!suggested) return res.status(409).json({ success: false, message: "No available assets in this unit" });

    const assignment = await Assignment.create({
      unitId,
      assetId: suggested._id,
      requestedBy: uid(req),
      note: note?.trim() || "",
    });

    // Notify all admins/managers of the new request
    await notifyRole(
      ["admin", "manager"],
      "asset:request_new",
      "New Asset Request",
      `${req.user.name} requested "${unit?.name || "an asset"}".`,
      { requestId: assignment._id.toString(), actorName: req.user.name },
    );

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyAssignments = async (req, res) => {
  try {
    const assignments = await populate(
      Assignment.find({ requestedBy: uid(req) }).sort({ createdAt: -1 })
    );
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getAssignments = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    const assignments = await populate(
      Assignment.find(query).sort({ createdAt: -1 })
    );
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAvailableAssets = async (req, res) => {
  try {
    const assets = await Asset.find({
      unitId: req.params.unitId,
      status: "Healthy",
      isAssigned: { $ne: true },
    }).select("tag _id").sort({ tag: 1 });
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { assetId, adminNote } = req.body || {};

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    if (assignment.status !== "Pending") return res.status(400).json({ success: false, message: "Only pending requests can be approved" });

    const targetId = assetId || assignment.assetId;
    if (!targetId) return res.status(400).json({ success: false, message: "No asset selected" });

    const asset = await Asset.findById(targetId);
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
    if (asset.status !== "Healthy" || asset.isAssigned)
      return res.status(409).json({ success: false, message: "Asset is no longer available" });

    asset.isAssigned = true;
    await asset.save();

    assignment.assetId   = asset._id;
    assignment.assignedTo = assignment.requestedBy;
    assignment.assignedBy = uid(req);
    assignment.assignedAt = new Date();
    assignment.status     = "Approved";
    if (adminNote?.trim()) assignment.adminNote = adminNote.trim();
    await assignment.save();

    // Notify the employee their request was approved
    await createNotification(
      assignment.requestedBy,
      "asset:request_updated",
      "Asset Request Approved",
      "Your asset request has been approved.",
      { requestId: assignment._id.toString(), status: "Approved" },
    );

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { adminNote } = req.body || {};

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    if (assignment.status !== "Pending") return res.status(400).json({ success: false, message: "Only pending requests can be rejected" });

    assignment.status = "Rejected";
    if (adminNote?.trim()) assignment.adminNote = adminNote.trim();
    await assignment.save();

    // Notify the employee their request was rejected
    await createNotification(
      assignment.requestedBy,
      "asset:request_updated",
      "Asset Request Denied",
      "Your asset request has been denied.",
      { requestId: assignment._id.toString(), status: "Rejected" },
    );

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const assignment = await populate(Assignment.findById(req.params.id));
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    if (assignment.status !== "Approved") return res.status(400).json({ success: false, message: "Only active assignments can request a return" });

    const employeeEmail = assignment.assignedTo?.email;
    const employeeName  = assignment.assignedTo?.name || "Employee";
    const assetTag      = assignment.assetId?.tag   || "N/A";
    const unitName      = assignment.unitId?.name   || "asset";

    if (!employeeEmail) return res.status(400).json({ success: false, message: "Employee email not found" });

    await sendEmail({
      to: employeeEmail,
      subject: `Return Request: ${unitName} (${assetTag})`,
      text: `Hi ${employeeName},\n\nWe are requesting you to return the following asset currently assigned to you:\n\nItem: ${unitName}\nAsset Tag: ${assetTag}\n\nPlease return this asset to the admin at your earliest convenience.\n\nThank you!`,
    });

    res.json({ success: true, message: "Return request email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const processReturn = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    if (assignment.status !== "Approved") return res.status(400).json({ success: false, message: "Only approved assignments can be returned" });

    if (assignment.assetId) {
      await Asset.findByIdAndUpdate(assignment.assetId, { isAssigned: false });
    }

    assignment.status     = "Returned";
    assignment.isReturned = true;
    assignment.returnedAt = new Date();
    assignment.receivedBy = uid(req);
    await assignment.save();

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
