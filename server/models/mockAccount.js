import mongoose from "mongoose";

const { Schema } = mongoose;

const MockAccountSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  cash: {
    type: Number,
    required: true,
    default: 10000,
  },
  holdings: {
    type: Map,
    of: Number,
    default: {
      BTCUSDT: 1,
      ETHUSDT: 10,
      USDT: 1000,
      BNBUSDT: 5,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MockAccount = mongoose.model("MockAccount", MockAccountSchema);

export default MockAccount;
