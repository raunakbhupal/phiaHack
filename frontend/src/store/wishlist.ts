import { useCallback, useEffect, useState } from "react";
import type { GiftResult } from "../types";

const STORAGE_KEY = "phia-wishlist";

function load(): GiftResult[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items: GiftResult[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useWishlist() {
  const [items, setItems] = useState<GiftResult[]>(load);

  useEffect(() => { save(items); }, [items]);

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

  return { items, toggle, isWishlisted, clear, count: items.length };
}
