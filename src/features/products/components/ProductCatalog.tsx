"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import { initialCartItems } from "@/src/features/cart/mock/cartItems";
import { addCartItem } from "@/src/features/cart/services/cartStorage";
import ProductImage from "./ProductImage";
import { getProducts } from "../services/productService";
import type { Product } from "../types";

type ViewMode = "grid" | "list";
type SortOption = "default" | "price-asc" | "price-desc" | "rating";

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function Icon({
  name,
}: {
  name:
    | "arrow"
    | "cart"
    | "check"
    | "filter"
    | "grid"
    | "heart"
    | "info"
    | "list"
    | "search"
    | "star"
    | "truck";
}) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m5 16.5h.01M18 19.5h.01",
    check: "m5 12 4 4L19 6",
    filter: "M4 6h16M7 12h10m-7 6h4",
    grid: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
    heart:
      "M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.2a5.1 5.1 0 0 0 0-7.2Z",
    info: "M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    search: "m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
    star:
      "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1-4.4-4.3 6.1-.9L12 3Z",
    truck: "M3 7h11v10H3V7Zm11 3h4l3 3v4h-7v-7ZM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  };

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ProductStatusBadge({ product }: { product: Product }) {
  if (!product.status) {
    return null;
  }

  const classes = {
    hot: "bg-[#bc3d2b] text-white",
    new: "bg-[#2f6f5e] text-white",
    sale: "bg-[#d89b47] text-[#1f2421]",
  };

  const labels = {
    hot: "Hot",
    new: "New",
    sale: "Sale",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${classes[product.status]}`}>
      {labels[product.status]}
    </span>
  );
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [maxBudget, setMaxBudget] = useState(25000000);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setIsLoading(true);
      setLoadError("");

      try {
        const apiProducts = await getProducts(controller.signal);
        setProducts(apiProducts);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách sản phẩm.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [reloadToken]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const styleOptions = useMemo(() => {
    const styles = new Map<string, string>();

    products.forEach((product) => {
      styles.set(product.style, product.styleName);
    });

    return [
      { id: "all", label: "Tất cả phong cách" },
      ...Array.from(styles, ([id, label]) => ({ id, label })),
    ];
  }, [products]);

  const budgetCeiling = useMemo(() => {
    const highestPrice = Math.max(
      30000000,
      ...products.map((product) => product.priceVND),
    );

    return Math.ceil(highestPrice / 500000) * 500000;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          [product.name, product.category, product.styleName, product.material]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesStyle = selectedStyle === "all" || product.style === selectedStyle;
        const matchesCategory =
          selectedCategory === "all" || product.category === selectedCategory;
        const matchesBudget = product.priceVND <= maxBudget;

        return matchesSearch && matchesStyle && matchesCategory && matchesBudget;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return a.priceVND - b.priceVND;
        }

        if (sortBy === "price-desc") {
          return b.priceVND - a.priceVND;
        }

        if (sortBy === "rating") {
          return b.rating - a.rating;
        }

        return 0;
      });
  }, [maxBudget, products, searchTerm, selectedCategory, selectedStyle, sortBy]);

  function toggleFavorite(productId: string) {
    setFavorites((current) => ({
      ...current,
      [productId]: !current[productId],
    }));
  }

  function addToCart(product: Product) {
    addCartItem(
      {
        id: `catalog-${product.id}`,
        category: product.category,
        dimensions: product.dimensions,
        image: product.image,
        material: product.material,
        name: product.name,
        priceVND: product.priceVND,
        productHref: `/products/${product.id}`,
        quantity: 1,
        source: "catalog",
        stock: product.stock,
        style: product.styleName,
      },
      initialCartItems,
    );
    setNotice(`${product.name} đã được thêm vào giỏ hàng.`);
  }

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-10 text-[#1f2421] sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-[#ded6c9] pb-7 lg:flex-row lg:items-end">
          <div>
            <Link aria-label="DECOHO home" className="inline-flex" href="/">
              <BrandLogo className="h-9 w-32" variant="horizontal" />
            </Link>
            <h1 className="mt-3 text-4xl font-bold leading-tight">Catalog sản phẩm nội thất</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#646a61]">
              Lọc sofa, bàn, ghế, tủ và đèn theo phong cách thiết kế, ngân sách
              và nhu cầu mua sắm cho bản phối DECOHO.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-md border border-[#cfc6b8] bg-white px-4 text-sm font-bold text-[#1f2421] shadow-sm transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
              href="/cart"
            >
              Giỏ hàng
              <Icon name="cart" />
            </Link>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#2f6f5e] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#285f51]"
              href="/product-space"
            >
              Xem Moodboard
              <Icon name="arrow" />
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-lg border border-[#ded6c9] bg-white p-5 shadow-[0_14px_40px_rgba(57,45,29,.08)]">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_170px]">
            <label className="relative block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f746d]">
                <Icon name="search" />
              </span>
              <input
                className="h-12 w-full rounded-md border border-[#ded6c9] bg-[#fcfaf6] pl-10 pr-4 text-sm outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm sofa, bàn trà, đèn, chất liệu..."
                type="search"
                value={searchTerm}
              />
            </label>

            <select
              className="h-12 rounded-md border border-[#ded6c9] bg-[#fcfaf6] px-3 text-sm font-semibold outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
              onChange={(event) => setSelectedStyle(event.target.value)}
              value={selectedStyle}
            >
              {styleOptions.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>

            <select
              className="h-12 rounded-md border border-[#ded6c9] bg-[#fcfaf6] px-3 text-sm font-semibold outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
              onChange={(event) => setSelectedCategory(event.target.value)}
              value={selectedCategory}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Tất cả danh mục" : category}
                </option>
              ))}
            </select>

            <select
              className="h-12 rounded-md border border-[#ded6c9] bg-[#fcfaf6] px-3 text-sm font-semibold outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              value={sortBy}
            >
              <option value="default">Sắp xếp mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-[#51564f] md:max-w-md">
              <span className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <Icon name="filter" />
                  Ngân sách tối đa
                </span>
                <span>{formatPrice(maxBudget)}</span>
              </span>
              <input
                className="accent-[#2f6f5e]"
                max={budgetCeiling}
                min={1500000}
                onChange={(event) => setMaxBudget(Number(event.target.value))}
                step={500000}
                type="range"
                value={maxBudget}
              />
            </label>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#646a61]">
                {filteredProducts.length} sản phẩm phù hợp
              </p>
              <div className="flex rounded-lg border border-[#ded6c9] bg-[#f6f1e9] p-1">
                <button
                  aria-label="Xem dạng lưới"
                  className={`grid h-9 w-9 place-items-center rounded-md transition ${viewMode === "grid" ? "bg-white text-[#2f6f5e] shadow-sm" : "text-[#646a61] hover:text-[#2f6f5e]"}`}
                  onClick={() => setViewMode("grid")}
                  type="button"
                >
                  <Icon name="grid" />
                </button>
                <button
                  aria-label="Xem dạng danh sách"
                  className={`grid h-9 w-9 place-items-center rounded-md transition ${viewMode === "list" ? "bg-white text-[#2f6f5e] shadow-sm" : "text-[#646a61] hover:text-[#2f6f5e]"}`}
                  onClick={() => setViewMode("list")}
                  type="button"
                >
                  <Icon name="list" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {notice && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-[#b7dfc4] bg-[#eefbf2] p-4 text-sm text-[#23643b] shadow-sm">
            <span className="flex items-center gap-2">
              <Icon name="check" />
              {notice}
            </span>
            <button className="font-bold" onClick={() => setNotice("")} type="button">
              Đóng
            </button>
          </div>
        )}

        {isLoading ? (
          <section
            aria-label="Đang tải sản phẩm"
            className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {[0, 1, 2].map((item) => (
              <div
                className="overflow-hidden rounded-lg border border-[#ded6c9] bg-white shadow-sm"
                key={item}
              >
                <div className="h-64 animate-pulse bg-[#e8e0d4]" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-24 animate-pulse bg-[#e8e0d4]" />
                  <div className="h-6 w-3/4 animate-pulse bg-[#e8e0d4]" />
                  <div className="h-4 w-full animate-pulse bg-[#eee8de]" />
                </div>
              </div>
            ))}
          </section>
        ) : loadError ? (
          <section className="mt-8 rounded-lg border border-[#e1b8ae] bg-[#fff7f4] p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#8f2f24]">
              Không tải được sản phẩm
            </h2>
            <p className="mt-3 text-sm text-[#745c57]">{loadError}</p>
            <button
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#1f2421] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2f6f5e]"
              onClick={() => setReloadToken((value) => value + 1)}
              type="button"
            >
              Thử tải lại
              <Icon name="arrow" />
            </button>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="mt-8 rounded-lg border border-[#ded6c9] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Chưa có sản phẩm phù hợp</h2>
            <p className="mt-3 text-sm text-[#646a61]">
              Hãy thử tăng ngân sách, đổi phong cách hoặc xóa bớt từ khóa tìm kiếm.
            </p>
          </section>
        ) : (
          <section
            className={
              viewMode === "grid"
                ? "mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                : "mt-8 space-y-4"
            }
          >
            {filteredProducts.map((product) =>
              viewMode === "grid" ? (
                <article
                  className="group overflow-hidden rounded-lg border border-[#ded6c9] bg-white shadow-[0_8px_24px_rgba(57,45,29,.07)] transition duration-300 hover:-translate-y-1 hover:border-[#c8bba7] hover:shadow-[0_18px_38px_rgba(57,45,29,.13)]"
                  key={product.id}
                >
                  <Link
                    className="block w-full text-left"
                    href={`/products/${product.id}`}
                  >
                    <div className="relative h-64 overflow-hidden bg-[#eee7dc]">
                      <ProductImage
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        height={420}
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        src={product.image}
                        width={620}
                      />
                      <div className="absolute left-3 top-3">
                        <ProductStatusBadge product={product} />
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f7f3ec] px-2.5 py-1 text-[11px] font-bold uppercase text-[#6f746d]">
                          {product.category}
                        </span>
                        <span className="rounded-full bg-[#eef6f2] px-2.5 py-1 text-[11px] font-bold uppercase text-[#2f6f5e]">
                          {product.styleName}
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-bold leading-snug group-hover:text-[#2f6f5e]">
                        {product.name}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#646a61]">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-bold">{formatPrice(product.priceVND)}</p>
                        <p className="flex items-center gap-1 text-sm font-bold text-[#b46f2c]">
                          <Icon name="star" />
                          {product.rating}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="grid grid-cols-[1fr_40px_40px] gap-2 border-t border-[#eee7dc] bg-[#fcfaf6] p-4">
                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1f2421] px-3 text-sm font-bold text-white transition hover:bg-[#2f6f5e]"
                      onClick={() => addToCart(product)}
                      type="button"
                    >
                      <Icon name="cart" />
                      Thêm
                    </button>
                    <button
                      aria-label={`Yêu thích ${product.name}`}
                      className={`grid h-10 w-10 place-items-center rounded-md border transition ${favorites[product.id] ? "border-[#bc3d2b] bg-[#fff1ee] text-[#bc3d2b]" : "border-[#ded6c9] bg-white text-[#646a61] hover:border-[#bc3d2b] hover:text-[#bc3d2b]"}`}
                      onClick={() => toggleFavorite(product.id)}
                      type="button"
                    >
                      <Icon name="heart" />
                    </button>
                    <Link
                      aria-label={`Xem thông tin ${product.name}`}
                      className="grid h-10 w-10 place-items-center rounded-md border border-[#ded6c9] bg-white text-[#646a61] transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
                      href={`/products/${product.id}`}
                    >
                      <Icon name="info" />
                    </Link>
                  </div>
                </article>
              ) : (
                <article
                  className="grid gap-4 rounded-lg border border-[#ded6c9] bg-white p-4 shadow-[0_8px_24px_rgba(57,45,29,.07)] transition hover:border-[#c8bba7] hover:shadow-md md:grid-cols-[160px_1fr_auto]"
                  key={product.id}
                >
                  <Link
                    className="relative h-40 overflow-hidden rounded-md bg-[#eee7dc]"
                    href={`/products/${product.id}`}
                  >
                    <ProductImage
                      alt={product.name}
                      className="h-full w-full object-cover"
                      height={220}
                      sizes="160px"
                      src={product.image}
                      width={220}
                    />
                    <div className="absolute left-2 top-2">
                      <ProductStatusBadge product={product} />
                    </div>
                  </Link>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f7f3ec] px-2.5 py-1 text-[11px] font-bold uppercase text-[#6f746d]">
                        {product.category}
                      </span>
                      <span className="rounded-full bg-[#eef6f2] px-2.5 py-1 text-[11px] font-bold uppercase text-[#2f6f5e]">
                        {product.styleName}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-[#b46f2c]">
                        <Icon name="star" />
                        {product.rating} ({product.reviewsCount})
                      </span>
                    </div>
                    <Link
                      className="mt-3 text-left text-xl font-bold hover:text-[#2f6f5e]"
                      href={`/products/${product.id}`}
                    >
                      {product.name}
                    </Link>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#646a61]">
                      {product.description}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-[#646a61]">
                      KT: {product.dimensions} | {product.material}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 border-t border-[#eee7dc] pt-4 md:min-w-52 md:flex-col md:items-end md:justify-center md:border-t-0 md:pt-0">
                    <p className="text-xl font-bold">{formatPrice(product.priceVND)}</p>
                    <div className="flex gap-2">
                      <button
                        className="h-10 rounded-md bg-[#1f2421] px-4 text-sm font-bold text-white transition hover:bg-[#2f6f5e]"
                        onClick={() => addToCart(product)}
                        type="button"
                      >
                        Thêm
                      </button>
                      <Link
                        className="grid h-10 w-10 place-items-center rounded-md border border-[#ded6c9] text-[#646a61] transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
                        href={`/products/${product.id}`}
                      >
                        <Icon name="info" />
                      </Link>
                    </div>
                  </div>
                </article>
              ),
            )}
          </section>
        )}

        <section className="mt-12 grid border-y border-[#ded6c9] md:grid-cols-3">
          {[
            ["truck", "Vận chuyển và lắp đặt", "Hỗ trợ giao hàng, lắp đặt tại nhà cho Hà Nội và TP. HCM."],
            ["check", "Cam kết vật liệu", "Ưu tiên gỗ sấy, vải bền màu và phụ kiện có nguồn gốc rõ ràng."],
            ["star", "Tư vấn phối đồ", "Kết nối catalog với AI để đề xuất sản phẩm đúng phong cách."],
          ].map(([iconName, title, text]) => (
            <article className="py-6 md:border-l md:border-[#ded6c9] md:px-6 md:first:border-l-0 md:first:pl-0" key={title}>
              <span className="grid h-10 w-10 place-items-center rounded-md bg-[#e7f1ec] text-[#2f6f5e]">
                <Icon name={iconName as "truck" | "check" | "star"} />
              </span>
              <h2 className="mt-3 text-base font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#646a61]">{text}</p>
            </article>
          ))}
        </section>
      </section>

    </main>
  );
}
