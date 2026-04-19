import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { GiftResult } from "../types";

const STORAGE_KEY = "phia-wishlist";

function load(): GiftResult[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

interface WishlistCtx {
  items: GiftResult[];
  toggle: (r: GiftResult) => void;
  isWishlisted: (id: string) => boolean;
  clear: () => void;
  count: number;
}

const Ctx = createContext<WishlistCtx>({
  items: [], toggle: () => {}, isWishlisted: () => false, clear: () => {}, count: 0,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GiftResult[]>(load);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const toggle = useCallback((result: GiftResult) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.product.id === result.product.id);
      return exists
        ? prev.filter((i) => i.product.id !== result.product.id)
        : [...prev, result];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  const clear = useCallback(() => setItems([]), []);

  return (
    <Ctx.Provider value={{ items, toggle, isWishlisted, clear, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWishlist = () => useContext(Ctx);
