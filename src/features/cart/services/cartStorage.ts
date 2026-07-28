import type { CartItem } from "../types";

const CART_ITEMS_KEY = "decoho_cart_items_v1";
const CART_PROMO_KEY = "decoho_cart_promo_v1";
const CART_CHANGE_EVENT = "decoho-cart-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function parseCartItems(value: string | null): CartItem[] | null {
  if (!value) {
    return null;
  }

  try {
    const items = JSON.parse(value) as Partial<CartItem>[];

    if (!Array.isArray(items)) {
      return null;
    }

    return items.filter(
      (item): item is CartItem =>
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.category === "string" &&
        typeof item.style === "string" &&
        typeof item.material === "string" &&
        typeof item.dimensions === "string" &&
        typeof item.priceVND === "number" &&
        typeof item.quantity === "number" &&
        typeof item.image === "string",
    );
  } catch {
    return null;
  }
}

export function getStoredCartItems(fallbackItems: CartItem[] = []) {
  if (!isBrowser()) {
    return fallbackItems;
  }

  return parseCartItems(window.localStorage.getItem(CART_ITEMS_KEY)) ?? fallbackItems;
}

export function saveStoredCartItems(items: CartItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
  window.dispatchEvent(
    new CustomEvent<CartItem[]>(CART_CHANGE_EVENT, {
      detail: items,
    }),
  );
}

export function addCartItem(
  item: Omit<CartItem, "quantity"> & { quantity?: number },
  fallbackItems: CartItem[] = [],
) {
  const items = getStoredCartItems(fallbackItems);
  const existingItem = items.find((current) => current.id === item.id);
  const requestedQuantity = item.quantity ?? 1;
  const nextItems = existingItem
    ? items.map((current) =>
        current.id === item.id
          ? {
              ...current,
              quantity: Math.min(
                current.quantity + requestedQuantity,
                current.stock ?? Number.POSITIVE_INFINITY,
              ),
            }
          : current,
      )
    : [...items, { ...item, quantity: requestedQuantity }];

  saveStoredCartItems(nextItems);
  return nextItems;
}

export function subscribeCartItems(
  callback: (items: CartItem[]) => void,
  fallbackItems: CartItem[] = [],
) {
  if (!isBrowser()) {
    return () => {};
  }

  function handleCustomEvent(event: Event) {
    const items = (event as CustomEvent<CartItem[]>).detail;
    callback(Array.isArray(items) ? items : fallbackItems);
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === CART_ITEMS_KEY) {
      callback(parseCartItems(event.newValue) ?? fallbackItems);
    }
  }

  window.addEventListener(CART_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getStoredPromoCode() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(CART_PROMO_KEY);
}

export function saveStoredPromoCode(code: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CART_PROMO_KEY, code);
}

export function clearStoredPromoCode() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(CART_PROMO_KEY);
}
