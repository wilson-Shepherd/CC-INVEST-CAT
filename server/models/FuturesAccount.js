import mongoose from "mongoose";

const { Schema } = mongoose;

const FuturesAccountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 10000,
  },
  positions: [
    {
      type: Schema.Types.ObjectId,
      ref: "FuturesPosition",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FuturesAccountSchema.methods.deposit = function (amount) {
  if (amount <= 0) {
    throw new Error("Deposit amount must be positive");
  }
  this.balance += amount;
  return this.save();
};

FuturesAccountSchema.methods.withdraw = function (amount) {
  if (amount <= 0) {
    throw new Error("Withdrawal amount must be positive");
  }
  if (this.balance < amount) {
    throw new Error("Insufficient funds");
  }
  this.balance -= amount;
  return this.save();
};

const FuturesAccount = mongoose.model("FuturesAccount", FuturesAccountSchema);

export default FuturesAccount;
