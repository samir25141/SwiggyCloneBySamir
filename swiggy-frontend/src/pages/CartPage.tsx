import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orders";

const TAX_RATE = 0.05; // 5% GST
const DELIVERY_FEE = 30; // flat fee for demo

const CartPage: React.FC = () => {
  const { items, changeQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + tax + delivery;

  const handleCheckout = async () => {
    if (!items.length) return;

    try {
      const orderItems = items.map((item) => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      await createOrder(orderItems, grandTotal); // 🔥 API call
      clearCart();
      navigate("/orders"); // go to orders history page
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Failed to place order. Please login first."
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="page cart-page">
        <h2>Your Cart</h2>
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-primary">
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h2>Your Cart</h2>

      <div className="cart-layout">
        {/* Left: items */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-main">
                <div>
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">₹ {item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-total">
                  ₹ {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>

              <div className="cart-item-controls">
                <div className="cart-qty">
                  <button
                    type="button"
                    onClick={() =>
                      changeQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      changeQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="cart-remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn-secondary cart-clear-btn"
            onClick={clearCart}
          >
            Clear cart
          </button>
        </div>

        {/* Right: summary */}
        <div className="cart-summary">
          <h3>Bill Details</h3>

          <div className="cart-summary-row">
            <span>Item Total</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>

          <div className="cart-summary-row">
            <span>Taxes & Charges (5%)</span>
            <span>₹ {tax.toFixed(2)}</span>
          </div>

          <div className="cart-summary-row">
            <span>Delivery Fee</span>
            <span>₹ {delivery.toFixed(2)}</span>
          </div>

          <hr />

          <div className="cart-summary-row cart-summary-grand">
            <span>To Pay</span>
            <span>₹ {grandTotal.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="btn-primary cart-checkout-btn"
            onClick={handleCheckout}
          >
            Place Order
          </button>

          <Link to="/" className="cart-continue-link">
            ← Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
