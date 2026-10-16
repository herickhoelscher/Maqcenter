"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

// Shopping cart for products sold online. Prices here are for display only:
// the server recomputes price and stock from the database at checkout.

export type CartItem = { productId: string; slug: string; name: string; priceCents: number; qty: number; image?: string };

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  ready: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "maqcenter-carrinho";
const CartContext = createContext<CartContextValue | null>(null);

function read(): CartItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.productId === "string" && i.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setItems(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable: the cart lives for this page only.
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      totalCents: items.reduce((n, i) => n + i.qty * i.priceCents, 0),
      add: (item, qty = 1) => {
        const found = items.find((i) => i.productId === item.productId);
        persist(
          found
            ? items.map((i) => (i.productId === item.productId ? { ...i, ...item, qty: Math.min(99, i.qty + qty) } : i))
            : [...items, { ...item, qty }],
        );
      },
      setQty: (productId, qty) => persist(items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i))),
      remove: (productId) => persist(items.filter((i) => i.productId !== productId)),
      clear: () => persist([]),
    }),
    [items, ready, persist],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
