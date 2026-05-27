import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "ItemUnit", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tag: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Healthy", "Damaged", "Out-For-Repair", "Discarded"],
      default: "Healthy",
    },
    location: { type: String, default: null },
    isAssigned: { type: Boolean, default: false },
    isLost: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);
