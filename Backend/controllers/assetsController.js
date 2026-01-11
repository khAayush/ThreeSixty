const Asset = require('../models/Asset');
const Category = require('../models/Category');

const createAsset = async (req, res, next) => {
  try {
    const { name, category, assetId, status, assetType, notes } = req.body;
    const orgId = req.user && req.user.orgId;
    if (!orgId) return res.status(401).json({ message: 'Not authenticated' });

    // if category is an id, keep it; if it's a string name, try to resolve/create
    let categoryRef = null;
    if (category) {
      if (typeof category === 'string' && category.match(/^[0-9a-fA-F]{24}$/)) {
        categoryRef = category;
      } else if (typeof category === 'string') {
        // try find or create
        let found = await Category.findOne({ name: category });
        if (!found) found = await Category.create({ name: category, orgId });
        categoryRef = found._id;
      } else if (category._id) {
        categoryRef = category._id;
      }
    }

    const asset = await Asset.create({
      name,
      category: categoryRef,
      assetId,
      status,
      assetType,
      notes,
      orgId,
      createdBy: req.user.userId,
    });

    const populated = await Asset.findById(asset._id).populate('category');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const listAssets = async (req, res, next) => {
  try {
    const orgId = req.user && req.user.orgId;
    if (!orgId) return res.status(401).json({ message: 'Not authenticated' });

    const assets = await Asset.find({ orgId }).populate('category');
    res.json(assets);
  } catch (err) {
    next(err);
  }
};

const getAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.user && req.user.orgId;
    const asset = await Asset.findOne({ _id: id, orgId }).populate('category');
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    next(err);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.user && req.user.orgId;
    const update = req.body || {};

    // handle category passed as name/id
    if (update.category && typeof update.category === 'string' && !update.category.match(/^[0-9a-fA-F]{24}$/)) {
      let found = await Category.findOne({ name: update.category });
      if (!found) found = await Category.create({ name: update.category, orgId });
      update.category = found._id;
    }

    const asset = await Asset.findOneAndUpdate({ _id: id, orgId }, update, { new: true }).populate('category');
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    next(err);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.user && req.user.orgId;
    const asset = await Asset.findOneAndDelete({ _id: id, orgId });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAsset, listAssets, getAsset, updateAsset, deleteAsset };
