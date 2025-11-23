import { api } from "./client";
import type { Restaurant } from "../types/restaurant";

export interface Favorite {
  _id: string;
  restaurantId: string;
  name: string;
  avgRating: number;
}

export async function getFavorites(): Promise<Favorite[]> {
  try {
    const res = await api.get<Favorite[]>("/favorites");
    return res.data;
  } catch (err: any) {
    // If user is not logged in, backend returns 401 → treat as no favourites
    if (err?.response?.status === 401) {
      return [];
    }
    throw err;
  }
}

export async function toggleFavorite(
  restaurant: Restaurant
): Promise<Favorite[]> {
  const current = await getFavorites();
  const isFav = current.some((f) => f.restaurantId === restaurant.id);

  if (isFav) {
    await api.delete(`/favorites/${restaurant.id}`);
  } else {
    await api.post("/favorites", {
      restaurantId: restaurant.id,
      name: restaurant.name,
      avgRating: restaurant.avgRating,
    });
  }

  return getFavorites();
}
