import mongoose from "mongoose";

const itemUnitSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    // Uppercase base tag, e.g. "SONY-TV" — unique across all units
    baseTag: { type: String, required: true, unique: true, trim: true },
    // Total assets ever created for this unit (monotonically increasing)
    totalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ItemUnit", itemUnitSchema);
