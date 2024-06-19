import mongoose from 'mongoose';

const mockTradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symbol: String,
  amount: Number,
  price: Number,
  type: String,
  date: { type: Date, default: Date.now }
});

const MockTrade = mongoose.model('MockTrade', mockTradeSchema);
export default MockTrade;
