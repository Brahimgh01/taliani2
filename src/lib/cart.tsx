import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  image: string;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, "id" | "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("taliani.cart");
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("taliani.cart", JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const id = `${item.productId}-${item.size}`;
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, id, qty }];
    });
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) => setItems((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, count, subtotal }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart inside CartProvider");
  return c;
}

export function formatTND(amount: number): string {
  return `${amount.toFixed(0)} TND`;
}
