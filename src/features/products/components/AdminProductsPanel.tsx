"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteProduct,
  getProducts,
} from "../services/productService";
import type { Product } from "../types";
import ProductForm from "./ProductForm";

type Props = { accessToken?: string };

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; product: Product };

export default function AdminProductsPanel({ accessToken }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>({ mode: "list" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAuth = useCallback(
    (path: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers ?? {});
      headers.set("Accept", "application/json");
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
      return fetch(`${apiBase()}${path}`, { ...init, headers });
    },
    [accessToken],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getProducts();
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = useCallback(
    async (product: Product) => {
      const confirmed = window.confirm(`Xoá sản phẩm "${product.name}"?`);
      if (!confirmed) return;
      setDeletingId(product.id);
      try {
        await deleteProduct(product.id);
        setItems((prev) => prev.filter((item) => item.id !== product.id));
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "Xoá thất bại.");
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const filtered = items.filter((item) =>
    [item.name, item.sku, item.category, item.brand]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query.toLowerCase())),
  );

  if (view.mode === "create") {
    return (
      <ProductForm
        onSaved={(saved) => {
          setItems((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
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
            prev.map((p) => (p.id === saved.id ? saved : p)),
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
            Có {items.length} sản phẩm. Sản phẩm admin đăng sẽ tự động ở trạng thái <strong>APPROVED</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setView({ mode: "create" })}
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
          className="h-11 rounded-lg border border-[#dcd5c3] px-5 text-sm font-bold text-[#17211b] hover:bg-[#faf6ec]"
        >
          Tải lại
        </button>
      </div>

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
                <h3 className="line-clamp-2 font-black text-[#17211b]">{product.name}</h3>
                <p className="text-xs text-[#777e77]">
                  {product.category || "—"} · {product.brand || "DECOHO"}
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

                <div className="mt-3 flex gap-2 border-t border-[#e5dfd2] pt-3">
                  <button
                    type="button"
                    onClick={() => setView({ mode: "edit", product })}
                    className="flex-1 rounded-lg border border-[#dcd5c3] px-3 py-2 text-xs font-bold text-[#17211b] hover:bg-[#faf6ec]"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === product.id}
                    onClick={() => void onDelete(product)}
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
