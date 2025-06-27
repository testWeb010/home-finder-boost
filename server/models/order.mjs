import mongoose from "mongoose";
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Membership",
    unique: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: false,
  },
  txnId: { type: String, required: false }, // cf_payment_id
  bankReference: {type: String, required: false},
  orderId: {type: String, required: true, unique: true},
  success: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
