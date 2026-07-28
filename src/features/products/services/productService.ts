import type {
  Product,
  ProductStatus,
  ProductStyle,
} from "../types";

type ApiDimensions = {
  length?: string;
  width?: string;
  height?: string;
};

type ApiProduct = {
  id: string | number;
  sku?: string;
  name?: string;
  category?: string;
  brand?: string;
  description?: string;
  price?: string | number;
  discount?: string | number;
  stock?: string | number;
  status?: string;
  material?: string;
  color?: string;
  dimensions?: ApiDimensions | string;
  weight?: string;
  origin?: string;
  warranty?: string;
  rating?: string | number;
  reviews?: string | number;
  images?: string[];
  tags?: string[];
};

const FALLBACK_IMAGES = [
  "/images/decoho-home-interior-v2.png",
  "/images/decoho-home-hero-v2.png",
];

const DEFAULT_PRODUCTS_API_URL =
  "https://670f544b3e715186165759aa.mockapi.io/DECOHO";

function getApiUrl() {
  const url =
    process.env.NEXT_PUBLIC_PRODUCTS_API_URL?.trim() ||
    DEFAULT_PRODUCTS_API_URL;

  return url.replace(/\/+$/, "");
}

function toNumber(value: string | number | undefined, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function slugify(value: string): ProductStyle {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getDimensions(value: ApiProduct["dimensions"]) {
  if (typeof value === "string") {
    return value;
  }

  if (!value) {
    return "Đang cập nhật";
  }

  return [value.length, value.width, value.height]
    .filter(Boolean)
    .join(" x ");
}

function getStyleName(product: ApiProduct) {
  const tags = product.tags ?? [];
  const category = product.category?.toLowerCase();
  const styleTag = tags.find((tag) => {
    const normalizedTag = tag.toLowerCase();
    return (
      normalizedTag !== category &&
      !normalizedTag.startsWith("phòng")
    );
  });

  return styleTag ?? product.brand ?? "Nội thất hiện đại";
}

function getStatus(product: ApiProduct): ProductStatus | undefined {
  const discount = toNumber(product.discount);
  const rating = toNumber(product.rating);

  if (discount > 0) {
    return "sale";
  }

  if (rating >= 4.8) {
    return "hot";
  }

  return undefined;
}

function isPlaceholderImage(url: string) {
  try {
    return new URL(url).hostname === "example.com";
  } catch {
    return true;
  }
}

function normalizeProduct(product: ApiProduct, index = 0): Product {
  const originalPrice = toNumber(product.price);
  const discountPercentage = Math.max(
    0,
    Math.min(100, toNumber(product.discount)),
  );
  const priceVND = Math.round(
    originalPrice * (1 - discountPercentage / 100),
  );
  const styleName = getStyleName(product);
  const apiImages = (product.images ?? []).filter(Boolean);
  const usableImage = apiImages.find((image) => !isPlaceholderImage(image));
  const image =
    usableImage ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return {
    id: String(product.id),
    sku: product.sku ?? `DECOHO-${product.id}`,
    name: product.name ?? "Sản phẩm DECOHO",
    category: product.category ?? "Nội thất",
    brand: product.brand ?? "DECOHO",
    priceVND,
    originalPriceVND: originalPrice,
    discountPercentage,
    stock: toNumber(product.stock),
    availability: product.status ?? "Đang cập nhật",
    dimensions: getDimensions(product.dimensions),
    material: product.material ?? "Đang cập nhật",
    color: product.color ?? "Đang cập nhật",
    image,
    images: apiImages,
    tags: product.tags ?? [],
    style: slugify(styleName),
    styleName,
    description:
      product.description ?? "Thông tin sản phẩm đang được cập nhật.",
    rating: toNumber(product.rating),
    reviewsCount: toNumber(product.reviews),
    status: getStatus(product),
    specifications: {
      "Thương hiệu": product.brand ?? "Đang cập nhật",
      "Màu sắc": product.color ?? "Đang cập nhật",
      "Khối lượng": product.weight ?? "Đang cập nhật",
      "Xuất xứ": product.origin ?? "Đang cập nhật",
      "Bảo hành": product.warranty ?? "Đang cập nhật",
      "Tồn kho": `${toNumber(product.stock)} sản phẩm`,
      "Trạng thái": product.status ?? "Đang cập nhật",
    },
  };
}

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await fetch(getApiUrl(), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Không thể tải sản phẩm (${response.status}).`);
  }

  const data = (await response.json()) as ApiProduct[];

  if (!Array.isArray(data)) {
    throw new Error("MockAPI trả về dữ liệu sản phẩm không hợp lệ.");
  }

  return data.map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const response = await fetch(
    `${getApiUrl()}?id=${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Không thể tải sản phẩm (${response.status}).`);
  }

  const data = (await response.json()) as ApiProduct[];
  const product = Array.isArray(data) ? data[0] : null;

  return product
    ? normalizeProduct(product, toNumber(product.id))
    : null;
}

export function getRecommendedProducts(
  currentProduct: Product,
  products: Product[],
  limit = 4,
) {
  const currentTags = new Set(
    currentProduct.tags.map((tag) => tag.trim().toLowerCase()),
  );

  return products
    .filter((product) => product.id !== currentProduct.id)
    .map((product) => {
      const sharedTags = product.tags.filter((tag) =>
        currentTags.has(tag.trim().toLowerCase()),
      ).length;
      const score =
        sharedTags * 3 +
        (product.category === currentProduct.category ? 5 : 0) +
        (product.style === currentProduct.style ? 3 : 0) +
        (product.brand === currentProduct.brand ? 2 : 0);

      return { product, score };
    })
    .sort(
      (first, second) =>
        second.score - first.score ||
        second.product.rating - first.product.rating,
    )
    .slice(0, limit)
    .map(({ product }) => product);
}
