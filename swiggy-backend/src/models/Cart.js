import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
