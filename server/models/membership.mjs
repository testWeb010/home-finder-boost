import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const membershipSchema = new Schema({
  planName: { type: String, required: true, unique: true, },
  originalPrice: { type: Number, required: true, },
  discountedPrice: { type: Number, required: true, },
  durationInDays: { type: Number, required: true, default: 1,}, 
  features: {type: []},
  isActive: { type: Boolean, default: true, },
  createdAt: { type: Date, default: Date.now, },
  updatedAt: { type: Date, default: Date.now, }
});

membershipSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Membership = mongoose.model('Membership', membershipSchema);

export default Membership;
