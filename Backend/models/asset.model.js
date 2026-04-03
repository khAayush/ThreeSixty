import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "ItemUnit", required: true },
    // Denormalized for efficient queries without double-populate
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    // Auto-generated unique tag e.g. "SONY-TV-01"
    tag: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Healthy", "Damaged", "Out-For-Repair", "Discarded"],
      default: "Healthy",
    },
    // fixed-type: physical location ("Meeting Room 01"); null means In-Store
    location: { type: String, default: null },
    // assignable-type: true when assigned to an employee (Part 2)
    isAssigned: { type: Boolean, default: false },
    // Placeholder for Lost & Found integration (Part 2)
    isLost: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);
