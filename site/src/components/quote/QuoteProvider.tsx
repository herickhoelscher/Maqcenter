"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

// Quote list ("lista de orçamento"): equipment the visitor wants priced
// together. Kept in localStorage; it is never a purchase.

export type QuoteKind = "locacao" | "venda";
export type QuoteItem = { slug: string; name: string; qty: number; kind: QuoteKind };

type QuoteContextValue = {
  items: QuoteItem[];
  count: number;
  ready: boolean;
  add: (item: { slug: string; name: string; kind: QuoteKind }) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

const STORAGE_KEY = "maqcenter-orcamento";
const QuoteContext = createContext<QuoteContextValue | null>(null);

function read(): QuoteItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((i) => i && typeof i.slug === "string").map((i) => ({ ...i, kind: i.kind === "venda" ? "venda" : "locacao" }))
      : [];
  } catch {
    return [];
  }
}

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load after mount so server and client render the same markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setItems(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: QuoteItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode): the list lives for this page only.
    }
  }, []);

  const value = useMemo<QuoteContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      add: ({ slug, name, kind }) => {
        const found = items.find((i) => i.slug === slug);
        persist(found ? items.map((i) => (i.slug === slug ? { ...i, qty: i.qty + 1 } : i)) : [...items, { slug, name, kind, qty: 1 }]);
      },
      setQty: (slug, qty) => persist(items.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i))),
      remove: (slug) => persist(items.filter((i) => i.slug !== slug)),
      clear: () => persist([]),
      has: (slug) => items.some((i) => i.slug === slug),
    }),
    [items, ready, persist],
  );

  return <QuoteContext value={value}>{children}</QuoteContext>;
}

export function useQuote(): QuoteContextValue {
  const ctx = use(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside QuoteProvider");
  return ctx;
}
