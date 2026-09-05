"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Heart,
  List,
  SlidersHorizontal,
  Sofa,
  Sparkles,
  Truck,
  Shield,
  Headphones,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import EditorPicks from "../components/EditorPicks";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productService";
import type { Product } from "../types";

const CATEGORY_TABS: Array<{ id: string; label: string; icon?: LucideIcon }> = [
  { id: "all", label: "Tất cả", icon: Sparkles },
  { id: "Ghế", label: "Ghế" },
  { id: "Giường", label: "Giường" },
  { id: "Kệ sách", label: "Kệ sách" },
  { id: "Tranh", label: "Tranh" },
  { id: "Decor", label: "Decor" },
  { id: "Đèn", label: "Đèn" },
  { id: "Cây", label: "Cây" },
  { id: "Bình hoa", label: "Bình hoa" },
];

const TRUST_ITEMS: Array<{ icon: LucideIcon; title: string; subtitle: string }> = [
  { icon: RefreshCcw, title: "Đổi hàng 7 ngày", subtitle: "Đền hoặc hỗ trợ" },
  { icon: Truck, title: "Giao hàng cẩn thận", subtitle: "Vận chuyển tận nơi" },
  { icon: Shield, title: "Thanh toán an toàn", subtitle: "Bảo mật, đa dạng" },
  { icon: Headphones, title: "Hỗ trợ 24/7", subtitle: "Tư vấn tận tình" },
];

