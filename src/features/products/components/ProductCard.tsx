"use client";

import { ArrowUpRight, Eye, Heart, LoaderCircle, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getAccessToken } from "@/src/features/auth/services/session";
import type { Product } from "../types";
import { useProductFavorites } from "../hooks/useProductFavorites";
import { formatProductPrice } from "../utils/catalog";
import ProductArtwork from "./ProductArtwork";

export default function ProductCard({
  product,
  view = "grid",
  onQuickView,
}: {
  product: Product;
  view?: "grid" | "list";
  onQuickView?: (product: Product) => void;
}) {
  const { isLiked, toggle, busy } = useProductFavorites();
  const [error, setError] = useState("");
  const saved = isLiked(product.id);
  const isList = view === "list";
  async function save() {
    if (!getAccessToken()) {
      setError("Đăng nhập để lưu sản phẩm.");
      return;
    }
    setError("");
    const result = await toggle(product.id);
    if (result === null) setError("Chưa lưu được. Bạn thử lại nhé.");
  }
  return (
    <article
      className={`group min-w-0 rounded-2xl border border-[#e5e5da] bg-white transition-shadow duration-300 hover:shadow-[0_12px_35px_#35462a0a] ${isList ? "flex gap-4 p-3 sm:gap-6 sm:p-4" : "overflow-hidden"}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${isList ? "h-36 w-28 rounded-xl sm:h-48 sm:w-48" : "aspect-[4/4.3]"}`}
      >
        <Link
          href={`/products/${product.id}`}
          aria-label={`Xem ${product.name}`}
          className="absolute inset-0"
        >
          <ProductArtwork
            src={product.image}
            name={product.name}
            category={product.category}
          />
        </Link>
        {product.discountPercentage > 0 && (
          <span className="absolute left-2 top-3 rounded-full bg-[#fbf3e7] px-2.5 py-1 text-[10px] font-semibold text-[#9f663d] sm:left-3">
            −{product.discountPercentage}%
          </span>
        )}
        <button
          type="button"
          aria-label={`${saved ? "Bỏ lưu" : "Lưu"} ${product.name}`}
          aria-pressed={saved}
          disabled={busy}
          onClick={() => void save()}
          className="absolute right-2 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#466044] shadow-sm transition hover:bg-white disabled:opacity-50 sm:right-3 sm:h-9 sm:w-9"
        >
          {busy ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
          )}
        </button>
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col ${isList ? "py-1" : "p-3.5 sm:p-5"}`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-[9px] uppercase tracking-[0.1em] text-[#869078] sm:text-[10px]">
            {product.category}
          </span>
          {product.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-[#a78049]">
              <Star size={11} fill="currentColor" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#304c38] sm:text-base">
          <Link
            href={`/products/${product.id}`}
            className="hover:text-[#799657]"
          >
            {product.name}
          </Link>
        </h3>
        {isList && (
          <p className="mt-2 hidden line-clamp-2 text-xs leading-6 text-[#838976] sm:block">
            {product.description}
          </p>
        )}
        <div className="mb-3 mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-sm font-semibold text-[#354d30] sm:text-base">
            {formatProductPrice(product.priceVND)}
          </p>
          {product.discountPercentage > 0 && (
            <span className="text-[10px] text-[#9c9e90] line-through">
              {formatProductPrice(product.originalPriceVND)}
            </span>
          )}
        </div>
        {error && (
          <p role="alert" className="mb-3 text-xs text-[#a3503b]">
            {error}
            {!getAccessToken() && (
              <Link href="/login" className="ml-1 underline">
                Đăng nhập
              </Link>
            )}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-1 border-t border-[#eff0e8] pt-3">
          <span
            className={`text-[10px] ${product.stock > 0 ? "text-[#81906b]" : "text-[#aa8d7d]"}`}
          >
            {product.stock > 0 ? "Có sẵn" : "Tạm hết hàng"}
          </span>
          {onQuickView ? (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`Xem nhanh ${product.name}`}
              className="inline-flex items-center gap-1.5 rounded-md py-1 text-[11px] font-medium text-[#496848] hover:text-[#91a867]"
            >
              <Eye size={14} />
              <span>Xem nhanh</span>
            </button>
          ) : (
            <Link
              href={`/products/${product.id}`}
              className="flex items-center gap-1 text-xs"
            >
              Chi tiết <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
