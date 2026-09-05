import { getAccessToken } from "@/src/features/auth/services/session";

/**
 * Quản lý wishlist products + saved moodboards ở localStorage.
 * - Khi save ở trang products/moodboards thì profile sẽ thấy ngay.
 * - Subscribe qua window event "decoho-wishlist-change".
 */

const SAVED_MOODS_KEY = "decoho_saved_moods_v1";
const WISHLIST_PRODUCTS_KEY = "decoho_wishlist_products_v1";
const CHANGE_EVENT = "decoho-wishlist-change";

export type WishlistProduct = {
  id: string;
  name: string;
  priceVND?: number;
  image?: string;
  category?: string;
  brand?: string;
  style?: string;
  savedAt: number;
};

export type SavedMoodboard = {
  id: string;
  title: string;
  image?: string;
  author?: string;
  productCount?: number;
  roomType?: string;
  savedAt: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function emitChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function readSet(key: string): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeSet(key: string, values: string[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(values));
  emitChange();
}

/* ---------------- SAVED MOODBOARDS ---------------- */

export function getSavedMoodboardIds(): string[] {
  return readSet(SAVED_MOODS_KEY);
}

export function isSavedMoodboard(id: string): boolean {
  return getSavedMoodboardIds().includes(id);
}

export function toggleSavedMoodboard(id: string): boolean {
  const ids = getSavedMoodboardIds();
  const idx = ids.indexOf(id);
  let nowSaved: boolean;
  if (idx >= 0) {
    ids.splice(idx, 1);
    nowSaved = false;
  } else {
    ids.unshift(id);
    nowSaved = true;
  }
  writeSet(SAVED_MOODS_KEY, ids);
  return nowSaved;
}

export function subscribeSavedMoodboards(callback: (ids: string[]) => void) {
  if (!isBrowser()) return () => {};
  const handler = () => callback(getSavedMoodboardIds());
  window.addEventListener(CHANGE_EVENT, handler);
  // Listen storage từ tab khác
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ---------------- WISHLIST PRODUCTS ---------------- */

export function getWishlistProductIds(): string[] {
  return readSet(WISHLIST_PRODUCTS_KEY);
}

export function isWishlistProduct(id: string): boolean {
  return getWishlistProductIds().includes(id);
}

export function toggleWishlistProduct(id: string): boolean {
  const ids = getWishlistProductIds();
  const idx = ids.indexOf(id);
  let nowSaved: boolean;
  if (idx >= 0) {
    ids.splice(idx, 1);
    nowSaved = false;
  } else {
    ids.unshift(id);
    nowSaved = true;
  }
  writeSet(WISHLIST_PRODUCTS_KEY, ids);
  return nowSaved;
}

export function subscribeWishlistProducts(callback: (ids: string[]) => void) {
  if (!isBrowser()) return () => {};
  const handler = () => callback(getWishlistProductIds());
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ---------------- METADATA cho Profile ---------------- */

const PRODUCT_META_KEY = "decoho_wishlist_meta_v1";
const MOOD_META_KEY = "decoho_saved_moods_meta_v1";

function readMeta<T>(key: string): Record<string, T> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeMeta<T>(key: string, value: Record<string, T>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function saveProductMeta(product: WishlistProduct) {
  const meta = readMeta<WishlistProduct>(PRODUCT_META_KEY);
  meta[product.id] = { ...meta[product.id], ...product, savedAt: Date.now() };
  writeMeta(PRODUCT_META_KEY, meta);
  emitChange();
}

export function getWishlistProducts(): WishlistProduct[] {
  const ids = getWishlistProductIds();
  const meta = readMeta<WishlistProduct>(PRODUCT_META_KEY);
  return ids
    .map((id) => meta[id])
    .filter((p): p is WishlistProduct => Boolean(p));
}

export function saveMoodboardMeta(mood: SavedMoodboard) {
  const meta = readMeta<SavedMoodboard>(MOOD_META_KEY);
  meta[mood.id] = { ...meta[mood.id], ...mood, savedAt: Date.now() };
  writeMeta(MOOD_META_KEY, meta);
  emitChange();
}

export function getSavedMoodboards(): SavedMoodboard[] {
  const ids = getSavedMoodboardIds();
  const meta = readMeta<SavedMoodboard>(MOOD_META_KEY);
  return ids
    .map((id) => meta[id])
    .filter((m): m is SavedMoodboard => Boolean(m));
}

/* ---------------- API URL builder (optional backend) ---------------- */

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Đồng bộ wishlist lên backend (nếu có). Best-effort — không ném lỗi.
 */
export async function syncWishlistToBackend() {
  if (!isBrowser()) return;
  try {
    await fetch(`${apiBase()}/me/wishlist/sync`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        productIds: getWishlistProductIds(),
        moodboardIds: getSavedMoodboardIds(),
      }),
    });
  } catch {
    // ignore - local-first
  }
}
