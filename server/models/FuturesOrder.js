import mongoose from "mongoose";

const { Schema } = mongoose;

const FuturesOrderSchema = new Schema({
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
    enum: ["buy-limit", "sell-limit", "buy-market", "sell-market"],
    required: true,
  },
  price: {
    type: Number,
    required: function () {
      return this.orderType.includes("limit");
    },
    min: 0,
  },
  entryPrice: {
    type: Number,
    min: 0,
  },
  exitPrice: {
    type: Number,
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
  executedAt: {
    type: Date,
  },
});

FuturesOrderSchema.index({ userId: 1, createdAt: -1 });

const FuturesOrder = mongoose.model("FuturesOrder", FuturesOrderSchema);

export default FuturesOrder;
