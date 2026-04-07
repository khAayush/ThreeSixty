import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    userName: { type: String, required: true },
    userImage: { type: String, default: "" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    description: { type: String, default: "" },

    // Resolution fields
    note: { type: String, default: "" },
    resolvedDate: { type: Date },
    resolvedBy: { type: String, default: "" },
    closedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;