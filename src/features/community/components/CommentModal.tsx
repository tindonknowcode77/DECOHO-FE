"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Heart, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { apiClient } from "@/src/services/axios";
import { getAccessToken } from "@/src/features/auth/services/session";
import {
  REACTION_META,
  type CommunityComment,
  type CommunityPost,
  type ReactionType,
} from "../types";
import {
  communityError,
  formatCommunityDate,
  normalizeComment,
} from "../services/community-data";
import CommunityDialog from "./CommunityDialog";
import CommunityAvatar from "./CommunityAvatar";
import ReactionPicker from "./ReactionPicker";

export default function CommentModal({
  post,
  onClose,
  onCommentAdded,
}: {
  post: CommunityPost;
  onClose: () => void;
  onCommentAdded: (
    id: string,
    total: number,
    comment: CommunityComment,
  ) => void;
}) {
  const token = getAccessToken();
  const [comments, setComments] = useState<CommunityComment[]>(
    post.comments.filter((c) => !c.parentId),
  );
  const [total, setTotal] = useState(post.commentCount);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(!!token);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState<CommunityComment | null>(null);
  const [replies, setReplies] = useState<Record<string, CommunityComment[]>>(
    {},
  );
  const [replyPages, setReplyPages] = useState<Record<string, number>>({});
  const [replyHasMore, setReplyHasMore] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<Set<string>>(new Set());
  const locks = useRef(new Set<string>());
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    apiClient
      .get<{ items: unknown[]; total: number; totalPages: number }>(
        `/community/posts/${post._id}/comments?page=${page}&limit=20`,
        { token, signal: controller.signal },
      )
      .then((data) => {
        if (controller.signal.aborted) return;
        const incoming = (Array.isArray(data.items) ? data.items : [])
          .map(normalizeComment)
          .filter((c) => c._id);
        setComments((old) =>
          page === 1
            ? incoming
            : Array.from(
                new Map([...old, ...incoming].map((c) => [c._id, c])).values(),
              ),
        );
        setTotal(data.total);
        setPages(data.totalPages);
        setError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            communityError(error, "Chưa tải được bình luận. Hãy thử lại."),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [post._id, token, page, revision]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!token || !content || locks.current.has("send") || loading) return;
    locks.current.add("send");
    setBusy(true);
    setError("");
    try {
      const result = normalizeComment(
        await apiClient.post(
          `/community/posts/${post._id}/comments`,
          { content, ...(replyTo ? { parentId: replyTo._id } : {}) },
          { token },
        ),
      );
      if (!result._id) throw new Error("Invalid comment response");
      if (replyTo) {
        setReplies((old) => ({
          ...old,
          [replyTo._id]: [...(old[replyTo._id] ?? []), result],
        }));
        setComments((old) =>
          old.map((c) =>
            c._id === replyTo._id
              ? { ...c, replyCount: (c.replyCount ?? 0) + 1 }
              : c,
          ),
        );
      } else {
        setComments((old) => [result, ...old]);
        setTotal((old) => old + 1);
      }
      onCommentAdded(post._id, total + 1, result);
      setDraft("");
      setReplyTo(null);
    } catch (error) {
      setError(
        communityError(
          error,
          "Chưa gửi được bình luận. Nội dung vẫn được giữ lại để bạn thử lại.",
        ),
      );
    } finally {
      locks.current.delete("send");
      setBusy(false);
    }
  }

  async function react(comment: CommunityComment, type: ReactionType) {
    if (!token || loading || locks.current.has(comment._id)) return;
    locks.current.add(comment._id);
    setPending(new Set(locks.current));
    try {
      const result = await apiClient.post<{
        myType: ReactionType | null;
        counts: Partial<Record<ReactionType, number>>;
        total: number;
      }>(
        `/community/posts/${post._id}/comments/${comment._id}/react`,
        { type },
        { token },
      );
      const update = (c: CommunityComment) =>
        c._id === comment._id
          ? {
              ...c,
              myReaction: result.myType,
              reactionCounts: result.counts,
              reactionTotal: result.total,
            }
          : c;
      setComments((old) => old.map(update));
      setReplies((old) =>
        Object.fromEntries(
          Object.entries(old).map(([id, list]) => [id, list.map(update)]),
        ),
      );
    } catch (error) {
      setError(
        communityError(error, "Chưa cập nhật được cảm xúc. Hãy thử lại."),
      );
    } finally {
      locks.current.delete(comment._id);
      setPending(new Set(locks.current));
    }
  }

  async function loadReplies(comment: CommunityComment) {
    const key = `replies:${comment._id}`;
    if (!token || locks.current.has(key)) return;
    locks.current.add(key);
    setPending(new Set(locks.current));
    const nextPage = (replyPages[comment._id] ?? 0) + 1;
    try {
      const data = await apiClient.get<{
        items: unknown[];
        totalPages: number;
      }>(
        `/community/posts/${post._id}/comments?parentId=${comment._id}&page=${nextPage}&limit=20`,
        { token },
      );
      const incoming = (Array.isArray(data.items) ? data.items : []).map(
        normalizeComment,
      );
      setReplies((old) => ({
        ...old,
        [comment._id]: Array.from(
          new Map(
            [...(old[comment._id] ?? []), ...incoming].map((c) => [c._id, c]),
          ).values(),
        ),
      }));
      setReplyPages((old) => ({ ...old, [comment._id]: nextPage }));
      setReplyHasMore((old) => ({
        ...old,
        [comment._id]: nextPage < data.totalPages,
      }));
    } catch (error) {
      setError(
        communityError(error, "Chưa tải được câu trả lời. Hãy thử lại."),
      );
    } finally {
      locks.current.delete(key);
      setPending(new Set(locks.current));
    }
  }

  function renderComment(comment: CommunityComment, nested = false) {
    return (
      <div key={comment._id} className="flex min-w-0 gap-3">
        <CommunityAvatar user={comment.userId} size={nested ? 28 : 34} />
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-[#f0f2e9] px-4 py-3">
            <p className="text-xs font-semibold">{comment.userId.fullName}</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#65705c]">
              {comment.content}
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#8a917f]">
            <span>{formatCommunityDate(comment.createdAt)}</span>
            {token && (
              <ReactionPicker
                busy={loading || pending.has(comment._id)}
                myReaction={comment.myReaction ?? null}
                onPick={(type) => void react(comment, type)}
              >
                <span>
                  {comment.myReaction ? (
                    REACTION_META[comment.myReaction].emoji
                  ) : (
                    <Heart size={13} />
                  )}
                </span>
                <span className="text-xs">
                  {comment.reactionTotal || "Thích"}
                </span>
              </ReactionPicker>
            )}
            {token && !nested && (
              <button
                disabled={busy}
                onClick={() => {
                  setReplyTo(comment);
                  textarea.current?.focus();
                }}
                className="text-xs font-medium"
              >
                Trả lời
              </button>
            )}
          </div>
          {!nested &&
            (comment.replyCount ?? 0) > 0 &&
            (!replyPages[comment._id] || replyHasMore[comment._id]) && (
              <button
                disabled={pending.has(`replies:${comment._id}`)}
                onClick={() => void loadReplies(comment)}
                className="my-2 text-xs font-semibold text-[#477452]"
              >
                {pending.has(`replies:${comment._id}`)
                  ? "Đang tải…"
                  : replyPages[comment._id]
                    ? "Xem thêm trả lời"
                    : `Xem ${comment.replyCount} câu trả lời`}
              </button>
            )}
          {!nested && (
            <div className="mt-2 space-y-3">
              {(replies[comment._id] ?? []).map((reply) =>
                renderComment(reply, true),
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <CommunityDialog title="Cùng trò chuyện" onClose={onClose} busy={busy}>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-5 border-b border-[#e5e8dc] pb-5">
          <div className="flex items-center gap-3">
            <CommunityAvatar user={post.userId} />
            <div>
              <p className="text-sm font-semibold">{post.userId.fullName}</p>
              <p className="mt-1 text-xs text-[#8b9380]">{post.roomType}</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#73806a]">
            {post.description}
          </p>
        </div>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
            <button
              disabled={busy || pending.size > 0 || loading}
              onClick={() => {
                setLoading(true);
                setRevision((v) => v + 1);
              }}
              className="ml-2 underline"
            >
              Tải lại
            </button>
          </div>
        )}
        {loading && (
          <p role="status" className="mb-4 text-xs text-[#7c8573]">
            Đang tải bình luận…
          </p>
        )}
        {!loading && !comments.length && (
          <div className="py-9 text-center">
            <MessageCircle size={30} className="mx-auto text-[#8fa379]" />
            <p className="mt-3 text-sm text-[#7c8573]">
              Hãy bắt đầu cuộc trò chuyện bằng một lời chia sẻ.
            </p>
          </div>
        )}
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
        {token && page < pages && (
          <button
            disabled={loading || busy || pending.size > 0}
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
            className="mt-5 w-full text-sm font-semibold text-[#527b54]"
          >
            Xem thêm bình luận
          </button>
        )}
      </div>
      {token ? (
        <form
          onSubmit={submit}
          className="shrink-0 border-t border-[#e5e8dc] bg-white p-4 sm:px-6"
        >
          {replyTo && (
            <div className="mb-2 flex items-center justify-between text-xs text-[#6b7c5d]">
              Đang trả lời {replyTo.userId.fullName}
              <button
                type="button"
                aria-label="Hủy trả lời"
                disabled={busy}
                onClick={() => setReplyTo(null)}
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textarea}
              aria-label="Nhập bình luận"
              placeholder="Chia sẻ suy nghĩ của bạn…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={busy}
              maxLength={1000}
              rows={2}
              className="min-w-0 flex-1 resize-none rounded-xl border border-[#dce2d3] bg-[#f8f9f4] p-3 text-sm outline-none focus:border-[#6c946a]"
            />
            <button
              aria-label="Gửi bình luận"
              type="submit"
              disabled={busy || loading || !draft.trim()}
              className="rounded-full bg-[#2f6f5e] p-3 text-white disabled:opacity-40"
            >
              {busy ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="mt-2 text-right text-[10px] text-[#8a937f]">
            {draft.length}/1000
          </p>
        </form>
      ) : (
        <div className="border-t border-[#e5e8dc] p-5 text-center text-sm">
          <Link
            href="/login"
            className="font-semibold text-[#3b7756] underline"
          >
            Đăng nhập
          </Link>{" "}
          để xem đầy đủ và tham gia trò chuyện.
        </div>
      )}
    </CommunityDialog>
  );
}
