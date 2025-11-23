import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchMenu, type MenuItem } from "../api/menu";
import { useCart } from "../context/CartContext";
import type { Restaurant } from "../types/restaurant";
import { useLocationContext } from "../context/LocationContext";

const CDN_URL =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

// Fallback sample menu when Swiggy doesn't return data
const FALLBACK_MENU: MenuItem[] = [
  {
    id: "sample-1",
    name: "Paneer Butter Masala",
    description: "Cottage cheese cooked in rich, creamy tomato gravy.",
    price: 249,
    isVeg: true,
  },
  {
    id: "sample-2",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice cooked with spiced chicken pieces.",
    price: 299,
    isVeg: false,
  },
  {
    id: "sample-3",
    name: "Veg Hakka Noodles",
    description: "Stir-fried noodles with veggies in Indo-Chinese style.",
    price: 199,
    isVeg: true,
  },
  {
    id: "sample-4",
    name: "Cheese Burger",
    description: "Grilled patty with cheese, lettuce & special sauce.",
    price: 179,
    isVeg: false,
  },
];

const RestaurantMenuPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { location: loc } = useLocationContext();

  // get restaurant details from route state (for hero section)
  const location = useLocation();
  const state = location.state as { restaurant?: Restaurant } | null;
  const restaurant = state?.restaurant;

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await fetchMenu(id, loc.lat, loc.lng);
        console.log("Menu items for", id, items);
        setMenuItems(items);
      } catch (e) {
        console.error("Menu load error:", e);
        setError("Failed to load live menu. Showing sample dishes instead.");
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, loc.lat, loc.lng]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
  };

  const handleAddAndGoToCart = (item: MenuItem) => {
    addToCart(item);
    navigate("/cart");
  };

  const isFallback = !loading && !error && menuItems.length === 0;
  const itemsToShow = isFallback ? FALLBACK_MENU : menuItems;

  return (
    <div className="page menu-page">
      {/* Restaurant details header */}
      {restaurant && (
        <div className="restaurant-hero">
          <div className="restaurant-hero-left">
            {restaurant.cloudinaryImageId && (
              <img
                src={CDN_URL + restaurant.cloudinaryImageId}
                alt={restaurant.name}
                className="restaurant-hero-img"
              />
            )}
          </div>
          <div className="restaurant-hero-info">
            <h2>{restaurant.name}</h2>
            <p className="hero-cuisines">
              {restaurant.cuisines.join(", ")}
            </p>
            <p className="hero-area">📍 {restaurant.areaName}</p>
            <div className="hero-meta">
              <span>⭐ {restaurant.avgRating || "N/A"}</span>
              {restaurant.slaString && <span>{restaurant.slaString}</span>}
              {restaurant.costForTwo && <span>{restaurant.costForTwo}</span>}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: "1.5rem" }}>Menu</h3>

      {loading && <p>Loading menu...</p>}
      {error && <p className="error">{error}</p>}

      {isFallback && (
        <div className="no-menu-card">
          <h3>Live menu not available</h3>
          <p>
            Swiggy didn&apos;t return a menu for this restaurant. Showing a
            sample menu so you can still try the cart &amp; ordering flow.
          </p>
        </div>
      )}

      {/* Menu items (live or fallback) */}
      <div className="menu-list">
        {itemsToShow.map((item) => (
          <div key={item.id} className="menu-item-card">
            <div className="menu-item-info">
              <h4>{item.name}</h4>

              {item.description && (
                <p className="desc">{item.description}</p>
              )}

              {typeof item.price === "number" && (
                <p className="menu-item-price">
                  ₹ {item.price.toFixed(2)}
                </p>
              )}

              {item.isVeg !== undefined && (
                <span className="menu-item-veg">
                  {item.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                </span>
              )}
            </div>

            <div className="menu-item-actions">
              <button
                type="button"
                className="btn-secondary menu-add-btn"
                onClick={() => handleAddToCart(item)}
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="btn-primary menu-add-btn"
                onClick={() => handleAddAndGoToCart(item)}
              >
                Add &amp; Go to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenuPage;
