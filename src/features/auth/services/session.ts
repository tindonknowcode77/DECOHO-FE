import type { AuthSessionUser } from "../types";

export const AUTH_STORAGE_KEY = "decoho_demo_user";
export const AUTH_CHANGE_EVENT = "decoho-auth-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function parseSessionUser(value: string | null): AuthSessionUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AuthSessionUser>;

    if (typeof parsed.email === "string" && typeof parsed.name === "string") {
      return {
        address: parsed.address,
        avatar: parsed.avatar,
        email: parsed.email,
        favoriteMaterials: Array.isArray(parsed.favoriteMaterials)
          ? parsed.favoriteMaterials.filter((item): item is string => typeof item === "string")
          : undefined,
        name: parsed.name,
        phone: parsed.phone,
        preferredStyle: parsed.preferredStyle,
        registeredAt: parsed.registeredAt,
        remember: parsed.remember,
        role:
          parsed.role === "admin" || parsed.role === "customer" || parsed.role === "store"
            ? parsed.role
            : undefined,
        storeId: typeof parsed.storeId === "string" ? parsed.storeId : undefined,
        storeName: typeof parsed.storeName === "string" ? parsed.storeName : undefined,
        storeStatus:
          parsed.storeStatus === "approved" ||
          parsed.storeStatus === "pending" ||
          parsed.storeStatus === "rejected"
            ? parsed.storeStatus
            : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function getSessionUser() {
  if (!isBrowser()) {
    return null;
  }

  return parseSessionUser(window.localStorage.getItem(AUTH_STORAGE_KEY));
}

export function saveSessionUser(user: AuthSessionUser) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent<AuthSessionUser>(AUTH_CHANGE_EVENT, { detail: user }));
}

export function clearSessionUser() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: null }));
}

export function subscribeSessionUser(callback: (user: AuthSessionUser | null) => void) {
  if (!isBrowser()) {
    return () => {};
  }

  function handleChange() {
    callback(getSessionUser());
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === AUTH_STORAGE_KEY) {
      handleChange();
    }
  }

  window.addEventListener(AUTH_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}
