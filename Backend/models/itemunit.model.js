import mongoose from "mongoose";

const itemUnitSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    baseTag: { type: String, required: true, unique: true, trim: true },
    totalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ItemUnit", itemUnitSchema);
