import { getAccessToken, REFRESH_TOKEN_KEY, saveAuthTokens } from "./session";

let pendingRefresh: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}`, Accept: "application/json" },
  });
  if (!response.ok) return false;
  const tokens = await response.json();
  // Do not restore a session that was logged out or changed while refreshing.
  if (localStorage.getItem(REFRESH_TOKEN_KEY) !== refreshToken) return false;
  if (typeof tokens.accessToken !== "string" || typeof tokens.refreshToken !== "string") return false;
  saveAuthTokens(tokens.accessToken, tokens.refreshToken);
  return true;
}

export async function authenticatedFetch(url: string, init: RequestInit = {}) {
  const send = () => {
    const headers = new Headers(init.headers);
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    else headers.delete("Authorization");
    return fetch(url, { ...init, headers });
  };
  const originalToken = getAccessToken();
  const response = await send();
  if (response.status !== 401) return response;
  if (getAccessToken() && getAccessToken() !== originalToken) return send();
  pendingRefresh ??= refreshSession().catch(() => false).finally(() => { pendingRefresh = null; });
  if (await pendingRefresh) return send();
  return response;
}
