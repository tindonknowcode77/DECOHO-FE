import { getAccessToken } from "@/src/features/auth/services/session";
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
  id?: string | number;
  _id?: string;
  sku?: string;
  name?: string;
  category?: string;
  brand?: string;
  description?: string;
  price?: string | number;
  discount?: string | number;
  stock?: string | number;
  soldCount?: string | number;
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
  image?: string;
  tags?: string[];
  styleTags?: string[];
  ecommercePlatform?: string;
  productLink?: string;
  isFeatured?: boolean;
  ratingAvg?: number | string;
};

function getApiUrl() {
  const url =
    process.env.NEXT_PUBLIC_PRODUCTS_API_URL?.trim() ||
    `${(process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "")}/products`;

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
  const tags = product.tags ?? product.styleTags ?? [];
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

function normalizeProduct(product: ApiProduct): Product {
  const productId=String(product.id??product._id??"");
  const originalPrice = toNumber(product.price);
  const discountPercentage = Math.max(
    0,
    Math.min(100, toNumber(product.discount)),
  );
  const priceVND = Math.round(
    originalPrice * (1 - discountPercentage / 100),
  );
  const styleName = getStyleName(product);
  const apiImages = [product.image,...(product.images ?? [])].filter((value):value is string=>Boolean(value));
  const usableImage = apiImages.find((image) => !isPlaceholderImage(image));
  const image = usableImage ?? "";

  return {
    id: productId,
    sku: product.sku ?? productId,
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
    tags: product.tags ?? product.styleTags ?? [],
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
    __raw: product,
  } as Product;
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
    throw new Error("Backend trả về dữ liệu sản phẩm không hợp lệ.");
  }

  return data.map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const response = await fetch(
    `${getApiUrl()}/${encodeURIComponent(id)}`,
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

  const product = (await response.json()) as ApiProduct;
  return product ? normalizeProduct(product) : null;
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

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type CreateProductPayload = {
  name: string;
  price: number;
  image?: string;
  category?: string;
  brand?: string;
  description?: string;
  discount?: number;
  stock?: number;
  material?: string;
  color?: string;
  dimensions?: { length?: string; width?: string; height?: string };
  weight?: string;
  origin?: string;
  warranty?: string;
  tags?: string[];
  styleTags?: string[];
  images?: string[];
  productLink?: string;
  ecommercePlatform?: string;
};

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await fetch(getApiUrl(), {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data: ApiProduct | ApiProduct[] | null = text
    ? (JSON.parse(text) as ApiProduct | ApiProduct[])
    : null;

  if (!response.ok) {
    throw new Error(
      extractError(data) ??
        `Không thể tạo sản phẩm (${response.status}).`,
    );
  }

  const single = Array.isArray(data) ? data[0] : data;
  if (!single) {
    throw new Error("Backend không trả về sản phẩm vừa tạo.");
  }
  return normalizeProduct(single);
}

export async function updateProduct(
  id: string,
  payload: Partial<CreateProductPayload>,
): Promise<Product> {
  const response = await fetch(
    `${getApiUrl()}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: authHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify(payload),
    },
  );

  const text = await response.text();
  const data: ApiProduct | null = text ? (JSON.parse(text) as ApiProduct) : null;
  if (!response.ok) {
    throw new Error(
      extractError(data) ?? `Không thể cập nhật sản phẩm (${response.status}).`,
    );
  }
  if (!data) {
    throw new Error("Backend không trả về sản phẩm vừa cập nhật.");
  }
  return normalizeProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(
    `${getApiUrl()}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: authHeaders({ Accept: "application/json" }),
    },
  );
  if (!response.ok) {
    const text = await response.text();
    let parsed: ApiProduct | null = null;
    try {
      parsed = text ? (JSON.parse(text) as ApiProduct) : null;
    } catch {
      // ignore
    }
    throw new Error(
      extractError(parsed) ?? `Không thể xoá sản phẩm (${response.status}).`,
    );
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const base = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
  const response = await fetch(`${base}/upload/image`, {
    method: "POST",
    headers: authHeaders({ Accept: "application/json" }),
    body: formData,
  });

  const text = await response.text();
  const data: { secureUrl?: string; url?: string } | null = text
    ? (JSON.parse(text) as { secureUrl?: string; url?: string })
    : null;
  if (!response.ok) {
    throw new Error(
      extractError(data as unknown as ApiProduct) ??
        `Upload thất bại (${response.status}).`,
    );
  }
  const url = data?.secureUrl ?? data?.url;
  if (!url) {
    throw new Error("Backend không trả về URL ảnh.");
  }
  return url;
}

function extractError(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  const candidate =
    (typeof record.message === "string" && record.message) ||
    (typeof record.error === "string" && record.error);
  if (candidate) return candidate;

  const details = record.message;
  if (Array.isArray(details) && details.length) {
    const first = details[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const message = (first as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }
  }
  return undefined;
}
