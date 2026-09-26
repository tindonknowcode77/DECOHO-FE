"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Check,
  Compass,
  Heart,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Plus,
  RefreshCw,
  Share2,
  Users,
  X,
} from "lucide-react";
import { apiClient } from "@/src/services/axios";
import {
  getAccessToken,
  getSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";
import {
  REACTION_META,
  type CommunityComment,
  type CommunityCreator,
  type CommunityPost,
  type ReactionType,
} from "../types";
import {
  communityError,
  formatCommunityDate,
  normalizePost,
  normalizeUser,
} from "../services/community-data";
import CommunityAvatar from "./CommunityAvatar";
import PublishModal from "./PublishModal";
import CommentModal from "./CommentModal";
import MediaGallery from "./MediaGallery";
import ReactionPicker from "./ReactionPicker";

const tabs = [
  { id: "for-you", label: "Khám phá", icon: Compass },
  { id: "following", label: "Đang theo dõi", icon: Users },
  { id: "saved", label: "Bài viết đã lưu", icon: Bookmark },
];
const empty: Record<string, [string, string]> = {
  "for-you": [
    "Câu chuyện đầu tiên bắt đầu từ bạn",
    "Chia sẻ một góc nhà yêu thích để cùng nhau tìm thêm cảm hứng.",
  ],
  following: [
    "Thêm những người truyền cảm hứng",
    "Theo dõi thành viên để xem những bài viết mới của họ ở đây.",
  ],
  saved: [
    "Giữ lại những ý tưởng bạn thích",
    "Nhấn biểu tượng lưu trên bài viết để dễ dàng tìm lại sau.",
  ],
};

export default function CommunityView() {
  const [session, setSession] = useState<AuthSessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("for-you");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creators, setCreators] = useState<CommunityCreator[]>([]);
  const [creatorsError, setCreatorsError] = useState(false);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const locks = useRef(new Set<string>());
  const [publish, setPublish] = useState(false);
  const [discussion, setDiscussion] = useState<CommunityPost | null>(null);
  const lastCreated = useRef<CommunityPost | null>(null);

  useEffect(() => {
    const sync = () => {
      setSession(getSessionUser());
      setToken(getAccessToken());
      setFollowing(new Set());
      setPosts([]);
      setTab("for-you");
      setPage(1);
      setLoading(true);
      setReady(true);
      setRevision((value) => value + 1);
    };
    sync();
    return subscribeSessionUser(sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    if (tab !== "for-you" && !token) return;
    apiClient
      .get<{ items?: unknown[]; totalPages?: number }>(
        `/community/${token ? "feed" : "posts"}?tab=${tab}&page=${page}&limit=10`,
        { ...(token ? { token } : {}), signal: controller.signal },
      )
      .then((data) => {
        if (controller.signal.aborted) return;
        const incoming = (Array.isArray(data.items) ? data.items : [])
          .map(normalizePost)
          .filter((post) => post._id);
        const created = lastCreated.current;
        if (
          page === 1 &&
          tab === "for-you" &&
          created &&
          !incoming.some((p) => p._id === created._id)
        )
          incoming.unshift(created);
        lastCreated.current = null;
        setPosts((old) =>
          page === 1
            ? incoming
            : Array.from(
                new Map(
                  [...old, ...incoming].map((post) => [post._id, post]),
                ).values(),
              ),
        );
        setTotalPages(
          typeof data.totalPages === "number" ? data.totalPages : 0,
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            communityError(
              error,
              "Chưa tải được bài viết. Kiểm tra kết nối và thử lại nhé.",
            ),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [tab, page, revision, ready, token]);

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get<CommunityCreator[]>("/community/creators", {
        signal: controller.signal,
      })
      .then((data) => {
        if (!controller.signal.aborted)
          setCreators(
            Array.isArray(data)
              ? data
                  .filter((c) => typeof c.userId === "string")
                  .map((c) => ({ ...c, fullName: normalizeUser(c).fullName }))
              : [],
          );
      })
      .catch(() => {
        if (!controller.signal.aborted) setCreatorsError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCreatorsLoading(false);
      });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    apiClient
      .get<{ userIds: string[] }>("/community/following", {
        token,
        signal: controller.signal,
      })
      .then((data) => {
        if (!controller.signal.aborted)
          setFollowing(
            new Set(Array.isArray(data.userIds) ? data.userIds : []),
          );
      })
      .catch(() => {
        /* Feed authors also include their following state. */
      });
    return () => controller.abort();
  }, [token, revision]);

  function refresh() {
    if (locks.current.size) return;
    setError("");
    setCreatorsLoading(true);
    setCreatorsError(false);
    setLoading(tab === "for-you" || !!token);
    setPage(1);
    setRevision((value) => value + 1);
  }
  function retryPage() {
    if (locks.current.size) return;
    setError("");
    setLoading(true);
    setRevision((value) => value + 1);
  }
  function switchTab(next: string) {
    if (locks.current.size || next === tab) return;
    setPosts([]);
    setTotalPages(0);
    setError("");
    setLoading(next === "for-you" || !!token);
    setPage(1);
    setTab(next);
    setNotice("");
  }
  function openPublish() {
    if (!token) {
      setError("Đăng nhập để chia sẻ câu chuyện của bạn.");
      return;
    }
    setPublish(true);
  }
  function updatePost(
    id: string,
    update: (post: CommunityPost) => CommunityPost,
  ) {
    setPosts((old) =>
      old.map((post) => (post._id === id ? update(post) : post)),
    );
  }
  async function action(
    key: string,
    run: (accessToken: string) => Promise<void>,
  ) {
    if (!token) {
      setError("Vui lòng đăng nhập để tương tác với cộng đồng.");
      return;
    }
    if (locks.current.has(key) || loading) return;
    locks.current.add(key);
    setPending(new Set(locks.current));
    setError("");
    try {
      await run(token);
    } catch (error) {
      setError(
        communityError(error, "Thao tác chưa thành công. Bạn thử lại nhé."),
      );
    } finally {
      locks.current.delete(key);
      setPending(new Set(locks.current));
    }
  }
  function react(post: CommunityPost, type: ReactionType) {
    void action(`reaction:${post._id}`, async (accessToken) => {
      const result = await apiClient.post<{
        myType: ReactionType | null;
        counts: Partial<Record<ReactionType, number>>;
      }>(
        `/community/posts/${post._id}/react`,
        { type },
        { token: accessToken },
      );
      updatePost(post._id, (current) =>
        normalizePost({
          ...current,
          myReaction: result.myType,
          reactionCounts: result.counts,
        }),
      );
    });
  }
  function save(post: CommunityPost) {
    void action(`save:${post._id}`, async (accessToken) => {
      const result = await apiClient.post<{ active: boolean }>(
        `/community/posts/${post._id}/save`,
        undefined,
        { token: accessToken },
      );
      if (tab === "saved" && !result.active)
        setPosts((old) => old.filter((p) => p._id !== post._id));
      else
        updatePost(post._id, (current) => ({
          ...current,
          saved: result.active,
        }));
      setNotice(
        result.active
          ? "Đã lưu vào bộ sưu tập ý tưởng của bạn."
          : "Đã bỏ lưu bài viết.",
      );
    });
  }
  function follow(id: string) {
    if (!id || id === session?._id) return;
    void action(`follow:${id}`, async (accessToken) => {
      const result = await apiClient.post<{ following: boolean }>(
        `/community/users/${id}/follow`,
        undefined,
        { token: accessToken },
      );
      setFollowing((old) => {
        const next = new Set(old);
        if (result.following) next.add(id);
        else next.delete(id);
        return next;
      });
      setPosts((old) =>
        old
          .filter(
            (post) =>
              tab !== "following" || result.following || post.userId._id !== id,
          )
          .map((post) =>
            post.userId._id === id
              ? {
                  ...post,
                  userId: { ...post.userId, following: result.following },
                }
              : post,
          ),
      );
    });
  }
  async function share(post: CommunityPost) {
    const url = `${window.location.origin}/community/post/${post._id}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: `Không gian của ${post.userId.fullName}`,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        setNotice("Đã sao chép liên kết bài viết.");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setError("Chưa thể chia sẻ liên kết. Bạn thử lại nhé.");
    }
  }
  function commentAdded(id: string, total: number, comment: CommunityComment) {
    updatePost(id, (post) => ({
      ...post,
      commentCount: Math.max(
        post.commentCount +
          (post.comments.some((c) => c._id === comment._id) ? 0 : 1),
        total,
      ),
      comments: [
        ...post.comments.filter((c) => c._id !== comment._id),
        comment,
      ],
    }));
  }
  const privateTab = tab !== "for-you" && !token;
  return (
    <main className="min-h-screen bg-[#f6f5f0] pb-16 text-[#283e32]">
      <section className="mx-auto max-w-[1320px] px-4 pb-8 pt-7 sm:px-8 sm:pt-10">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#254d3d] px-7 py-10 text-white sm:px-12 sm:py-12">
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-[46%] sm:block">
            <Image
              src="/images/product-space/organic-calm.png"
              alt="Góc nhà ngập ánh sáng tự nhiên"
              fill
              sizes="600px"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#254d3d] via-[#254d3d]/30 to-transparent" />
          </div>
          <div className="max-w-xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d4dfbf]">
              DECOHO COMMUNITY
            </p>
            <h1 className="font-serif text-4xl leading-[1.12] sm:text-5xl">
              Nhà đẹp hơn.
              <br />
              <span className="text-[#d9e4bd]">Khi cùng chia sẻ.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Góc nhỏ bạn yêu, ý tưởng bạn thử, câu chuyện bạn kể. Cùng nhau tạo
              nên những không gian đáng sống.
            </p>
            <button
              onClick={openPublish}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e4edca] px-5 py-3 text-sm font-semibold text-[#284a35]"
            >
              <Plus size={17} /> Chia sẻ câu chuyện
            </button>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1320px] items-start gap-6 px-4 sm:px-8 lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)_270px]">
        <aside className="lg:sticky lg:top-24">
          <p className="mb-4 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#868d80] lg:block">
            Góc cộng đồng
          </p>
          <nav
            aria-label="Bộ lọc diễn đàn"
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                disabled={pending.size > 0}
                aria-current={tab === id ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${tab === id ? "bg-[#e4ebdc] text-[#2c593e]" : "text-[#747c6f] hover:bg-white"}`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-7 hidden border-t border-[#e1e3d9] px-3 pt-6 lg:block">
            <p className="font-serif text-lg">
              Một góc nhà.
              <br />
              Ngàn cảm hứng.
            </p>
            <p className="mt-3 text-xs leading-6 text-[#7d8477]">
              Chia sẻ chân thành.
              <br />
              Góp ý tử tế.
              <br />
              Tôn trọng sự khác biệt.
            </p>
            <Link
              href="/moodboards"
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#3c7056]"
            >
              Khám phá moodboard <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
        <section className="min-w-0" aria-label="Bảng tin diễn đàn">
          <div className="mb-5 rounded-2xl border border-[#e5e6dd] bg-white p-5">
            <div className="flex items-center gap-3">
              <CommunityAvatar
                user={{
                  fullName: session?.name || "Bạn",
                  avatar: session?.avatar,
                }}
              />
              <button
                onClick={openPublish}
                className="min-w-0 flex-1 rounded-full bg-[#f6f6f1] px-4 py-3 text-left text-sm text-[#7b8275]"
              >
                Hôm nay, góc nhà bạn có gì mới?
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#f0f0e9] pt-3">
              <span className="flex items-center gap-2 text-xs text-[#7b8275]">
                <ImagePlus size={16} /> Một bức ảnh, một câu chuyện
              </span>
              <button
                onClick={openPublish}
                className="rounded-full bg-[#2f6f5e] px-4 py-2 text-xs font-semibold text-white"
              >
                Tạo bài viết
              </button>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl">
              {tabs.find((t) => t.id === tab)?.label}
            </h2>
            <button
              onClick={refresh}
              disabled={loading || pending.size > 0}
              className="inline-flex items-center gap-1.5 rounded-lg p-2 text-xs text-[#737b6b] hover:bg-white disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-[#e6c9bd] bg-[#fff4ec] p-4 text-sm text-[#904e36]"
            >
              <div className="flex items-start justify-between gap-3">
                <p>{error}</p>
                <button
                  aria-label="Đóng thông báo lỗi"
                  onClick={() => setError("")}
                >
                  <X size={16} />
                </button>
              </div>
              {!token && (
                <Link
                  href="/login"
                  className="mt-2 inline-block font-semibold underline"
                >
                  Đăng nhập
                </Link>
              )}
              {!loading && (
                <button
                  onClick={retryPage}
                  className="ml-3 mt-2 font-semibold underline"
                >
                  Thử tải lại
                </button>
              )}
            </div>
          )}
          {notice && (
            <div
              role="status"
              className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[#e7efdd] px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <Check size={16} />
                {notice}
              </span>
              <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {loading && posts.length === 0 && (
            <div aria-label="Đang tải bài viết" className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white p-5">
                  <div className="mb-5 h-10 w-44 rounded-xl bg-[#eceee5]" />
                  <div className="aspect-[16/9] rounded-xl bg-[#eceee5]" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-[#eceee5]" />
                </div>
              ))}
            </div>
          )}
          {!loading && !posts.length && !error && (
            <div className="rounded-2xl border border-dashed border-[#ccd4c2] bg-white/70 px-6 py-14 text-center">
              <MessageCircle size={32} className="mx-auto text-[#8da37a]" />
              <h3 className="mt-5 font-serif text-2xl">
                {privateTab ? "Góc riêng dành cho bạn" : empty[tab][0]}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#7b8275]">
                {privateTab
                  ? "Đăng nhập để xem bài viết đã lưu và những người bạn theo dõi."
                  : empty[tab][1]}
              </p>
              {privateTab ? (
                <Link
                  href="/login"
                  className="mt-5 inline-block rounded-full bg-[#2f6f5e] px-5 py-2.5 text-sm text-white"
                >
                  Đăng nhập
                </Link>
              ) : (
                tab === "for-you" && (
                  <button
                    onClick={openPublish}
                    className="mt-5 rounded-full bg-[#2f6f5e] px-5 py-2.5 text-sm text-white"
                  >
                    Chia sẻ đầu tiên
                  </button>
                )
              )}
            </div>
          )}
          <div className="space-y-5">
            {posts.map((post) => (
              <article
                key={post._id}
                className="rounded-2xl border border-[#e5e6dd] bg-white shadow-[0_3px_12px_#283e3203]"
              >
                <div className="flex items-center gap-3 p-5">
                  <CommunityAvatar user={post.userId} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {post.userId.fullName}
                    </p>
                    <p className="mt-1 text-[11px] text-[#899080]">
                      {formatCommunityDate(post.createdAt)}
                    </p>
                  </div>
                  {post.userId._id && post.userId._id !== session?._id && (
                    <button
                      disabled={
                        pending.has(`follow:${post.userId._id}`) || loading
                      }
                      onClick={() => follow(post.userId._id)}
                      className="rounded-full border border-[#dce4d4] px-3 py-1.5 text-xs font-medium text-[#4f7859] disabled:opacity-40"
                    >
                      {following.has(post.userId._id) || post.userId.following
                        ? "Đang theo dõi"
                        : "+ Theo dõi"}
                    </button>
                  )}
                </div>
                <div className="px-5 pb-4">
                  <span className="rounded-md bg-[#f0f3e9] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#77815e]">
                    {post.roomType}
                  </span>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#4e574b]">
                    {post.description}
                  </p>
                  {!!post.hashtags.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.hashtags.map((tag) => (
                        <span key={tag} className="text-xs text-[#68875b]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!!post.media.length && <MediaGallery media={post.media} />}
                <div className="px-4 py-3 sm:px-5">
                  <div className="flex items-center justify-between border-b border-[#eeeee6] pb-3 text-xs text-[#858c7d]">
                    <span>{post.reactionTotal || 0} lượt cảm xúc</span>
                    <button
                      onClick={() => setDiscussion(post)}
                      className="hover:underline"
                    >
                      {post.commentCount} bình luận
                    </button>
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    <ReactionPicker
                      busy={loading || pending.has(`reaction:${post._id}`)}
                      myReaction={post.myReaction ?? null}
                      onPick={(type) => react(post, type)}
                    >
                      <span>
                        {post.myReaction ? (
                          REACTION_META[post.myReaction].emoji
                        ) : (
                          <Heart size={18} />
                        )}
                      </span>
                      <span className="text-xs">
                        {post.myReaction
                          ? REACTION_META[post.myReaction].label
                          : "Thích"}
                      </span>
                    </ReactionPicker>
                    <button
                      onClick={() => setDiscussion(post)}
                      className="flex items-center gap-2 rounded-xl p-2 text-xs font-medium text-[#737c6c] hover:bg-[#f5f6ef]"
                    >
                      <MessageCircle size={18} />
                      <span>Bình luận</span>
                    </button>
                    <button
                      onClick={() => void share(post)}
                      aria-label="Chia sẻ bài viết"
                      className="ml-auto rounded-xl p-2 text-[#737c6c] hover:bg-[#f5f6ef]"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={() => save(post)}
                      disabled={loading || pending.has(`save:${post._id}`)}
                      aria-label={
                        post.saved ? "Bỏ lưu bài viết" : "Lưu bài viết"
                      }
                      aria-pressed={post.saved}
                      className="rounded-xl p-2 text-[#527c55] hover:bg-[#f5f6ef] disabled:opacity-40"
                    >
                      <Bookmark
                        size={18}
                        fill={post.saved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  {post.comments
                    .filter((c) => !c.parentId)
                    .slice(-1)
                    .map((comment) => (
                      <div
                        key={comment._id}
                        className="mt-3 flex gap-2 border-t border-[#eeeee6] pt-3"
                      >
                        <CommunityAvatar size={28} user={comment.userId} />
                        <p className="min-w-0 flex-1 break-words rounded-xl bg-[#f5f6f0] px-3 py-2 text-xs leading-5 text-[#6c7564]">
                          <strong className="mr-1.5 text-[#44563c]">
                            {comment.userId.fullName}
                          </strong>
                          {comment.content}
                        </p>
                      </div>
                    ))}
                </div>
              </article>
            ))}
          </div>
          {page < totalPages && (
            <button
              disabled={loading || pending.size > 0}
              onClick={() => {
                if (error) retryPage();
                else {
                  setLoading(true);
                  setPage((p) => p + 1);
                }
              }}
              className="mx-auto mt-6 flex items-center gap-2 rounded-full border border-[#d8dfce] bg-white px-6 py-3 text-sm disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <ArrowDown size={16} />
              )}
              {loading ? "Đang tải…" : error ? "Thử lại" : "Xem thêm bài viết"}
            </button>
          )}
        </section>
        <aside className="hidden space-y-5 xl:sticky xl:top-24 xl:block">
          <section className="rounded-2xl border border-[#e5e6dd] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d9581]">
              Kết nối & cảm hứng
            </p>
            <h2 className="mt-2 font-serif text-xl">Những người kể chuyện</h2>
            <div className="mt-5 space-y-5">
              {creatorsLoading ? (
                <p className="text-xs text-[#7c8573]">Đang tìm thành viên…</p>
              ) : creatorsError ? (
                <p className="text-xs leading-6 text-[#7c8573]">
                  Chưa tải được thành viên.{" "}
                  <button onClick={refresh} className="underline">
                    Thử lại
                  </button>
                </p>
              ) : !creators.length ? (
                <p className="text-xs leading-6 text-[#7c8573]">
                  Những thành viên chia sẻ tích cực sẽ xuất hiện ở đây.
                </p>
              ) : (
                creators.slice(0, 5).map((creator) => (
                  <div
                    key={creator.userId}
                    className="flex items-center gap-2.5"
                  >
                    <CommunityAvatar user={creator} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {creator.fullName}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8b9380]">
                        {creator.posts || 0} bài chia sẻ
                      </p>
                    </div>
                    {creator.userId !== session?._id && (
                      <button
                        aria-label={`${following.has(creator.userId) ? "Bỏ theo dõi" : "Theo dõi"} ${creator.fullName}`}
                        onClick={() => follow(creator.userId)}
                        disabled={
                          loading || pending.has(`follow:${creator.userId}`)
                        }
                        className="rounded-full bg-[#f0f3e9] p-1.5 text-[#527547] disabled:opacity-40"
                      >
                        {following.has(creator.userId) ? (
                          <Check size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="rounded-2xl bg-[#e9edde] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#758361]">
              Một gợi ý cho hôm nay
            </p>
            <h2 className="mt-3 font-serif text-2xl leading-tight">
              Góc nhỏ,
              <br />
              niềm vui lớn.
            </h2>
            <p className="mt-3 text-xs leading-6 text-[#7d856f]">
              Không cần một căn nhà hoàn hảo. Chỉ cần một góc khiến bạn muốn trở
              về.
            </p>
            <button
              onClick={openPublish}
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#436446]"
            >
              Kể câu chuyện của bạn <ArrowRight size={14} />
            </button>
          </section>
          <p className="px-2 text-[10px] leading-5 text-[#929986]">
            DECOHO · Decorate your home
            <br />
            Cảm hứng từ những ngôi nhà thật.
          </p>
        </aside>
      </div>
      {publish && (
        <PublishModal
          close={() => setPublish(false)}
          onCreated={(post) => {
            lastCreated.current = post;
            setPosts([post]);
            setLoading(true);
            setError("");
            setTab("for-you");
            setPage(1);
            setRevision((v) => v + 1);
            setNotice("Bài viết của bạn đã được chia sẻ.");
          }}
        />
      )}
      {discussion && (
        <CommentModal
          key={discussion._id}
          post={discussion}
          onClose={() => setDiscussion(null)}
          onCommentAdded={commentAdded}
        />
      )}
    </main>
  );
}
