import mongoose from 'mongoose';

const mockAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cash: { type: Number, default: 10000 },
  holdings: { type: Map, of: Number }
});

const MockAccount = mongoose.model('MockAccount', mockAccountSchema);
export default MockAccount;
