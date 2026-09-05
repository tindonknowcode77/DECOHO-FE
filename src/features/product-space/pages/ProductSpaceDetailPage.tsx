"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProductQuickView from "@/src/features/products/components/ProductQuickView";
import { getProductSpace } from "../services/productSpaceService";
import {
  ROOM_TYPE_LABELS,
  type ProductPoint,
  type ProductSpace,
  type ProductSpaceProduct,
} from "../types";

function getProduct(point: ProductPoint): ProductSpaceProduct | undefined {
  if (point.product && typeof point.product === "object") return point.product;
  if (point.productId && typeof point.productId === "object") return point.productId;
  return undefined;
}

function formatPrice(value: number | undefined): string {
  if (typeof value !== "number") return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function formatDate(value: string | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

type ProductSpaceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductSpaceDetailPage({
  params,
}: ProductSpaceDetailPageProps) {
  const [space, setSpace] = useState<ProductSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [id, setId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSpaceProduct | null>(null);

  useEffect(() => {
    params.then(({ id: resolvedId }) => setId(resolvedId));
  }, [params]);

  const loadSpace = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getProductSpace(id);
      setSpace(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải Moodboard");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSpace();
  }, [loadSpace]);

  const points = space?.productPoints ?? [];
  const roomLabel = space?.roomType
    ? (ROOM_TYPE_LABELS[space.roomType] ?? "Không gian")
    : "Không gian";
  const spaceId = space?._id ?? space?.id ?? space?.roomId ?? id;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff9f1] px-4 py-8 sm:px-8 sm:py-10">
        <section className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#79943b] border-t-transparent" />
          </div>
        </section>
      </main>
    );
  }

  if (error || !space) {
    return (
      <main className="min-h-screen bg-[#fff9f1] px-4 py-8 sm:px-8 sm:py-10">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
            <span className="text-6xl">⚠️</span>
            <h2 className="text-2xl font-black text-[#7b8079]">Không thể tải Moodboard</h2>
            <p className="text-[#7b7f78]">{error || "Moodboard không tồn tại"}</p>
            <Link
              className="mt-2 rounded-xl bg-[#79943b] px-5 py-3 text-sm font-bold text-white"
              href="/product-space"
            >
              Quay lại danh sách
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#fff9f1] px-4 py-8 text-[#2f6f5e] sm:px-8 sm:py-10">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md border border-[#d6ded8] bg-white px-3 py-2 text-sm font-bold text-[#2f6f5e] shadow-sm transition hover:border-[#2f6f5e] hover:bg-[#eef6f2]"
              href="/product-space"
            >
              <span aria-hidden="true">←</span>
              Quay lại danh sách Moodboard
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7b7f78]">
              {roomLabel}
              {space.isFeatured ? " · Nổi bật" : ""}
            </p>
          </div>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
            <div className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white p-3 shadow-[0_12px_36px_rgba(57,45,29,.09)]">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#ece7dd]">
                {space.imageUrl ? (
                  <Image
                    alt={space.title ?? "Moodboard"}
                    className="object-cover"
                    fill
                    priority
                    sizes="(min-width: 1024px) 54vw, 100vw"
                    src={space.imageUrl}
                    unoptimized
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-[#888d85]">
                    Chưa có ảnh cover
                  </div>
                )}
                {points.map((point, index) => (
                  <button
                    className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#ef6e61] text-xs font-black text-white shadow transition hover:bg-[#e0554a] hover:scale-110"
                    key={point._id ?? point.id ?? index}
                    style={{ left: `${point.x ?? 0}%`, top: `${point.y ?? 0}%` }}
                    onClick={() => {
                      const product = getProduct(point);
                      if (product) setSelectedProduct(product);
                    }}
                    aria-label={`Xem sản phẩm ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              {space.description ? (
                <p className="mt-4 px-2 pb-1 text-sm leading-6 text-[#5e645b]">
                  {space.description}
                </p>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-[#ddd2c2] bg-white p-5 shadow-[0_12px_36px_rgba(57,45,29,.09)] sm:p-7">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef4df] px-3 py-1 text-[11px] font-bold text-[#667c38]">
                  {roomLabel}
                </span>
                {space.isFeatured ? (
                  <span className="rounded-full bg-[#fff0c9] px-3 py-1 text-[11px] font-bold text-[#9a7020]">
                    Nổi bật
                  </span>
                ) : null}
                {space.isPublic ? (
                  <span className="rounded-full bg-[#eef6f2] px-3 py-1 text-[11px] font-bold text-[#2f6f5e]">
                    Công khai
                  </span>
                ) : (
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-1 text-[11px] font-bold text-[#7b6e58]">
                    Riêng tư
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                {space.title ?? "Moodboard chưa đặt tên"}
              </h1>

              <p className="mt-2 text-sm text-[#697067]">
                {points.length} sản phẩm đã gắn
                {space.createdAt ? ` · Tạo ngày ${formatDate(space.createdAt)}` : ""}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e8dfd2] bg-[#e8dfd2] text-sm">
                {[
                  ["Loại phòng", roomLabel],
                  ["Kích thước", `${space.width ?? 0} × ${space.length ?? 0} m`],
                  ["Số sản phẩm", `${points.length}`],
                  ["Trạng thái", space.isPublic ? "Công khai" : "Riêng tư"],
                ].map(([label, value]) => (
                  <div className="min-w-0 bg-[#fcfaf6] p-3" key={label}>
                    <p className="text-xs font-bold text-[#51564f]">{label}</p>
                    <p className="mt-1 break-words text-[#646a61]">{value}</p>
                  </div>
                ))}
              </div>

              <Link
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#79943b] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#6a8430]"
                href={`/product-space?highlight=${encodeURIComponent(spaceId)}`}
              >
                <span aria-hidden="true">＋</span>
                Thêm sản phẩm vào Moodboard
              </Link>
              <Link
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#ded6c9] bg-[#fcfaf6] px-5 py-3 text-sm font-bold text-[#51564f] transition hover:border-[#79943b] hover:text-[#667c38]"
                href="/showroom"
              >
                Xem trong Showroom 3D
              </Link>
            </aside>
          </div>

          <section className="mt-8 rounded-2xl border border-[#eadfce] bg-white p-5 shadow-[0_10px_30px_rgba(57,45,29,.07)] sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#eee6da] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#78913f]">
                  Danh sách sản phẩm
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Sản phẩm đã gắn ({points.length})
                </h2>
              </div>
              <Link
                className="rounded-md border border-[#cfc6b8] bg-white px-3 py-2 text-sm font-bold text-[#2f6f5e] transition hover:border-[#2f6f5e]"
                href="/products"
              >
                Xem toàn bộ catalog →
              </Link>
            </div>

            {points.length === 0 ? (
              <p className="mt-6 rounded-xl bg-[#faf7f1] p-6 text-center text-sm text-[#7b8079]">
                Moodboard này chưa gắn sản phẩm nào.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {points.map((point, index) => {
                  const product = getProduct(point);
                  return (
                    <button
                      className="group overflow-hidden rounded-2xl border border-[#ece4d8] bg-white p-2 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      key={point._id ?? point.id ?? index}
                      onClick={() => {
                        if (product) setSelectedProduct(product);
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f2eee7]">
                        {product?.images?.[0] ? (
                          <Image
                            alt={product.name ?? "Sản phẩm"}
                            className="object-cover transition duration-500 group-hover:scale-105"
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            src={product.images[0]}
                            unoptimized
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-3xl">
                            🪑
                          </div>
                        )}
                        <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#ef6e61] text-xs font-black text-white shadow">
                          {index + 1}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/30 hover:opacity-100">
                          <span className="rounded-full bg-white px-3 py-2 text-sm font-bold text-[#2f6f5e] shadow-lg">
                            Xem nhanh
                          </span>
                        </div>
                      </div>
                      <div className="px-1 pb-1 pt-3">
                        <p className="truncate text-sm font-black">
                          {product?.name ?? "Sản phẩm chưa đồng bộ"}
                        </p>
                        <p className="mt-1 text-xs text-[#78913f]">
                          {formatPrice(product?.price)}
                        </p>
                        {product?.brand ? (
                          <p className="mt-1 text-[11px] text-[#898d86]">
                            {product.brand}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>

      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
