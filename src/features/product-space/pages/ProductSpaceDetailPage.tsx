"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductQuickView from "@/src/features/products/components/ProductQuickView";
import { getProductById } from "@/src/features/products/services/productService";
import { getProductSpace } from "../services/productSpaceService";
import {
  ROOM_TYPE_LABELS,
  type ProductPoint,
  type ProductSpace,
  type ProductSpaceProduct,
} from "../types";
import { findDemoMoodboard, isLikelyMongoId, DEMO_PRODUCT_MAP } from "../data/demoSpaces";

/**
 * BE có thể populate `productPoints[].productId` thành object ProductSpaceProduct,
 * hoặc chỉ trả về string id. Hàm này ưu tiên object (nếu có) hoặc fallback
 * đọc từ cache client (được fill bằng `getProductById`).
 */
function readProduct(
  point: ProductPoint,
  cache: Map<string, ProductSpaceProduct>,
): ProductSpaceProduct | undefined {
  if (point.product && typeof point.product === "object") return point.product;
  if (point.productId && typeof point.productId === "object") return point.productId;
  const id =
    typeof point.productId === "string"
      ? point.productId
      : point._id ?? point.id ?? "";
  if (!id) return undefined;
  return cache.get(String(id));
}

function getProductId(point: ProductPoint): string {
  if (typeof point.productId === "string") return point.productId;
  if (point.productId && typeof point.productId === "object") {
    return String(point.productId._id ?? point.productId.id ?? "");
  }
  return "";
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
  const [productCache, setProductCache] = useState<Map<string, ProductSpaceProduct>>(
    new Map(),
  );
  const [pendingProductId, setPendingProductId] = useState<string>("");
  const cacheRef = useRef(productCache);
  cacheRef.current = productCache;

  useEffect(() => {
    params.then(({ id: resolvedId }) => setId(resolvedId));
  }, [params]);

  const loadSpace = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    // Only known demo IDs use fixtures. Imported boards may also have string IDs.
    const demo = findDemoMoodboard(id);
    if (demo) {
      setSpace(demo);
      setLoading(false);
      return;
    }

    // Both ObjectIds and legacy IDs are resolved by the backend.
    try {
      const data = await getProductSpace(id);
      setSpace(data);
      // Cache luôn các product đã được BE populate (object) để render nhanh
      if (data?.productPoints?.length) {
        setProductCache((prev) => {
          const next = new Map(prev);
          for (const point of data.productPoints ?? []) {
            const idStr = getProductId(point);
            if (!idStr) continue;
            const embedded = readProduct(point, new Map());
            if (embedded) next.set(idStr, embedded);
          }
          return next;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải Moodboard");
      setSpace(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSpace();
  }, [loadSpace]);

  const openProduct = useCallback(
    async (point: ProductPoint) => {
      const embedded = readProduct(point, cacheRef.current);
      if (embedded) {
        setSelectedProduct(embedded);
        return;
      }
      const idStr = getProductId(point);
      if (!idStr) return;

      // Id demo (không phải MongoId) -> dùng map mock, không gọi API
      if (!isLikelyMongoId(idStr)) {
        const demoProduct = DEMO_PRODUCT_MAP[idStr];
        if (demoProduct) {
          cacheRef.current = new Map(cacheRef.current).set(idStr, demoProduct);
          setProductCache(new Map(cacheRef.current));
          setSelectedProduct(demoProduct);
          return;
        }
        // Không có demo -> vẫn mở QuickView với skeleton
        setSelectedProduct({ _id: idStr, id: idStr, name: "Sản phẩm demo" });
        return;
      }

      // Lazy fetch khi BE chỉ trả về string id (MongoId 24-hex)
      try {
        setPendingProductId(idStr);
        const product = await getProductById(idStr);
        if (!product) return;
        const normalized: ProductSpaceProduct = {
          _id: product.id ?? product.sku ?? idStr,
          id: product.id ?? idStr,
          name: product.name,
          price: product.priceVND,
          images:
            product.images?.length
              ? product.images
              : product.image
              ? [product.image]
              : [],
          image: product.image,
          brand: product.brand,
        };
        cacheRef.current = new Map(cacheRef.current).set(idStr, normalized);
        setProductCache(new Map(cacheRef.current));
        setSelectedProduct(normalized);
      } catch {
        // vẫn mở QuickView với skeleton (chỉ có id) để user thấy đang tải
        setSelectedProduct({ _id: idStr, id: idStr, name: "Đang tải sản phẩm…" });
      } finally {
        setPendingProductId("");
      }
    },
    [],
  );

  const points = space?.productPoints ?? [];
  const roomLabel = space?.roomType
    ? (ROOM_TYPE_LABELS[space.roomType] ?? "Không gian")
    : "Không gian";
  const spaceId = space?._id ?? space?.id ?? space?.roomId ?? id;

  // Memo để render không bị re-create Map mỗi lần
  const pointsWithCachedProduct = useMemo(
    () =>
      points.map((point) => ({
        point,
        product: readProduct(point, productCache),
        id: getProductId(point),
      })),
    [points, productCache],
  );

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
                {points.map((point, index) => {
                  const productId = getProductId(point);
                  const pending = pendingProductId === productId;
                  const isSelected =
                    String(selectedProduct?._id ?? selectedProduct?.id ?? "") ===
                    String(productId);
                  return (
                    <button
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow transition disabled:opacity-60
                        h-3 w-3
                        ${isSelected ? "scale-125 bg-[#79943b] ring-2 ring-white/80" : "bg-[#ef6e61]"}
                        hover:scale-125 hover:bg-[#79943b] focus-visible:scale-125 focus-visible:bg-[#79943b]`}
                      key={point._id ?? point.id ?? index}
                      style={{
                        left: `${point.x ?? 0}%`,
                        top: `${point.y ?? 0}%`,
                      }}
                      onClick={() => {
                        void openProduct(point);
                      }}
                      disabled={pending}
                      aria-label={`Xem sản phẩm ${index + 1}`}
                      title={`Sản phẩm ${index + 1}`}
                    >
                      {pending ? (
                        <span className="block h-full w-full animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 px-2 pb-1 text-xs font-bold text-[#78913f]">
                Bấm vào chấm tròn trên ảnh để xem chi tiết sản phẩm
              </p>
              {space.description ? (
                <p className="mt-1 px-2 pb-1 text-sm leading-6 text-[#5e645b]">
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
                {pointsWithCachedProduct.map(({ point, product, id: productId }, index) => {
                  const pending = pendingProductId === productId;
                  return (
                    <button
                      className="group overflow-hidden rounded-2xl border border-[#ece4d8] bg-white p-2 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:opacity-60"
                      key={point._id ?? point.id ?? index}
                      onClick={() => {
                        void openProduct(point);
                      }}
                      disabled={pending}
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
                        ) : pending ? (
                          <div className="grid h-full place-items-center">
                            <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#79943b] border-t-transparent" />
                          </div>
                        ) : (
                          <div className="grid h-full place-items-center text-3xl">
                            🪑
                          </div>
                        )}
                        <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#ef6e61] text-xs font-black text-white shadow">
                          {index + 1}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                          <span className="rounded-full bg-white px-3 py-2 text-sm font-bold text-[#2f6f5e] shadow-lg">
                            Xem nhanh
                          </span>
                        </div>
                      </div>
                      <div className="px-1 pb-1 pt-3">
                        <p className="truncate text-sm font-black">
                          {product?.name ?? (pending ? "Đang tải…" : "Sản phẩm chưa đồng bộ")}
                        </p>
                        <p className="mt-1 text-xs text-[#78913f]">
                          {product?.price ? formatPrice(product.price) : pending ? "" : "—"}
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
