"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  getSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";

export default function DeletePostButton({
  postId,
  authorId,
  onDeleted,
}: {
  postId: string;
  authorId: string;
  onDeleted: () => void;
}) {
  const [userId, setUserId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => setUserId(getSessionUser()?._id), 0);
    const unsubscribe = subscribeSessionUser((user) => setUserId(user?._id));
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
  if (!userId || userId !== authorId) return null;
  async function remove() {
    if (lock.current || getSessionUser()?._id !== authorId) return;
    if (
      !window.confirm(
        "Xóa bài viết này? Bài viết và các bình luận sẽ bị xóa và không thể khôi phục.",
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(
        /\/$/,
        "",
      );
      const response = await authenticatedFetch(
        `${base}/community/posts/${encodeURIComponent(postId)}`,
        { method: "DELETE" },
      );
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "Vui lòng đăng nhập lại để xóa bài viết."
            : response.status === 403 || response.status === 404
              ? "Không thể xóa: bài không tồn tại hoặc không thuộc tài khoản của bạn."
              : "Chưa xóa được bài viết. Vui lòng thử lại.",
        );
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa xóa được bài viết.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="ml-auto max-w-52 text-right">
      <button
        type="button"
        aria-label="Xóa bài viết của tôi"
        disabled={busy}
        onClick={() => void remove()}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-[#977469] hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 size={15} />
        {busy ? "Đang xóa…" : "Xóa bài"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
