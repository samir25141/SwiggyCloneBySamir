import React from "react";
import type { Restaurant } from "../types/restaurant";
import { Link } from "react-router-dom";

interface Props {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const CDN_URL =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/";

const RestaurantCard: React.FC<Props> = ({
  restaurant,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div className="restaurant-card">
      {/* Image clickable: go to menu, pass full restaurant in state */}
      <Link
        to={`/restaurants/${restaurant.id}`}
        state={{ restaurant }}
        className="restaurant-image-link"
      >
        {restaurant.cloudinaryImageId && (
          <img
            src={CDN_URL + restaurant.cloudinaryImageId}
            alt={restaurant.name}
            className="restaurant-image"
          />
        )}
      </Link>

      <div className="restaurant-info">
        <div className="header-row">
          <h3>
            <Link
              to={`/restaurants/${restaurant.id}`}
              state={{ restaurant }}
            >
              {restaurant.name}
            </Link>
          </h3>

          {onToggleFavorite && (
            <button
              type="button"
              className="fav-btn"
              onClick={onToggleFavorite}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          )}
        </div>

        <p className="cuisines">{restaurant.cuisines.join(", ")}</p>

        <div className="meta">
          <span>⭐ {restaurant.avgRating || "N/A"}</span>
          {restaurant.slaString && <span>{restaurant.slaString}</span>}
          {restaurant.costForTwo && <span>{restaurant.costForTwo}</span>}
        </div>

        {restaurant.areaName && (
          <p className="area">📍 {restaurant.areaName}</p>
        )}

        {/* 👉 View Menu button */}
        <div className="card-actions">
          <Link
            to={`/restaurants/${restaurant.id}`}
            state={{ restaurant }}
            className="btn-primary view-menu-btn"
          >
            View Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
