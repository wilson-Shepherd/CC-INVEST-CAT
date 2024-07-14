import mongoose from "mongoose";

const { Schema } = mongoose;

const futuresAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    balance: {
      type: Number,
      default: 10000,
    },
    contracts: [
      {
        type: Schema.Types.ObjectId,
        ref: "FuturesContract",
      },
    ],
    totalMarginBalance: {
      type: Number,
    },
    totalUnrealizedPnl: {
      type: Number,
    },
    maintenanceMargin: {
      type: Number,
    },
    marginRatio: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

const FuturesAccount = mongoose.model("FuturesAccount", futuresAccountSchema);

export default FuturesAccount;
