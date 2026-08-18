"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Bookmark, Heart, ImagePlus, MessageCircle, Send, Share2, Sparkles, Users, X } from "lucide-react";
import { ApiError, apiClient } from "@/src/services/axios";
import { clearSessionUser, getAccessToken, getSessionUser } from "@/src/features/auth/services/session";
import type { CommunityCreator, CommunityFeed, CommunityPost, CommunityUser } from "../types";
import BeforeAfterImage from "./BeforeAfterImage";

const tabs = [
  ["for-you", "Dành cho bạn"], ["following", "Đang theo dõi"], ["trending", "Xu hướng"],
  ["makeovers", "Cải tạo"], ["tips", "Mẹo hay"],
] as const;

function avatar(value?: CommunityUser["avatar"]) {
  return typeof value === "string" ? value : value?.secureUrl;
}

function Avatar({ user, size = 44 }: { user: Pick<CommunityUser, "fullName" | "avatar">; size?: number }) {
  const src = avatar(user.avatar);
  return src ? <Image alt={user.fullName} className="rounded-full object-cover" height={size} src={src} unoptimized width={size} /> :
    <span className="grid shrink-0 place-items-center rounded-full bg-[#dcebb2] font-bold text-[#42551f]" style={{ height: size, width: size }}>{user.fullName.slice(0, 2).toUpperCase()}</span>;
}

