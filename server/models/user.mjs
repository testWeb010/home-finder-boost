import mongoose from "mongoose";
const Schema = mongoose.Schema;

const user = new Schema({
  role: { type: String, enum: ["Admin", "user"], required: true },
  email: { type: String, required: true },
  password: { type: String },
  username: { type: String, required: true, unique: true },
  name: { type: String },
  photo: { type: String, default: null },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default: "user",
  },
  accountType: {
    type: String,
    required: true,
    enum: ["google", "local"],
    default: "local",
  },
  accountStatus: {
    type: String,
    required: true,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  // isDeleted: { type: Boolean, default: false } // soft delete
  aadhaarCard: { type: String, required: false },
  membership: {
    type: Schema.Types.ObjectId,
    ref: "Membership",
    required: false,
  },
});

const User = mongoose.model("User", user);

export default User;
