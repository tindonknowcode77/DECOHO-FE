"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Heart,
  ImageIcon,
  ImagePlus,
  MessageCircle,
  Search,
  Send,
  Share2,
  ShoppingCart,
  Bell,
  Sparkles,
  TrendingUp,
  Users,
  ChevronDown,
  Star,
  Video,
  X,
} from "lucide-react";
import { ApiError, apiClient } from "@/src/services/axios";
import { clearSessionUser, getAccessToken, getSessionUser } from "@/src/features/auth/services/session";
import {
  REACTION_LIST,
  REACTION_META,
  type CommunityCreator,
  type CommunityFeed,
  type CommunityPost,
  type CommunityUser,
  type ReactionType,
} from "../types";
import MediaGallery from "./MediaGallery";
import ReactionPicker from "./ReactionPicker";
import CommentModal from "./CommentModal";

const tabs = [
  ["for-you", "Tất cả"], ["following", "Đang theo dõi"], ["trending", "Xu hướng"],
  ["saved", "Đã lưu"],
] as const;

function avatar(value?: CommunityUser["avatar"]) {
  return typeof value === "string" ? value : value?.secureUrl;
}

function Avatar({ user, size = 44 }: { user: Pick<CommunityUser, "fullName" | "avatar">; size?: number }) {
  const src = avatar(user.avatar);
  return src ? <Image alt={user.fullName} className="rounded-full object-cover" height={size} src={src} unoptimized width={size} /> :
    <span className="grid shrink-0 place-items-center rounded-full bg-[#dcebb2] font-bold text-[#42551f]" style={{ height: size, width: size }}>{user.fullName.slice(0, 2).toUpperCase()}</span>;
}

type PreviewItem = { file: File; preview: string; type: "image" | "video" };

