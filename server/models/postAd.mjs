import mongoose from "mongoose";
import cron from "node-cron";
const Schema = mongoose.Schema;

const postAddSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    totalRooms: { type: Number, required: false }, // for single room, it not required
    totalRent: { type: Number, required: true },
    electricityIncluded: { type: Boolean, required: true },
    kitchen: { type: [], required: true }, // at 0 index isKitchen and at 1 index isShared
    washroom: { type: [], required: true }, // at 0 index isWashroom and at 1 index isShared
    canSmoke: { type: Boolean, required: true },
    isIndependent: { type: Boolean, required: true },
    capacity: { type: Number, required: true },
    propertyName: { type: String, required: true },
    mobile: { type: Number, required: true },
    needRoommate: { type: Boolean, required: true },
    aboutRoommate: { type: String },
    location: { type: Object, required: true },
    securityMoney: { type: Number, required: true },
    extra: { type: [] }, // at 0 index isRO, at 1 index isAC and at 2 index isFoodServiceAvailable
    preferedGender: {
      type: String,
      enum: ["male", "female", "other", "any"],
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["apartment", "pg", "singleroom"],
      required: true,
    },
    description: { type: String },
    // isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    clicks: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Index to automatically set isActive to false after 3 days 259200

// cron.schedule("0 * * * *", async () => {
//   const ThreeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000); 
//   await PostAdd.updateMany(
//     { createdAt: { $lte: ThreeDaysAgo }, isActive: true },
//     { $set: { isActive: false } }
//   );
//   console.log("Updated inactive posts");
// });

const PostAdd = mongoose.model("PostAd", postAddSchema);

export default PostAdd;