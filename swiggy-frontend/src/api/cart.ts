import { api } from "./client";

export interface CartApiItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export async function fetchCartFromServer(): Promise<CartApiItem[]> {
  const res = await api.get<{ items: CartApiItem[] }>("/cart");
  return res.data.items || [];
}

export async function saveCartToServer(
  items: CartApiItem[]
): Promise<void> {
  await api.put("/cart", { items });
}
