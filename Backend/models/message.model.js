import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:  { type: String, default: "" },
    type:     { type: String, enum: ["text", "image"], default: "text" },
    status:   { type: String, enum: ["sent", "delivered", "seen"], default: "sent" },
    edited:   { type: Boolean, default: false },
    deleted:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);