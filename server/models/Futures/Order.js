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
      trim: true,
    },
    orderType: {
      type: String,
      enum: ["market"],
      required: true,
      default: "market",
    },
    side: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    leverage: {
      type: Number,
      required: true,
      min: [0, "Leverage must be positive"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity must be positive"],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price must be positive"],
    },
    status: {
      type: String,
      enum: ["open", "executed", "closed", "canceled"],
      default: "open",
    },
    stopLoss: {
      type: Number,
      default: 0,
      min: [0, "Stop loss must be positive"],
    },
    takeProfit: {
      type: Number,
      default: 0,
      min: [0, "Take profit must be positive"],
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, "Fee must be positive"],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const FuturesOrder = mongoose.model("FuturesOrder", futuresOrderSchema);

export default FuturesOrder;
