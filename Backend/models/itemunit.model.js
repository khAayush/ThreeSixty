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

// Case-insensitive uniqueness: "Laptop" and "laptop" are the same unit within a category
itemUnitSchema.index({ name: 1, categoryId: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export default mongoose.model("ItemUnit", itemUnitSchema);
