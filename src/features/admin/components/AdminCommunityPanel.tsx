"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, MessageSquare, Search } from "lucide-react";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";

type Post = {
  _id: string;
  description: string;
  userId?: { fullName?: string } | null;
  roomType: string;
  isPublished: boolean;
  createdAt?: string;
  media: { url: string; type: string }[];
  commentCount: number;
  reactionCount: number;
};
type Result = { items: Post[]; total: number; totalPages: number };
const base = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(
  /\/$/,
  "",
);

async function read(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : response.status === 403
          ? "Tài khoản không có quyền quản lý diễn đàn."
          : (body?.message ?? "Không thể tải dữ liệu. Vui lòng thử lại."),
    );
  return body;
}

export default function AdminCommunityPanel() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState({ q: "", status: "all", page: 1 });
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const lock = useRef(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          q: filter.q,
          status: filter.status,
          page: String(filter.page),
        });
        const data: Result = await read(
          await authenticatedFetch(`${base}/community/admin/posts?${params}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
        );
        if (!controller.signal.aborted) {
          if (filter.page > 1 && !data.items.length)
            setFilter((current) => ({
              ...current,
              page: Math.max(1, data.totalPages),
            }));
          else setResult(data);
        }
      } catch (value) {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(
            value instanceof Error
              ? value.message
              : "Không thể kết nối máy chủ.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filter, revision]);

  function search(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFilter((current) => ({ ...current, q: query.trim(), page: 1 }));
  }

  async function toggle(post: Post) {
    if (lock.current) return;
    if (
      !window.confirm(
        post.isPublished
          ? "Ẩn bài viết này khỏi diễn đàn? Bạn có thể hiển thị lại sau."
          : "Hiển thị lại bài viết này trên diễn đàn?",
      )
    )
      return;
    lock.current = true;
    setBusy(post._id);
    setError("");
    try {
      await read(
        await authenticatedFetch(
          `${base}/community/admin/posts/${encodeURIComponent(post._id)}/visibility`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublished: !post.isPublished }),
          },
        ),
      );
      setLoading(true);
      setRevision((current) => current + 1);
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Không thể cập nhật bài viết.",
      );
    } finally {
      lock.current = false;
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý diễn đàn</h1>
          <p className="mt-2 text-sm text-[#68756a]">
            Xem bài viết và quản lý nội dung hiển thị trong cộng đồng.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-[#dce4d8] bg-white px-4 py-2 text-sm">
          <MessageSquare size={16} />
          {loading
            ? "Đang tải…"
            : result
              ? `${result.total} bài viết phù hợp`
              : "Chưa tải được dữ liệu"}
        </span>
      </div>
      <form
        onSubmit={search}
        className="flex flex-wrap gap-3 rounded-2xl border border-[#e2ded3] bg-white p-4"
      >
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#deded4] px-3">
          <Search size={18} className="shrink-0" />
          <input
            aria-label="Tìm bài viết"
            className="min-w-0 w-full bg-transparent py-3 text-sm outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nội dung, hashtag, loại phòng hoặc mã bài…"
          />
        </label>
        <select
          aria-label="Trạng thái bài viết"
          className="rounded-xl border border-[#deded4] bg-white px-3 py-3 text-sm"
          value={filter.status}
          onChange={(event) => {
            setLoading(true);
            setFilter((current) => ({
              ...current,
              status: event.target.value,
              page: 1,
            }));
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[#2e6f5e] px-5 py-3 text-sm font-semibold text-white"
        >
          Tìm kiếm
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setRevision((current) => current + 1);
          }}
          className="rounded-xl border px-4 py-3 text-sm disabled:opacity-50"
        >
          Tải lại
        </button>
      </form>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="py-12 text-center text-sm">
          Đang tải bài viết…
        </p>
      ) : (
        result && (
          <>
            {result.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
                Không có bài viết phù hợp.
              </div>
            ) : (
              <div className="space-y-4">
                {result.items.map((post) => (
                  <article
                    key={post._id}
                    className="rounded-2xl border border-[#e2ded3] bg-white p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="font-bold">
                          {post.userId?.fullName ||
                            "Người dùng không còn tồn tại"}
                        </h2>
                        <p className="mt-1 text-xs text-[#6a756c]">
                          {post.roomType} ·{" "}
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "Chưa có ngày đăng"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${post.isPublished ? "bg-[#edf4e9] text-[#2e6f5e]" : "bg-amber-50 text-amber-800"}`}
                      >
                        {post.isPublished ? "Đang hiển thị" : "Đã ẩn"}
                      </span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">
                      {post.description}
                    </p>
                    {post.media.length > 0 && (
                      <details className="mt-3 text-sm">
                        <summary className="w-fit cursor-pointer font-semibold text-[#2e6f5e]">
                          Xem {post.media.length} ảnh / video đính kèm
                        </summary>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {post.media.map((media, index) =>
                            /^https?:\/\//i.test(media.url) ? (
                              <a
                                key={index}
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border px-4 py-2 underline"
                              >
                                {media.type === "video" ? "Video" : "Ảnh"}{" "}
                                {index + 1} ↗
                              </a>
                            ) : null,
                          )}
                        </div>
                      </details>
                    )}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeee7] pt-4">
                      <span className="text-xs text-[#6a756c]">
                        {post.commentCount} bình luận · {post.reactionCount}{" "}
                        biểu cảm
                      </span>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void toggle(post)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#dce4d8] px-4 py-2 text-sm font-semibold text-[#2e6f5e] hover:bg-[#f1f5ed] disabled:opacity-50"
                      >
                        {post.isPublished ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                        {busy === post._id
                          ? "Đang cập nhật…"
                          : post.isPublished
                            ? "Ẩn bài viết"
                            : "Hiển thị lại"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-4 text-sm">
              <button
                disabled={filter.page <= 1}
                onClick={() => {
                  setLoading(true);
                  setFilter((current) => ({
                    ...current,
                    page: current.page - 1,
                  }));
                }}
                className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
              >
                Trước
              </button>
              <span>
                Trang {filter.page} / {Math.max(1, result.totalPages)}
              </span>
              <button
                disabled={filter.page >= result.totalPages}
                onClick={() => {
                  setLoading(true);
                  setFilter((current) => ({
                    ...current,
                    page: current.page + 1,
                  }));
                }}
                className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
}
