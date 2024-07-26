import mongoose from "mongoose";

const { Schema } = mongoose;

const futuresContractSchema = new Schema(
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
    leverage: {
      type: Number,
      required: true,
      min: [0, "Leverage must be positive"],
    },
    entryPrice: {
      type: Number,
      required: true,
      min: [0, "Entry price must be positive"],
    },
    positionSize: {
      type: Number,
      required: true,
      min: [0, "Position size must be positive"],
    },
    margin: {
      type: Number,
      required: true,
      min: [0, "Margin must be positive"],
    },
    type: {
      type: String,
      enum: ["long", "short"],
      required: true,
    },
    liquidationPrice: {
      type: Number,
      default: 0,
      min: [0, "Liquidation price must be positive"],
    },
    markPrice: {
      type: Number,
      default: 0,
      min: [0, "Mark price must be positive"],
    },
    pnl: {
      type: Number,
      default: 0,
    },
    roe: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "closed", "canceled"],
      default: "open",
    },
    maintenanceMargin: {
      type: Number,
      default: 0,
      min: [0, "Maintenance margin must be positive"],
    },
    marginRatio: {
      type: Number,
      default: 0,
      min: [0, "Margin ratio must be positive"],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const FuturesContract = mongoose.model(
  "FuturesContract",
  futuresContractSchema,
);

export default FuturesContract;
