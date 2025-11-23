import React, { createContext, useContext, useEffect, useState } from "react";
import type { MenuItem } from "../api/menu";
import { fetchCartFromServer, saveCartToServer } from "../api/cart";

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  changeQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "swiggy_clone_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Initial load: try from server, else from localStorage
  useEffect(() => {
    const load = async () => {
      try {
        const serverItems = await fetchCartFromServer();
        if (serverItems.length > 0) {
          const mapped: CartItem[] = serverItems.map((it) => ({
            id: it.itemId,
            name: it.name,
            price: it.price,
            description: "",
            isVeg: undefined,
            quantity: it.quantity,
          }));
          setItems(mapped);
        } else {
          const stored = localStorage.getItem(CART_KEY);
          if (stored) setItems(JSON.parse(stored));
        }
      } catch {
        const stored = localStorage.getItem(CART_KEY);
        if (stored) setItems(JSON.parse(stored));
      } finally {
        setInitialLoaded(true);
      }
    };
    load();
  }, []);

  // Always backup to localStorage
  useEffect(() => {
    if (!initialLoaded) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, initialLoaded]);

  // Sync to server when cart changes (if logged in, token is sent automatically)
  useEffect(() => {
    const sync = async () => {
      if (!initialLoaded) return;
      try {
        setIsSyncing(true);
        const payload = items.map((it) => ({
          itemId: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
        }));
        await saveCartToServer(payload);
      } catch {
        // ignore
      } finally {
        setIsSyncing(false);
      }
    };
    sync();
  }, [items, initialLoaded]);

  const addToCart = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const changeQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        changeQuantity,
        clearCart,
        total,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
