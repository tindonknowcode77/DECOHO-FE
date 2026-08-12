"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAccessToken, getSessionUser } from "@/src/features/auth/services/session";

type ApiProduct = Record<string, unknown>;

export default function StoreDashboardView() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getSessionUser();
  const loadProducts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
      const token = getAccessToken();
      const response = await fetch(`${base}/products/supplier/mine`, { cache: "no-store", headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message ?? "Không thể tải sản phẩm.");
      setProducts(Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : []);
    } catch (value) { setError(value instanceof Error ? value.message : "Không thể kết nối backend."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void loadProducts(), 0); return () => window.clearTimeout(timer); }, [loadProducts]);
  if (!user || user.role !== "supplier") return <main className="grid min-h-screen place-items-center bg-[#f5f1ea] p-6"><div className="rounded-2xl bg-white p-8 text-center"><h1 className="text-2xl font-black">Khu vực Supplier</h1><p className="mt-3 text-sm text-neutral-600">Vui lòng đăng nhập bằng tài khoản supplier đã được Admin duyệt.</p><Link className="mt-5 inline-block rounded-lg bg-[#17211b] px-5 py-3 font-bold text-white" href="/login">Đăng nhập</Link></div></main>;
  return <main className="min-h-screen bg-[#f5f1ea] px-5 py-12"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#a76227]">Supplier Center</p><h1 className="mt-2 text-4xl font-black">{user.storeName || user.name}</h1><p className="mt-2 text-sm text-neutral-600">Dữ liệu được đồng bộ trực tiếp từ hệ thống DECOHO.</p></div><button className="rounded-lg border bg-white px-4 py-2 font-bold" onClick={() => void loadProducts()} type="button">Tải lại</button></div>{loading ? <p className="mt-10">Đang tải sản phẩm...</p> : error ? <p className="mt-10 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : products.length === 0 ? <p className="mt-10 rounded-xl border bg-white p-8 text-center text-neutral-500">Supplier chưa có sản phẩm.</p> : <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{products.map((product, index) => { const id=String(product._id ?? product.id ?? index); return <article className="rounded-xl border bg-white p-5" key={id}><h2 className="font-black">{String(product.name ?? "Sản phẩm chưa đặt tên")}</h2><p className="mt-2 text-sm text-neutral-600">Trạng thái: {String(product.status ?? "—")}</p><p className="mt-1 text-sm text-neutral-600">Tồn kho: {String(product.stock ?? product.quantity ?? "—")}</p></article> })}</div>}</div></main>;
}
