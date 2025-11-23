import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    itemId: String,
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [orderItemSchema],
    total: Number,
    status: { type: String, default: "PLACED" },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
