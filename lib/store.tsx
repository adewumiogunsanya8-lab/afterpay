"use client";

/**
 * Client-side storefront state: the cart.
 *
 * The cart lives in `localStorage` and is read through `useSyncExternalStore`,
 * so the server-rendered HTML and the first client render always agree (React uses
 * the server snapshot while hydrating, then re-renders once the browser values
 * are known). There is no setState-in-effect waterfall.
 *
 * Cart lines keep a small snapshot of the product instead of referencing the
 * full catalogue, which keeps product records out of the client bundle.
 *
 * The store is US-only, so there is no selected-country state: prices come from
 * the market cache in `lib/markets.ts`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getMarket } from "@/lib/markets";
import type { Market, Product } from "@/data/types";

export const CART_STORAGE_KEY = "afterpay.cart.v1";

/** The subset of a product the cart and checkout need. */
export type CartProduct = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "brand"
  | "image"
  | "price"
  | "originalPrice"
  | "discountPercent"
  | "installment"
  | "stock"
>;

export type CartLine = {
  product: CartProduct;
  quantity: number;
};

export function toCartProduct(product: Product): CartProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.image,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent,
    installment: product.installment,
    stock: product.stock,
  };
}

type PersistentStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
};

/**
 * Minimal `localStorage`-backed external store.
 * Reads are memoised; writes persist and notify every subscriber.
 *
 * `fallback` may be a thunk. The market store needs that: this module is
 * evaluated on import, which happens *before* the root layout has fetched the
 * markets from Postgres and primed the cache in `lib/markets.ts`. Resolving the
 * fallback lazily keeps the server snapshot correct instead of freezing a
 * default guessed at import time.
 */
function createPersistentStore<T>(
  key: string,
  parse: (raw: string | null) => T,
  fallback: T | (() => T),
): PersistentStore<T> {
  const resolve = (): T =>
    typeof fallback === "function" ? (fallback as () => T)() : fallback;

  const listeners = new Set<() => void>();
  let cache: T | null = null;

  const getSnapshot = (): T => {
    if (cache !== null) return cache;
    if (typeof window === "undefined") return resolve();
    cache = parse(window.localStorage.getItem(key));
    return cache;
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    getServerSnapshot: resolve,
    set(value) {
      cache = value;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage unavailable (private mode / quota) — state still works in memory.
      }
      for (const listener of listeners) listener();
    },
  };
}

const cartStore = createPersistentStore<CartLine[]>(CART_STORAGE_KEY, (raw) => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        Boolean(line) &&
        typeof (line as CartLine).quantity === "number" &&
        Boolean((line as CartLine).product?.id),
    );
  } catch {
    return [];
  }
}, []);

type StoreValue = {
  market: Market;
  lines: CartLine[];
  itemCount: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  quantityOf: (productId: string) => number;
  isCartEmpty: boolean;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** False during SSR and the hydration pass, true once in the browser. */
  hydrated: boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

/** True only after hydration — lets pages avoid an empty-state flash. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const hydrated = useHydrated();
  const [cartOpen, setCartOpen] = useState(false);

  // Lock body scroll while the cart drawer is open.
  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [cartOpen]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    const current = cartStore.getSnapshot();
    const exists = current.some((line) => line.product.id === product.id);
    cartStore.set(
      exists
        ? current.map((line) =>
            line.product.id === product.id
              ? { ...line, quantity: Math.min(line.quantity + quantity, 99) }
              : line,
          )
        : [...current, { product, quantity }],
    );
    setCartOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const current = cartStore.getSnapshot();
    cartStore.set(
      quantity <= 0
        ? current.filter((line) => line.product.id !== productId)
        : current.map((line) =>
            line.product.id === productId
              ? { ...line, quantity: Math.min(quantity, 99) }
              : line,
          ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    cartStore.set(cartStore.getSnapshot().filter((line) => line.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => cartStore.set([]), []);

  const quantityOf = useCallback(
    (productId: string) => lines.find((line) => line.product.id === productId)?.quantity ?? 0,
    [lines],
  );

  const value = useMemo<StoreValue>(
    () => ({
      market: getMarket(),
      lines,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      quantityOf,
      isCartEmpty: lines.length === 0,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      hydrated,
    }),
    [
      lines,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      quantityOf,
      cartOpen,
      hydrated,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside <StoreProvider>");
  }
  return context;
}

/** Convenience hook when only the storefront's market is needed. */
export function useStoreMarket(): Market {
  return useStore().market;
}
