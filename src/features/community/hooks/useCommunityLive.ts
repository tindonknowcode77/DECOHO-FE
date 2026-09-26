"use client";

import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/src/services/axios";
import { getAccessToken } from "@/src/features/auth/services/session";
import type {
  CommunityFeed,
  CommunityPost,
  ReactionType,
} from "../types";

type LiveOptions = {
  /** Polling interval in ms (default 8000) */
  intervalMs?: number;
  /** Pause polling when tab is hidden or user is interacting */
  pauseWhenHidden?: boolean;
};

const DEFAULT_INTERVAL = 8000;

/**
 * Merge incoming (fresh) posts into the existing feed, preserving optimistic UI state
 * (reactions / new comments from current user) so the poll never undoes their actions.
 */
function mergeFeed(
  previous: CommunityFeed | null,
  incoming: CommunityFeed,
  pendingReactionIds: Set<string>,
): CommunityFeed {
  if (!previous) return incoming;

  const previousMap = new Map(previous.items.map((p) => [p._id, p]));

  const mergedItems: CommunityPost[] = incoming.items.map((fresh) => {
    const old = previousMap.get(fresh._id);
    if (!old) return fresh;

    // Skip overwriting a post the user just reacted to (within poll cycle)
    if (pendingReactionIds.has(fresh._id)) {
      return {
        ...fresh,
        // Preserve the local optimistic counts/total until server confirms
        myReaction: old.myReaction,
        reactionCounts: old.reactionCounts,
        reactionTotal: old.reactionTotal,
        liked: old.liked,
        likeCount: old.likeCount,
        // Preserve local comments so user sees their just-posted comment instantly
        comments: old.comments,
        commentCount: old.commentCount,
      };
    }

    // Otherwise: keep server counts but preserve local comments array if larger
    const localComments = old.comments ?? [];
    const freshComments = fresh.comments ?? [];
    const comments =
      localComments.length > freshComments.length ? localComments : freshComments;
    const commentCount = Math.max(old.commentCount ?? 0, fresh.commentCount ?? 0);

    return {
      ...fresh,
      comments,
      commentCount,
    };
  });

  return { ...incoming, items: mergedItems };
}

/**
 * Polls the community feed in the background so comments and reactions from
 * other users appear without a manual reload. Pauses while the tab is hidden
 * and while the user has unsent content in a comment input.
 */
export function useCommunityLive(
  tab: string,
  pendingReactionIds: Set<string>,
  hasUnsavedDraft: boolean,
  options: LiveOptions = {},
) {
  const { intervalMs = DEFAULT_INTERVAL, pauseWhenHidden = true } = options;
  const [feed, setFeed] = useState<CommunityFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const tickRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let visibilityHandler: (() => void) | null = null;

    async function fetchOnce() {
      if (cancelled) return;
      const token = getAccessToken();
      if ((tab === "following" || tab === "saved") && !token) {
        setFeed({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
        setError("Hãy đăng nhập để xem nội dung cá nhân của bạn.");
        setLoading(false);
        return;
      }

      const path = token
        ? `/community/feed?tab=${tab}`
        : `/community/posts?tab=${tab}`;
      const tick = ++tickRef.current;

      try {
        const data = await apiClient.get<CommunityFeed>(
          path,
          token ? { token } : undefined,
        );
        if (cancelled || tick !== tickRef.current) return;
        setFeed((prev) => mergeFeed(prev, data, pendingReactionIds));
        setError("");
      } catch (value) {
        if (cancelled || tick !== tickRef.current) return;
        const status = (value as { status?: number }).status;
        if (status === 401) {
          setFeed({
            items: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          });
          setError(
            "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại để tương tác.",
          );
        } else if (status === 429) {
          // back off on rate limit
        } else {
          setError((prev) => (prev ? prev : "Chưa thể làm mới diễn đàn."));
        }
      } finally {
        if (!cancelled && tick === tickRef.current) setLoading(false);
      }
    }

    function schedule() {
      if (cancelled) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        const hidden = pauseWhenHidden && document.hidden;
        if (!hidden && !hasUnsavedDraft) {
          await fetchOnce();
        }
        schedule();
      }, intervalMs);
    }

    void fetchOnce().finally(schedule);

    if (pauseWhenHidden && typeof document !== "undefined") {
      visibilityHandler = () => {
        if (!document.hidden) {
          // immediate refresh when user returns to the tab
          void fetchOnce();
        }
      };
      document.addEventListener("visibilitychange", visibilityHandler);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (visibilityHandler && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
    };
    // We intentionally do not depend on `pendingReactionIds`/`hasUnsavedDraft` —
    // refs are read at call-time so the interval keeps running with the latest values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, intervalMs, pauseWhenHidden]);

  return { feed, setFeed, loading, error, setError };
}

/**
 * Lighter-weight poll used inside the comment modal so the conversation
 * updates without forcing a full feed re-fetch.
 */
export function usePostCommentsPoll(
  postId: string | null,
  token: string | null,
  intervalMs = 6000,
) {
  const [comments, setComments] = useState<unknown[]>([]);
  const [count, setCount] = useState(0);
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function fetchComments() {
      if (cancelled) return;
      try {
        const data = await apiClient.get<{
          items?: unknown[];
          comments?: unknown[];
          total?: number;
          commentCount?: number;
        }>(
          `/community/posts/${postId}/comments`,
          token ? { token } : undefined,
        );
        if (cancelled) return;
        const list =
          (Array.isArray(data?.items) && data.items) ||
          (Array.isArray(data?.comments) && data.comments) ||
          [];
        setComments(list);
        const total = data?.total ?? data?.commentCount ?? list.length;
        setCount(typeof total === "number" ? total : 0);
        const newest = (list[list.length - 1] as { _id?: string } | undefined)?._id;
        if (newest) lastIdRef.current = newest;
      } catch {
        /* swallow — non-critical */
      } finally {
        if (!cancelled && timer === null) {
          const hidden = typeof document !== "undefined" && document.hidden;
          if (!hidden) {
            timer = setTimeout(fetchComments, intervalMs);
          } else {
            timer = setTimeout(fetchComments, intervalMs);
          }
        }
      }
    }

    void fetchComments();

    const onVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        void fetchComments();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [postId, token, intervalMs]);

  return { comments, count };
}

export type { CommunityFeed, CommunityPost, ReactionType };
