"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import { products, styleOptions } from "../mock/products";
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
    | "bag"
    | "cart"
    | "check"
    | "close"
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
    bag: "M6 8h12l-1 13H7L6 8Zm3 0a3 3 0 0 1 6 0",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m5 16.5h.01M18 19.5h.01",
    check: "m5 12 4 4L19 6",
    close: "M6 6l12 12M18 6 6 18",
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
    <span className={`rounded px-2 py-1 text-xs font-bold uppercase ${classes[product.status]}`}>
      {labels[product.status]}
    </span>
  );
}

export default function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [maxBudget, setMaxBudget] = useState(25000000);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((product) => product.category)))],
    [],
  );

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
  }, [maxBudget, searchTerm, selectedCategory, selectedStyle, sortBy]);

  function toggleFavorite(productId: string) {
    setFavorites((current) => ({
      ...current,
      [productId]: !current[productId],
    }));
  }

  function addToCart(product: Product) {
    setNotice(`${product.name} đã được ghi nhận. Giỏ hàng demo sẽ nối API ở bước sau.`);
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
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
              className="inline-flex items-center gap-2 rounded-md border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-bold text-[#1f2421]"
              href="/cart"
            >
              Giỏ hàng
              <Icon name="cart" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-[#2f6f5e] px-4 py-2 text-sm font-bold text-white"
              href="/ai"
            >
              Gợi ý bằng AI
              <Icon name="arrow" />
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_170px]">
            <label className="relative block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f746d]">
                <Icon name="search" />
              </span>
              <input
                className="h-12 w-full rounded-md border border-[#ded6c9] bg-[#fbf7ef] pl-10 pr-4 text-sm outline-none focus:border-[#2f6f5e]"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm sofa, bàn trà, đèn, chất liệu..."
                type="search"
                value={searchTerm}
              />
            </label>

            <select
              className="h-12 rounded-md border border-[#ded6c9] bg-[#fbf7ef] px-3 text-sm font-semibold outline-none focus:border-[#2f6f5e]"
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
              className="h-12 rounded-md border border-[#ded6c9] bg-[#fbf7ef] px-3 text-sm font-semibold outline-none focus:border-[#2f6f5e]"
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
              className="h-12 rounded-md border border-[#ded6c9] bg-[#fbf7ef] px-3 text-sm font-semibold outline-none focus:border-[#2f6f5e]"
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
                max={30000000}
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
              <div className="flex rounded-md border border-[#ded6c9] bg-[#fbf7ef] p-1">
                <button
                  aria-label="Xem dạng lưới"
                  className={`rounded p-2 ${viewMode === "grid" ? "bg-white text-[#2f6f5e] shadow-sm" : "text-[#646a61]"}`}
                  onClick={() => setViewMode("grid")}
                  type="button"
                >
                  <Icon name="grid" />
                </button>
                <button
                  aria-label="Xem dạng danh sách"
                  className={`rounded p-2 ${viewMode === "list" ? "bg-white text-[#2f6f5e] shadow-sm" : "text-[#646a61]"}`}
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
          <div className="mt-5 flex items-center justify-between gap-4 rounded-md border border-[#b7dfc4] bg-[#eefbf2] p-4 text-sm text-[#23643b]">
            <span className="flex items-center gap-2">
              <Icon name="check" />
              {notice}
            </span>
            <button className="font-bold" onClick={() => setNotice("")} type="button">
              Đóng
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <section className="mt-8 rounded-md border border-[#ded6c9] bg-white p-10 text-center shadow-sm">
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
                  className="group overflow-hidden rounded-md border border-[#ded6c9] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  key={product.id}
                >
                  <button
                    className="block w-full text-left"
                    onClick={() => setSelectedProduct(product)}
                    type="button"
                  >
                    <div className="relative h-64 overflow-hidden bg-[#eee7dc]">
                      <Image
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
                        <span className="rounded bg-[#f7f3ec] px-2 py-1 text-xs font-bold uppercase text-[#6f746d]">
                          {product.category}
                        </span>
                        <span className="rounded bg-[#eef6f2] px-2 py-1 text-xs font-bold uppercase text-[#2f6f5e]">
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
                  </button>

                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-t border-[#eee7dc] p-4">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2421] px-3 py-2 text-sm font-bold text-white"
                      onClick={() => addToCart(product)}
                      type="button"
                    >
                      <Icon name="cart" />
                      Thêm
                    </button>
                    <button
                      aria-label={`Yêu thích ${product.name}`}
                      className={`rounded-md border px-3 py-2 ${favorites[product.id] ? "border-[#bc3d2b] bg-[#fff1ee] text-[#bc3d2b]" : "border-[#ded6c9] text-[#646a61]"}`}
                      onClick={() => toggleFavorite(product.id)}
                      type="button"
                    >
                      <Icon name="heart" />
                    </button>
                    <button
                      aria-label={`Xem thông tin ${product.name}`}
                      className="rounded-md border border-[#ded6c9] px-3 py-2 text-[#646a61]"
                      onClick={() => setSelectedProduct(product)}
                      type="button"
                    >
                      <Icon name="info" />
                    </button>
                  </div>
                </article>
              ) : (
                <article
                  className="grid gap-4 rounded-md border border-[#ded6c9] bg-white p-4 shadow-sm md:grid-cols-[160px_1fr_auto]"
                  key={product.id}
                >
                  <button
                    className="relative h-40 overflow-hidden rounded-md bg-[#eee7dc]"
                    onClick={() => setSelectedProduct(product)}
                    type="button"
                  >
                    <Image
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
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[#f7f3ec] px-2 py-1 text-xs font-bold uppercase text-[#6f746d]">
                        {product.category}
                      </span>
                      <span className="rounded bg-[#eef6f2] px-2 py-1 text-xs font-bold uppercase text-[#2f6f5e]">
                        {product.styleName}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-[#b46f2c]">
                        <Icon name="star" />
                        {product.rating} ({product.reviewsCount})
                      </span>
                    </div>
                    <button
                      className="mt-3 text-left text-xl font-bold hover:text-[#2f6f5e]"
                      onClick={() => setSelectedProduct(product)}
                      type="button"
                    >
                      {product.name}
                    </button>
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
                        className="rounded-md bg-[#1f2421] px-3 py-2 text-sm font-bold text-white"
                        onClick={() => addToCart(product)}
                        type="button"
                      >
                        Thêm
                      </button>
                      <button
                        className="rounded-md border border-[#ded6c9] px-3 py-2 text-[#646a61]"
                        onClick={() => setSelectedProduct(product)}
                        type="button"
                      >
                        <Icon name="info" />
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
          </section>
        )}

        <section className="mt-10 grid gap-4 rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm md:grid-cols-3">
          {[
            ["truck", "Vận chuyển và lắp đặt", "Hỗ trợ giao hàng, lắp đặt tại nhà cho Hà Nội và TP. HCM."],
            ["check", "Cam kết vật liệu", "Ưu tiên gỗ sấy, vải bền màu và phụ kiện có nguồn gốc rõ ràng."],
            ["star", "Tư vấn phối đồ", "Kết nối catalog với AI để đề xuất sản phẩm đúng phong cách."],
          ].map(([iconName, title, text]) => (
            <article className="rounded-md bg-[#fbf7ef] p-4" key={title}>
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-[#2f6f5e]">
                <Icon name={iconName as "truck" | "check" | "star"} />
              </span>
              <h2 className="mt-3 text-base font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#646a61]">{text}</p>
            </article>
          ))}
        </section>
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex justify-end bg-white/90 p-4 backdrop-blur">
              <button
                aria-label="Đóng chi tiết sản phẩm"
                className="rounded-md bg-[#f7f3ec] p-2 text-[#646a61]"
                onClick={() => setSelectedProduct(null)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="grid gap-6 p-5 pt-0 md:grid-cols-[0.9fr_1.1fr] md:p-8 md:pt-0">
              <Image
                alt={selectedProduct.name}
                className="aspect-square w-full rounded-md object-cover"
                height={640}
                sizes="(min-width: 768px) 45vw, 100vw"
                src={selectedProduct.image}
                width={640}
              />

              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-[#f7f3ec] px-2 py-1 text-xs font-bold uppercase text-[#6f746d]">
                    {selectedProduct.category}
                  </span>
                  <span className="rounded bg-[#eef6f2] px-2 py-1 text-xs font-bold uppercase text-[#2f6f5e]">
                    {selectedProduct.styleName}
                  </span>
                  <ProductStatusBadge product={selectedProduct} />
                </div>

                <h2 className="mt-4 text-3xl font-bold leading-tight">{selectedProduct.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#b46f2c]">
                  <Icon name="star" />
                  {selectedProduct.rating} từ {selectedProduct.reviewsCount} đánh giá
                </p>

                <p className="mt-5 text-3xl font-bold">{formatPrice(selectedProduct.priceVND)}</p>
                <p className="mt-5 text-sm leading-7 text-[#646a61]">
                  {selectedProduct.description}
                </p>

                <div className="mt-6 grid gap-3 rounded-md bg-[#fbf7ef] p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-bold text-[#51564f]">Kích thước</p>
                    <p className="mt-1 text-[#646a61]">{selectedProduct.dimensions}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#51564f]">Vật liệu</p>
                    <p className="mt-1 text-[#646a61]">{selectedProduct.material}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-bold uppercase text-[#51564f]">
                    Thông số kỹ thuật
                  </h3>
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div className="flex justify-between gap-4 border-b border-[#eee7dc] py-3 text-sm" key={key}>
                      <span className="text-[#646a61]">{key}</span>
                      <span className="text-right font-semibold">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d89b47] px-4 py-3 text-sm font-bold text-[#1f2421]"
                    onClick={() => addToCart(selectedProduct)}
                    type="button"
                  >
                    <Icon name="cart" />
                    Thêm vào giỏ
                  </button>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2f6f5e] px-4 py-3 text-sm font-bold text-white"
                    href={`https://shopee.vn/search?keyword=${encodeURIComponent(selectedProduct.name)}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon name="bag" />
                    Shopee
                  </a>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2421] px-4 py-3 text-sm font-bold text-white"
                    href={`https://www.tiktok.com/search?q=${encodeURIComponent(selectedProduct.name)}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    TikTok
                    <Icon name="arrow" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
