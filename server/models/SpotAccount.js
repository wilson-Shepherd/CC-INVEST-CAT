import mongoose from "mongoose";

const { Schema } = mongoose;

const SpotAccountSchema = new Schema({
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
      USDT: 1000,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SpotAccountSchema.methods.deposit = function (amount) {
  if (amount <= 0) {
    throw new Error("Deposit amount must be positive");
  }
  this.balance += amount;
  return this.save();
};

SpotAccountSchema.methods.withdraw = function (amount) {
  if (amount <= 0) {
    throw new Error("Withdrawal amount must be positive");
  }
  if (this.balance < amount) {
    throw new Error("Insufficient funds");
  }
  this.balance -= amount;
  return this.save();
};

const SpotAccount = mongoose.model("SpotAccount", SpotAccountSchema);

export default SpotAccount;
