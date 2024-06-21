import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  symbol: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  orderType: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MockOrder = mongoose.model("MockOrder", orderSchema);

export default MockOrder;