const SPACE_ICONS: Array<{ label: string; icon: LucideIcon; count: string }> = [
  { label: "Phòng khách", icon: Sofa, count: "235+" },
  { label: "Phòng ngủ", icon: Sofa, count: "180+" },
  { label: "Phòng bếp", icon: Sofa, count: "120+" },
  { label: "Phòng tắm", icon: Sofa, count: "85+" },
  { label: "Phòng ăn", icon: Sofa, count: "94+" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function ProductsExplorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await getProducts();
      setProducts(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let result = products;

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.priceVND - b.priceVND;
        case "price-desc":
          return b.priceVND - a.priceVND;
        case "popular":
          return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [products, activeCategory, search, sortBy]);

  // Reset về trang 1 khi filter / search / sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, sortBy]);

  // Tính tổng số trang + slice sản phẩm cho trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Auto fix nếu currentPage vượt totalPages (vd: filter thu nhỏ list)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <main className="min-h-screen bg-[#faf6ee]">
      {/* SECTION 1 — Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Sản phẩm{" "}
              <span className="relative inline-block">
                decor
                <Heart
                  className="absolute -right-7 -top-2 h-5 w-5 text-[#d89b47]"
                  fill="currentColor"
                />
              </span>{" "}
              cho ngôi nhà đúng gu
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#646a61]">
              Tuyển chọn đa dạng từ những thương hiệu uy tín, đồ mới & mới lạ
              đến tay không gian sống thanh sạch.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-[#75953a] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#688935]"
                href="#products-grid"
              >
                Khám phá sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#2f6f5e] bg-white px-6 py-3 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#f4f0e6]"
                href="#filters"
              >
                Lọc theo phong cách
              </Link>
            </div>
          </div>

          {/* Hero image with stickers */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#5d8bcf]">
              <Image
                alt="Phòng khách DECOHO"
                className="object-cover"
                fill
                sizes="(min-width:768px) 50vw,100vw"
                src="/images/products/hero-living-room.png"
                unoptimized
              />

              {/* Stickers */}
              <span className="absolute left-4 top-4 rounded-full bg-[#5786B6] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                Mới
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-[#EC9C32] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                Bán chạy
              </span>
              <div className="absolute bottom-6 right-6 grid h-20 w-20 place-items-center rounded-full bg-[#d89b47] text-center text-[10px] font-black text-white shadow-xl">
                Mới
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-white p-3 shadow-2xl sm:flex sm:items-center sm:gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#f4f0e6]">
                <Image
                  alt="Bình hoa"
                  className="h-full w-full object-cover"
                  height={48}
                  src="/images/products/decor-vase-small.png"
                  unoptimized
                  width={48}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#646a61]">Mới</p>
                <p className="text-sm font-bold text-[#2f6f5e]">Bình gốm Bắc Âu</p>
                <p className="text-xs font-bold text-[#7e9a3f]">223.000đ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Trust Bar */}
      <section className="mt-12 border-y border-[#e8e1d4] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-[#e8e1d4] px-5 sm:px-8 md:grid-cols-4 md:divide-x">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                className={`flex items-center gap-3 py-5 ${idx > 0 ? "md:pl-6" : ""} ${idx < 2 ? "border-b border-[#e8e1d4] md:border-b-0" : ""}`}
                key={item.title}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0f5e8]">
                  <Icon className="h-4 w-4 text-[#78933c]" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#2f6f5e]">{item.title}</p>
                  <p className="text-xs text-[#646a61]">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3 + 4 — Category Pills + Filter Row */}
      <section
        id="filters"
        className="sticky top-[var(--header-height,64px)] z-30 border-b border-[#e8e1d4] bg-[#faf6ee] py-4"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-[#2f6f5e] text-white"
                      : "border border-[#e8e1d4] bg-white text-[#2f6f5e] hover:border-[#2f6f5e]"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  type="button"
                >
                  {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                  {tab.label}
                </button>
              );
            })}
            <button
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:border-[#2f6f5e]"
              type="button"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] hover:border-[#2f6f5e]">
              Mới nhất
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="rounded-full bg-[#f0f5e8] px-4 py-2 text-xs font-bold text-[#7e9a3f]">
              Bán chạy
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] hover:border-[#2f6f5e]">
              Đang sale
              <ChevronDown className="h-3 w-3" />
            </button>

            <span className="mx-2 hidden h-5 w-px bg-[#e8e1d4] sm:block" />

            <button className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] hover:border-[#2f6f5e]">
              Theo phong cách
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] hover:border-[#2f6f5e]">
              Theo màu sắc
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] hover:border-[#2f6f5e]">
              Theo giá
              <ChevronDown className="h-3 w-3" />
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-[#646a61]">Sắp xếp:</span>
              <div className="relative">
                <select
                  className="appearance-none rounded-full border border-[#e8e1d4] bg-white px-4 py-2 pr-8 text-xs font-bold text-[#2f6f5e] focus:border-[#2f6f5e] focus:outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#646a61]"
                  strokeWidth={2.5}
                />
              </div>

              {/* View toggle */}
              <div className="flex rounded-full border border-[#e8e1d4]">
                <button
                  className={`grid h-8 w-8 place-items-center rounded-l-full transition ${
                    viewMode === "grid" ? "bg-[#2f6f5e] text-white" : "bg-white text-[#646a61]"
                  }`}
                  onClick={() => setViewMode("grid")}
                  type="button"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  className={`grid h-8 w-8 place-items-center rounded-r-full transition ${
                    viewMode === "list" ? "bg-[#2f6f5e] text-white" : "bg-white text-[#646a61]"
                  }`}
                  onClick={() => setViewMode("list")}
                  type="button"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                className="hidden items-center gap-1.5 rounded-full border border-[#e8e1d4] bg-white px-3 py-1.5 text-xs font-bold text-[#2f6f5e] hover:border-[#2f6f5e] sm:flex"
                type="button"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Product Grid */}
      <section id="products-grid" className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-[#646a61]">
            {loading
              ? "Đang tải sản phẩm..."
              : error
                ? "Lỗi tải dữ liệu"
                : `Hiển thị ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                    currentPage * PAGE_SIZE,
                    filtered.length,
                  )} trong ${filtered.length} sản phẩm`}
          </p>
          {error && (
            <button
              className="rounded-full bg-[#2f6f5e] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#2f6f5e]"
              onClick={() => void load()}
              type="button"
            >
              Thử lại
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                className="overflow-hidden rounded-2xl bg-white"
                key={i}
              >
                <div className="aspect-square animate-pulse bg-[#ede6d7]" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-3/4 animate-pulse bg-[#ede6d7]" />
                  <div className="h-3 w-1/2 animate-pulse bg-[#ede6d7]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid min-h-[400px] place-items-center text-center">
            <div>
              <Sofa className="mx-auto h-16 w-16 text-[#d9d1c4]" strokeWidth={1.5} />
              <h2 className="mt-6 text-xl font-bold text-[#2f6f5e]">
                Không tìm thấy sản phẩm phù hợp
              </h2>
              <p className="mt-2 text-sm text-[#646a61]">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                className="mt-4 rounded-full border border-[#2f6f5e] px-5 py-2 text-sm font-bold transition hover:bg-[#f4f0e6]"
                onClick={() => {
                  setActiveCategory("all");
                  setSearch("");
                }}
                type="button"
              >
                Xoá bộ lọc
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} view={viewMode} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs text-[#646a61]">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                aria-label="Trang trước"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:border-[#2f6f5e] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Hiển thị: trang đầu, cuối, hiện tại ±1
                  if (page === 1 || page === totalPages) return true;
                  return Math.abs(page - currentPage) <= 1;
                })
                .reduce<Array<number | "ellipsis">>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                    acc.push("ellipsis");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "ellipsis" ? (
                    <span className="px-2 text-sm text-[#646a61]" key={`e-${idx}`}>
                      …
                    </span>
                  ) : (
                    <button
                      aria-current={item === currentPage ? "page" : undefined}
                      aria-label={`Trang ${item}`}
                      className={`min-w-10 rounded-full px-4 py-2 text-sm font-bold transition ${
                        item === currentPage
                          ? "bg-[#2f6f5e] text-white"
                          : "border border-[#e8e1d4] bg-white text-[#2f6f5e] hover:border-[#2f6f5e]"
                      }`}
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ),
                )}

              <button
                aria-label="Trang sau"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:border-[#2f6f5e] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 6 — Editor's Picks */}
      <EditorPicks />

      {/* SECTION 7 — Browse by Space */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Mua theo không gian
            </h2>
            <p className="mt-2 text-sm text-[#646a61]">
              Tìm sản phẩm phù hợp với từng căn phòng
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1 text-sm font-bold text-[#2f6f5e] transition hover:text-[#7e9a3f]"
            href="#"
          >
            Đọc tất cả không gian
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SPACE_ICONS.map((space) => {
            const Icon = space.icon;
            return (
              <Link
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#e8e1d4] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                href="#"
                key={space.label}
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#e6f0f7] transition group-hover:bg-[#d4e6f2]">
                  <Icon className="h-6 w-6 text-[#5786B6]" strokeWidth={1.8} />
                </span>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#2f6f5e]">{space.label}</p>
                  <p className="text-xs text-[#646a61]">{space.count} sản phẩm</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 8 — Why Choose DECOHO */}
      <section className="bg-[#2f6f5e] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#d89b47]">
                Vì sao chọn DECOHO?
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
                Chưa biết chọn gì?
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#cdc6b9]">
                Xem Moodboards để lấy cảm hứng và đặt câu hỏi trong diễn đàn.
                Đơn giản, nhanh chóng và đầy cảm hứng.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-full bg-[#75953a] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#688935]"
                  href="/product-space"
                >
                  Xem Moodboards
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#2f6f5e]"
                  href="/community"
                >
                  Tham gia Diễn đàn
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#3a3f3b]">
                  <Image
                    alt="DECOHO"
                    className="h-full w-full object-cover"
                    fill
                    sizes="(min-width:768px) 25vw,50vw"
                    src="/images/products/lifestyle-1.png"
                    unoptimized
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#3a3f3b]">
                  <Image
                    alt="DECOHO"
                    className="h-full w-full object-cover"
                    fill
                    sizes="(min-width:768px) 25vw,50vw"
                    src="/images/products/lifestyle-2.png"
                    unoptimized
                  />
                </div>
              </div>
              <div className="space-y-3 pt-8">
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#3a3f3b]">
                  <Image
                    alt="DECOHO"
                    className="h-full w-full object-cover"
                    fill
                    sizes="(min-width:768px) 25vw,50vw"
                    src="/images/products/lifestyle-3.png"
                    unoptimized
                  />
                </div>
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#3a3f3b]">
                  <Image
                    alt="DECOHO"
                    className="h-full w-full object-cover"
                    fill
                    sizes="(min-width:768px) 25vw,50vw"
                    src="/images/products/lifestyle-4.png"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
