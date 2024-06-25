import mongoose from "mongoose";

const { Schema } = mongoose;

const futuresOrderSchema = new Schema({
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
    enum: ["buy-market", "sell-market", "buy-limit", "sell-limit"],
    required: true,
  },
  price: {
    type: Number,
    required: function () {
      return this.orderType.includes("limit");
    },
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
  leverage: {
    type: Number,
    required: true,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FuturesOrder = mongoose.model("FuturesOrder", futuresOrderSchema);

export default FuturesOrder;
