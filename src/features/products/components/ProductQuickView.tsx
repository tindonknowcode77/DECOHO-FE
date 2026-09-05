"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductSpaceProduct } from "../../product-space/types";
import { getProductById } from "@/src/features/products/services/productService";
import type { Product } from "../types";
import AddToCartButton from "@/src/features/cart/components/AddToCartButton";

type ProductQuickViewProps = {
  product: ProductSpaceProduct | undefined;
  onClose: () => void;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

export default function ProductQuickView({
  product,
  onClose,
}: ProductQuickViewProps) {
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productId = product?._id ?? product?.id;

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getProductById(String(productId));
      setFullProduct(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!product) return null;

  const displayProduct = fullProduct ?? {
    id: String(productId ?? ""),
    sku: "Đang cập nhật",
    name: product.name ?? "Sản phẩm",
    brand: product.brand ?? "DECOHO",
    category: "Nội thất",
    priceVND: product.price ?? 0,
    originalPriceVND: product.price ?? 0,
    discountPercentage: 0,
    stock: 0,
    availability: "Đang cập nhật",
    dimensions: "Đang cập nhật",
    material: "Đang cập nhật",
    color: product.brand ?? "Đang cập nhật",
    image: product.images?.[0] ?? product.image ?? "",
    images: product.images ?? [product.image ?? ""],
    tags: [],
    style: "",
    styleName: product.brand ?? "Nội thất",
    description: "Thông tin sản phẩm đang được cập nhật.",
    rating: 0,
    reviewsCount: 0,
    specifications: {},
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl font-bold text-[#646a61] shadow-lg transition hover:bg-white hover:text-[#2f6f5e]"
          onClick={onClose}
          aria-label="Đóng"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#79943b] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-[#7b7f78]">{error}</p>
            <button
              className="rounded-lg bg-[#79943b] px-5 py-2 text-sm font-bold text-white"
              onClick={loadProduct}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[300px] bg-[#f5f1ea] lg:min-h-[500px]">
              {displayProduct.images?.[0] ? (
                <Image
                  alt={displayProduct.name}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={displayProduct.images[0]}
                  unoptimized
                />
              ) : (
                <div className="grid h-full place-items-center text-6xl">🪑</div>
              )}
              {displayProduct.discountPercentage > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-[#bc3d2b] px-3 py-1.5 text-sm font-bold text-white">
                  -{displayProduct.discountPercentage}%
                </span>
              )}
            </div>

            <div className="flex flex-col p-6 lg:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef4df] px-3 py-1 text-[11px] font-bold text-[#667c38]">
                  {displayProduct.category}
                </span>
                <span className="rounded-full bg-[#eef6f2] px-3 py-1 text-[11px] font-bold text-[#2f6f5e]">
                  {displayProduct.styleName}
                </span>
              </div>

              <h2
                className="mt-4 text-2xl font-black leading-tight lg:text-3xl"
                id="quickview-title"
              >
                {displayProduct.name}
              </h2>

              <p className="mt-2 text-sm text-[#646a61]">
                {displayProduct.brand} · SKU {displayProduct.sku}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-bold text-[#b46f2c]">
                  {displayProduct.rating}
                </span>
                <span className="text-sm font-semibold text-[#b46f2c]">★</span>
                <span className="h-1 w-1 rounded-full bg-[#c9c0b3]" />
                <span className="text-sm text-[#646a61]">
                  {displayProduct.reviewsCount} đánh giá
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-[#eee7dc] pt-5">
                <p className="text-3xl font-bold text-[#bc3d2b]">
                  {formatPrice(displayProduct.priceVND)}
                </p>
                {displayProduct.discountPercentage > 0 && (
                  <p className="pb-1 text-lg text-[#848982] line-through">
                    {formatPrice(displayProduct.originalPriceVND)}
                  </p>
                )}
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#646a61]">
                {displayProduct.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-[#e8dfd2] bg-[#fcfaf6] p-4 text-sm">
                {[
                  ["Kích thước", displayProduct.dimensions],
                  ["Vật liệu", displayProduct.material],
                  ["Màu sắc", displayProduct.color],
                  ["Tồn kho", `${displayProduct.stock} sản phẩm`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-[#51564f]">{label}</p>
                    <p className="mt-0.5 text-[#646a61]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                {fullProduct && (
                  <AddToCartButton
                    item={{
                      id: `quickview-${fullProduct.id}`,
                      category: fullProduct.category,
                      dimensions: fullProduct.dimensions,
                      image: fullProduct.image,
                      material: fullProduct.material,
                      name: fullProduct.name,
                      priceVND: fullProduct.priceVND,
                      productHref: `/products/${fullProduct.id}`,
                      source: "catalog",
                      stock: fullProduct.stock,
                      style: fullProduct.styleName,
                    }}
                  />
                )}
                <Link
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#2f6f5e] bg-white px-5 py-3 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#eef6f2]"
                  href={`/products/${productId}`}
                >
                  Xem chi tiết đầy đủ →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
