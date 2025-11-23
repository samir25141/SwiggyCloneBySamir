import { api } from "./client";

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

export async function createOrder(
  items: OrderItem[],
  total: number
): Promise<Order> {
  const res = await api.post<Order>("/orders", { items, total });
  return res.data;
}

export async function getOrders(): Promise<Order[]> {
  const res = await api.get<Order[]>("/orders");
  return res.data;
}
