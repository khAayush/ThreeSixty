import mongoose from "mongoose";

const assetLogSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  actionType: {
    type: String,
    enum: ["CREATED", "STATUS_CHANGE", "LOCATION_CHANGE", "LOST_STATUS_CHANGE"],
    required: true,
  },
  fromLocation: { type: String, default: null },
  toLocation: { type: String, default: null },
  fromStatus: { type: String, default: null },
  toStatus: { type: String, default: null },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  changedAt: { type: Date, default: Date.now },
  comment: { type: String, default: "" },
});

// Index for fast per-asset history lookups
assetLogSchema.index({ assetId: 1, changedAt: -1 });

export default mongoose.model("AssetLog", assetLogSchema);
