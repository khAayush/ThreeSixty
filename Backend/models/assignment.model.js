import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    unitId:      { type: mongoose.Schema.Types.ObjectId, ref: "ItemUnit", required: true },
    assetId:     { type: mongoose.Schema.Types.ObjectId, ref: "Asset",    default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user",     required: true },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "user",     default: null },
    assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "user",     default: null },
    assignedAt:  { type: Date, default: null },
    isReturned:  { type: Boolean, default: false },
    returnedAt:  { type: Date,    default: null },
    receivedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Returned"],
      default: "Pending",
    },
    note:      { type: String, default: "" }, // employee reason
    adminNote: { type: String, default: "" }, // admin note on approve / reject
  },
  { timestamps: true }
);

assignmentSchema.index({ requestedBy: 1, createdAt: -1 });
assignmentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Assignment", assignmentSchema);
