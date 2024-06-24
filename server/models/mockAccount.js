import mongoose from 'mongoose';

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
      USDT: 1000,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MockAccountSchema.methods.deposit = function (amount) {
  if (amount <= 0) {
    throw new Error('Deposit amount must be positive');
  }
  this.cash += amount;
  return this.save();
};

MockAccountSchema.methods.withdraw = function (amount) {
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be positive');
  }
  if (this.cash < amount) {
    throw new Error('Insufficient funds');
  }
  this.cash -= amount;
  return this.save();
};

const MockAccount = mongoose.model('MockAccount', MockAccountSchema);

export default MockAccount;
