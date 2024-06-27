import mongoose from "mongoose";

const { Schema } = mongoose;

const FuturesPositionSchema = new Schema(
  {
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
    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    leverage: {
      type: Number,
      required: true,
      min: 1,
    },
    positionType: {
      type: String,
      enum: ["long", "short"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

const FuturesPosition = mongoose.model(
  "FuturesPosition",
  FuturesPositionSchema,
);

export default FuturesPosition;
