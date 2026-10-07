"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import type { CartItem } from "@/types";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  removeItem: (medicineId: string) => void;
  clearCart: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

function getCartKey(userId?: string) {
  return userId ? `group54-cart-${userId}` : "group54-cart-guest";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeKey, setActiveKey] = useState("group54-cart-guest");

  const loadedForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = getCartKey(user?.userId);
    setActiveKey(key);

    try {
      const stored = localStorage.getItem(key);
      const parsed = stored ? (JSON.parse(stored) as CartItem[]) : [];
      setItems(parsed);
      loadedForKeyRef.current = key;
    } catch {
      setItems([]);
      loadedForKeyRef.current = key;
    }
  }, [user?.userId]);

  useEffect(() => {
    // Prevent accidental overwrites while switching accounts/keys.
    if (loadedForKeyRef.current !== activeKey) return;

    try {
      localStorage.setItem(activeKey, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items, activeKey]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.medicineId === item.medicineId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + item.quantity, existing.availableStock);
        return prev.map((p) => (p.medicineId === item.medicineId ? { ...p, quantity: nextQty } : p));
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((p) =>
        p.medicineId === medicineId ? { ...p, quantity: Math.min(quantity, p.availableStock) } : p,
      ),
    );
  };

  const removeItem = (medicineId: string) => {
    setItems((prev) => prev.filter((p) => p.medicineId !== medicineId));
  };

  const clearCart = () => setItems([]);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, subtotal }),
    [items, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
