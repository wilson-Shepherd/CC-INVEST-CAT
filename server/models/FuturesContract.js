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
    },
    leverage: {
      type: Number,
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    positionSize: {
      type: Number,
      required: true,
    },
    margin: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["long", "short"],
      required: true,
    },
    liquidationPrice: {
      type: Number,
    },
    markPrice: {
      type: Number,
    },
    pnl: {
      type: Number,
    },
    roe: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

const FuturesContract = mongoose.model(
  "FuturesContract",
  futuresContractSchema,
);

export default FuturesContract;
