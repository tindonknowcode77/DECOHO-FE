"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { X, Send, Loader2, Trash2, MessageCircle } from "lucide-react";
import { ApiError, apiClient } from "@/src/services/axios";
import { getAccessToken } from "@/src/features/auth/services/session";
import type { CommunityComment, CommunityPost, CommunityUser } from "../types";

type CommentsPage = {
  items: CommunityComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Props = {
  post: CommunityPost;
  onClose: () => void;
  onCommentAdded: (postId: string, newTotal: number) => void;
};

export default function CommentModal({ post, onClose, onCommentAdded }: Props) {
  const [page, setPage] = useState<CommentsPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const token = typeof window === "undefined" ? null : getAccessToken();

  async function load(targetPage: number) {
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.get<CommentsPage>(
        `/community/posts/${post._id}/comments?page=${targetPage}&limit=20`,
        token ? { token } : undefined,
      );
      setPage(result);
      setCurrentPage(result.page);
    } catch (value) {
      const msg =
        value instanceof ApiError
          ? value.message
          : value instanceof Error
            ? value.message
            : "Không thể tải bình luận.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post._id]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("Bạn cần đăng nhập để bình luận.");
      return;
    }
    const content = draft.trim();
    if (!content) return;
    setSubmitting(true);
    setError("");
    try {
      await apiClient.post(`/community/posts/${post._id}/comments`, { content }, { token });
      setDraft("");
      await load(1);
      const newTotal = (page?.total ?? post.commentCount) + 1;
      onCommentAdded(post._id, newTotal);
    } catch (value) {
      const msg =
        value instanceof ApiError
          ? value.message
          : value instanceof Error
            ? value.message
            : "Không thể gửi bình luận.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const totalLabel = useMemo(() => {
    const total = page?.total ?? post.commentCount;
    return `${total} bình luận`;
  }, [page?.total, post.commentCount]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[80vh] sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-slate-600" />
            <h2 className="text-base font-semibold text-slate-900">{totalLabel}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && !page ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="mr-2 animate-spin" size={18} />
              Đang tải bình luận...
            </div>
          ) : page && page.items.length > 0 ? (
            <ul className="space-y-4">
              {page.items.map((comment) => (
                <CommentItem key={comment._id} comment={comment} />
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {page && page.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => void load(currentPage - 1)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-xs text-slate-500">
                Trang {currentPage}/{page.totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= page.totalPages || loading}
                onClick={() => void load(currentPage + 1)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        <form
          onSubmit={submit}
          className="shrink-0 border-t border-slate-200 bg-white px-5 py-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={token ? "Viết bình luận..." : "Đăng nhập để bình luận"}
              disabled={!token || submitting}
              rows={2}
              maxLength={1000}
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit(e as unknown as FormEvent);
                }
              }}
            />
            <button
              type="submit"
              disabled={!token || submitting || !draft.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Gửi bình luận"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: CommunityComment }) {
  const author: CommunityUser | undefined = comment.userId;
  const avatarUrl = typeof author?.avatar === "string" ? author.avatar : author?.avatar?.secureUrl;
  const initials = (author?.fullName ?? "U").trim().slice(0, 1).toUpperCase();
  return (
    <li className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={author?.fullName ?? "Người dùng"} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <div className="text-sm font-semibold text-slate-900">
            {author?.fullName ?? "Người dùng"}
          </div>
          <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{comment.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 px-2 text-xs text-slate-500">
          <time dateTime={comment.createdAt}>
            {new Date(comment.createdAt).toLocaleString("vi-VN")}
          </time>
          <button
            type="button"
            className="rounded-full px-1 text-slate-500 transition hover:text-sky-600"
            aria-label="Thích bình luận"
          >
            Thích
          </button>
          <button
            type="button"
            className="rounded-full px-1 text-slate-500 transition hover:text-red-600"
            aria-label="Xóa bình luận"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </li>
  );
}
