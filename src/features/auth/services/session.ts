import type { AuthSessionUser } from "../types";

export const AUTH_STORAGE_KEY = "decoho_user";
export const ACCESS_TOKEN_KEY = "decoho_access_token";
export const REFRESH_TOKEN_KEY = "decoho_refresh_token";
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
          parsed.role === "user" ||
          parsed.role === "supplier" ||
          parsed.role === "staff" ||
          parsed.role === "admin" ||
          parsed.role === "super_admin"
            ? parsed.role
            : (parsed as { role?: string }).role === "customer"
              ? "user"
            : (parsed as { role?: string }).role === "store"
              ? "supplier"
            : undefined,
        storeId: typeof parsed.storeId === "string" ? parsed.storeId : undefined,
        storeName: typeof parsed.storeName === "string" ? parsed.storeName : undefined,
        storeStatus:
          parsed.storeStatus === "approved" ||
          parsed.storeStatus === "pending" ||
          parsed.storeStatus === "rejected"
            ? parsed.storeStatus
            : undefined,
        supplierApplicationStatus:
          parsed.supplierApplicationStatus === "none" ||
          parsed.supplierApplicationStatus === "pending" ||
          parsed.supplierApplicationStatus === "approved" ||
          parsed.supplierApplicationStatus === "rejected"
            ? parsed.supplierApplicationStatus
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

export function saveAuthTokens(accessToken:string,refreshToken?:string){if(!isBrowser())return;window.localStorage.setItem(ACCESS_TOKEN_KEY,accessToken);if(refreshToken)window.localStorage.setItem(REFRESH_TOKEN_KEY,refreshToken);}
export function getAccessToken(){return isBrowser()?window.localStorage.getItem(ACCESS_TOKEN_KEY):null;}

export function clearSessionUser() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
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
