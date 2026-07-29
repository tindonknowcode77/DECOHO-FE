"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { initialCartItems } from "@/src/features/cart/mock/cartItems";
import { addCartItem } from "@/src/features/cart/services/cartStorage";
import { getProducts } from "@/src/features/products/services/productService";
import type { Product } from "@/src/features/products/types";
import ProductScanner from "./ProductScanner";

type Hotspot = {
  id: string;
  productId: string;
  fallbackLabel: string;
  x: number;
  y: number;
  cardSide: "left" | "right";
  cardAlign?: "top" | "center" | "bottom";
};

type ProductScene = {
  id: string;
  name: string;
  style: string;
  description: string;
  image: string;
  hotspots: Hotspot[];
};

const productScenes: ProductScene[] = [
  {
    id: "organic-calm",
    name: "Organic Calm",
    style: "Tự nhiên · Tĩnh tại",
    description:
      "Bảng màu kem, gỗ ấm và những đường cong mềm tạo nên một phòng khách nhẹ nhàng.",
    image: "/images/product-space/organic-calm.png",
    hotspots: [
      {
        cardAlign: "center",
        cardSide: "right",
        fallbackLabel: "Kệ tivi phòng khách",
        id: "organic-tv-console",
        productId: "11",
        x: 15,
        y: 70,
      },
      {
        cardAlign: "top",
        cardSide: "right",
        fallbackLabel: "Đèn thả cánh hoa",
        id: "organic-pendant",
        productId: "17",
        x: 50,
        y: 22,
      },
      {
        cardAlign: "center",
        cardSide: "left",
        fallbackLabel: "Sofa góc chữ L",
        id: "organic-sofa",
        productId: "1",
        x: 76,
        y: 64,
      },
      {
        cardAlign: "bottom",
        cardSide: "right",
        fallbackLabel: "Bộ bàn trà đá tự nhiên",
        id: "organic-table",
        productId: "18",
        x: 43,
        y: 76,
      },
      {
        cardAlign: "bottom",
        cardSide: "left",
        fallbackLabel: "Thảm dệt Japandi",
        id: "organic-rug",
        productId: "4",
        x: 58,
        y: 86,
      },
    ],
  },
  {
    id: "urban-warmth",
    name: "Urban Warmth",
    style: "Hiện đại · Ấm áp",
    description:
      "Đường nét gọn, tương phản đen và kem cùng ánh sáng gián tiếp cho căn hộ thành thị.",
    image: "/images/product-space/urban-warmth.png",
    hotspots: [
      {
        cardAlign: "top",
        cardSide: "right",
        fallbackLabel: "Đèn chùm ánh sáng vàng",
        id: "urban-chandelier",
        productId: "16",
        x: 52,
        y: 17,
      },
      {
        cardAlign: "center",
        cardSide: "right",
        fallbackLabel: "Kệ tivi treo tường",
        id: "urban-tv-console",
        productId: "11",
        x: 36,
        y: 59,
      },
      {
        cardAlign: "center",
        cardSide: "left",
        fallbackLabel: "Sofa góc chữ L",
        id: "urban-sofa",
        productId: "1",
        x: 76,
        y: 60,
      },
      {
        cardAlign: "bottom",
        cardSide: "right",
        fallbackLabel: "Bàn trà tròn màu đen",
        id: "urban-table",
        productId: "12",
        x: 50,
        y: 70,
      },
      {
        cardAlign: "bottom",
        cardSide: "right",
        fallbackLabel: "Ghế thư giãn boucle",
        id: "urban-chair",
        productId: "13",
        x: 23,
        y: 73,
      },
      {
        cardAlign: "bottom",
        cardSide: "right",
        fallbackLabel: "Đôn tròn bọc da lộn",
        id: "urban-ottoman",
        productId: "14",
        x: 30,
        y: 86,
      },
      {
        cardAlign: "bottom",
        cardSide: "left",
        fallbackLabel: "Thảm lông ngắn màu kem",
        id: "urban-rug",
        productId: "15",
        x: 66,
        y: 84,
      },
    ],
  },
  {
    id: "soft-evening",
    name: "Soft Evening",
    style: "Cozy · Ánh sáng ấm",
    description:
      "Không gian quây quần với sofa lớn, gỗ sáng và nhiều lớp ánh sáng dịu vào cuối ngày.",
    image: "/images/product-space/soft-evening.png",
    hotspots: [
      {
        cardAlign: "top",
        cardSide: "right",
        fallbackLabel: "Đèn thả trần nghệ thuật",
        id: "evening-pendant",
        productId: "5",
        x: 49,
        y: 14,
      },
      {
        cardAlign: "center",
        cardSide: "right",
        fallbackLabel: "Kệ tivi phòng khách",
        id: "evening-tv-console",
        productId: "11",
        x: 20,
        y: 66,
      },
      {
        cardAlign: "center",
        cardSide: "left",
        fallbackLabel: "Sofa góc chữ L",
        id: "evening-sofa",
        productId: "1",
        x: 80,
        y: 61,
      },
      {
        cardAlign: "bottom",
        cardSide: "right",
        fallbackLabel: "Bàn trà tròn",
        id: "evening-table",
        productId: "2",
        x: 50,
        y: 69,
      },
      {
        cardAlign: "bottom",
        cardSide: "right",
        fallbackLabel: "Ghế thư giãn boucle",
        id: "evening-poufs",
        productId: "13",
        x: 25,
        y: 83,
      },
      {
        cardAlign: "bottom",
        cardSide: "left",
        fallbackLabel: "Thảm lông ngắn màu kem",
        id: "evening-rug",
        productId: "15",
        x: 54,
        y: 84,
      },
    ],
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ProductPopover({
  isAdded,
  onAddToCart,
  product,
}: {
  isAdded: boolean;
  onAddToCart: (product: Product) => void;
  product: Product;
}) {
  return (
    <div className="w-full rounded-lg border border-white/70 bg-white/95 p-4 text-[#1f2421] shadow-[0_18px_45px_rgba(24,30,26,.26)] backdrop-blur-md sm:w-64">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2f6f5e]">
          {product.category}
        </p>
        <span className="shrink-0 text-[10px] font-bold uppercase text-[#b46f2c]">
          {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-base font-bold leading-5">
        {product.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#646a61]">
        {product.material} · {product.dimensions}
      </p>
      <div className="mt-3 border-t border-[#eee7dc] pt-3">
        <p className="text-sm font-bold">{formatPrice(product.priceVND)}</p>
        <div className="mt-3 grid grid-cols-[1fr_84px] gap-2">
          <button
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-bold transition ${
              isAdded
                ? "bg-[#2f6f5e] text-white"
                : "bg-[#d89b47] text-[#17211d] hover:bg-[#e4aa55]"
            } disabled:cursor-not-allowed disabled:bg-[#d7d3cb] disabled:text-[#777c75]`}
            disabled={product.stock === 0}
            onClick={() => onAddToCart(product)}
            type="button"
          >
            {isAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isAdded ? "Đã thêm" : "Thêm giỏ"}
          </button>
          <Link
            className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-[#d7cdbc] text-xs font-bold text-[#2f6f5e] transition hover:border-[#2f6f5e]"
            href={`/products/${product.id}`}
          >
            Chi tiết
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductSpaceView({
  initialProducts = [],
}: {
  initialProducts?: Product[];
}) {
  const [selectedSceneId, setSelectedSceneId] = useState(productScenes[0].id);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0);
  const [loadError, setLoadError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const addedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialProducts.length > 0 && reloadToken === 0) {
      return;
    }

    const controller = new AbortController();

    async function loadProducts() {
      setIsLoading(true);
      setLoadError("");

      try {
        setProducts(await getProducts(controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) {
          const message =
            error instanceof Error ? error.message : "";
          setLoadError(
            message && message !== "Failed to fetch"
              ? message
              : "Không thể kết nối catalog sản phẩm. Vui lòng thử lại.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [initialProducts.length, reloadToken]);

  useEffect(
    () => () => {
      if (addedResetTimer.current) {
        clearTimeout(addedResetTimer.current);
      }
    },
    [],
  );

  const selectedScene =
    productScenes.find((scene) => scene.id === selectedSceneId) ??
    productScenes[0];

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const activeHotspot = selectedScene.hotspots.find(
    (hotspot) => hotspot.id === activeHotspotId,
  );
  const activeProduct = activeHotspot
    ? productsById.get(activeHotspot.productId)
    : undefined;
  const availableProductCount = selectedScene.hotspots.filter((hotspot) =>
    productsById.has(hotspot.productId),
  ).length;

  function selectScene(sceneId: string) {
    setSelectedSceneId(sceneId);
    setActiveHotspotId(null);
  }

  function addProductToCart(product: Product) {
    addCartItem(
      {
        category: product.category,
        dimensions: product.dimensions,
        id: `catalog-${product.id}`,
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
    setAddedProductId(product.id);

    if (addedResetTimer.current) {
      clearTimeout(addedResetTimer.current);
    }

    addedResetTimer.current = setTimeout(() => setAddedProductId(null), 2200);
  }

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-8 text-[#1f2421] sm:px-8 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 border-b border-[#ded6c9] pb-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#b46f2c]">
              Nội thất có thể chạm
            </p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              Moodboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#646a61] sm:text-base">
              Di chuột hoặc chạm vào điểm đánh dấu trong phòng để xem đúng sản
              phẩm, giá và thông số từ catalog DECOHO.
            </p>
          </div>
          <Link
            className="inline-flex h-11 w-fit items-center gap-2 rounded-md bg-[#1f2421] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f6f5e]"
            href="/products"
          >
            Mở toàn bộ sản phẩm
            <ArrowIcon />
          </Link>
        </header>

        <div className="mt-12 flex items-end justify-between gap-4 border-b border-[#ded6c9] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#b46f2c]">
              Không gian có thể chạm
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Khám phá showroom theo phong cách
            </h2>
          </div>
          <span className="hidden text-xs text-[#737970] sm:block">
            Chọn không gian · Chạm vào điểm đánh dấu
          </span>
        </div>

        <div
          aria-label="Chọn không gian"
          className="mt-6 grid gap-3 sm:grid-cols-3"
          role="tablist"
        >
          {productScenes.map((scene) => {
            const isSelected = scene.id === selectedScene.id;

            return (
              <button
                aria-selected={isSelected}
                className={`grid grid-cols-[76px_1fr] items-center gap-3 rounded-lg border p-2 text-left transition ${
                  isSelected
                    ? "border-[#2f6f5e] bg-[#e8f1ec] shadow-sm"
                    : "border-[#ded6c9] bg-white hover:border-[#b8ad9c]"
                }`}
                key={scene.id}
                onClick={() => selectScene(scene.id)}
                role="tab"
                type="button"
              >
                <span className="relative h-14 overflow-hidden rounded-md bg-[#ddd4c6]">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="76px"
                    src={scene.image}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{scene.name}</span>
                  <span className="mt-1 block truncate text-xs text-[#646a61]">
                    {scene.style}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {loadError && (
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-lg border border-[#e3b7ad] bg-[#fff7f4] p-4 text-sm text-[#8f2f24] sm:flex-row sm:items-center">
            <p>{loadError}</p>
            <button
              className="rounded-md border border-[#d79c8f] px-3 py-2 font-bold"
              onClick={() => setReloadToken((value) => value + 1)}
              type="button"
            >
              Tải lại
            </button>
          </div>
        )}

        <section className="mt-5 overflow-hidden rounded-lg border border-[#d7cdbc] bg-[#17211d] shadow-[0_18px_50px_rgba(48,39,28,.16)]">
          <div className="relative aspect-[3/2] overflow-hidden">
            <Image
              alt={`Không gian ${selectedScene.name}`}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              src={selectedScene.image}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />

            <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-black/35 px-3 py-2 text-xs font-bold text-white backdrop-blur-md sm:left-5 sm:top-5">
              {selectedScene.name} · {selectedScene.style}
            </div>

            {selectedScene.hotspots.map((hotspot, index) => {
              const product = productsById.get(hotspot.productId);
              const isActive = activeHotspotId === hotspot.id;

              return (
                <div
                  className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                    isActive ? "z-40" : "z-20"
                  }`}
                  key={hotspot.id}
                  onMouseEnter={() => setActiveHotspotId(hotspot.id)}
                  onMouseLeave={() => setActiveHotspotId(null)}
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                >
                  <button
                    aria-label={`Xem ${product?.name ?? hotspot.fallbackLabel}`}
                    className={`relative grid h-9 w-9 place-items-center rounded-full border-2 border-white text-sm font-bold shadow-[0_5px_18px_rgba(0,0,0,.35)] transition ${
                      isActive
                        ? "scale-110 bg-[#d89b47] text-[#17211d]"
                        : "bg-[#2f6f5e] text-white hover:scale-110 hover:bg-[#d89b47] hover:text-[#17211d]"
                    }`}
                    onClick={() =>
                      setActiveHotspotId((current) =>
                        current === hotspot.id ? null : hotspot.id,
                      )
                    }
                    onFocus={() => setActiveHotspotId(hotspot.id)}
                    type="button"
                  >
                    <span
                      className={`absolute inset-0 -z-10 rounded-full bg-white/60 ${
                        isActive ? "animate-ping" : ""
                      }`}
                    />
                    {index + 1}
                  </button>

                  {isActive && product && (
                    <div
                      className={`absolute hidden sm:block ${
                        hotspot.cardSide === "left" ? "right-12" : "left-12"
                      } ${
                        hotspot.cardAlign === "top"
                          ? "top-0"
                          : hotspot.cardAlign === "bottom"
                            ? "bottom-0"
                            : "top-1/2 -translate-y-1/2"
                      }`}
                    >
                      <ProductPopover
                        isAdded={addedProductId === product.id}
                        onAddToCart={addProductToCart}
                        product={product}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white sm:bottom-5 sm:left-5 sm:right-5">
              <p className="hidden max-w-md text-sm leading-6 text-white/85 sm:block">
                {selectedScene.description}
              </p>
              <span className="ml-auto rounded-full border border-white/30 bg-black/35 px-3 py-2 text-xs font-bold backdrop-blur-md">
                {isLoading
                  ? "Đang nối catalog..."
                  : `${availableProductCount} sản phẩm trong phòng`}
              </span>
            </div>
          </div>

          {activeProduct && (
            <div className="border-t border-white/15 bg-[#17211d] p-4 sm:hidden">
              <ProductPopover
                isAdded={addedProductId === activeProduct.id}
                onAddToCart={addProductToCart}
                product={activeProduct}
              />
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#646a61]">
          <p>
            Chọn một không gian khác để khám phá cách cùng sản phẩm thay đổi
            theo bối cảnh.
          </p>
          <Link
            className="inline-flex items-center gap-2 font-bold text-[#2f6f5e] hover:text-[#b46f2c]"
            href="/products"
          >
            So sánh trong catalog
            <ArrowIcon />
          </Link>
        </div>

        <ProductScanner />
      </section>
    </main>
  );
}
