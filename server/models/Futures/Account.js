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
      min: [0, "Balance must be positive"],
    },
    contracts: [
      {
        type: Schema.Types.ObjectId,
        ref: "FuturesContract",
      },
    ],
    totalMarginBalance: {
      type: Number,
      default: 0,
      min: [0, "Total margin balance must be positive"],
    },
    totalUnrealizedPnl: {
      type: Number,
      default: 0,
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

const FuturesAccount = mongoose.model("FuturesAccount", futuresAccountSchema);

export default FuturesAccount;
