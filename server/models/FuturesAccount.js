import mongoose from "mongoose";

const { Schema } = mongoose;

const FuturesAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    balance: {
      type: Number,
      required: true,
      default: 100000,
    },
    borrowedAssets: {
      type: Map,
      of: Number,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

const FuturesAccount = mongoose.model("FuturesAccount", FuturesAccountSchema);

export default FuturesAccount;
