const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
