import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["property", "message", "subscription", "system", "appointment"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    refPath: "onModel"
  },
  onModel: {
    type: String,
    enum: ["Property", "Message", "Subscription", "User"]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },
  icon: {
    type: String,
    default: "notification"
  }
});

// Add indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;