function PublishModal({ close, published }: { close: () => void; published: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return setError("Bạn cần đăng nhập để chia sẻ không gian.");
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try { await apiClient.post("/community/posts", data, { token }); published(); close(); }
    catch { setError("Không thể đăng bài. Hãy kiểm tra đủ hai ảnh và thử lại."); }
    finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-[#1f2421]/55 p-4" onMouseDown={close}>
    <form className="w-full max-w-xl rounded-[28px] bg-[#fffdf8] p-6 shadow-2xl" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
      <div className="flex items-start justify-between"><div><p className="font-accent text-lg text-[#718d34]">Chia sẻ cảm hứng ✦</p><h2 className="text-3xl">Đăng không gian của bạn</h2></div><button aria-label="Đóng" onClick={close} type="button"><X /></button></div>
      <textarea className="mt-5 min-h-28 w-full rounded-2xl border border-[#ddd2c2] bg-white p-4 outline-none focus:border-[#78953b]" maxLength={3000} name="description" placeholder="Kể câu chuyện cải tạo của bạn..." required />
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><input className="rounded-xl border border-[#ddd2c2] bg-white px-4 py-3" maxLength={60} name="roomType" placeholder="Loại phòng (Phòng khách...)" required /><input className="rounded-xl border border-[#ddd2c2] bg-white px-4 py-3" name="hashtags" placeholder="cozy, decor, tips" /></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{[["before", "Ảnh trước"], ["after", "Ảnh sau"]].map(([name,label]) => <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#a9b878] bg-[#f5f8e9] p-4 text-sm font-bold" key={name}><ImagePlus className="text-[#78953b]" /><span>{label}</span><input accept="image/*" className="sr-only" name={name} required type="file" /></label>)}</div>
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="mt-5 w-full rounded-xl bg-[#78953b] py-3 font-bold text-white disabled:opacity-60" disabled={busy}>{busy ? "Đang đăng..." : "Chia sẻ với cộng đồng"}</button>
    </form>
  </div>;
}

export default function CommunityView() {
  const [tab, setTab] = useState("for-you");
  const [feed, setFeed] = useState<CommunityFeed | null>(null);
  const [creators, setCreators] = useState<CommunityCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
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
        setFeed(await apiClient.get<CommunityFeed>(`/community/posts?tab=${tab}`));
        setError("Phiên đăng nhập đã hết hạn. Bảng tin công khai vẫn được hiển thị; hãy đăng nhập lại để tương tác.");
      } else {
        setError(tab === "following" && !token ? "Hãy đăng nhập để xem những người bạn đang theo dõi." : "Chưa thể tải bảng tin cộng đồng.");
      }
    }
    finally { setLoading(false); }
  }, [tab, token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (tab === "following" && !token) {
        setFeed({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
        setError("Hãy đăng nhập để xem những người bạn đang theo dõi.");
        setLoading(false);
        return;
      }
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load, tab, token]);
  useEffect(() => { void apiClient.get<CommunityCreator[]>("/community/creators").then(setCreators).catch(() => setCreators([])); }, []);

  async function action(post: CommunityPost, kind: "like" | "save") {
    if (!token) return setError("Bạn cần đăng nhập để thực hiện thao tác này.");
    const result = await apiClient.post<{active:boolean;count:number}>(`/community/posts/${post._id}/${kind}`, undefined, { token });
    setFeed((old) => old ? { ...old, items: old.items.map((item) => item._id === post._id ? { ...item, [kind === "like" ? "liked" : "saved"]: result.active, ...(kind === "like" ? { likeCount: result.count } : {}) } : item) } : old);
  }

  async function submitComment(event: FormEvent, post: CommunityPost) {
    event.preventDefault(); const content = comments[post._id]?.trim();
    if (!token) return setError("Bạn cần đăng nhập để bình luận."); if (!content) return;
    await apiClient.post(`/community/posts/${post._id}/comments`, { content }, { token });
    setComments((old) => ({ ...old, [post._id]: "" })); await load();
  }

  async function follow(id: string) {
    if (!token) return setError("Bạn cần đăng nhập để theo dõi nhà sáng tạo.");
    await apiClient.post(`/community/users/${id}/follow`, undefined, { token });
  }

  return <main className="min-h-screen bg-[#faf6ef]">
    <section className="border-b border-[#e6dccd] bg-[#fffdf9] px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-[1460px] flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="font-accent text-xl text-[#718d34]">Người thật · Không gian thật ✦</p><h1 className="mt-1 text-4xl sm:text-5xl">Cộng đồng DECOHO ♡</h1><p className="mt-2 text-[#71776e]">Chia sẻ căn phòng, khám phá ý tưởng và cùng nhau biến đổi không gian sống.</p></div>
        <button className="rounded-2xl bg-[#78953b] px-6 py-3 font-bold text-white shadow-lg shadow-[#78953b]/20" onClick={() => setModal(true)}><span className="inline-flex items-center gap-2"><ImagePlus size={19}/> Chia sẻ không gian</span></button>
      </div>
      <div className="mx-auto mt-7 flex max-w-[1460px] gap-2 overflow-x-auto">{tabs.map(([key,label]) => <button className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === key ? "bg-[#232821] text-white" : "border border-[#ddd4c7] bg-white text-[#666d64] hover:border-[#78953b]"}`} key={key} onClick={() => { setLoading(true); setTab(key); }}>{label}</button>)}</div>
    </section>

    <div className="mx-auto grid max-w-[1460px] gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_350px]">
      <section className="space-y-6">
        {error && <div className="rounded-2xl border border-[#efb6aa] bg-[#fff3ef] p-4 text-[#a33f31]">{error}</div>}
        {loading && <div className="rounded-3xl border border-[#e2d8c9] bg-white p-12 text-center text-[#777d74]">Đang tải câu chuyện thật từ cộng đồng...</div>}
        {!loading && feed?.items.length === 0 && <div className="rounded-3xl border border-dashed border-[#cfc3b2] bg-white p-14 text-center"><Sparkles className="mx-auto text-[#78953b]"/><h2 className="mt-3 text-2xl">Chưa có bài viết trong mục này</h2><p className="mt-2 text-[#747970]">Hãy là người đầu tiên chia sẻ màn cải tạo của mình.</p></div>}
        {feed?.items.map((post) => <article className="overflow-hidden rounded-[26px] border border-[#e0d6c8] bg-white shadow-sm" key={post._id}>
          <div className="flex items-center justify-between p-5"><div className="flex items-center gap-3"><Avatar user={post.userId}/><div><h2 className="font-sans text-base font-extrabold tracking-normal">{post.userId.fullName}</h2><p className="text-xs text-[#7b8078]">{post.userId.businessAddress || post.roomType} · {new Date(post.createdAt).toLocaleDateString("vi-VN")}</p></div></div><button className="rounded-full border border-[#cad6a8] px-4 py-2 text-xs font-bold text-[#66832d]" onClick={() => void follow(post.userId._id)}>+ Theo dõi</button></div>
          <BeforeAfterImage after={post.afterImageUrl} before={post.beforeImageUrl}/>
          <div className="p-5"><p className="leading-7 text-[#424740]">{post.description}</p><div className="mt-2 flex flex-wrap gap-2">{post.hashtags.map((tag) => <span className="text-sm font-semibold text-[#739137]" key={tag}>#{tag}</span>)}</div>
            <div className="mt-4 flex items-center gap-1 border-y border-[#eee7dc] py-2"><button className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${post.liked ? "text-[#ee6f62]" : "text-[#626960]"}`} onClick={() => void action(post,"like")}><Heart fill={post.liked ? "currentColor" : "none"} size={20}/>{post.likeCount}</button><span className="flex items-center gap-2 px-3 text-sm text-[#626960]"><MessageCircle size={20}/>{post.commentCount}</span><button aria-label="Chia sẻ" className="rounded-xl p-2 text-[#626960]"><Share2 size={20}/></button><button aria-label="Lưu bài" className={`ml-auto rounded-xl p-2 ${post.saved ? "text-[#78953b]" : "text-[#626960]"}`} onClick={() => void action(post,"save")}><Bookmark fill={post.saved ? "currentColor" : "none"} size={20}/></button></div>
            {post.comments.slice(-2).map((comment) => <div className="mt-3 flex gap-2 text-sm" key={comment._id}><Avatar size={30} user={comment.userId}/><p className="rounded-2xl bg-[#f6f2eb] px-3 py-2"><strong>{comment.userId.fullName}</strong> {comment.content}</p></div>)}
            <form className="mt-4 flex gap-2" onSubmit={(event) => void submitComment(event,post)}><input className="min-w-0 flex-1 rounded-full border border-[#ddd4c7] bg-[#fbf9f5] px-4 py-2.5 text-sm outline-none focus:border-[#78953b]" onChange={(e) => setComments((old) => ({...old,[post._id]:e.target.value}))} placeholder={session ? `Bình luận với tên ${session.name}...` : "Đăng nhập để bình luận..."} value={comments[post._id] ?? ""}/><button aria-label="Gửi bình luận" className="grid h-10 w-10 place-items-center rounded-full bg-[#78953b] text-white"><Send size={17}/></button></form>
          </div>
        </article>)}
      </section>

      <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
        <div className="rounded-[24px] border border-[#e0d6c8] bg-white p-5"><div className="flex items-center gap-2"><Users className="text-[#78953b]"/><h2 className="font-sans text-lg font-extrabold tracking-normal">Nhà sáng tạo nổi bật</h2></div><div className="mt-4 space-y-4">{creators.length ? creators.slice(0,5).map((creator) => <div className="flex items-center gap-3" key={creator.userId}><Avatar user={{fullName:creator.fullName,avatar:creator.avatar}}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{creator.fullName}</p><p className="text-xs text-[#7b8078]">{creator.posts} bài · {creator.likes} lượt thích</p></div><button className="text-xs font-bold text-[#718d34]" onClick={() => void follow(creator.userId)}>Theo dõi</button></div>) : <p className="text-sm text-[#7b8078]">Danh sách sẽ xuất hiện khi có bài đăng thật.</p>}</div></div>
        <div className="overflow-hidden rounded-[24px] bg-[#ddecaa] p-6"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#637d2c]">Thử thách tuần</p><h2 className="mt-2 text-3xl">Góc xanh trong nhà</h2><p className="mt-2 text-sm leading-6 text-[#53613e]">Chia sẻ màn biến đổi cùng cây xanh và hashtag #GocXanhDecoho.</p><button className="mt-4 rounded-full bg-[#263020] px-5 py-2.5 text-sm font-bold text-white" onClick={() => setModal(true)}>Tham gia ngay</button></div>
        <div className="rounded-[24px] border border-[#e0d6c8] bg-white p-5"><h2 className="font-sans text-base font-extrabold tracking-normal">Nguyên tắc cộng đồng</h2><p className="mt-2 text-sm leading-6 text-[#737970]">Tôn trọng tác giả, chia sẻ hình ảnh bạn có quyền sử dụng và cùng giữ DECOHO là nơi truyền cảm hứng tích cực.</p><Link className="mt-3 inline-block text-sm font-bold text-[#718d34]" href="/">Tìm hiểu thêm →</Link></div>
      </aside>
    </div>
    {modal && <PublishModal close={() => setModal(false)} published={() => void load()}/>} 
  </main>;
}
