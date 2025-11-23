import React, { useEffect, useState } from "react";
import { getOrders, type Order } from "../api/orders";

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getOrders();
        setOrders(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load orders. Please login."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <h2>Your Orders</h2>
      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p>You don&apos;t have any orders yet.</p>
      )}

      <div className="orders-list">
        {orders.map((o) => (
          <div key={o._id} className="order-card">
            <div className="order-header">
              <span>Order #{o._id.slice(-6)}</span>
              <span>{new Date(o.createdAt).toLocaleString()}</span>
            </div>
            <ul className="order-items">
              {o.items.map((it, i) => (
                <li key={i}>
                  {it.name} × {it.quantity} — ₹{" "}
                  {(it.price * it.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="order-footer">
              <span>Status: {o.status}</span>
              <span>Total: ₹ {o.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