function PublishModal({ close, onCreated }: { close: () => void; onCreated: (post: CommunityPost) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const next: PreviewItem[] = [];
    Array.from(list).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      next.push({
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    });
    setPreviews((old) => [...old, ...next].slice(0, 10));
  }

  function removePreview(index: number) {
    setPreviews((old) => {
      const item = old[index];
      if (item) URL.revokeObjectURL(item.preview);
      return old.filter((_, i) => i !== index);
    });
  }

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [previews]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return setError("Bạn cần đăng nhập để chia sẻ không gian.");
    if (!previews.length) return setError("Hãy chọn ít nhất 1 ảnh hoặc video.");
    const data = new FormData(event.currentTarget);
    previews.forEach((p) => data.append("files", p.file));
    setBusy(true); setError("");
    try {
      const newPost = await apiClient.post<CommunityPost>("/community/posts", data, { token });
      onCreated(newPost);
      close();
    } catch (value) {
      setError(value instanceof ApiError ? value.message : "Không thể đăng bài. Vui lòng thử lại.");
    } finally { setBusy(false); }
  }

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-[#2f6f5e]/55 p-4" onMouseDown={close}>
    <form className="w-full max-w-xl rounded-[28px] bg-[#fffdf8] p-6 shadow-2xl" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-accent text-lg text-[#718d34]">Chia sẻ cảm hứng ✦</p>
          <h2 className="text-3xl">Đăng không gian của bạn</h2>
        </div>
        <button aria-label="Đóng" onClick={close} type="button"><X /></button>
      </div>

      <textarea
        className="mt-5 min-h-28 w-full rounded-2xl border border-[#ddd2c2] bg-white p-4 outline-none focus:border-[#78953b]"
        maxLength={3000}
        name="description"
        placeholder="Kể câu chuyện không gian của bạn..."
        required
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input className="rounded-xl border border-[#ddd2c2] bg-white px-4 py-3" maxLength={60} name="roomType" placeholder="Loại phòng (Phòng khách...)" required />
        <input className="rounded-xl border border-[#ddd2c2] bg-white px-4 py-3" name="hashtags" placeholder="cozy, decor, tips" />
      </div>

      {/* Upload area */}
      <div
        className="mt-3 cursor-pointer rounded-2xl border-2 border-dashed border-[#a9b878] bg-[#f5f8e9] p-5 transition hover:border-[#78953b]"
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <div className="flex items-center gap-2 text-sm font-bold text-[#78953b]">
            <ImagePlus size={20} /> <Video size={20} />
          </div>
          <p className="text-sm font-bold text-[#42551f]">Kéo thả hoặc nhấp để chọn ảnh/video</p>
          <p className="text-xs text-[#7b8078]">Tối đa 10 file · Ảnh: JPEG/PNG/WEBP (10MB) · Video: MP4/WEBM/MOV (50MB)</p>
        </div>
        <input
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          className="sr-only"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          ref={fileInput}
          type="file"
        />
      </div>

      {/* Preview */}
      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((item, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-[#e8e1d4] bg-[#f7f3ec]">
              {item.type === "video" ? (
                <>
                  <video className="h-full w-full object-cover" src={item.preview} />
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">VIDEO</span>
                </>
              ) : (
                <Image alt={`Preview ${idx + 1}`} className="object-cover" fill sizes="120px" src={item.preview} unoptimized />
              )}
              <button
                aria-label="Xóa"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); removePreview(idx); }}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="mt-5 w-full rounded-xl bg-[#78953b] py-3 font-bold text-white disabled:opacity-60" disabled={busy}>
        {busy ? "Đang đăng..." : "Chia sẻ với diễn đàn"}
      </button>
    </form>
  </div>;
}

const featuredTopics = [
  { title: "Chọn sofa cho phòng khách nhỏ dưới 15m² thì chọn loại nào?", tag: "Hỏi đáp decor", image: "/images/product-space/urban-warmth.png", likes: 234, comments: 42, author: "Minh Anh" },
  { title: "Setup góc làm việc tại nhà 5m² với ngân sách 5 triệu", tag: "DIY", image: "/images/product-space/organic-calm.png", likes: 189, comments: 28, author: "Phong Trần" },
  { title: "Review thảm lau sàn bằng tre có đáng tiền không?", tag: "Review sản phẩm", image: "/images/product-space/soft-evening.png", likes: 156, comments: 35, author: "Ngọc Linh" },
  { title: "Màu sơn nào hợp với phòng ngủ hướng Tây?", tag: "Hỏi đáp decor", image: "/images/moodboards/contemporary-living-moodboard-v2.png", likes: 312, comments: 67, author: "Hà My" },
];

const trendingQuestions = [
  { title: "Chọn sofa cho phòng khách nhỏ dưới 15m² thì chọn loại nào?", time: "5 giờ trước", likes: 234 },
  { title: "Màu sơn nào hợp với phòng ngủ hướng Tây?", time: "1 ngày trước", likes: 312 },
  { title: "Có nên mua nệm online không?", time: "2 ngày trước", likes: 178 },
];

const inspirationImages = [
  "/images/decoho-home-interior-v2.png",
  "/images/product-space/organic-calm.png",
  "/images/product-space/urban-warmth.png",
  "/images/product-space/soft-evening.png",
  "/images/moodboards/contemporary-living-moodboard-v2.png",
  "/images/product-space/organic-calm.png",
];

const communityRules = [
  "Tôn trọng mọi người, không spam quảng cáo",
  "Chia sẻ thật, review có tâm",
  "Ghi nguồn khi dùng ảnh của người khác",
  "Hỏi đáp cụ thể, dễ hiểu",
];

export default function CommunityView() {
  const [tab, setTab] = useState("for-you");
  const [feed, setFeed] = useState<CommunityFeed | null>(null);
  const [creators, setCreators] = useState<CommunityCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [pendingReactions, setPendingReactions] = useState<Set<string>>(new Set());
  const [commentModalPost, setCommentModalPost] = useState<CommunityPost | null>(null);
  const token = typeof window === "undefined" ? null : getAccessToken();
  const session = typeof window === "undefined" ? null : getSessionUser();

  const load = useCallback(async () => {
    try {
      const path = token ? `/community/feed?tab=${tab}` : `/community/posts?tab=${tab}`;
      setFeed(await apiClient.get<CommunityFeed>(path, token ? { token } : undefined));
      setError("");
    } catch (value) {
      if (token && value instanceof ApiError && value.status === 401) {
        clearSessionUser();
        setFeed(tab === "following" || tab === "saved"
          ? { items: [], total: 0, page: 1, limit: 10, totalPages: 0 }
          : await apiClient.get<CommunityFeed>(`/community/posts?tab=${tab}`));
        setError("Phiên đăng nhập đã hết hạn. Bảng tin công khai vẫn được hiển thị; hãy đăng nhập lại để tương tác.");
      } else {
        setError((tab === "following" || tab === "saved") && !token ? "Hãy đăng nhập để xem nội dung cá nhân của bạn." : "Chưa thể tải bảng tin diễn đàn.");
      }
    }
    finally { setLoading(false); }
  }, [tab, token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if ((tab === "following" || tab === "saved") && !token) {
        setFeed({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
        setError("Hãy đăng nhập để xem nội dung cá nhân của bạn.");
        setLoading(false);
        return;
      }
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load, tab, token]);
  useEffect(() => { void apiClient.get<CommunityCreator[]>("/community/creators").then(setCreators).catch(() => setCreators([])); }, []);
  useEffect(() => {
    if (!token) return;
    void apiClient.get<{ userIds: string[] }>("/community/following", { token })
      .then(({ userIds }) => setFollowingIds(new Set(userIds)))
      .catch(() => setFollowingIds(new Set()));
  }, [token]);

  async function react(post: CommunityPost, type: ReactionType) {
    if (!token) return setError("Bạn cần đăng nhập để bày tỏ cảm xúc.");
    if (pendingReactions.has(post._id)) return;

    const previous = post;
    setPendingReactions((set) => {
      const next = new Set(set);
      next.add(post._id);
      return next;
    });

    // Optimistic update
    const prevMy = post.myReaction ?? null;
    const nextMy: ReactionType | null = prevMy === type ? null : type;
    const counts = { ...(post.reactionCounts ?? {}) } as Partial<Record<ReactionType, number>>;
    if (prevMy) {
      counts[prevMy] = Math.max(0, (counts[prevMy] ?? 1) - 1);
      if (counts[prevMy] === 0) delete counts[prevMy];
    }
    if (nextMy) {
      counts[nextMy] = (counts[nextMy] ?? 0) + 1;
    }
    const nextTotal = Object.values(counts).reduce((sum, v) => sum + (v ?? 0), 0);
    setFeed((old) => old ? {
      ...old,
      items: old.items.map((item) => item._id === post._id ? {
        ...item,
        myReaction: nextMy,
        reactionCounts: counts,
        reactionTotal: nextTotal,
        liked: nextMy === "like",
        likeCount: counts.like ?? item.likeCount,
      } : item),
    } : old);

    try {
      const result = await apiClient.post<{
        active: boolean;
        myType: ReactionType | null;
        counts: Partial<Record<ReactionType, number>>;
        total: number;
      }>(`/community/posts/${post._id}/react`, { type }, { token });
      setFeed((old) => old ? {
        ...old,
        items: old.items.map((item) => item._id === post._id ? {
          ...item,
          myReaction: result.myType,
          reactionCounts: result.counts,
          reactionTotal: result.total,
          liked: result.myType === "like",
          likeCount: result.counts.like ?? item.likeCount,
        } : item),
      } : old);
      setError("");
    } catch (value) {
      // Rollback
      setFeed((old) => old ? {
        ...old,
        items: old.items.map((item) => item._id === post._id ? previous : item),
      } : old);
      console.error("react failed", {
        postId: post._id,
        type,
        error: value instanceof Error
          ? { name: value.name, message: value.message, status: (value as { status?: number }).status }
          : value,
      });
      const msg = value instanceof ApiError
        ? `${value.status} - ${value.message}`
        : value instanceof Error
          ? value.message
          : "Không thể cập nhật cảm xúc. Vui lòng thử lại.";
      setError(`Lỗi cảm xúc: ${msg}`);
    } finally {
      setPendingReactions((set) => {
        const next = new Set(set);
        next.delete(post._id);
        return next;
      });
    }
  }

  async function toggleSave(post: CommunityPost) {
    if (!token) return setError("Bạn cần đăng nhập để thực hiện thao tác này.");
    try {
      const result = await apiClient.post<{ active: boolean }>(
        `/community/posts/${post._id}/save`,
        undefined,
        { token },
      );
      setFeed((old) => old ? {
        ...old,
        items: old.items.map((item) => item._id === post._id ? { ...item, saved: result.active } : item),
      } : old);
      setError("");
    } catch (value) {
      console.error("save failed", { postId: post._id, err: value });
      const msg = value instanceof ApiError
        ? `${value.status} - ${value.message}`
        : "Không thể lưu bài viết. Vui lòng thử lại.";
      setError(`Lỗi lưu: ${msg}`);
    }
  }

  async function submitComment(event: FormEvent, post: CommunityPost) {
    event.preventDefault();
    const content = comments[post._id]?.trim();
    if (!token) return setError("Bạn cần đăng nhập để bình luận.");
    if (!content) return;
    try {
      const newComment = await apiClient.post<{
        _id: string;
        content: string;
        createdAt: string;
        userId: CommunityUser;
      }>(`/community/posts/${post._id}/comments`, { content }, { token });
      setComments((old) => ({ ...old, [post._id]: "" }));
      setError("");
      setFeed((old) => old ? {
        ...old,
        items: old.items.map((item) => item._id === post._id ? {
          ...item,
          commentCount: item.commentCount + 1,
          comments: [...(item.comments ?? []), newComment],
        } : item),
      } : old);
      setCommentModalPost((current) => current && current._id === post._id ? {
        ...current,
        commentCount: current.commentCount + 1,
        comments: [...(current.comments ?? []), newComment],
      } : current);
    } catch (value) {
      console.error("submitComment failed", {
        postId: post._id,
        content,
        error: value instanceof Error
          ? { name: value.name, message: value.message, status: (value as { status?: number }).status }
          : value,
      });
      const msg = value instanceof ApiError
        ? `${value.status} - ${value.message}`
        : value instanceof Error
          ? value.message
          : "Không thể gửi bình luận. Vui lòng thử lại.";
      setError(`Lỗi bình luận: ${msg}`);
    }
  }

  async function follow(id: string) {
    if (!token) return setError("Bạn cần đăng nhập để theo dõi nhà sáng tạo.");
    try {
      // #region agent log
      fetch('http://127.0.0.1:7585/ingest/62ddf151-99e7-43e4-94fd-6eea656c826d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1552f3'},body:JSON.stringify({sessionId:'1552f3',location:'CommunityView.tsx:314',message:'FE follow() request',data:{targetId:id,hasToken:!!token},runId:'run1',hypothesisId:'FE_follow',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const result = await apiClient.post<{ following: boolean }>(`/community/users/${id}/follow`, undefined, { token });
      // #region agent log
      fetch('http://127.0.0.1:7585/ingest/62ddf151-99e7-43e4-94fd-6eea656c826d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1552f3'},body:JSON.stringify({sessionId:'1552f3',location:'CommunityView.tsx:320',message:'FE follow() response',data:{following:result?.following},runId:'run1',hypothesisId:'FE_follow',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setFollowingIds((old) => {
        const next = new Set(old);
        if (result.following) next.add(id);
        else next.delete(id);
        return next;
      });
      setFeed((old) => old ? { ...old, items: old.items
        .filter((post) => !(tab === "following" && post.userId._id === id && !result.following))
        .map((post) => post.userId._id === id ? { ...post, userId: { ...post.userId, following: result.following } } : post) } : old);
      setError("");
    } catch (value) {
      // #region agent log
      fetch('http://127.0.0.1:7585/ingest/62ddf151-99e7-43e4-94fd-6eea656c826d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1552f3'},body:JSON.stringify({sessionId:'1552f3',location:'CommunityView.tsx:333',message:'FE follow() THROW',data:{err:value instanceof Error ? value.message : String(value)},runId:'run1',hypothesisId:'FE_follow',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error("follow failed", { id, err: value });
      const msg = value instanceof ApiError
        ? `${value.status} - ${value.message}`
        : "Không thể cập nhật theo dõi. Vui lòng thử lại.";
      setError(`Lỗi theo dõi: ${msg}`);
    }
  }

  return <main className="min-h-screen bg-[#faf7f2] text-[#2f6f5e]">
    {error && (
      <div className="sticky top-0 z-40 mx-auto flex max-w-7xl items-center justify-between gap-3 border-b border-[#efb6aa] bg-[#fff3ef] px-5 py-3 text-sm text-[#a33f31] sm:px-8">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="font-bold">{error}</span>
        </div>
        <button aria-label="Đóng thông báo" className="rounded-full p-1 hover:bg-[#efb6aa]/50" onClick={() => setError("")}>
          <X className="h-4 w-4" />
        </button>
      </div>
    )}
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <Sparkles className="absolute -left-3 -top-3 h-5 w-5 text-[#c8e976]" />
            <h1 className="font-serif text-4xl font-bold leading-[1.05] sm:text-5xl">
              Diễn đàn cảm hứng cho ngôi nhà bạn
            </h1>
            <p className="mt-5 text-base leading-7 text-[#646a61]">
              Đặt câu hỏi, chia sẻ không gian sống, khoe thành quả decor và kết nối cùng nghệ nhân, nhà thiết kế cùng những người yêu cái đẹp trên khắp Việt Nam.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="rounded-full bg-[#2f6f5e] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f3431]" onClick={() => setModal(true)}>
                Tạo bài viết
              </button>
              <Link className="rounded-full border-2 border-[#2f6f5e] bg-white px-6 py-3 text-sm font-bold transition hover:bg-[#f7f3ec]" href="#feed">
                Khám phá Diễn đàn
              </Link>
            </div>
            <div className="absolute -right-2 top-10 text-[#f2c749]">
              <Star className="h-6 w-6 fill-current" />
            </div>
          </div>
          <div className="relative h-[420px]">
            <div className="absolute left-4 top-2 h-72 w-56 rotate-[-8deg] overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-xl">
              <Image alt="Không gian 1" className="object-cover" fill sizes="240px" src="/images/decoho-home-interior-v2.png" />
            </div>
            <div className="absolute right-2 top-12 h-56 w-44 rotate-[6deg] overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-xl">
              <Image alt="Không gian 2" className="object-cover" fill sizes="200px" src="/images/product-space/urban-warmth.png" />
            </div>
            <div className="absolute left-0 bottom-4 w-56 rounded-xl border border-[#e8e1d4] bg-white p-3 shadow-lg">
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[#f7f3ec]">
                  <Image alt="avatar" className="object-cover" height={32} src="/images/product-space/organic-calm.png" width={32} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">Minh Anh</p>
                  <p className="truncate text-xs text-[#646a61]">Góc chờ chill cùng mọi người đọc lúc nào?</p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-52 rounded-xl border border-[#e8e1d4] bg-white p-3 shadow-lg">
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[#f7f3ec]">
                  <Image alt="avatar" className="object-cover" height={32} src="/images/product-space/soft-evening.png" width={32} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">Phong Trần</p>
                  <p className="truncate text-xs text-[#646a61]">Mọi người đang tâm sự gì?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="overflow-x-auto">
          <div className="flex items-center gap-2 pb-2">
            {tabs.map(([key, label]) => (
              <button
                className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  tab === key ? "border-[#2f6f5e] bg-[#2f6f5e] text-white" : "border-[#e8e1d4] bg-white text-[#2f6f5e] hover:border-[#2f6f5e]"
                }`}
                key={key}
                onClick={() => { setLoading(true); setTab(key); }}
              >
                {label}
              </button>
            ))}
            <button className="ml-auto flex flex-shrink-0 items-center gap-1 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-sm font-medium hover:border-[#2f6f5e]">
              Mới nhất <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Featured Article + Create CTA */}
        <section className="rounded-2xl border border-[#e8e1d4] bg-[#f7f3ec] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-white">
                <Image alt="avatar" className="object-cover" height={48} src="/images/product-space/organic-calm.png" width={48} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">DECOHO Editorial</span>
                  <button className="rounded-full border border-[#2f6f5e] bg-white px-3 py-1 text-xs font-bold hover:bg-[#2f6f5e] hover:text-white">Theo dõi</button>
                </div>
                <p className="mt-1 text-xs text-[#646a61]">Cập nhật hôm qua</p>
              </div>
            </div>
            <div className="flex-1 lg:ml-4">
              <h2 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
                Tuần lễ Decor 2026: Hơn 50+ ý tưởng biến phòng trọ thành không gian sống đáng mơ ước
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#646a61]">
                Tổng hợp những mẹo decor thông minh, tiết kiệm và đầy cảm hứng từ chính những thành viên tích cực nhất của diễn đàn DECOHO...
              </p>
              <div className="mt-4 flex items-center gap-5 text-sm text-[#646a61]">
                <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> 1.2K</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> 234</span>
                <span className="flex items-center gap-1.5"><Bookmark className="h-4 w-4" /> 89</span>
              </div>
            </div>
            <button className="rounded-full bg-[#2f6f5e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#245a4a]" onClick={() => setModal(true)}>
              Tạo bài viết mới
            </button>
          </div>
        </section>

        {/* Featured Topics */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#c8e976]" />
              <h2 className="font-serif text-2xl font-bold">Thảo luận nổi bật</h2>
            </div>
            <Link className="text-sm font-bold text-[#2f6f5e] hover:underline" href="#">Xem tất cả →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTopics.map((topic, idx) => (
              <Link className="group overflow-hidden rounded-2xl border border-[#e8e1d4] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md" href="#" key={idx}>
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f3ec]">
                  <Image alt={topic.title} className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(min-width:1024px) 25vw,50vw" src={topic.image} />
                  <span className="absolute left-3 top-3 rounded-full bg-[#2f6f5e] px-2.5 py-1 text-[10px] font-bold text-white">{topic.tag}</span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug">{topic.title}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#646a61]">
                    <span>{topic.author}</span>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{topic.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{topic.comments}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Feed Section */}
        <section id="feed">
          <div className="mb-5 flex items-end justify-between border-b border-[#e8e1d4] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2f6f5e]" />
              <h2 className="font-serif text-2xl font-bold">Bài viết mới nhất</h2>
            </div>
            <Link className="text-sm font-bold text-[#2f6f5e] hover:underline" href="#">Xem thêm →</Link>
          </div>

          {error && <div className="mb-5 rounded-2xl border border-[#efb6aa] bg-[#fff3ef] p-4 text-[#a33f31]">{error}</div>}
          {loading && <div className="rounded-3xl border border-[#e2d8c9] bg-white p-12 text-center text-[#777d74]">Đang tải câu chuyện thật từ diễn đàn...</div>}
          {!loading && feed?.items.length === 0 && <div className="rounded-3xl border border-dashed border-[#cfc3b2] bg-white p-14 text-center"><Sparkles className="mx-auto text-[#78953b]" /><h2 className="mt-3 text-2xl">Chưa có bài viết trong mục này</h2><p className="mt-2 text-[#747970]">Hãy là người đầu tiên chia sẻ không gian của mình.</p></div>}

          <div className="space-y-6">
            {feed?.items.map((post) => <article className="overflow-hidden rounded-[26px] border border-[#e0d6c8] bg-white shadow-sm" key={post._id}>
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Avatar user={post.userId} />
                  <div>
                    <h2 className="font-sans text-base font-extrabold tracking-normal">{post.userId.fullName}</h2>
                    <p className="text-xs text-[#7b8078]">{post.userId.businessAddress || post.roomType} · {new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <button
                  className={`rounded-full border px-4 py-2 text-xs font-bold ${followingIds.has(post.userId._id) || post.userId.following ? "border-[#78953b] bg-[#eef5dc] text-[#526d21]" : session?._id === post.userId._id ? "cursor-not-allowed border-[#ccc] text-[#aaa]" : "border-[#cad6a8] text-[#66832d]"}`}
                  disabled={session?._id === post.userId._id}
                  onClick={() => session?._id !== post.userId._id && void follow(post.userId._id)}
                >
                  {session?._id === post.userId._id ? "Đây là bạn" : followingIds.has(post.userId._id) || post.userId.following ? "Đang theo dõi" : "+ Theo dõi"}
                </button>
              </div>

              <MediaGallery media={post.media} />

              <div className="p-5">
                <p className="leading-7 text-[#424740]">{post.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">{post.hashtags.map((tag) => <span className="text-sm font-semibold text-[#739137]" key={tag}>#{tag}</span>)}</div>
                <div className="mt-4 flex items-center gap-1 border-y border-[#eee7dc] py-2">
                  <ReactionPicker
                    myReaction={post.myReaction ?? null}
                    busy={pendingReactions.has(post._id)}
                    onPick={(type) => void react(post, type)}
                  >
                    <span className="flex items-center gap-2">
                      {post.myReaction ? (
                        <span className="text-lg leading-none">{REACTION_META[post.myReaction].emoji}</span>
                      ) : (
                        <Heart size={20} />
                      )}
                      {post.reactionTotal ?? post.likeCount}
                    </span>
                  </ReactionPicker>
                  <span className="flex items-center gap-2 px-3 text-sm text-[#626960]"><MessageCircle size={20} />{post.commentCount}</span>
                  <button aria-label="Chia sẻ" className="rounded-xl p-2 text-[#626960]"><Share2 size={20} /></button>
                  <button aria-label="Lưu bài" className={`ml-auto rounded-xl p-2 ${post.saved ? "text-[#78953b]" : "text-[#626960]"}`} onClick={() => void toggleSave(post)}>
                    <Bookmark fill={post.saved ? "currentColor" : "none"} size={20} />
                  </button>
                </div>
                {post.reactionTotal && post.reactionTotal > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#626960]">
                    <div className="flex -space-x-1.5">
                      {REACTION_LIST.filter((t) => (post.reactionCounts?.[t] ?? 0) > 0)
                        .slice(0, 6)
                        .map((t) => (
                          <span
                            className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-white text-base"
                            key={t}
                          >
                            {REACTION_META[t].emoji}
                          </span>
                        ))}
                    </div>
                    <span>
                      {post.reactionTotal} lượt cảm xúc
                    </span>
                  </div>
                )}
                {post.commentCount > post.comments.length ? (
                  <button
                    className="mt-3 text-xs font-semibold text-[#78953b] hover:underline"
                    onClick={() => setCommentModalPost(post)}
                    type="button"
                  >
                    Xem tất cả {post.commentCount} bình luận
                  </button>
                ) : null}
                {post.comments.slice(-2).map((comment) => <div className="mt-3 flex gap-2 text-sm" key={comment._id}>
                  <Avatar size={30} user={comment.userId} />
                  <p className="rounded-2xl bg-[#f6f2eb] px-3 py-2"><strong>{comment.userId.fullName}</strong> {comment.content}</p>
                </div>)}
                <button
                  className="mt-2 text-xs font-semibold text-[#78953b] hover:underline"
                  onClick={() => setCommentModalPost(post)}
                  type="button"
                >
                  {post.commentCount > post.comments.length
                    ? `Mở hộp thoại bình luận`
                    : "Mở hộp thoại bình luận"}
                </button>
                <form className="mt-4 flex gap-2" onSubmit={(event) => void submitComment(event, post)}>
                  <input className="min-w-0 flex-1 rounded-full border border-[#ddd4c7] bg-[#fbf9f5] px-4 py-2.5 text-sm outline-none focus:border-[#78953b]" onChange={(e) => setComments((old) => ({ ...old, [post._id]: e.target.value }))} placeholder={session ? `Bình luận với tên ${session.name}...` : "Đăng nhập để bình luận..."} value={comments[post._id] ?? ""} />
                  <button aria-label="Gửi bình luận" className="grid h-10 w-10 place-items-center rounded-full bg-[#78953b] text-white"><Send size={17} /></button>
                </form>
              </div>
            </article>)}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <section className="overflow-hidden rounded-2xl border border-[#e8e1d4] bg-gradient-to-br from-[#f7f3ec] to-[#f0e7d4] p-5">
          <div className="text-3xl">🌿</div>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#2f6f5e]">Thử thách tuần này</p>
          <h3 className="mt-2 font-serif text-xl font-bold leading-tight">Show us your cozy corner</h3>
          <p className="mt-2 text-sm text-[#646a61]">
            Chia sẻ góc nhỏ yêu thích nhất trong nhà bạn, nhận ngay voucher 200K từ DECOHO.
          </p>
          <button className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#2f6f5e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2f3431]" onClick={() => setModal(true)}>
            Tạo bài viết mới
          </button>
        </section>

        <section className="rounded-2xl border border-[#e8e1d4] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold">Thành viên nổi bật</h3>
            <Link className="text-xs font-bold text-[#2f6f5e] hover:underline" href="#">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {creators.length ? creators.slice(0, 4).map((creator) => <div className="flex items-center gap-3" key={creator.userId}>
              <Avatar user={{ fullName: creator.fullName, avatar: creator.avatar }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{creator.fullName}</p>
                <p className="text-xs text-[#7b8078]">{creator.posts} bài · {creator.likes} lượt thích</p>
              </div>
              <button
                className={`text-xs font-bold ${session?._id === creator.userId ? "text-[#aaa] cursor-not-allowed" : followingIds.has(creator.userId) ? "text-[#718d34]" : "text-[#2f6f5e]"}`}
                disabled={session?._id === creator.userId}
                onClick={() => session?._id !== creator.userId && void follow(creator.userId)}
              >
                {session?._id === creator.userId ? "Đây là bạn" : followingIds.has(creator.userId) ? "Đang theo dõi" : "Theo dõi"}
              </button>
            </div>) : <p className="text-sm text-[#7b8078]">Danh sách sẽ xuất hiện khi có bài đăng thật.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8e1d4] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold">Câu hỏi được quan tâm</h3>
            <Link className="text-xs font-bold text-[#2f6f5e] hover:underline" href="#">Xem tất cả</Link>
          </div>
          <ul className="space-y-3">
            {trendingQuestions.map((q, idx) => <li key={idx}>
              <Link className="group flex gap-3 rounded-lg p-2 transition hover:bg-[#f7f3ec]" href="#">
                <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#ef6e61]" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-[#2f6f5e]">{q.title}</p>
                  <p className="mt-1 text-xs text-[#646a61]">{q.time} · {q.likes} lượt thích</p>
                </div>
              </Link>
            </li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e8e1d4] bg-white p-5">
          <h3 className="mb-3 font-serif text-lg font-bold">Quy tắc diễn đàn</h3>
          <ul className="space-y-2 text-sm text-[#646a61]">
            {communityRules.map((rule, idx) => <li className="flex gap-2" key={idx}>
              <span className="text-[#2f6f5e]">•</span><span>{rule}</span>
            </li>)}
          </ul>
          <Link className="mt-4 inline-block text-xs font-bold text-[#2f6f5e] hover:underline" href="#">Xem chi tiết →</Link>
        </section>

        <section className="rounded-2xl border border-[#e8e1d4] bg-white p-5">
          <h3 className="mb-4 font-serif text-lg font-bold">Cảm hứng từ diễn đàn</h3>
          <div className="grid grid-cols-3 gap-2">
            {inspirationImages.map((img, idx) => <Link className="relative aspect-square overflow-hidden rounded-lg bg-[#f7f3ec] transition hover:opacity-90" href="#" key={idx}>
              <Image alt={`Cảm hứng ${idx + 1}`} className="object-cover" fill sizes="100px" src={img} />
            </Link>)}
          </div>
        </section>
      </aside>
    </div>

    {modal && <PublishModal close={() => setModal(false)} onCreated={(newPost) => {
      setFeed((old) => {
        if (!old) return old;
        const exists = old.items.some((item) => item._id === newPost._id);
        if (exists) return old;
        return { ...old, items: [newPost, ...old.items], total: old.total + 1 };
      });
    }} />}
    {commentModalPost && (
      <CommentModal
        onClose={() => setCommentModalPost(null)}
        onCommentAdded={(postId, newTotal) => {
          setFeed((old) => old ? {
            ...old,
            items: old.items.map((item) => item._id === postId ? { ...item, commentCount: newTotal } : item),
          } : old);
          setCommentModalPost((current) => current && current._id === postId
            ? { ...current, commentCount: newTotal }
            : current);
        }}
        post={commentModalPost}
      />
    )}
  </main>;
}
