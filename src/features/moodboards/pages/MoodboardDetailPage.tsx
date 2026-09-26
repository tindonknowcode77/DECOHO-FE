"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Heart,
  Loader2,
  Package2,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  fetchMoodboardById,
  fetchMoodboardProducts,
} from "../services/moodboardsService";
import type { Moodboard, MoodboardProductSummary } from "../types";
import {
  getSavedMoodboardIds,
  saveMoodboardMeta,
  subscribeSavedMoodboards,
  toggleSavedMoodboard,
  type SavedMoodboard,
} from "@/src/features/profile/services/wishlistStorage";

const ROOM_TYPE_LABELS: Record<string, string> = {
  all: "Tất cả",
  living_room: "Phòng khách",
  bedroom: "Phòng ngủ",
  kitchen: "Bếp",
  bathroom: "Phòng tắm",
  study: "Phòng làm việc",
  dining: "Phòng ăn",
  outdoor: "Ngoài trời",
  office: "Phòng làm việc",
  dining_room: "Phòng ăn",
  other: "Khác",
};

function formatPrice(value: number | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
    maximumFractionDigits: 0,
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

type Tab = "moodboard" | "products";

type MoodboardDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function MoodboardDetailPage({ params }: MoodboardDetailPageProps) {
  const [id, setId] = useState("");
  const [board, setBoard] = useState<Moodboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("moodboard");
  const [products, setProducts] = useState<MoodboardProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Resolve params Promise (Next 15)
  useEffect(() => {
    let alive = true;
    void params.then((p) => {
      if (alive) setId(p.id);
    });
    return () => {
      alive = false;
    };
  }, [params]);

  // Lắng nghe saved moodboards (localStorage)
  useEffect(() => {
    setSavedIds(new Set(getSavedMoodboardIds()));
    return subscribeSavedMoodboards((ids) => setSavedIds(new Set(ids)));
  }, []);

  const loadMoodboard = useCallback(async (moodboardId: string) => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchMoodboardById(moodboardId);
      setBoard(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Không tải được moodboard");
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async (moodboardId: string) => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const data = await fetchMoodboardProducts(moodboardId);
      setProducts(data.items ?? []);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "Không tải được sản phẩm");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    void loadMoodboard(id);
  }, [id, loadMoodboard]);

  // Tab Products: lazy load khi chuyển sang
  useEffect(() => {
    if (!id) return;
    if (activeTab === "products" && products.length === 0 && !productsLoading) {
      void loadProducts(id);
    }
  }, [activeTab, id, products.length, productsLoading, loadProducts]);

  const roomLabel = useMemo(
    () => ROOM_TYPE_LABELS[board?.roomType ?? "other"] ?? "Khác",
    [board?.roomType],
  );

  function handleToggleSave() {
    if (!board) return;
    const moodboardId = board.moodboardId ?? board._id ?? board.id ?? id;
    if (!moodboardId) return;
    const nowSaved = toggleSavedMoodboard(String(moodboardId));
    if (nowSaved && board) {
      const meta: SavedMoodboard = {
        author:
          typeof board.author === "string"
            ? board.author
            : board.authorName ?? "Ẩn danh",
        id: String(moodboardId),
        image: board.imageUrl ?? "",
        productCount: board.productsCount ?? board.productPoints?.length ?? 0,
        roomType: board.roomType,
        savedAt: Date.now(),
        title: board.title ?? "Moodboard không tên",
      };
      saveMoodboardMeta(meta);
    }
  }

  const isSaved = savedIds.has(
    String(board?.moodboardId ?? board?._id ?? board?.id ?? id ?? ""),
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#faf6ee]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#7e9a3f]" />
          <p className="mt-4 text-sm text-[#646a61]">Đang tải moodboard...</p>
        </div>
      </div>
    );
  }

  if (loadError || !board) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#faf6ee]">
        <div className="max-w-md text-center">
          <Sparkles className="mx-auto h-14 w-14 text-[#d9d1c4]" strokeWidth={1.5} />
          <h1 className="mt-5 font-serif text-2xl font-bold text-[#2f6f5e]">
            Không tải được moodboard
          </h1>
          <p className="mt-2 text-sm text-[#646a61]">{loadError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              className="rounded-full border border-[#2f6f5e] px-5 py-2 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
              href="/moodboards"
            >
              <ArrowLeft className="mr-1.5 inline h-4 w-4" />
              Quay lại
            </Link>
            <button
              className="rounded-full bg-[#2f6f5e] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#265a4d]"
              onClick={() => void loadMoodboard(id)}
              type="button"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf6ee] pb-16">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
        <nav className="flex items-center gap-2 text-sm text-[#646a61]">
          <Link className="transition hover:text-[#2f6f5e]" href="/">
            Trang chủ
          </Link>
          <span>/</span>
          <Link className="transition hover:text-[#2f6f5e]" href="/moodboards">
            Moodboards
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-[#2f6f5e]">{board.title ?? "Chi tiết"}</span>
        </nav>
      </div>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-5 pt-4 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3e9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#5b7a32]">
              {roomLabel}
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#2f6f5e] sm:text-4xl">
              {board.title ?? "Moodboard không tên"}
            </h1>
            <p className="mt-2 text-sm text-[#646a61]">
              Bởi {board.authorName ?? board.authorId ?? "Ẩn danh"} ·{" "}
              {formatDate(board.createdAt)}
            </p>
            {board.description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3a4a40]">
                {board.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#2f6f5e] ring-1 ring-[#e8e1d4]">
              <Heart className="h-3.5 w-3.5 text-[#ef6e61]" fill="currentColor" />
              {board.likes ?? 0} lượt thích
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#2f6f5e] ring-1 ring-[#e8e1d4]">
              <Eye className="h-3.5 w-3.5" />
              {board.views ?? 0} lượt xem
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#2f6f5e] ring-1 ring-[#e8e1d4]">
              <Package2 className="h-3.5 w-3.5" />
              {board.productsCount ?? board.productPoints?.length ?? 0} sản phẩm
            </span>
            <button
              aria-label={isSaved ? "Bỏ lưu" : "Lưu moodboard"}
              className={`grid h-10 w-10 place-items-center rounded-full transition ${
                isSaved
                  ? "bg-[#d89b47] text-white"
                  : "bg-white text-[#2f6f5e] ring-1 ring-[#e8e1d4] hover:bg-[#f7f3ec]"
              }`}
              onClick={handleToggleSave}
              type="button"
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {board.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {board.tags.map((tag) => (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#646a61] ring-1 ring-[#e8e1d4]"
                key={tag}
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-[#e8e1d4]">
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === "moodboard"
                ? "bg-[#2f6f5e] text-white shadow-sm"
                : "text-[#646a61] hover:bg-[#f7f3ec]"
            }`}
            onClick={() => setActiveTab("moodboard")}
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            Moodboard
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === "products"
                ? "bg-[#2f6f5e] text-white shadow-sm"
                : "text-[#646a61] hover:bg-[#f7f3ec]"
            }`}
            onClick={() => setActiveTab("products")}
            type="button"
          >
            <ShoppingBag className="h-4 w-4" />
            Sản phẩm
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === "products"
                  ? "bg-white/20 text-white"
                  : "bg-[#f5f0e8] text-[#646a61]"
              }`}
            >
              {board.productsCount ?? board.productPoints?.length ?? 0}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <section className="mx-auto mt-6 max-w-7xl px-5 sm:px-8">
        {activeTab === "moodboard" ? (
          <MoodboardTab board={board} />
        ) : (
          <ProductsTab
            error={productsError}
            items={products}
            loading={productsLoading}
            onRetry={() => void loadProducts(id)}
          />
        )}
      </section>
    </main>
  );
}

// =============================================================================
// TAB: MOODBOARD
// =============================================================================

function MoodboardTab({ board }: { board: Moodboard }) {
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const activePoint = useMemo(
    () => board.productPoints.find((p) => p._id === activePointId) ?? null,
    [board.productPoints, activePointId],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Ảnh + points */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e8e1d4]">
        <div className="relative aspect-[4/3] w-full bg-[#f7f3ec]">
          {board.imageUrl ? (
            <Image
              alt={board.title ?? "Moodboard"}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 70vw, 100vw"
              src={board.imageUrl}
              unoptimized
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-[#898d86]">
              Chưa có ảnh
            </div>
          )}

          {/* Points */}
          {board.productPoints.map((point, idx) => {
            const pointKey = point._id ?? `${point.productId}-${idx}`;
            const isActive = pointKey === activePointId;
            return (
              <button
                aria-label={`Sản phẩm ${point.product?.name ?? point.productId}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${
                  isActive ? "z-10 scale-110" : "z-0 hover:scale-105"
                }`}
                key={pointKey}
                onClick={() => setActivePointId(isActive ? null : pointKey)}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                type="button"
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black ring-4 ring-white shadow-lg transition ${
                    isActive
                      ? "bg-[#d89b47] text-white"
                      : "bg-[#2f6f5e] text-white hover:bg-[#265a4d]"
                  }`}
                >
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Point detail */}
        {activePoint && (
          <div className="border-t border-[#e8e1d4] bg-[#faf6ee] p-5">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                {activePoint.product?.image ? (
                  <Image
                    alt={activePoint.product.name ?? "Sản phẩm"}
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={activePoint.product.image}
                    unoptimized
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-[#898d86]">
                    No img
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-bold text-[#2f6f5e]">
                  {activePoint.product?.name ?? `Sản phẩm #${activePoint.productId.slice(-6)}`}
                </h3>
                <p className="mt-1 text-xs text-[#646a61]">
                  {activePoint.product?.brand ?? "—"}
                  {activePoint.product?.category ? ` · ${activePoint.product.category}` : ""}
                </p>
                <p className="mt-1.5 text-sm font-bold text-[#d89b47]">
                  {formatPrice(activePoint.product?.price)}
                </p>
              </div>
              <Link
                className="rounded-full bg-[#2f6f5e] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#265a4d]"
                href={`/products/${activePoint.productId}`}
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar: danh sách tất cả points */}
      <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8e1d4]">
        <h2 className="font-bold text-[#2f6f5e]">
          Sản phẩm trong moodboard ({board.productPoints.length})
        </h2>
        {board.productPoints.length === 0 ? (
          <p className="mt-3 text-sm text-[#646a61]">
            Moodboard chưa ghim sản phẩm nào.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {board.productPoints.map((point, idx) => {
              const key = point._id ?? `${point.productId}-${idx}`;
              const isActive = key === activePointId;
              return (
                <li key={key}>
                  <button
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                      isActive ? "bg-[#eaf3e9]" : "hover:bg-[#f7f3ec]"
                    }`}
                    onClick={() => setActivePointId(isActive ? null : key)}
                    type="button"
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${
                        isActive
                          ? "bg-[#d89b47] text-white"
                          : "bg-[#2f6f5e] text-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f7f3ec]">
                      {point.product?.image ? (
                        <Image
                          alt={point.product.name ?? ""}
                          className="object-cover"
                          fill
                          sizes="48px"
                          src={point.product.image}
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-bold text-[#2f6f5e]">
                        {point.product?.name ?? "Sản phẩm"}
                      </p>
                      <p className="text-[11px] text-[#d89b47]">
                        {formatPrice(point.product?.price)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </aside>
    </div>
  );
}

// =============================================================================
// TAB: PRODUCTS — gọi BE /moodboards/:id/products
// =============================================================================

function ProductsTab({
  items,
  loading,
  error,
  onRetry,
}: {
  items: MoodboardProductSummary[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-[#e8e1d4]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#7e9a3f]" />
          <p className="mt-3 text-sm text-[#646a61]">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-[#e8e1d4]">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#d9d1c4]" strokeWidth={1.5} />
          <h3 className="mt-4 font-bold text-[#bc3d2b]">Không tải được sản phẩm</h3>
          <p className="mt-2 text-sm text-[#646a61]">{error}</p>
          <button
            className="mt-4 rounded-full border border-[#2f6f5e] px-5 py-2 text-sm font-bold transition hover:bg-[#f7f3ec]"
            onClick={onRetry}
            type="button"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-[#e8e1d4]">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#d9d1c4]" strokeWidth={1.5} />
          <h3 className="mt-4 font-bold text-[#2f6f5e]">Chưa có sản phẩm</h3>
          <p className="mt-2 text-sm text-[#646a61]">
            Moodboard này hiện chưa có sản phẩm nào được ghim.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p, idx) => {
        const id = p._id ?? p.id ?? `prod-${idx}`;
        return (
          <Link
            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e8e1d4] transition hover:-translate-y-1 hover:shadow-xl"
            href={`/products/${id}`}
            key={id}
          >
            <div className="relative aspect-square overflow-hidden bg-[#f7f3ec]">
              {p.image ? (
                <Image
                  alt={p.name ?? "Sản phẩm"}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  fill
                  sizes="(min-width:1280px) 25vw,(min-width:1024px) 33vw,(min-width:640px) 50vw,100vw"
                  src={p.image}
                  unoptimized
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-[#898d86]">
                  No image
                </div>
              )}
              {typeof p.discount === "number" && p.discount > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-[#ef6e61] px-2.5 py-1 text-[10px] font-black text-white">
                  -{p.discount}%
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7e9a3f]">
                {p.brand ?? p.category ?? "Sản phẩm"}
              </p>
              <h3 className="mt-1 line-clamp-2 font-bold text-[#2f6f5e] transition group-hover:text-[#7e9a3f]">
                {p.name ?? "Sản phẩm"}
              </h3>
              <div className="mt-auto flex items-end justify-between pt-3">
                <div>
                  <p className="text-base font-bold text-[#d89b47]">
                    {formatPrice(p.price)}
                  </p>
                  {typeof p.rating === "number" && p.rating > 0 && (
                    <p className="mt-0.5 text-[11px] text-[#646a61]">
                      ★ {p.rating.toFixed(1)}
                    </p>
                  )}
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#2f6f5e] text-white transition group-hover:bg-[#265a4d]">
                  <ShoppingBag className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
