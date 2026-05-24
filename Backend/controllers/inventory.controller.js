import Category from "../models/category.model.js";
import ItemUnit from "../models/itemunit.model.js";
import Asset from "../models/asset.model.js";
import AssetLog from "../models/assetlog.model.js";
import Assignment from "../models/assignment.model.js";
import LostAndFound from "../models/lostandfound.model.js";

const uid = (req) => req.user._id || req.user.id;

// ── Categories ────────────────────────────────────────────────────────────────

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const catIds = categories.map((c) => c._id);

    const unitAgg = await ItemUnit.aggregate([
      { $match: { categoryId: { $in: catIds } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);
    const unitMap = Object.fromEntries(unitAgg.map((u) => [u._id.toString(), u.count]));

    const data = categories.map((c) => ({
      ...c.toObject(),
      unitCount: unitMap[c._id.toString()] || 0,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("getCategories:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    if (!name || !type)
      return res.status(400).json({ success: false, message: "name and type are required" });

    const cat = await Category.create({ name: name.trim(), type, description: description || "" });
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: "Category name already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const update = {
      ...(name && { name: name.trim() }),
      ...(type && { type }),
      ...(description !== undefined && { description }),
    };
    const cat = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!cat)
      return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: cat });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: "Category name already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const unitCount = await ItemUnit.countDocuments({ categoryId: req.params.id });
    if (unitCount > 0)
      return res.status(409).json({ success: false, message: `Cannot delete: category has ${unitCount} unit(s)` });

    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Employee browse (categories + units + availableCount) ────────────────────

export const browseInventory = async (req, res) => {
  try {
    const categories = await Category.find({ type: "assignable" }).sort({ name: 1 });
    const catIds = categories.map((c) => c._id);

    const units = await ItemUnit.find({ categoryId: { $in: catIds } }).sort({ name: 1 });
    const unitIds = units.map((u) => u._id);

    const [availAgg, totalAgg] = await Promise.all([
      // availableCount = Healthy AND not assigned
      Asset.aggregate([
        { $match: { unitId: { $in: unitIds }, status: "Healthy", isAssigned: { $ne: true } } },
        { $group: { _id: "$unitId", count: { $sum: 1 } } },
      ]),
      // assetCount = actual number of asset documents (source of truth)
      Asset.aggregate([
        { $match: { unitId: { $in: unitIds } } },
        { $group: { _id: "$unitId", count: { $sum: 1 } } },
      ]),
    ]);
    const availMap = Object.fromEntries(availAgg.map((a) => [a._id.toString(), a.count]));
    const totalMap = Object.fromEntries(totalAgg.map((a) => [a._id.toString(), a.count]));

    const unitsByCategory = {};
    units.forEach((u) => {
      const catId = u.categoryId.toString();
      if (!unitsByCategory[catId]) unitsByCategory[catId] = [];
      unitsByCategory[catId].push({
        ...u.toObject(),
        availableCount: availMap[u._id.toString()] || 0,
        assetCount: totalMap[u._id.toString()] || 0,
      });
    });

    const data = categories
      .map((c) => ({ ...c.toObject(), units: unitsByCategory[c._id.toString()] || [] }))
      .filter((c) => c.units.length > 0);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Units ─────────────────────────────────────────────────────────────────────

export const getUnitsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const units = await ItemUnit.find({ categoryId }).sort({ name: 1 });
    const unitIds = units.map((u) => u._id);

    const agg = await Asset.aggregate([
      { $match: { unitId: { $in: unitIds } } },
      { $group: { _id: { unitId: "$unitId", status: "$status" }, count: { $sum: 1 } } },
    ]);
    const countMap = {};
    agg.forEach(({ _id, count }) => {
      const uid = _id.unitId.toString();
      if (!countMap[uid]) countMap[uid] = {};
      countMap[uid][_id.status] = count;
    });

    const data = units.map((u) => {
      const sc = countMap[u._id.toString()] || {};
      return {
        ...u.toObject(),
        statusCounts: sc,
        assetCount: Object.values(sc).reduce((sum, v) => sum + v, 0),
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUnit = async (req, res) => {
  try {
    let { categoryId, name, baseTag, initialCount } = req.body;
    const count = parseInt(initialCount);
    if (!categoryId || !name || !baseTag || isNaN(count) || count < 1)
      return res.status(400).json({
        success: false,
        message: "categoryId, name, baseTag, and initialCount (≥1) are required",
      });

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    baseTag = baseTag.trim().toUpperCase();
    if (await ItemUnit.findOne({ baseTag }))
      return res.status(409).json({ success: false, message: "Base tag already exists" });
    
    const unit = await ItemUnit.create({ categoryId, name: name.trim(), baseTag, totalCount: count });
    const userId = uid(req);

    const assetDocs = Array.from({ length: count }, (_, i) => ({
      unitId: unit._id,
      categoryId,
      tag: `${baseTag}-${(i + 1).toString().padStart(2, "0")}`,
      status: "Healthy",
      isLost: false,
      createdBy: userId,
      ...(category.type === "fixed" ? { location: null } : { isAssigned: false }),
    }));

    const assets = await Asset.insertMany(assetDocs);

    await AssetLog.insertMany(
      assets.map((a) => ({
        assetId: a._id,
        actionType: "CREATED",
        changedBy: userId,
        changedAt: new Date(),
        comment: `Asset ${a.tag} created`,
      }))
    );

    res.status(201).json({ success: true, data: { unit, assetsCreated: assets.length } });
  } catch (err) {
    console.error("createUnit:", err);
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: "Duplicate tag — adjust count or base tag" });

    res.status(500).json({ success: false, message: err.message });
  }
};

export const addStock = async (req, res) => {
  try {
    const { unitId } = req.params;
    const count = parseInt(req.body.additionalCount);
    if (isNaN(count) || count < 1)
      return res.status(400).json({ success: false, message: "additionalCount must be ≥1" });

    const unit = await ItemUnit.findById(unitId).populate("categoryId");
    if (!unit)
      return res.status(404).json({ success: false, message: "Unit not found" });

    const userId = uid(req);
    const startIdx = unit.totalCount;

    const assetDocs = Array.from({ length: count }, (_, i) => ({
      unitId: unit._id,
      categoryId: unit.categoryId._id,
      tag: `${unit.baseTag}-${(startIdx + i + 1).toString().padStart(2, "0")}`,
      status: "Healthy",
      isLost: false,
      createdBy: userId,
      ...(unit.categoryId.type === "fixed" ? { location: null } : { isAssigned: false }),
    }));

    const assets = await Asset.insertMany(assetDocs);
    await ItemUnit.findByIdAndUpdate(unitId, { $inc: { totalCount: count } });

    await AssetLog.insertMany(
      assets.map((a) => ({
        assetId: a._id,
        actionType: "CREATED",
        changedBy: userId,
        changedAt: new Date(),
        comment: `Asset ${a.tag} added to stock`,
      }))
    );

    res.json({ success: true, data: { assetsCreated: assets.length } });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: "Duplicate tag detected" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Assets ────────────────────────────────────────────────────────────────────

export const getAssetsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { status, page = 1, limit = 100 } = req.query;
    const query = { unitId, ...(status && { status }) };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assets, total] = await Promise.all([
      Asset.find(query).sort({ tag: 1 }).skip(skip).limit(parseInt(limit)),
      Asset.countDocuments(query),
    ]);

    res.json({ success: true, data: assets, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssetDetails = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate("unitId", "name baseTag")
      .populate("categoryId", "name type")
      .populate("createdBy", "name");

    if (!asset)
      return res.status(404).json({ success: false, message: "Asset not found" });

    const logs = await AssetLog.find({ assetId: asset._id })
      .populate("changedBy", "name")
      .sort({ changedAt: -1 });

    res.json({ success: true, data: { asset, logs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAssetStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Healthy", "Damaged", "Out-For-Repair", "Discarded"];
    if (!valid.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const asset = await Asset.findById(req.params.id);
    if (!asset)
      return res.status(404).json({ success: false, message: "Asset not found" });

    const fromStatus = asset.status;
    asset.status = status;
    await asset.save();

    await AssetLog.create({
      assetId: asset._id,
      actionType: "STATUS_CHANGE",
      fromStatus,
      toStatus: status,
      changedBy: uid(req),
      changedAt: new Date(),
    });

    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

    const ageMs = Date.now() - new Date(asset.createdAt).getTime();
    if (ageMs > 3 * 24 * 60 * 60 * 1000)
      return res.status(403).json({ success: false, message: "Assets can only be deleted within 3 days of creation" });

    if (asset.isAssigned)
      return res.status(409).json({ success: false, message: "Cannot delete an assigned asset" });

    // Nullify any pending assignment suggestions pointing to this asset
    await Assignment.updateMany({ assetId: asset._id, status: "Pending" }, { $set: { assetId: null } });

    await AssetLog.deleteMany({ assetId: asset._id });
    await asset.deleteOne();
    await ItemUnit.findByIdAndUpdate(asset.unitId, { $inc: { totalCount: -1 } });

    res.json({ success: true, message: "Asset deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAssetLost = async (req, res) => {
  try {
    const { location } = req.body || {};
    const asset = await Asset.findById(req.params.id).populate("unitId", "name");
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

    if (!asset.isLost) {
      // ── Marking as lost ──────────────────────────────────────────────────────
      if (!location?.trim())
        return res.status(400).json({ success: false, message: "Last known location is required" });

      asset.isLost = true;
      await asset.save();

      await LostAndFound.create({
        assetCode: asset.tag,
        assetName: asset.unitId?.name || asset.tag,
        location: location.trim(),
        type: "lost",
        status: "open",
        createdBy: uid(req),
        createdByName: req.user.name || "Admin",
      });

      await AssetLog.create({
        assetId: asset._id,
        actionType: "LOST_STATUS_CHANGE",
        fromStatus: "Not Lost",
        toStatus: "Lost",
        changedBy: uid(req),
        changedAt: new Date(),
        comment: `Marked as lost by admin. Last known location: ${location.trim()}`,
      });
    } else {
      // ── Marking as found ─────────────────────────────────────────────────────
      asset.isLost = false;
      await asset.save();

      await LostAndFound.updateMany(
        { assetCode: asset.tag, type: "lost", status: "open" },
        {
          status: "resolved",
          resolvedBy: uid(req),
          resolvedByName: req.user.name || "Admin",
          resolvedAt: new Date(),
        },
      );

      await AssetLog.create({
        assetId: asset._id,
        actionType: "LOST_STATUS_CHANGE",
        fromStatus: "Lost",
        toStatus: "Not Lost",
        changedBy: uid(req),
        changedAt: new Date(),
        comment: "Marked as found by admin",
      });
    }

    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAssetLocation = async (req, res) => {
  try {
    const { location } = req.body;

    const asset = await Asset.findById(req.params.id).populate("categoryId");
    if (!asset)
      return res.status(404).json({ success: false, message: "Asset not found" });

    if (asset.categoryId.type !== "fixed")
      return res.status(400).json({ success: false, message: "Location only applies to fixed-type assets" });

    const fromLocation = asset.location;
    asset.location = location || null;
    await asset.save();

    await AssetLog.create({
      assetId: asset._id,
      actionType: "LOCATION_CHANGE",
      fromLocation: fromLocation || "In-Store",
      toLocation: location || "In-Store",
      changedBy: uid(req),
      changedAt: new Date(),
    });

    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
