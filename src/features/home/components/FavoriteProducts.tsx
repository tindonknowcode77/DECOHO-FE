"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Sparkles } from "lucide-react";

const products = [
  { name: "Đèn bàn Bắc Âu", price: "580.000đ", oldPrice: "750.000đ", badge: "NEW", image: "/images/product-space/urban-warmth.png" },
  { name: "Ghế nâu gỗ trang trí", price: "1.890.000đ", oldPrice: "2.350.000đ", badge: null, image: "/images/product-space/organic-calm.png" },
  { name: "Bình gốm Bắc Âu", price: "223.000đ", oldPrice: null, badge: "NEW", image: "/images/moodboards/contemporary-living-moodboard-v2.png" },
  { name: "Thảm Tropical Dreams boho", price: "420.000đ", oldPrice: "520.000đ", badge: "-19%", image: "/images/product-space/soft-evening.png" },
  { name: "Bộ khay trang trí Boho", price: "286.000đ", oldPrice: null, badge: null, image: "/images/product-space/urban-warmth.png" },
  { name: "Đồ trang trí Boho", price: "710.000đ", oldPrice: "890.000đ", badge: null, image: "/images/product-space/organic-calm.png" },
  { name: "Đèn mây tre đan treo", price: "690.000đ", oldPrice: "850.000đ", badge: "-19%", image: "/images/moodboards/contemporary-living-moodboard-v2.png" },
];

export default function FavoriteProducts() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction === "left" ? -360 : 360, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#d89b47]" strokeWidth={2.5} />
          <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Sản phẩm được yêu thích
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="hidden text-sm font-bold text-[#78933c] hover:text-[#2f6f5e] sm:inline"
            href="/products"
          >
            Xem tất cả
          </Link>
          <button
            aria-label="Trước"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
            onClick={() => scroll("left")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Sau"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
            onClick={() => scroll("right")}
            type="button"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
      >
        {products.map((product) => (
          <Link
            className="group w-[180px] shrink-0 overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1 sm:w-[200px]"
            href="/products"
            key={product.name}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f7f3ec]">
              <Image
                alt={product.name}
                className="object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="200px"
                src={product.image}
              />
              <button
                aria-label="Lưu sản phẩm"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur transition hover:bg-white"
                type="button"
              >
                <Bookmark className="h-4 w-4 text-[#2f6f5e]" />
              </button>
              {product.badge && (
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black text-white ${
                    product.badge === "NEW" ? "bg-[#2f6f5e]" : "bg-[#ef6e61]"
                  }`}
                >
                  {product.badge}
                </span>
              )}
            </div>
            <div className="px-1 pt-3">
              <h3 className="line-clamp-1 text-sm font-bold text-[#2f6f5e]">
                {product.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-bold text-[#2f6f5e]">{product.price}</span>
                {product.oldPrice && (
                  <span className="text-xs text-[#646a61] line-through">
                    {product.oldPrice}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
