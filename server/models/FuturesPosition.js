import mongoose from 'mongoose';

const { Schema } = mongoose;

const FuturesPositionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    symbol: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    leverage: {
      type: Number,
      required: true,
    },
    positionType: {
      type: String,
      required: true,
      enum: ['long', 'short'],
    },
    initialMargin: {
      type: Number,
      default: 0,
    },
    maintenanceMargin: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const FuturesPosition = mongoose.model('FuturesPosition', FuturesPositionSchema);

export default FuturesPosition;
