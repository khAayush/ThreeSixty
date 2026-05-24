import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ["CATEGORY_CREATED", "CATEGORY_DELETED", "UNIT_CREATED", "STOCK_ADDED", "ASSET_DELETED"],
    required: true,
  },
  entityName: { type: String, required: true },
  details:    { type: String, default: "" },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  performedAt: { type: Date, default: Date.now },
});

inventoryLogSchema.index({ performedAt: -1 });

export default mongoose.model("InventoryLog", inventoryLogSchema);
