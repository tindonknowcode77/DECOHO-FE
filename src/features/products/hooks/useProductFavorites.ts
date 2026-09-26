"use client";

import { useCallback, useEffect, useState } from "react";
import { productFavoritesService } from "@/src/services/product-favorites.service";
import {
  getAccessToken,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";

const listeners = new Set<(ids: Set<string>) => void>();
let cachedIds: Set<string> = new Set();
let loaded = false;
let loadingPromise: Promise<void> | null = null;
let loadedToken: string | null | undefined;
const pendingIds = new Set<string>();

function notify(ids: Set<string>) {
  cachedIds = ids;
  listeners.forEach((cb) => cb(ids));
}

async function ensureLoaded(): Promise<void> {
  const token = getAccessToken();
  if (loadedToken !== token) {
    loadedToken = token;
    loaded = false;
    loadingPromise = null;
    notify(new Set());
  }
  if (loaded) return;
  if (loadingPromise) return loadingPromise;

  if (!token) {
    loaded = true;
    return;
  }

  loadingPromise = (async () => {
    try {
      const ids = await productFavoritesService.getIds(token);
      if (loadedToken === token) notify(new Set(ids));
    } catch {
      if (loadedToken === token) notify(new Set());
    } finally {
      if (loadedToken === token) {
        loaded = true;
        loadingPromise = null;
      }
    }
  })();
  return loadingPromise;
}

export function useProductFavorites() {
  const [likedIds, setLikedIds] = useState<Set<string>>(cachedIds);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const cb = (ids: Set<string>) => setLikedIds(new Set(ids));
    listeners.add(cb);
    void ensureLoaded();
    const unsubscribe = subscribeSessionUser(() => {
      void ensureLoaded();
    });
    return () => {
      listeners.delete(cb);
      unsubscribe();
    };
  }, []);

  const toggle = useCallback(
    async (productId: string): Promise<boolean | null> => {
      const token = getAccessToken();
      if (!token) return null;
      if (pendingIds.has(productId)) return null;
      pendingIds.add(productId);
      setBusy(true);
      await ensureLoaded();
      if (getAccessToken() !== token) {
        pendingIds.delete(productId);
        setBusy(false);
        return null;
      }

      const isLiked = cachedIds.has(productId);
      const optimistic = new Set(cachedIds);
      if (isLiked) optimistic.delete(productId);
      else optimistic.add(productId);
      notify(optimistic);

      try {
        const result = isLiked
          ? await productFavoritesService.remove(token, productId)
          : await productFavoritesService.add(token, productId);
        if (getAccessToken() === token) {
          const confirmed = new Set(cachedIds);
          if (result.liked) confirmed.add(productId);
          else confirmed.delete(productId);
          notify(confirmed);
        }
        return result.liked;
      } catch {
        if (getAccessToken() === token) {
          const rollback = new Set(cachedIds);
          if (isLiked) rollback.add(productId);
          else rollback.delete(productId);
          notify(rollback);
        }
        return null;
      } finally {
        setBusy(false);
        pendingIds.delete(productId);
      }
    },
    [],
  );

  return { likedIds, isLiked: (id: string) => likedIds.has(id), toggle, busy };
}
