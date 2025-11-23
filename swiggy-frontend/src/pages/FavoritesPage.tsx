import React, { useEffect, useState } from "react";
import RestaurantCard from "../components/RestaurantCard";
import { fetchRestaurants } from "../api/restaurants";
import { getFavorites, type Favorite, toggleFavorite } from "../api/favorites";
import type { Restaurant } from "../types/restaurant";
import { useAuth } from "../context/AuthContext";
import { useLocationContext } from "../context/LocationContext";

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const { location } = useLocationContext();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setRestaurants([]);
      setFavoriteIds([]);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [allRestaurants, favorites] = await Promise.all([
          fetchRestaurants({
            search: "",
            minRating: 0,
            cuisine: "",
            lat: location.lat,
            lng: location.lng,
          }),
          getFavorites(),
        ]);

        // 🔸 1. Deduplicate favourites by restaurantId
        const uniqueFavoritesMap = new Map<string, Favorite>();
        for (const f of favorites) {
          uniqueFavoritesMap.set(f.restaurantId, f);
        }
        const uniqueFavorites = Array.from(uniqueFavoritesMap.values());

        const favIds = uniqueFavorites.map((f) => f.restaurantId);
        setFavoriteIds(favIds);
        const favIdSet = new Set(favIds);

        // 🔸 2. Deduplicate restaurants by id
        const restaurantMap = new Map<string, Restaurant>();
        for (const r of allRestaurants) {
          restaurantMap.set(r.id, r);
        }
        const uniqueRestaurants = Array.from(restaurantMap.values());

        // 🔸 3. Keep only restaurants that are in favourites
        const favRestaurants = uniqueRestaurants.filter((r) =>
          favIdSet.has(r.id)
        );

        setRestaurants(favRestaurants);
      } catch (e) {
        setError("Failed to load favourites");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, location.lat, location.lng]);

  const handleToggleFavorite = async (restaurant: Restaurant) => {
    try {
      const updated = await toggleFavorite(restaurant);

      // Deduplicate updated favourites too
      const uniqueMap = new Map<string, Favorite>();
      for (const f of updated) {
        uniqueMap.set(f.restaurantId, f);
      }
      const uniqueUpdated = Array.from(uniqueMap.values());
      const newIds = uniqueUpdated.map((f) => f.restaurantId);

      setFavoriteIds(newIds);
      const newIdSet = new Set(newIds);

      // Filter restaurants to those still in favourites (they are already unique)
      setRestaurants((prev) => prev.filter((r) => newIdSet.has(r.id)));
    } catch {
      // ignore or show toast
    }
  };

  if (!user) {
    return (
      <div className="page">
        <h2>Your Favourites</h2>
        <p>Please login to see and save your favourite restaurants.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Your Favourites</h2>

      {loading && <p>Loading favourites...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p>You don&apos;t have any favourite restaurants yet.</p>
      )}

      <div className="restaurant-grid">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            isFavorite={favoriteIds.includes(r.id)}
            onToggleFavorite={() => handleToggleFavorite(r)}
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
