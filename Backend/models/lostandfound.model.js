import mongoose from "mongoose";

const lostAndFoundSchema = new mongoose.Schema(
  {
    assetCode: { type: String, default: "NO-TAG" },
    assetName: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["lost", "found"], required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "resolved", "cancelled"],
      default: "open",
      required: true,
    },
    // Who created this report
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    createdByName: { type: String, required: true },
    // Who resolved/cancelled it (if applicable)
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    resolvedByName: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const LostAndFound = mongoose.models.LostAndFound || mongoose.model("LostAndFound", lostAndFoundSchema);

export default LostAndFound;
