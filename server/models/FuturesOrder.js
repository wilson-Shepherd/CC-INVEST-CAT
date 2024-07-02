import mongoose from "mongoose";

const { Schema } = mongoose;

const FuturesOrderSchema = new Schema(
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
    quantity: {
      type: Number,
      required: true,
    },
    orderType: {
      type: String,
      required: true,
      enum: ["buy-market", "sell-market", "buy-limit", "sell-limit"],
    },
    price: {
      type: Number,
      required: function () {
        return this.orderType.includes("limit");
      },
    },
    leverage: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    executedAt: {
      type: Date,
    },
  },
  { versionKey: false },
);

const FuturesOrder = mongoose.model("FuturesOrder", FuturesOrderSchema);

export default FuturesOrder;
