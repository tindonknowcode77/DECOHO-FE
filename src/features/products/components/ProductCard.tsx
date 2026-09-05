"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProductImage from "./ProductImage";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function Badge({ kind }: { kind: "new" | "hot" | "sale" | "best" }) {
  const styles = {
    new: "bg-[#5786B6] text-white",
    hot: "bg-[#BC3D2B] text-white",
    sale: "bg-[#EC9C32] text-white",
    best: "bg-[#7E9A3F] text-white",
  };
  const labels = {
    new: "Mới",
    hot: "Hot",
    sale: "-20%",
    best: "Best",
  };
  return (
    <span
      className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm ${styles[kind]}`}
    >
      {labels[kind]}
    </span>
  );
}

function getBadge(product: Product): "new" | "hot" | "sale" | "best" | null {
  if (product.discountPercentage && product.discountPercentage >= 10) return "sale";
  if (product.status === "hot") return "hot";
  if (product.status === "new") return "new";
  return null;
}

export default function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const [saved, setSaved] = useState(false);
  const badge = getBadge(product);
  const soldCount = product.reviewsCount ?? 0;

  function toggleSave(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setSaved((prev) => !prev);
  }

  if (view === "list") {
    return (
      <article className="group flex gap-4 overflow-hidden rounded-2xl border border-[#e8e1d4] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-4">
        <Link className="relative block shrink-0" href={`/products/${product.id}`}>
          <div className="relative h-28 w-28 overflow-hidden rounded-xl bg-[#f4f0e6] sm:h-32 sm:w-32">
            <ProductImage
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              fill
              sizes="128px"
              src={product.image}
            />
            {badge && <Badge kind={badge} />}
          </div>
        </Link>

        <div className="flex flex-1 flex-col justify-between gap-2">
          <div>
            <Link
              className="block text-sm font-bold leading-snug text-[#2f6f5e] transition hover:text-[#7e9a3f] sm:text-base"
              href={`/products/${product.id}`}
            >
              {product.name}
            </Link>
            <p className="mt-1 line-clamp-1 text-xs text-[#646a61]">
              {product.material} · {product.category}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-bold text-[#7e9a3f] sm:text-lg">
              {formatPrice(product.priceVND)}
            </p>
            <button
              aria-label={saved ? "Bỏ lưu" : "Lưu sản phẩm"}
              className={`grid h-8 w-8 place-items-center rounded-full transition ${
                saved
                  ? "bg-[#bc3d2b] text-white"
                  : "border border-[#e8e1d4] text-[#646a61] hover:border-[#bc3d2b] hover:text-[#bc3d2b]"
              }`}
              onClick={toggleSave}
              type="button"
            >
              <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1 hover:shadow-xl">
      <Link className="block" href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f4f0e6]">
          <ProductImage
            alt={product.name}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(min-width:1280px) 25vw,(min-width:768px) 33vw,50vw"
            src={product.image}
          />

          {badge && <Badge kind={badge} />}

          {/* Wishlist */}
          <button
            aria-label={saved ? "Bỏ lưu" : "Lưu sản phẩm"}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur transition hover:bg-white"
            onClick={toggleSave}
            type="button"
          >
            <Heart
              className={`h-4 w-4 transition ${saved ? "text-[#bc3d2b]" : "text-[#2f6f5e]"}`}
              fill={saved ? "currentColor" : "none"}
            />
          </button>

          {/* Sold count */}
          {soldCount > 0 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#646a61] backdrop-blur">
              {soldCount} đã bán
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link className="block" href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#2f6f5e] transition hover:text-[#7e9a3f]">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-base font-bold text-[#7e9a3f]">
          {formatPrice(product.priceVND)}
        </p>
      </div>
    </article>
  );
}
