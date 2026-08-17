"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken, getSessionUser } from "@/src/features/auth/services/session";

type Product = { _id?: string; id?: string; name?: string; price?: number; images?: string[] };
type ProductPoint = { _id?: string; id?: string; x?: number; y?: number; product?: Product; productId?: Product | string };
type ProductSpace = { _id?: string; id?: string; title?: string; imageUrl?: string; description?: string; roomType?: string; isFeatured?: boolean; productPoints?: ProductPoint[]; createdAt?: string };

const roomLabels: Record<string, string> = { living_room: "Phòng khách", bedroom: "Phòng ngủ", dining_room: "Phòng ăn", kitchen: "Nhà bếp", office: "Góc làm việc", bathroom: "Phòng tắm", other: "Không gian" };

function getProduct(point: ProductPoint) { return typeof point.productId === "object" ? point.productId : point.product; }
function currency(value?: number) { return typeof value === "number" ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value) : "Liên hệ"; }

export default function ProductSpaceView() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<ProductSpace[]>([]);
  const [activeId, setActiveId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
      const token = getAccessToken();
      const response = await fetch(`${base}/product-spaces`, { cache: "no-store" });
      const mineResponse = token ? await fetch(`${base}/product-spaces/mine`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } }) : null;
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message ?? "Không thể tải Moodboard.");
      const publicItems = (Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : []) as ProductSpace[];
      const mineBody = mineResponse?.ok ? await mineResponse.json().catch(() => []) : [];
      const ownItems = (Array.isArray(mineBody) ? mineBody : []) as ProductSpace[];
      const seen = new Set<string>();
      const items = [...ownItems, ...publicItems].filter((item) => { const id = String(item._id ?? item.id ?? ""); if (seen.has(id)) return false; seen.add(id); return true; });
      setSpaces(items); setActiveId((current) => current || String(items[0]?._id ?? items[0]?.id ?? ""));
    } catch (value) { setError(value instanceof Error ? value.message : "Không thể kết nối backend."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const filtered = useMemo(() => spaces.filter((space) => `${space.title ?? ""} ${space.description ?? ""}`.toLowerCase().includes(query.toLowerCase())), [query, spaces]);
  const active = spaces.find((space) => String(space._id ?? space.id) === activeId) ?? filtered[0];
  const points = active?.productPoints ?? [];
  const user = getSessionUser();
  function openCreate() {
    if (!user || !getAccessToken()) {
      router.push("/login");
      return;
    }
    setCreateError("");
    setCreateOpen(true);
  }

  async function createMoodboard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return router.push("/login");
    setCreating(true);
    setCreateError("");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
      const formData = new FormData(event.currentTarget);
      formData.set("width", "4");
      formData.set("length", "4");
      const response = await fetch(`${base}/product-spaces/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message ?? "Không thể tạo Moodboard.");
      setCreateOpen(false);
      await load();
    } catch (value) {
      setCreateError(value instanceof Error ? value.message : "Không thể kết nối backend.");
    } finally {
      setCreating(false);
    }
  }

  return <main className="min-h-screen bg-[#fff9f1] text-[#22271f]">
    <div className="px-3 py-5 sm:px-4 lg:px-5">
      <header className="rounded-3xl border border-[#eadfce] bg-[linear-gradient(120deg,#fffdf8,#f5f8e9)] px-5 py-5 shadow-sm sm:px-7"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-accent text-lg font-bold text-[#7a943e]">Lưu lại mọi cảm hứng ✦</p><h1 className="mt-1 text-4xl font-black">Moodboard của tôi ♡</h1><p className="mt-1 text-sm text-[#697067]">Thu thập, sắp xếp và chia sẻ ý tưởng cho không gian sống.</p></div><div className="flex flex-wrap gap-2"><label className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-[#ddd2c2] bg-white px-4 py-2.5 text-sm shadow-sm"><span>⌕</span><input className="w-full bg-transparent outline-none" onChange={(event)=>setQuery(event.target.value)} placeholder="Tìm Moodboard..." value={query}/></label><button className="rounded-xl border border-[#ddd2c2] bg-white px-4 py-2 text-sm font-bold shadow-sm transition hover:border-[#8ca84b] hover:text-[#718b36]" onClick={()=>void load()} type="button">↻ Làm mới</button></div></div><div className="mt-5 flex flex-wrap gap-2">{[["all","Tất cả"],["saved","Đã lưu"],["shared","Đã chia sẻ"],["products","Sản phẩm"],["combos","Combo"]].map(([id,label], index)=><span className={`rounded-full px-4 py-2 text-xs font-bold ${index===0?"bg-[#79943b] text-white":"border border-[#e0d6c7] bg-white text-[#656b63]"}`} key={id}>{label}</span>)}</div></header>

      <div className={`mt-5 grid gap-5 ${error ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_420px]"}`}>
        <section>
          {loading ? <div className="grid min-h-72 place-items-center rounded-2xl border bg-white text-[#71776f]">Đang tải Moodboard...</div> : error ? <div className="grid min-h-[430px] place-items-center rounded-3xl border border-[#eadfce] bg-white p-8 text-center shadow-sm"><div className="max-w-md"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff0eb] text-3xl">⌁</span><h2 className="mt-5 text-3xl font-black">Chưa kết nối được Moodboard</h2><p className="mt-3 text-sm leading-6 text-[#6d736b]">Backend DECOHO chưa phản hồi. Hãy kiểm tra server đang chạy ở cổng 3000 rồi thử tải lại.</p><p className="mt-2 rounded-lg bg-[#faf7f1] px-3 py-2 text-xs text-[#8b6258]">{error}</p><button className="mt-5 rounded-xl bg-[#79943b] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#79943b]/20" onClick={()=>void load()} type="button">Thử kết nối lại</button></div></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <button className="grid min-h-64 place-items-center rounded-2xl border-2 border-dashed border-[#d9cebd] bg-white text-center transition hover:border-[#92b34c] hover:bg-[#fbfef4]" onClick={openCreate} type="button"><div><span className="text-5xl font-light">＋</span><p className="mt-3 font-black">Tạo Moodboard mới</p><p className="mt-1 text-xs text-[#797f76]">Lưu ý tưởng và sản phẩm</p></div></button>
            {filtered.map((space,index) => { const id=String(space._id ?? space.id ?? index); const count=space.productPoints?.length ?? 0; return <button className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${id===String(active?._id ?? active?.id)?"border-[#8cab49] ring-2 ring-[#bcd77d]/30":"border-[#e4dacb]"}`} key={id} onClick={()=>setActiveId(id)} type="button"><div className="relative aspect-[4/3] overflow-hidden bg-[#eee9df]">{space.imageUrl ? <Image alt={space.title ?? "Moodboard"} className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(min-width:1280px) 25vw,50vw" src={space.imageUrl} unoptimized/> : <div className="grid h-full place-items-center text-sm text-[#898d86]">Chưa có ảnh cover</div>}<span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#e6a727] shadow">{space.isFeatured?"★":"☆"}</span></div><div className="p-4"><h2 className="text-lg font-black">{space.title ?? "Moodboard chưa đặt tên"}</h2><p className="mt-1 text-xs text-[#737970]">{roomLabels[space.roomType ?? ""] ?? "Không gian"} · {count} sản phẩm</p></div></button> })}
          </div>}
          {!loading && !error && filtered.length === 0 && spaces.length > 0 ? <p className="mt-4 rounded-xl bg-white p-5 text-center text-sm text-[#777d75]">Không tìm thấy Moodboard phù hợp.</p> : null}
        </section>

        <aside className={`${error ? "hidden" : "block"} self-start overflow-hidden rounded-2xl border border-[#ddd2c2] bg-white shadow-[0_18px_50px_rgba(70,52,31,.10)] xl:sticky xl:top-32`}>
          {active ? <><div className="flex items-start justify-between gap-3 p-5"><div><p className="text-xs text-[#798078]">Moodboard đang chọn</p><h2 className="mt-1 text-2xl font-black">{active.title ?? "Moodboard"} ✎</h2><p className="mt-1 text-xs text-[#72786f]">{roomLabels[active.roomType ?? ""] ?? "Không gian"} · {points.length} sản phẩm</p></div><button className="rounded-lg bg-[#79943b] px-4 py-2 text-xs font-black text-white" type="button">Chia sẻ ↗</button></div>
            <div className="relative mx-4 aspect-[16/9] overflow-hidden rounded-xl bg-[#ece7dd]">{active.imageUrl ? <Image alt={active.title ?? "Moodboard"} className="object-cover" fill sizes="420px" src={active.imageUrl} unoptimized/> : <div className="grid h-full place-items-center text-sm text-[#888d85]">Chưa có ảnh</div>}{points.map((point,index)=><span className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#ef6e61] text-xs font-black text-white shadow" key={point._id ?? point.id ?? index} style={{left:`${point.x ?? 0}%`,top:`${point.y ?? 0}%`}}>{index+1}</span>)}</div>
            <section className="border-b border-[#eee6da] p-5"><div className="flex items-center justify-between"><h3 className="text-lg font-black">Sản phẩm đã lưu ({points.length})</h3><Link className="text-xs font-black text-[#718d35]" href="/products">Xem tất cả <span>→</span></Link></div>{points.length ? <div className="mt-4 grid grid-cols-2 gap-3">{points.slice(0,4).map((point,index)=>{const product=getProduct(point);return <Link className="rounded-xl border border-[#ece4d8] p-2" href={product?`/products/${product._id ?? product.id}`:"/products"} key={point._id ?? point.id ?? index}>{product?.images?.[0] ? <div className="relative aspect-square overflow-hidden rounded-lg"><Image alt={product.name ?? "Sản phẩm"} className="object-cover" fill sizes="160px" src={product.images[0]} unoptimized/></div> : <div className="grid aspect-square place-items-center rounded-lg bg-[#f2eee7] text-2xl">🪑</div>}<p className="mt-2 truncate text-xs font-black">{product?.name ?? "Sản phẩm"}</p><p className="mt-1 text-[11px] text-[#78913f]">{currency(product?.price)}</p></Link>})}</div> : <p className="mt-3 rounded-xl bg-[#faf7f1] p-4 text-center text-xs text-[#7b8079]">Moodboard này chưa gắn sản phẩm.</p>}</section>
            <section className="p-5"><div className="flex items-center justify-between"><h3 className="text-lg font-black">Ghi chú</h3><span className="text-xs font-bold text-[#78913f]">Chỉnh sửa</span></div><p className="mt-2 text-sm leading-6 text-[#666d65]">{active.description || "Chưa có ghi chú cho Moodboard này."}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#eef4df] px-3 py-1 text-[11px] font-bold text-[#667c38]">{roomLabels[active.roomType ?? ""] ?? "Không gian"}</span>{active.isFeatured ? <span className="rounded-full bg-[#fff0c9] px-3 py-1 text-[11px] font-bold text-[#9a7020]">Nổi bật</span> : null}</div></section>
          </> : <div className="grid min-h-[520px] place-items-center p-8 text-center"><div><span className="text-5xl">♡</span><h2 className="mt-4 text-2xl font-black">Chưa có Moodboard</h2><p className="mt-2 text-sm text-[#747a72]">Tạo Moodboard đầu tiên để lưu cảm hứng của bạn.</p><button className="mt-5 rounded-xl bg-[#79943b] px-5 py-3 text-sm font-black text-white" onClick={openCreate} type="button">Tạo Moodboard</button></div></div>}
        </aside>
      </div>
    </div>
    {createOpen && <div className="fixed inset-0 z-[80] grid place-items-center bg-[#253128]/50 p-4 backdrop-blur-sm" onMouseDown={() => setCreateOpen(false)}><form className="w-full max-w-lg rounded-[26px] bg-[#fffdf8] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()} onSubmit={createMoodboard}><div className="flex items-start justify-between"><div><p className="font-accent text-lg text-[#78943c]">Gom cảm hứng của bạn ✦</p><h2 className="text-3xl">Tạo Moodboard mới</h2></div><button className="rounded-full px-3 py-2 text-xl" onClick={() => setCreateOpen(false)} type="button">×</button></div><div className="mt-5 space-y-3"><input className="w-full rounded-xl border border-[#ddd2c2] bg-white px-4 py-3" maxLength={160} name="title" placeholder="Tên Moodboard" required/><textarea className="min-h-24 w-full rounded-xl border border-[#ddd2c2] bg-white px-4 py-3" maxLength={1000} name="description" placeholder="Mô tả ý tưởng của bạn..."/><select className="w-full rounded-xl border border-[#ddd2c2] bg-white px-4 py-3" name="roomType" required><option value="living_room">Phòng khách</option><option value="bedroom">Phòng ngủ</option><option value="dining_room">Phòng ăn</option><option value="kitchen">Nhà bếp</option><option value="office">Góc làm việc</option><option value="bathroom">Phòng tắm</option><option value="other">Không gian khác</option></select><label className="block rounded-xl border-2 border-dashed border-[#b9ca8e] bg-[#f6f9ed] p-5 text-center text-sm font-bold text-[#657a38]">Chọn ảnh căn phòng<input accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-xs" name="image" required type="file"/></label><label className="flex items-center gap-2 text-sm"><input name="isPublic" type="checkbox" value="true"/> Công khai Moodboard với cộng đồng</label></div>{createError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{createError}</p>}<button className="mt-5 w-full rounded-xl bg-[#79943b] py-3 font-black text-white disabled:opacity-60" disabled={creating}>{creating ? "Đang tạo..." : "Tạo Moodboard"}</button></form></div>}
  </main>;
}
