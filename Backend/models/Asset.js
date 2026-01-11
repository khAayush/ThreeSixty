const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
    assetId: { type: String, required: false },
    status: {
      type: String,
      enum: ['In-Stock', 'Out-Of-Stock', 'Damaged', 'In-Repair', 'Discarded'],
      default: 'In-Stock',
    },
    assetType: { type: String, enum: ['Fixed', 'Flexible'], default: 'Fixed' },
    notes: { type: String },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
