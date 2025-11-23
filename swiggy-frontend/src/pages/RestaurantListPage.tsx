import React, { useEffect, useRef, useState } from "react";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import RestaurantCard from "../components/RestaurantCard";
import SkeletonRestaurantCard from "../components/SkeletonRestaurantCard";
import { fetchRestaurants } from "../api/restaurants";
import type { Restaurant } from "../types/restaurant";
import { getFavorites, toggleFavorite } from "../api/favorites";
import { useLocationContext } from "../context/LocationContext";

const PAGE_SIZE = 12;

// ... parseCostForTwo and parseDeliveryTime if you added them earlier

const RestaurantListPage: React.FC = () => {
    const { location } = useLocationContext(); // 👈 get current city lat/lng

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [cuisine, setCuisine] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    const [sortBy, setSortBy] = useState<string>("relevance");
    const [onlyVeg, setOnlyVeg] = useState<boolean>(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Debounce search
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(id);
    }, [search]);

    // Fetch favorites once
    useEffect(() => {
        (async () => {
            try {
                const favs = await getFavorites();
                setFavoriteIds(favs.map((f) => f.restaurantId));
            } catch {
                // ignore
            }
        })();
    }, []);

    // Fetch restaurants when filters OR location change
  useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setVisibleCount(PAGE_SIZE);
      const data = await fetchRestaurants({
        search: debouncedSearch,
        minRating,
        cuisine,
        lat: location.lat,
        lng: location.lng,
      });

      const uniqueById = Array.from(
        new Map(data.map((r) => [r.id, r])).values()
      );

      setRestaurants(uniqueById);
    } catch (err) {
      setError("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  load();
}, [debouncedSearch, minRating, cuisine, location.lat, location.lng]);


    // Infinite scroll logic
    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
                    setVisibleCount((prev) =>
                        prev + PAGE_SIZE > restaurants.length
                            ? restaurants.length
                            : prev + PAGE_SIZE
                    );
                }
            },
            { threshold: 1.0 }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [restaurants.length]);

    const handleToggleFavorite = async (restaurant: Restaurant) => {
        try {
            const updated = await toggleFavorite(restaurant);
            setFavoriteIds(updated.map((f) => f.restaurantId));
        } catch {
            // handle error if needed
        }
    };

    const handleClearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setMinRating(0);
        setCuisine("");
        setSortBy("relevance");
        setOnlyVeg(false);
        setShowFavoritesOnly(false);
    };


    // Helper: convert "30-35 mins" or "25 mins" -> number of minutes
    const parseDeliveryTime = (slaString?: string): number => {
        if (!slaString) return 999; // unknown -> send to bottom
        const match = slaString.match(/\d+/); // first number
        if (!match) return 999;
        return Number(match[0]) || 999;
    };

    // Helper: convert "₹400 for two" or "400 for two" -> 400
    const parseCostForTwo = (costForTwo?: string): number => {
        if (!costForTwo) return 0;

        // remove non-digits and parse
        const match = costForTwo.replace(/[^0-9]/g, "");
        const value = Number(match);
        if (Number.isNaN(value)) return 0;
        return value;
    };

    // Apply extra frontend filters: veg + favourites + sorting
    const filtered = restaurants
        .filter((r) => {
            if (onlyVeg && !r.veg) return false;
            if (showFavoritesOnly && !favoriteIds.includes(r.id)) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "rating") {
                return (b.avgRating || 0) - (a.avgRating || 0);
            }
            if (sortBy === "delivery") {
                return (
                    parseDeliveryTime(a.slaString) - parseDeliveryTime(b.slaString)
                );
            }
            if (sortBy === "costLowHigh") {
                return (
                    parseCostForTwo(a.costForTwo) - parseCostForTwo(b.costForTwo)
                );
            }
            if (sortBy === "costHighLow") {
                return (
                    parseCostForTwo(b.costForTwo) - parseCostForTwo(a.costForTwo)
                );
            }
            // relevance: no change
            return 0;
        });

    const visibleRestaurants = filtered.slice(0, visibleCount);

    return (
        <div className="page">
            <div className="controls">
                <SearchBar value={search} onChange={setSearch} />
                <FilterBar
                    minRating={minRating}
                    onMinRatingChange={setMinRating}
                    cuisine={cuisine}
                    onCuisineChange={setCuisine}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    onlyVeg={onlyVeg}
                    onOnlyVegChange={setOnlyVeg}
                    showFavoritesOnly={showFavoritesOnly}
                    onShowFavoritesOnlyChange={setShowFavoritesOnly}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Loading state with shimmer */}
            {loading && (
                <div className="restaurant-grid">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <SkeletonRestaurantCard key={idx} />
                    ))}
                </div>
            )}

            {error && <p className="error">{error}</p>}

            {!loading && !error && filtered.length === 0 && (
                <p>No restaurants found. Try adjusting your search or filters.</p>
            )}

            {!loading && !error && filtered.length > 0 && (
                <>
                    <div className="restaurant-grid">
                        {visibleRestaurants.map((r) => (
                            <RestaurantCard
                                key={r.id}
                                restaurant={r}
                                isFavorite={favoriteIds.includes(r.id)}
                                onToggleFavorite={() => handleToggleFavorite(r)}
                            />
                        ))}
                    </div>


                    {/* Sentinel for infinite scroll */}
                    <div ref={loadMoreRef} style={{ height: 40 }} />

                    {visibleCount < filtered.length && (
                        <p style={{ textAlign: "center", margin: "1rem 0" }}>
                            Loading more...
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default RestaurantListPage;
