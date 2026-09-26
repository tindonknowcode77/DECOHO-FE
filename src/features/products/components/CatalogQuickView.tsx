"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import AddToCartButton from "@/src/features/cart/components/AddToCartButton";
import type { Product } from "../types";
import { formatProductPrice } from "../utils/catalog";
import ProductArtwork from "./ProductArtwork";

export default function CatalogQuickView({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [selected, setSelected] = useState(product.image);
  const images = [
    ...new Set([product.image, ...product.images].filter(Boolean)),
  ];
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby={title}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[90dvh] w-[94vw] max-w-4xl overflow-y-auto rounded-3xl border-0 bg-[#fdfcf8] p-0 text-[#304b36] shadow-2xl backdrop:bg-[#203c2d]/65 backdrop:backdrop-blur-sm"
    >
      <div className="relative grid sm:grid-cols-2">
        <button
          onClick={onClose}
          type="button"
          aria-label="Đóng xem nhanh"
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-sm"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col bg-[#eeeee4]">
          <div className="relative aspect-square sm:aspect-auto sm:min-h-[430px] sm:flex-1">
            <ProductArtwork
              src={selected}
              name={product.name}
              category={product.category}
              sizes="(max-width: 640px) 90vw, 450px"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {images.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setSelected(src)}
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-pressed={selected === src}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${selected === src ? "border-[#64855c]" : "border-transparent"}`}
                >
                  <ProductArtwork
                    src={src}
                    name={product.name}
                    category={product.category}
                    sizes="60px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col p-6 sm:py-12 sm:pl-8 sm:pr-7">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8b967c]">
            {product.category}
          </p>
          <h2 id={title} className="mt-3 text-3xl leading-tight">
            {product.name}
          </h2>
          <p className="mt-2 text-xs text-[#8b907f]">{product.brand}</p>
          <div className="my-5 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold">
              {formatProductPrice(product.priceVND)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-sm text-[#939889] line-through">
                {formatProductPrice(product.originalPriceVND)}
              </span>
            )}
          </div>
          <p className="mb-5 text-sm leading-7 text-[#7c8572]">
            {product.description}
          </p>
          <dl className="mb-6 grid grid-cols-2 gap-4 border-y border-[#e5e7dc] py-5 text-xs">
            {[
              ["Chất liệu", product.material],
              ["Màu sắc", product.color],
              ["Kích thước", product.dimensions],
              ["Tình trạng", product.stock > 0 ? "Có sẵn" : "Tạm hết hàng"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[#919886]">{label}</dt>
                <dd className="mt-1.5 leading-5">{value || "Đang cập nhật"}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex flex-col gap-3">
            <AddToCartButton
              item={{
                id: `catalog-${product.id}`,
                name: product.name,
                category: product.category,
                style: product.styleName,
                material: product.material,
                dimensions: product.dimensions,
                image: product.image,
                priceVND: product.priceVND,
                productHref: `/products/${product.id}`,
                source: "catalog",
                stock: product.stock,
              }}
            />
            <Link
              href={`/products/${product.id}`}
              className="flex items-center justify-center gap-2 py-2 text-sm font-medium"
            >
              Xem chi tiết sản phẩm <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
