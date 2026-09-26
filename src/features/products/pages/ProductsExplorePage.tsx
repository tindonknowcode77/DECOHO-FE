"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import CatalogQuickView from "../components/CatalogQuickView";
import { getProducts } from "../services/productService";
import {
  PRICE_RANGES,
  PRODUCT_GROUPS,
  productGroup,
  searchable,
} from "../utils/catalog";
import type { Product } from "../types";

const PAGE_SIZE = 12;
const initialFilters = {
  category: "all",
  price: "all",
  color: "all",
  search: "",
  inStock: false,
  sale: false,
};

export default function ProductsExplorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("default");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getProducts(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setProducts(items);
          setError("");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            "Chưa thể tải bộ sưu tập. Hãy kiểm tra kết nối và thử lại nhé.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);

  function updateFilters(update: Partial<typeof initialFilters>) {
    setFilters((old) => ({ ...old, ...update }));
    setPage(1);
  }
  function resetFilters() {
    setFilters(initialFilters);
    setPage(1);
  }
  const counts = useMemo(
    () =>
      products.reduce<Record<string, number>>((counts, product) => {
        const group = productGroup(product);
        counts[group] = (counts[group] ?? 0) + 1;
        return counts;
      }, {}),
    [products],
  );
  const colors = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((p) => p.color)
            .filter((color) => color && color !== "Đang cập nhật"),
        ),
      ].sort((a, b) => a.localeCompare(b, "vi")),
    [products],
  );
  const filtered = useMemo(() => {
    const range =
      PRICE_RANGES.find((range) => range.id === filters.price) ??
      PRICE_RANGES[0];
    const search = searchable(filters.search.trim());
    return products
      .filter(
        (product) =>
          (filters.category === "all" ||
            productGroup(product) === filters.category) &&
          product.priceVND >= range.min &&
          product.priceVND < range.max &&
          (filters.color === "all" || product.color === filters.color) &&
          (!filters.inStock || product.stock > 0) &&
          (!filters.sale || product.discountPercentage > 0) &&
          (!search ||
            searchable(
              [
                product.name,
                product.category,
                product.brand,
                product.material,
                ...product.tags,
              ].join(" "),
            ).includes(search)),
      )
      .sort((a, b) =>
        sort === "price-asc"
          ? a.priceVND - b.priceVND
          : sort === "price-desc"
            ? b.priceVND - a.priceVND
            : sort === "name"
              ? a.name.localeCompare(b.name, "vi")
              : 0,
      );
  }, [products, filters, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const activeCount =
    Number(filters.category !== "all") +
    Number(filters.price !== "all") +
    Number(filters.color !== "all") +
    Number(filters.inStock) +
    Number(filters.sale);
  const chips = [
    ...(filters.category !== "all"
      ? [
          {
            label:
              PRODUCT_GROUPS.find((c) => c.id === filters.category)?.label ??
              filters.category,
            clear: () => updateFilters({ category: "all" }),
          },
        ]
      : []),
    ...(filters.price !== "all"
      ? [
          {
            label:
              PRICE_RANGES.find((p) => p.id === filters.price)?.label ??
              "Khoảng giá",
            clear: () => updateFilters({ price: "all" }),
          },
        ]
      : []),
    ...(filters.color !== "all"
      ? [{ label: filters.color, clear: () => updateFilters({ color: "all" }) }]
      : []),
    ...(filters.inStock
      ? [{ label: "Còn hàng", clear: () => updateFilters({ inStock: false }) }]
      : []),
    ...(filters.sale
      ? [{ label: "Đang ưu đãi", clear: () => updateFilters({ sale: false }) }]
      : []),
  ];
  function changePage(next: number) {
    setPage(Math.min(totalPages, Math.max(1, next)));
    document
      .getElementById("catalog")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  }
  function browse(category: string) {
    updateFilters({ category });
    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[#f7f7f1] text-[#2c4934]">
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-8 lg:px-12">
        <nav
          aria-label="Đường dẫn"
          className="mb-5 flex items-center gap-2 text-[11px] text-[#8b9480]"
        >
          <Link href="/" className="hover:text-[#355a3d]">
            Trang chủ
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#466546]">Sản phẩm</span>
        </nav>
        <section className="grid overflow-hidden rounded-[28px] bg-[#e9eddc] md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex flex-col justify-center px-7 py-9 sm:px-10 sm:py-11 lg:px-12">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c8864]">
              <span className="h-px w-7 bg-[#91a374]" />
              Decor & Living
            </p>
            <h1 className="mt-5 text-[36px] leading-[1.08] tracking-tight sm:text-[44px] lg:text-[52px]">
              Chọn điều bạn thích.
              <br />
              <span className="text-[#7a9162]">
                Sống trong điều
                <br className="hidden lg:block" /> bạn yêu.
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#7c856d]">
              Từ một chiếc đèn ấm đến chiếc ghế thật êm. Tìm những món đồ làm
              nên chất riêng cho tổ ấm.
            </p>
            <a
              href="#catalog"
              className="mt-7 inline-flex w-fit items-center gap-4 rounded-full bg-[#315f43] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#254a33]"
            >
              Khám phá bộ sưu tập <ArrowDown size={15} />
            </a>
          </div>
          <div className="relative min-h-64 md:min-h-[380px]">
            <Image
              src="/images/product-space/organic-calm.png"
              alt="Không gian sống với sofa, bàn và ánh sáng tự nhiên"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 650px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#233325]/30 to-transparent" />
            <Link
              href="/moodboards"
              className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/50 bg-white/85 px-4 py-3 text-[#3f5941] backdrop-blur sm:left-7 sm:right-7"
            >
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#849077]">
                  Cảm hứng không gian
                </p>
                <p className="mt-1 text-sm font-medium">
                  Một chút mộc, một chút bình yên
                </p>
              </div>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>

        <section aria-label="Khám phá danh mục" className="py-7 sm:py-9">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Bạn đang tìm điều gì?</h2>
            <span className="hidden text-xs text-[#929984] sm:block">
              Những mảnh ghép cho tổ ấm của bạn
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
            {PRODUCT_GROUPS.slice(1).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => browse(id)}
                aria-pressed={filters.category === id}
                className={`group flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition ${filters.category === id ? "border-[#a4b28c] bg-[#e9eedd]" : "border-[#e5e7dc] bg-white/65 hover:border-[#c2cfb2] hover:bg-white"}`}
              >
                <Icon
                  size={25}
                  strokeWidth={1.2}
                  className="text-[#78896a] transition group-hover:-translate-y-0.5"
                />
                <span className="text-[10px] font-medium sm:text-xs">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          id="catalog"
          className="scroll-mt-24 border-t border-[#e2e5d8] pt-7"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9a9f8c]">
                Tìm món đồ của bạn
              </p>
              <h2 className="text-2xl sm:text-3xl">
                Một lựa chọn. Nhiều cảm hứng.
              </h2>
            </div>
            <label className="flex w-full items-center gap-2.5 rounded-full border border-[#e1e5d7] bg-white px-4 py-2.5 sm:w-72">
              <Search size={17} className="shrink-0 text-[#8a987b]" />
              <input
                aria-label="Tìm sản phẩm"
                value={filters.search}
                onChange={(event) =>
                  updateFilters({ search: event.target.value })
                }
                placeholder="Tìm món đồ bạn yêu thích…"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#a0a693]"
              />
              {filters.search && (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => updateFilters({ search: "" })}
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[205px_minmax(0,1fr)] lg:gap-9">
            <div>
              <button
                type="button"
                aria-expanded={filtersOpen}
                aria-controls="product-filters"
                onClick={() => setFiltersOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border border-[#e0e4d5] bg-white px-4 py-3 text-sm lg:hidden"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Bộ lọc {activeCount > 0 && `(${activeCount})`}
                </span>
                {filtersOpen ? <X size={16} /> : <span>+</span>}
              </button>
              <aside
                id="product-filters"
                aria-label="Bộ lọc sản phẩm"
                className={`${filtersOpen ? "block" : "hidden"} mt-3 rounded-2xl border border-[#e5e7dc] bg-white p-5 lg:mt-0 lg:block lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <SlidersHorizontal size={15} />
                    Bộ lọc
                  </h3>
                  {activeCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-[10px] text-[#819267] underline"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>
                <fieldset className="border-t border-[#e4e7da] pt-5">
                  <legend className="mb-3 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6a7a5b]">
                    Danh mục
                  </legend>
                  <div className="space-y-1">
                    {PRODUCT_GROUPS.map(({ id, label }) => (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs ${filters.category === id ? "bg-[#e9eddf] font-semibold" : "text-[#7e8872] hover:bg-[#edf0e5]"}`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={id}
                          checked={filters.category === id}
                          onChange={() => updateFilters({ category: id })}
                          className="h-3.5 w-3.5 accent-[#5b8052]"
                        />
                        <span className="flex-1">{label}</span>
                        <span className="text-[10px] text-[#9aa18b]">
                          {loading
                            ? "—"
                            : id === "all"
                              ? products.length
                              : (counts[id] ?? 0)}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-5 border-t border-[#e4e7da]">
                  <legend className="mb-3 pt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6a7a5b]">
                    Khoảng giá
                  </legend>
                  <div className="space-y-3">
                    {PRICE_RANGES.map((range) => (
                      <label
                        key={range.id}
                        className="flex cursor-pointer items-center gap-2 text-[11px] text-[#7f8874]"
                      >
                        <input
                          type="radio"
                          name="price-range"
                          checked={filters.price === range.id}
                          onChange={() => updateFilters({ price: range.id })}
                          className="h-3.5 w-3.5 accent-[#5b8052]"
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {colors.length > 1 && (
                  <label className="mt-6 block border-t border-[#e4e7da] pt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6a7a5b]">
                    Màu sắc
                    <select
                      aria-label="Lọc màu sắc"
                      value={filters.color}
                      onChange={(event) =>
                        updateFilters({ color: event.target.value })
                      }
                      className="mt-3 w-full rounded-lg border border-[#e0e5d4] bg-white px-2 py-2.5 text-xs font-normal normal-case tracking-normal"
                    >
                      <option value="all">Tất cả màu sắc</option>
                      {colors.map((color) => (
                        <option key={color}>{color}</option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="mt-6 space-y-3 border-t border-[#e4e7da] pt-5">
                  <label className="flex items-center gap-2 text-xs text-[#7e8872]">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(event) =>
                        updateFilters({ inStock: event.target.checked })
                      }
                      className="accent-[#5b8052]"
                    />
                    Chỉ hiện sản phẩm còn hàng
                  </label>
                  {products.some((p) => p.discountPercentage > 0) && (
                    <label className="flex items-center gap-2 text-xs text-[#7e8872]">
                      <input
                        type="checkbox"
                        checked={filters.sale}
                        onChange={(event) =>
                          updateFilters({ sale: event.target.checked })
                        }
                        className="accent-[#5b8052]"
                      />
                      Đang ưu đãi
                    </label>
                  )}
                </div>
                <div className="mt-7 hidden rounded-2xl bg-[#e9eedc] p-5 lg:block">
                  <Sparkles
                    size={20}
                    strokeWidth={1.3}
                    className="text-[#859e65]"
                  />
                  <h3 className="mt-3 text-lg leading-tight">
                    Chưa biết
                    <br />
                    bắt đầu từ đâu?
                  </h3>
                  <p className="mt-2 text-[11px] leading-5 text-[#879276]">
                    Thử phối những món đồ trong một không gian bạn thích.
                  </p>
                  <Link
                    href="/moodboards"
                    className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold"
                  >
                    Xem moodboard <ArrowUpRight size={13} />
                  </Link>
                </div>
              </aside>
            </div>
            <div className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p role="status" className="text-xs text-[#8b937e]">
                  {loading ? (
                    "Đang tìm những món đồ đẹp…"
                  ) : error ? (
                    "Chưa tải được sản phẩm"
                  ) : (
                    <>
                      <strong className="font-semibold text-[#486142]">
                        {filtered.length}
                      </strong>{" "}
                      sản phẩm
                      {filtered.length > 0 && (
                        <span className="hidden sm:inline">
                          {" "}
                          · Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–
                          {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                        </span>
                      )}
                    </>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <select
                    aria-label="Sắp xếp sản phẩm"
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value);
                      setPage(1);
                    }}
                    className="max-w-44 rounded-lg border border-[#e1e5d7] bg-white px-3 py-2 text-[11px] text-[#687b57]"
                  >
                    <option value="default">Thứ tự mặc định</option>
                    <option value="price-asc">Giá: thấp đến cao</option>
                    <option value="price-desc">Giá: cao đến thấp</option>
                    <option value="name">Tên: A – Z</option>
                  </select>
                  <div className="flex gap-1 border-l border-[#dde2d1] pl-3">
                    <button
                      aria-label="Dạng lưới"
                      aria-pressed={view === "grid"}
                      onClick={() => setView("grid")}
                      className={`rounded-md p-1.5 ${view === "grid" ? "bg-[#e5ebda] text-[#46643a]" : "text-[#9aa48c]"}`}
                    >
                      <Grid2X2 size={17} />
                    </button>
                    <button
                      aria-label="Dạng danh sách"
                      aria-pressed={view === "list"}
                      onClick={() => setView("list")}
                      className={`rounded-md p-1.5 ${view === "list" ? "bg-[#e5ebda] text-[#46643a]" : "text-[#9aa48c]"}`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
              {!!chips.length && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={chip.clear}
                      aria-label={`Bỏ lọc ${chip.label}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#e9eddf] px-3 py-1.5 text-[10px] text-[#5a7250]"
                    >
                      {chip.label}
                      <X size={11} />
                    </button>
                  ))}
                  <button
                    onClick={resetFilters}
                    className="px-2 text-[10px] text-[#889576] underline"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
              {loading ? (
                <div
                  aria-label="Đang tải sản phẩm"
                  className="grid grid-cols-2 gap-4 md:grid-cols-3"
                >
                  {Array.from({ length: 6 }, (_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl bg-white p-3"
                    >
                      <div className="aspect-square rounded-xl bg-[#e8ecdf]" />
                      <div className="mt-4 h-3 w-2/3 rounded bg-[#e8ecdf]" />
                      <div className="mb-4 mt-3 h-3 w-1/3 rounded bg-[#e8ecdf]" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-[#e5dbcc] bg-white px-6 py-14 text-center"
                >
                  <p className="text-sm text-[#93806b]">{error}</p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setError("");
                      setRevision((value) => value + 1);
                    }}
                    className="mt-5 rounded-full bg-[#355f42] px-5 py-2.5 text-xs text-white"
                  >
                    Thử lại
                  </button>
                </div>
              ) : !filtered.length ? (
                <div className="rounded-2xl border border-dashed border-[#d8deca] bg-white/60 px-6 py-16 text-center">
                  <Search
                    size={30}
                    strokeWidth={1.2}
                    className="mx-auto text-[#a3af92]"
                  />
                  <h3 className="mt-5 text-xl">Chưa tìm thấy món đồ phù hợp</h3>
                  <p className="mt-3 text-sm text-[#909881]">
                    Thử một từ khóa khác hoặc mở rộng khoảng giá nhé.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-5 rounded-full bg-[#355f42] px-5 py-2.5 text-xs text-white"
                  >
                    Xóa bộ lọc & tìm lại
                  </button>
                </div>
              ) : (
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {visible.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      view={view}
                      onQuickView={setQuickView}
                    />
                  ))}
                </div>
              )}
              {!loading && !error && totalPages > 1 && (
                <nav
                  aria-label="Phân trang sản phẩm"
                  className="mt-9 flex items-center justify-center gap-2"
                >
                  <button
                    aria-label="Trang trước"
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                    className="rounded-full border border-[#dfe4d2] p-2.5 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .map((p, index, pages) => (
                      <span key={p} className="flex items-center gap-2">
                        {index > 0 && p - pages[index - 1] > 1 && (
                          <span className="text-[#a0a890]">…</span>
                        )}
                        <button
                          aria-label={`Trang ${p}`}
                          aria-current={currentPage === p ? "page" : undefined}
                          onClick={() => changePage(p)}
                          className={`h-9 min-w-9 rounded-full text-xs ${currentPage === p ? "bg-[#345e42] text-white" : "text-[#81916e] hover:bg-[#e7ecd9]"}`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    aria-label="Trang sau"
                    disabled={currentPage === totalPages}
                    onClick={() => changePage(currentPage + 1)}
                    className="rounded-full border border-[#dfe4d2] p-2.5 disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </div>
          </div>
        </section>
        <section className="mt-14 grid overflow-hidden rounded-3xl bg-[#2d513b] text-white sm:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-56">
            <Image
              src="/images/product-space/soft-evening.png"
              alt="Cảm hứng phối đồ trong phòng khách"
              fill
              sizes="(max-width: 640px) 100vw, 550px"
              className="object-cover"
            />
          </div>
          <div className="px-7 py-9 sm:px-10">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#b7c59a]">
              Không chỉ là một món đồ
            </p>
            <h2 className="mt-4 text-3xl leading-tight">
              Đẹp khi đứng riêng.
              <br />
              <span className="text-[#c7d5b0]">Hài hòa khi ở cùng nhau.</span>
            </h2>
            <p className="mt-4 max-w-md text-xs leading-6 text-[#c1ccb6]">
              Khám phá cách phối màu, chất liệu và nội thất qua những moodboard
              đầy cảm hứng.
            </p>
            <Link
              href="/moodboards"
              className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/30 px-5 py-2.5 text-xs"
            >
              Tìm cảm hứng cho nhà <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] text-[#8b977c]">
          {[
            "Khám phá theo danh mục",
            "Lưu những món đồ yêu thích",
            "Tìm cảm hứng từ cộng đồng",
          ].map((text) => (
            <span key={text} className="flex items-center gap-1.5">
              <Check size={12} />
              {text}
            </span>
          ))}
        </div>
      </div>
      {quickView && (
        <CatalogQuickView
          key={quickView.id}
          product={quickView}
          onClose={() => setQuickView(null)}
        />
      )}
    </main>
  );
}
