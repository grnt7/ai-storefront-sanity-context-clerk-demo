"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "trailhead-cart";

function cartItemKey(item: Pick<CartItem, "productId" | "size" | "color">) {
  return [item.productId, item.size ?? "", item.color ?? ""].join("|");
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage can only be read after mount: the server render (and first
    // client paint) must match, so the stored cart is applied in an effect.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // Corrupt cart data — start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = cartItemKey(item);
        const existing = prev.find((i) => cartItemKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            cartItemKey(i) === key
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback((item: CartItem) => {
    setItems((prev) => prev.filter((i) => cartItemKey(i) !== cartItemKey(item)));
  }, []);

  const updateQuantity = useCallback((item: CartItem, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) =>
        prev.filter((i) => cartItemKey(i) !== cartItemKey(item)),
      );
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        cartItemKey(i) === cartItemKey(item) ? { ...i, quantity } : i,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    };
  }, [items, isOpen, addItem, removeItem, updateQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
