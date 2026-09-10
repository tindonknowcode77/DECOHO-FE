"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/src/services/axios";
import { productFavoritesService } from "@/src/services/product-favorites.service";
import { getAccessToken } from "@/src/features/auth/services/session";

const listeners = new Set<(ids: Set<string>) => void>();
let cachedIds: Set<string> = new Set();
let loaded = false;
let loadingPromise: Promise<void> | null = null;

function notify(ids: Set<string>) {
  cachedIds = ids;
  listeners.forEach((cb) => cb(ids));
}

async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  if (loadingPromise) return loadingPromise;

  const token = getAccessToken();
  if (!token) {
    loaded = true;
    return;
  }

  loadingPromise = (async () => {
    try {
      const ids = await productFavoritesService.getIds(token);
      notify(new Set(ids));
    } catch {
      notify(new Set());
    } finally {
      loaded = true;
      loadingPromise = null;
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
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const toggle = useCallback(
    async (productId: string): Promise<boolean | null> => {
      const token = getAccessToken();
      if (!token) return null;

      const isLiked = cachedIds.has(productId);
      const optimistic = new Set(cachedIds);
      if (isLiked) optimistic.delete(productId);
      else optimistic.add(productId);
      notify(optimistic);

      setBusy(true);
      try {
        const result = isLiked
          ? await productFavoritesService.remove(token, productId)
          : await productFavoritesService.add(token, productId);
        return result.liked;
      } catch (value) {
        notify(cachedIds);
        if (value instanceof ApiError) {
          console.error("toggle favorite failed:", value.message);
        }
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { likedIds, isLiked: (id: string) => likedIds.has(id), toggle, busy };
}
