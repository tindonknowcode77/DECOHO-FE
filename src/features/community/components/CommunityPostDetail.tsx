"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import DeletePostButton from "./DeletePostButton";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { apiClient } from "@/src/services/axios";
import { getAccessToken } from "@/src/features/auth/services/session";
import type { CommunityPost } from "../types";
import {
  communityError,
  formatCommunityDate,
  normalizePost,
} from "../services/community-data";
import CommunityAvatar from "./CommunityAvatar";
import MediaGallery from "./MediaGallery";
import CommentModal from "./CommentModal";

export default function CommunityPostDetail({ id }: { id: string }) {
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [error, setError] = useState("");
  const [discussion, setDiscussion] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const token = getAccessToken();
    apiClient
      .get(`/community/posts/${id}`, {
        ...(token ? { token } : {}),
        signal: controller.signal,
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setPost(normalizePost(data));
          setError("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            communityError(error, "Chưa tải được bài viết. Vui lòng thử lại."),
          );
      });
    return () => controller.abort();
  }, [id, revision]);
  return (
    <main className="min-h-screen bg-[#f6f5f0] px-4 py-10 text-[#2d4938]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/community"
          className="mb-6 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Trở về diễn đàn
        </Link>
        {error ? (
          <div role="alert" className="rounded-2xl bg-white p-6">
            <p>{error}</p>
            <Link href="/login" className="mr-4 mt-4 inline-block underline">
              Đăng nhập
            </Link>
            <button
              onClick={() => {
                setError("");
                setRevision((v) => v + 1);
              }}
              className="underline"
            >
              Thử lại
            </button>
          </div>
        ) : !post ? (
          <p role="status">Đang tải bài viết…</p>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-[#e2e7da] bg-white">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <CommunityAvatar user={post.userId} />

                <div>
                  <h1 className="text-base font-semibold">
                    {post.userId.fullName}
                  </h1>
                  <p className="text-xs text-[#7c8770]">
                    {formatCommunityDate(post.createdAt)} · {post.roomType}
                  </p>
                </div>
                  <DeletePostButton
                    postId={post._id}
                    authorId={post.userId._id}
                    onDeleted={() => router.replace("/community")}
                  />
              </div>
              <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7">
                {post.description}
              </p>
            </div>
            <MediaGallery media={post.media} />
            <button
              onClick={() => setDiscussion(true)}
              className="m-5 inline-flex items-center gap-2 rounded-full bg-[#edf2e4] px-5 py-3 text-sm"
            >
              <MessageCircle size={17} />
              {post.commentCount} bình luận · Tham gia trò chuyện
            </button>
          </article>
        )}
      </div>
      {discussion && post && (
        <CommentModal
          post={post}
          onClose={() => setDiscussion(false)}
          onCommentAdded={(_, total, comment) =>
            setPost((old) =>
              old
                ? {
                    ...old,
                    commentCount: Math.max(old.commentCount + 1, total),
                    comments: [...old.comments, comment],
                  }
                : old,
            )
          }
        />
      )}
    </main>
  );
}
