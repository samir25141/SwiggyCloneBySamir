import React from "react";

interface FilterBarProps {
  minRating: number;
  onMinRatingChange: (value: number) => void;
  cuisine: string;
  onCuisineChange: (value: string) => void;

  sortBy: string;
  onSortByChange: (value: string) => void;

  onlyVeg: boolean;
  onOnlyVegChange: (value: boolean) => void;

  showFavoritesOnly: boolean;
  onShowFavoritesOnlyChange: (value: boolean) => void;

  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  minRating,
  onMinRatingChange,
  cuisine,
  onCuisineChange,
  sortBy,
  onSortByChange,
  onlyVeg,
  onOnlyVegChange,
  showFavoritesOnly,
  onShowFavoritesOnlyChange,
  onClearFilters,
}) => {
  return (
    <div className="filters">
      <select
        value={minRating}
        onChange={(e) => onMinRatingChange(Number(e.target.value))}
      >
        <option value={0}>All Ratings</option>
        <option value={3}>3.0+</option>
        <option value={3.5}>3.5+</option>
        <option value={4}>4.0+</option>
      </select>

      <input
        type="text"
        placeholder="Filter by cuisine (e.g. Chinese)"
        value={cuisine}
        onChange={(e) => onCuisineChange(e.target.value)}
      />

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
      >
        <option value="relevance">Sort: Relevance</option>
        <option value="rating">Rating (high → low)</option>
        <option value="delivery">Delivery time</option>
        <option value="costLowHigh">Cost (low → high)</option>
        <option value="costHighLow">Cost (high → low)</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={onlyVeg}
          onChange={(e) => onOnlyVegChange(e.target.checked)}
        />{" "}
        Veg only
      </label>

      <label>
        <input
          type="checkbox"
          checked={showFavoritesOnly}
          onChange={(e) => onShowFavoritesOnlyChange(e.target.checked)}
        />{" "}
        Favourites only
      </label>

      <button type="button" onClick={onClearFilters}>
        Clear
      </button>
    </div>
  );
};

export default FilterBar;
