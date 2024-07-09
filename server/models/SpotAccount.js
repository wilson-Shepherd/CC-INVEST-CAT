import mongoose from "mongoose";

const { Schema } = mongoose;

const SpotAccountSchema = new Schema(
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
      default: 10000,
    },
    holdings: {
      type: Map,
      of: Number,
      default: {
        BTCUSDT: 1,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

const SpotAccount = mongoose.model("SpotAccount", SpotAccountSchema);

export default SpotAccount;
