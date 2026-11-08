"use client";
import { confirmDelete } from "@/src/components/common/confirmDelete";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteProduct,
  getAdminProducts,
} from "../services/productService";
import type { Product } from "../types";
import ProductForm from "./ProductForm";

type Props = { accessToken?: string };

type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; product: Product };

function getProductTimestamp(p: Product): number {
  if (p.createdAt) {
    const t = new Date(p.createdAt).getTime();
    if (!Number.isNaN(t) && t > 0) return t;
  }
  const raw = p.__raw as Record<string, unknown> | undefined;
  if (raw?.createdAt) {
    const t = new Date(String(raw.createdAt)).getTime();
    if (!Number.isNaN(t) && t > 0) return t;
  }
  const idStr = String(p.id ?? raw?._id ?? "");
  if (/^[0-9a-fA-F]{24}$/.test(idStr)) {
    return parseInt(idStr.substring(0, 8), 16) * 1000;
  }
  return 0;
}

function sortByNewest(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const tsA = getProductTimestamp(a);
    const tsB = getProductTimestamp(b);
    if (tsA !== tsB) return tsB - tsA;
    return String(b.id || "").localeCompare(String(a.id || ""));
  });
}

function formatCreatedDate(p: Product): string {
  const ts = getProductTimestamp(p);
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function isNewProduct(p: Product, allSorted: Product[]): boolean {
  const ts = getProductTimestamp(p);
  const now = Date.now();
  if (ts > 0 && now - ts < 7 * 24 * 60 * 60 * 1000) {
    return true;
  }
  const idx = allSorted.findIndex((item) => item.id === p.id);
  return idx >= 0 && idx < 3;
}

export default function AdminProductsPanel({ accessToken }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>({ mode: "list" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  async function removeProducts(products: Product[]) {
    if (deletingId || !products.length) return;
    if (!await confirmDelete(`Xóa ${products.length} sản phẩm${products.length === 1 ? ` "${products[0].name}"` : " đã chọn"}? Thao tác không thể hoàn tác.`)) return;
    setDeletingId(products[0].id);
    setError("");
    setNotice("");
    const deleted = new Set<string>();
    const failures: string[] = [];
    try {
      for (const product of products) {
        setDeletingId(product.id);
        try { await deleteProduct(product.id); deleted.add(product.id); }
        catch (value) { failures.push(`${product.name}: ${value instanceof Error ? value.message : "Xóa thất bại"}`); }
      }
      setItems(prev => prev.filter(item => !deleted.has(item.id)));
      setSelected(prev => prev.filter(id => !deleted.has(id)));
      setNotice(`Đã xóa ${deleted.size}/${products.length} sản phẩm.`);
      if (failures.length) setError(failures.join("; "));
    } finally { setDeletingId(null); }
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getAdminProducts(accessToken);
      const sorted = sortByNewest(list);
      setItems(sorted);
      setSelected(prev => prev.filter(id => sorted.some(item => item.id === id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => {
    const list = items.filter((item) =>
      [item.name, item.sku, item.category, item.brand]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query.toLowerCase())),
    );
    return sortByNewest(list);
  }, [items, query]);

  if (view.mode === "create") {
    return (
      <ProductForm
        onSaved={(saved) => {
          setItems((prev) => sortByNewest([saved, ...prev.filter((p) => p.id !== saved.id)]));
          setView({ mode: "list" });
        }}
        onCancel={() => setView({ mode: "list" })}
      />
    );
  }

  if (view.mode === "edit") {
    return (
      <ProductForm
        initial={view.product}
        onSaved={(saved) => {
          setItems((prev) =>
            sortByNewest(prev.map((p) => (p.id === saved.id ? saved : p))),
          );
          setView({ mode: "list" });
        }}
        onCancel={() => setView({ mode: "list" })}
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-[#17211b]">Quản lý sản phẩm</h2>
          <p className="text-xs text-[#777e77]">
            Có {items.length} sản phẩm (sản phẩm mới nhất luôn hiển thị đầu tiên). Sản phẩm admin đăng sẽ tự động ở trạng thái <strong>APPROVED</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setView({ mode: "create" })}
          disabled={deletingId !== null}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#2f6f5e] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#265a4c] sm:self-auto"
        >
          + Đăng sản phẩm mới
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, SKU, danh mục, thương hiệu..."
          className="h-11 flex-1 rounded-lg border border-[#dcd5c3] bg-white px-4 text-sm focus:border-[#2f6f5e] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || deletingId !== null}
          className="h-11 rounded-lg border border-[#dcd5c3] px-5 text-sm font-bold text-[#17211b] hover:bg-[#faf6ec]"
        >
          Tải lại
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox"
          disabled={loading || deletingId !== null || !filtered.length}
          checked={filtered.length > 0 && filtered.every(item => selected.includes(item.id))}
          onChange={event => setSelected(prev => event.target.checked
            ? [...new Set([...prev, ...filtered.map(item => item.id)])]
            : prev.filter(id => !filtered.some(item => item.id === id)))} /> Chọn tất cả kết quả lọc</label>
        <button type="button" disabled={loading || deletingId !== null || !items.length}
          onClick={() => setSelected(items.map(item => item.id))}>Chọn toàn bộ {items.length} sản phẩm</button>
        <span>Đã chọn {selected.length}</span>
        <button type="button" disabled={loading || deletingId !== null || !selected.length}
          className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white disabled:opacity-50"
          onClick={() => void removeProducts(items.filter(item => selected.includes(item.id)))}>
          {deletingId ? "Đang xóa…" : "Xóa đã chọn"}</button>
        <button type="button" disabled={deletingId !== null} onClick={() => setSelected([])}>Bỏ chọn</button>
      </div>
      {notice && <p role="status" className="text-sm text-green-800">{notice}</p>}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#e5dfd2] bg-white p-12 text-center text-sm">
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5dfd2] bg-white p-12 text-center">
          <h3 className="text-lg font-black text-[#17211b]">Chưa có sản phẩm nào</h3>
          <p className="mt-2 text-sm text-[#777e77]">
            Bấm <strong>Đăng sản phẩm mới</strong> để bắt đầu — sản phẩm sẽ lên trang chủ ngay.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#e5dfd2] bg-white shadow-sm"
            >
              <label className="flex items-center gap-2 p-3 text-sm"><input type="checkbox"
                disabled={deletingId !== null} checked={selected.includes(product.id)}
                aria-label={`Chọn ${product.name}`}
                onChange={event => setSelected(prev => event.target.checked ? [...prev, product.id] : prev.filter(id => id !== product.id))} /> Chọn sản phẩm</label>
              <div className="relative h-44 bg-[#faf6ec]">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[#777e77]">
                    Chưa có ảnh
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded bg-[#17211b]/85 px-2 py-1 text-[10px] font-bold uppercase text-white">
                  {product.availability || "APPROVED"}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-black text-[#17211b]">{product.name}</h3>
                  {isNewProduct(product, filtered) ? (
                    <span className="shrink-0 rounded-full border border-[#2f6f5e]/30 bg-[#eef6f2] px-2 py-0.5 text-[10px] font-bold text-[#2f6f5e]">
                      Mới
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-[#777e77]">
                  {product.category || "—"} · {product.brand || "DECOHO"}
                  {formatCreatedDate(product) ? ` · ${formatCreatedDate(product)}` : ""}
                </p>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-lg font-black text-[#2f6f5e]">
                      {product.priceVND.toLocaleString("vi-VN")} đ
                    </p>
                    {product.discountPercentage > 0 ? (
                      <p className="text-xs text-[#a1835a]">
                        -{product.discountPercentage}% ·{" "}
                        <s>{product.originalPriceVND.toLocaleString("vi-VN")} đ</s>
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs text-[#777e77]">Kho: {product.stock || 0}</span>
                </div>

                <div className="mt-1 flex items-center justify-end">
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-[#fff1ec] px-2 py-0.5 text-xs font-bold text-[#ee4d2d]"
                    title="Số lượt người dùng bấm Mua trên Shopee"
                  >
                    🖱️ {product.shopeeClicks ?? 0} click Shopee
                  </span>
                </div>

                <div className="mt-3 flex gap-2 border-t border-[#e5dfd2] pt-3">
                  <button
                    type="button"
                    onClick={() => setView({ mode: "edit", product })}
                    disabled={deletingId !== null}
                    className="flex-1 rounded-lg border border-[#dcd5c3] px-3 py-2 text-xs font-bold text-[#17211b] hover:bg-[#faf6ec]"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    disabled={deletingId !== null}
                    onClick={() => void removeProducts([product])}
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === product.id ? "Đang xoá..." : "Xoá"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
