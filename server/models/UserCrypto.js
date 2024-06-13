import mongoose from 'mongoose';

const UserCryptoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cryptoSymbol: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserCrypto = mongoose.model('UserCrypto', UserCryptoSchema);

export default UserCrypto;
