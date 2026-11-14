"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  Pause,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { getAccessToken, getSessionUser } from "@/src/features/auth/services/session";
import CommunityAvatar from "./CommunityAvatar";

export type CommunityStoryItem = {
  _id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
  viewedByMe: boolean;
};

export type CommunityStoryGroup = {
  user: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  hasUnseen: boolean;
  latestAt: string;
  stories: CommunityStoryItem[];
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function formatStoryTime(iso: string) {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour} giờ trước`;
}

export default function CommunityStoriesBar() {
  const session = getSessionUser();
  const [groups, setGroups] = useState<CommunityStoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Create story modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedPreview, setPickedPreview] = useState("");
  const [pickedType, setPickedType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Story viewer state
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number | null>(null);
  const [viewerStoryIndex, setViewerStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const loadStories = useCallback(async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${getApiBaseUrl()}/community/stories`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { groups?: CommunityStoryGroup[] };
      setGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  const activeGroup = viewerGroupIndex !== null ? groups[viewerGroupIndex] : undefined;
  const activeStory = activeGroup?.stories[viewerStoryIndex];

  const markStorySeen = useCallback((storyId: string) => {
    const token = getAccessToken();
    if (!token) return;
    void fetch(`${getApiBaseUrl()}/community/stories/${encodeURIComponent(storyId)}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, []);

  const goNextStory = useCallback(() => {
    if (viewerGroupIndex === null || !activeGroup) return;
    if (viewerStoryIndex < activeGroup.stories.length - 1) {
      setViewerStoryIndex((i) => i + 1);
      setProgress(0);
      return;
    }
    if (viewerGroupIndex < groups.length - 1) {
      setViewerGroupIndex((g) => (g !== null ? g + 1 : null));
      setViewerStoryIndex(0);
      setProgress(0);
      return;
    }
    setViewerGroupIndex(null);
  }, [viewerGroupIndex, activeGroup, viewerStoryIndex, groups.length]);

  const goPrevStory = useCallback(() => {
    if (viewerGroupIndex === null) return;
    if (viewerStoryIndex > 0) {
      setViewerStoryIndex((i) => i - 1);
      setProgress(0);
      return;
    }
    if (viewerGroupIndex > 0) {
      const prevGroup = groups[viewerGroupIndex - 1];
      setViewerGroupIndex(viewerGroupIndex - 1);
      setViewerStoryIndex(Math.max(0, prevGroup.stories.length - 1));
      setProgress(0);
    }
  }, [viewerGroupIndex, viewerStoryIndex, groups]);

  useEffect(() => {
    if (!activeStory) return;
    markStorySeen(activeStory._id);
    if (activeStory.mediaType === "video" || paused) return;

    setProgress(0);
    const start = Date.now();
    const duration = 5000;
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        goNextStory();
      }
    }, 50);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [activeStory, paused, goNextStory, markStorySeen]);

  const handlePickFile = (file: File | null) => {
    if (!file) return;
    setCreateError("");
    const isVideo = file.type.startsWith("video/");
    const maxBytes = (isVideo ? 50 : 10) * 1024 * 1024;
    if (file.size > maxBytes) {
      setCreateError(isVideo ? "Video tối đa 50MB." : "Ảnh tối đa 10MB.");
      return;
    }
    if (pickedPreview) URL.revokeObjectURL(pickedPreview);
    setPickedFile(file);
    setPickedType(isVideo ? "video" : "image");
    setPickedPreview(URL.createObjectURL(file));
  };

  const handleCreateStory = async () => {
    const token = getAccessToken();
    if (!token) {
      setCreateError("Vui lòng đăng nhập để đăng tin Story.");
      return;
    }
    if (!pickedFile) {
      setCreateError("Vui lòng chọn một ảnh hoặc video.");
      return;
    }
    setUploading(true);
    setCreateError("");
    try {
      const formData = new FormData();
      formData.append("media", pickedFile);
      if (caption.trim()) formData.append("caption", caption.trim());

      const res = await fetch(`${getApiBaseUrl()}/community/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Không thể đăng tin lúc này.");
      }

      if (pickedPreview) URL.revokeObjectURL(pickedPreview);
      setPickedFile(null);
      setPickedPreview("");
      setCaption("");
      setCreateOpen(false);
      await loadStories();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Đăng tin thất bại.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    const token = getAccessToken();
    if (!token) return;
    const res = await fetch(`${getApiBaseUrl()}/community/stories/${encodeURIComponent(storyId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setViewerGroupIndex(null);
      await loadStories();
    }
  };

  return (
    <>
      <section className="mx-auto max-w-[1320px] px-4 pb-6 pt-6 sm:px-8 sm:pt-8" aria-label="Tin cộng đồng">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {/* Thẻ Tạo tin giống Facebook */}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="group relative flex h-48 w-[124px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#ded6c9] bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md sm:h-52 sm:w-[136px]"
          >
            <div className="relative flex-1 w-full overflow-hidden bg-[#eef3ec]">
              {session?.avatar ? (
                <img
                  src={session.avatar}
                  alt={session.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2f6f5e] to-[#4c8974] text-2xl font-bold text-white">
                  {(session?.name || "D").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="relative flex h-14 flex-col items-center justify-end bg-white pb-2.5 pt-4">
              <span className="absolute -top-4 grid h-8 w-8 place-items-center rounded-full border-[3px] border-white bg-[#2f6f5e] text-white shadow-sm transition group-hover:scale-110">
                <Plus size={16} strokeWidth={2.75} />
              </span>
              <span className="text-xs font-bold text-[#254f43]">Tạo tin</span>
            </div>
          </button>

          {/* Danh sách Story của cộng đồng */}
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 w-[124px] shrink-0 animate-pulse rounded-2xl bg-[#e9eae2] sm:h-52 sm:w-[136px]"
              />
            ))
          ) : (
            groups.map((group, idx) => {
              const latest = group.stories[group.stories.length - 1];
              const thumb = latest?.thumbnailUrl || latest?.mediaUrl;
              return (
                <button
                  key={group.user._id}
                  type="button"
                  onClick={() => {
                    setViewerGroupIndex(idx);
                    setViewerStoryIndex(0);
                    setPaused(false);
                    setProgress(0);
                  }}
                  className="group relative h-48 w-[124px] shrink-0 overflow-hidden rounded-2xl border border-[#ded6c9] bg-[#1f2e27] text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md sm:h-52 sm:w-[136px]"
                >
                  {latest?.mediaType === "video" && !latest.thumbnailUrl ? (
                    <video
                      src={latest.mediaUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={thumb}
                      alt={group.user.fullName}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />

                  <div
                    className={`absolute left-2.5 top-2.5 rounded-full p-0.5 ${
                      group.hasUnseen ? "bg-[#2f6f5e] ring-2 ring-[#7ad3b6]" : "bg-white/60"
                    }`}
                  >
                    <CommunityAvatar user={group.user} size={32} />
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="line-clamp-2 text-xs font-bold leading-4 text-white drop-shadow-xs">
                      {group.user.fullName}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Modal Đăng Story */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee7dc] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#254f43]">Tạo tin (Story 24 giờ)</h3>
                <p className="text-xs text-[#646a61]">Chia sẻ nhanh khoảnh khắc góc nhà của bạn</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl p-1.5 text-[#646a61] hover:bg-[#f2efe6]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {pickedPreview ? (
                <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black">
                  {pickedType === "video" ? (
                    <video src={pickedPreview} controls className="h-full w-full object-contain" />
                  ) : (
                    <img src={pickedPreview} alt="Preview story" className="h-full w-full object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(pickedPreview);
                      setPickedFile(null);
                      setPickedPreview("");
                    }}
                    className="absolute right-2.5 top-2.5 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#2f6f5e]/40 bg-[#f6faf7] p-6 text-center transition hover:bg-[#ebf4ee]">
                  <ImagePlus size={32} className="text-[#2f6f5e]" />
                  <p className="text-sm font-bold text-[#254f43]">Chọn ảnh hoặc video</p>
                  <p className="text-xs text-[#646a61]">JPG, PNG, WEBP (≤ 10MB) hoặc MP4, WEBM (≤ 50MB)</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}

              <input
                type="text"
                maxLength={300}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Viết chú thích ngắn cho tin của bạn (tùy chọn)..."
                className="h-11 w-full rounded-xl border border-[#ded6c9] bg-[#fcfaf6] px-3.5 text-sm text-[#254f43] outline-none focus:border-[#2f6f5e]"
              />

              {createError && (
                <p className="rounded-xl bg-[#fff1ee] px-3 py-2 text-xs font-semibold text-[#bc3d2b]">
                  {createError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setCreateOpen(false)}
                  className="h-10 rounded-xl border border-[#ded6c9] px-4 text-xs font-bold text-[#646a61] hover:bg-[#f2efe6]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={uploading || !pickedFile}
                  onClick={() => void handleCreateStory()}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2f6f5e] px-5 text-xs font-bold text-white hover:bg-[#25594b] disabled:opacity-60"
                >
                  {uploading && <LoaderCircle size={14} className="animate-spin" />}
                  <span>Đăng tin ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trình xem Story toàn màn hình kiểu Facebook */}
      {activeGroup && activeStory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-3 backdrop-blur-xs">
          <button
            type="button"
            aria-label="Đóng trình xem tin"
            onClick={() => setViewerGroupIndex(null)}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
          >
            <X size={22} />
          </button>

          <button
            type="button"
            aria-label="Tin trước"
            onClick={goPrevStory}
            className="hidden sm:grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white mr-4 hover:bg-white/25"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="relative flex h-[86vh] w-full max-w-[420px] flex-col overflow-hidden rounded-3xl bg-[#111915] shadow-2xl">
            {/* Thanh tiến trình các tin */}
            <div className="absolute left-3 right-3 top-3 z-20 flex gap-1.5">
              {activeGroup.stories.map((st, idx) => {
                const width =
                  idx < viewerStoryIndex
                    ? "100%"
                    : idx === viewerStoryIndex
                      ? activeStory.mediaType === "video"
                        ? "100%"
                        : `${progress}%`
                      : "0%";
                return (
                  <div key={st._id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                    <div className="h-full bg-white transition-all duration-75" style={{ width }} />
                  </div>
                );
              })}
            </div>

            {/* Header tác giả */}
            <div className="absolute left-3 right-3 top-6 z-20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CommunityAvatar user={activeGroup.user} size={36} />
                <div>
                  <p className="text-xs font-bold text-white">{activeGroup.user.fullName}</p>
                  <p className="text-[11px] text-white/75">{formatStoryTime(activeStory.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {activeStory.mediaType === "image" && (
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
                    title={paused ? "Tiếp tục" : "Tạm dừng"}
                  >
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                  </button>
                )}
                {session?._id && session._id === activeGroup.user._id && (
                  <button
                    type="button"
                    onClick={() => void handleDeleteStory(activeStory._id)}
                    className="rounded-full bg-black/40 p-1.5 text-white hover:bg-[#bc3d2b]"
                    title="Xóa tin này"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Media */}
            <div className="relative flex-1 flex items-center justify-center bg-black">
              {activeStory.mediaType === "video" ? (
                <video
                  key={activeStory._id}
                  src={activeStory.mediaUrl}
                  autoPlay
                  controls
                  playsInline
                  onEnded={goNextStory}
                  className="max-h-full w-full object-contain"
                />
              ) : (
                <img
                  key={activeStory._id}
                  src={activeStory.mediaUrl}
                  alt={activeStory.caption || "Story DECOHO"}
                  className="max-h-full w-full object-contain"
                />
              )}

              {/* Vùng chạm trái / phải */}
              {activeStory.mediaType === "image" && (
                <>
                  <button
                    type="button"
                    aria-label="Tin trước"
                    onClick={goPrevStory}
                    className="absolute inset-y-16 left-0 w-1/3"
                  />
                  <button
                    type="button"
                    aria-label="Tin tiếp theo"
                    onClick={goNextStory}
                    className="absolute inset-y-16 right-0 w-1/3"
                  />
                </>
              )}
            </div>

            {activeStory.caption && (
              <div className="bg-black/75 px-4 py-3 text-center text-xs leading-relaxed text-white">
                {activeStory.caption}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Tin tiếp theo"
            onClick={goNextStory}
            className="hidden sm:grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white ml-4 hover:bg-white/25"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </>
  );
}
