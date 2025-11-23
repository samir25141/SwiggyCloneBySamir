import { api } from "./client";
import type { Restaurant } from "../types/restaurant";

export interface FetchRestaurantsParams {
  search?: string;
  minRating?: number;
  cuisine?: string;
  lat?: number;
  lng?: number;
}

export async function fetchRestaurants(
  params: FetchRestaurantsParams = {}
): Promise<Restaurant[]> {
  const response = await api.get<{ data: Restaurant[] }>("/restaurants", {
    params,
  });

  return response.data.data;
}
