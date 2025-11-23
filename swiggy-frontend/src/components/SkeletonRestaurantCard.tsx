import React from "react";

const SkeletonRestaurantCard: React.FC = () => {
  return (
    <div className="restaurant-card skeleton-card">
      <div className="skeleton-image" />
      <div className="restaurant-info">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-text" />
        <div className="skeleton-line skeleton-text short" />
      </div>
    </div>
  );
};

export default SkeletonRestaurantCard;
