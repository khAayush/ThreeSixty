const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    status: { type: String, enum: ['ACTIVE', 'PENDING'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
