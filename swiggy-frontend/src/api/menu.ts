import { api } from "./client";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;      // in rupees
  isVeg?: boolean;
}

export async function fetchMenu(
  restaurantId: string,
  lat?: number,
  lng?: number
): Promise<MenuItem[]> {
  const res = await api.get<{ data: MenuItem[] }>(
    `/restaurants/${restaurantId}/menu`,
    {
      params: { lat, lng },
    }
  );

  return res.data.data || [];
}
