const Category = require('../models/Category');

const listCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).select('name');
    res.json(categories.map((c) => ({ id: c._id, name: c.name })));
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    // avoid duplicates
    let existing = await Category.findOne({ name });
    if (existing) return res.status(200).json({ id: existing._id, name: existing.name });

    const orgId = req.user && req.user.orgId;
    const created = await Category.create({ name, orgId: orgId || null });
    res.status(201).json({ id: created._id, name: created.name });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCategories, createCategory };
