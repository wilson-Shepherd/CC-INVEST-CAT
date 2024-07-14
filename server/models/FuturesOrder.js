import mongoose from "mongoose";

const { Schema } = mongoose;

const futuresOrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    symbol: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["market"],
      required: true,
    },
    side: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    leverage: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["open", "closed", "canceled"],
      default: "open",
    },
    stopLoss: {
      type: Number,
    },
    takeProfit: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false, timestamps: true },
);

const FuturesOrder = mongoose.model("FuturesOrder", futuresOrderSchema);

export default FuturesOrder;
