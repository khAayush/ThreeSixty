import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["fixed", "assignable"], required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, type: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export default mongoose.model("Category", categorySchema);
