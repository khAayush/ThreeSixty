import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "user:pending_approval",
        "asset:request_new",
        "asset:request_updated",
        "asset:request_cancelled",
        "asset:returned",
        "ticket:new",
        "ticket:closed",
        "lostfound:new",
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    readAt:  { type: Date, default: null },   // set when marked read; TTL deletes after 24 h
    data:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// Auto-delete read notifications 24 hours after they were read (null values are ignored)
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model("Notification", notificationSchema);
