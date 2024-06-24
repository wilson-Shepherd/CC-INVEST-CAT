import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  orderType: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  fee: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ userId: 1, createdAt: -1 });

const MockOrder = mongoose.model("MockOrder", orderSchema);

export default MockOrder;
