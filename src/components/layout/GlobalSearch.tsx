"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchItem = { _id?: string; id?: string; name?: string; title?: string; supplierStoreName?: string; image?: string; imageUrl?: string; logoUrl?: string; category?: string; price?: number };
type SearchResponse = { resultCount: number; products: SearchItem[]; categories: SearchItem[]; brands: SearchItem[]; moodboards: SearchItem[]; suppliers: SearchItem[] };

function sessionId() {
  const key = "decoho_search_session"; let value = window.localStorage.getItem(key);
  if (!value) { value = crypto.randomUUID(); window.localStorage.setItem(key, value); }
  return value;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState(""); const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "/backend-api";
        const response = await fetch(`${base}/search?q=${encodeURIComponent(query.trim())}&sessionId=${encodeURIComponent(sessionId())}&limit=5`);
        if (!response.ok) throw new Error(); setData(await response.json()); setOpen(true);
      } catch { setData(null); setOpen(true); } finally { setLoading(false); }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);
  const groups = data ? [
    ["Sản phẩm", data.products, (item:SearchItem)=>`/products/${item._id ?? item.id}`],
    ["Moodboard", data.moodboards, (item:SearchItem)=>`/product-space?space=${item._id ?? item.id}`],
    ["Danh mục", data.categories, (item:SearchItem)=>`/products?category=${encodeURIComponent(item.name ?? "")}`],
    ["Thương hiệu", data.brands, (item:SearchItem)=>`/products?brand=${encodeURIComponent(item.name ?? "")}`],
    ["Supplier", data.suppliers, ()=>"/store"],
  ] as const : [];
  return <div className="relative hidden w-56 shrink-0 lg:block 2xl:w-72" ref={root}>
    <label className="flex h-10 items-center gap-2 rounded-full border border-[#ded6c9] bg-[#fbfaf7] px-3 text-[#687068] transition focus-within:border-[#91ad52] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#bcd77d]/15">
      <span aria-hidden="true">⌕</span>
      <input
        aria-label="Tìm kiếm toàn bộ DECOHO"
        className="min-w-0 flex-1 bg-transparent text-xs outline-none"
        onChange={(event) => {
          setQuery(event.target.value);
          if (event.target.value.trim().length < 2) { setOpen(false); setData(null); }
        }}
        onFocus={() => { if (data) setOpen(true); }}
        placeholder="Tìm sản phẩm, Moodboard..."
        value={query}
      />
      {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#78933c]/30 border-t-[#78933c]" /> : null}
    </label>
    {open ? <div className="absolute left-0 top-12 z-50 max-h-[70vh] w-[380px] overflow-auto rounded-2xl border border-[#ded6c9] bg-white p-3 shadow-2xl">
      {!data ? <p className="p-5 text-center text-xs text-[#8a6259]">Không thể kết nối dịch vụ tìm kiếm.</p> : data.resultCount===0 ? <p className="p-5 text-center text-xs text-[#737970]">Không tìm thấy kết quả cho “{query}”.</p> : groups.map(([label,items,href])=>items.length?<section className="mb-3 last:mb-0" key={label}><p className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[#82934f]">{label}</p>{items.map((item,index)=>{const image=item.image??item.imageUrl??item.logoUrl;const title=item.name??item.title??item.supplierStoreName??"Kết quả";return <Link className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f5f8e9]" href={href(item)} key={item._id??item.id??`${label}-${index}`} onClick={()=>setOpen(false)}>{image?<span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#eee9df]"><Image alt="" className="object-cover" fill sizes="40px" src={image} unoptimized/></span>:<span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f2eee6]">✦</span>}<span className="min-w-0"><span className="block truncate text-sm font-bold">{title}</span>{item.category?<span className="block text-[11px] text-[#777d75]">{item.category}</span>:null}</span></Link>})}</section>:null)}
    </div>:null}
  </div>;
}
