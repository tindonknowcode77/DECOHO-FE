import { getAccessToken } from "@/src/features/auth/services/session";
import type {
  CreateProductSpacePayload,
  ProductSpace,
  UpdateProductSpacePayload,
} from "../types";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function extractError(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  const candidate =
    (typeof record.message === "string" && record.message) ||
    (typeof record.error === "string" && record.error);
  if (typeof candidate === "string") return candidate;
  if (Array.isArray(record.message) && record.message[0]) {
    const first = record.message[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const message = (first as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }
  }
  return undefined;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: authHeaders({
      Accept: "application/json",
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(init.headers ?? {}),
    }),
  });

  const text = await response.text();
  const data: T | null = text ? (JSON.parse(text) as T) : null;

  if (!response.ok) {
    throw new Error(
      extractError(data) ?? `Lỗi ${response.status} khi gọi ${path}.`,
    );
  }
  return data as T;
}

/**
 * Tất cả Product Spaces công khai (featured-first).
 * Không cần auth.
 */
export function listPublicProductSpaces(): Promise<ProductSpace[]> {
  return request<ProductSpace[]>("/product-spaces", { cache: "no-store" });
}

/**
 * Product Spaces của user đang đăng nhập. Cần Bearer token.
 */
export function listMyProductSpaces(): Promise<ProductSpace[]> {
  return request<ProductSpace[]>("/product-spaces/mine", {
    cache: "no-store",
  });
}

/**
 * Admin: tất cả Product Spaces (cả public + private).
 */
export function listAllProductSpacesForAdmin(): Promise<ProductSpace[]> {
  return request<ProductSpace[]>("/product-spaces/admin/all", {
    cache: "no-store",
  });
}

/**
 * Lấy chi tiết một Product Space công khai.
 */
export function getProductSpace(id: string): Promise<ProductSpace> {
  return request<ProductSpace>(`/product-spaces/${encodeURIComponent(id)}`);
}

/**
 * Tạo Moodboard cá nhân. multipart/form-data với field `image` (required)
 * và các trường metadata kèm theo trong form body.
 */
export function createMyProductSpace(
  payload: CreateProductSpacePayload,
  image: File,
): Promise<ProductSpace> {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("roomType", payload.roomType);
  formData.append("width", String(payload.width));
  formData.append("length", String(payload.length));
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }
  if (payload.isPublic !== undefined) {
    formData.append("isPublic", String(payload.isPublic));
  }

  return request<ProductSpace>("/product-spaces/upload", {
    method: "POST",
    body: formData,
  });
}

/**
 * Admin: tạo Moodboard kèm ảnh. multipart/form-data.
 */
export function createProductSpaceAsAdmin(
  payload: CreateProductSpacePayload & { isFeatured?: boolean },
  image: File,
): Promise<ProductSpace> {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("roomType", payload.roomType);
  formData.append("width", String(payload.width));
  formData.append("length", String(payload.length));
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }
  if (payload.isPublic !== undefined) {
    formData.append("isPublic", String(payload.isPublic));
  }
  if (payload.isFeatured !== undefined) {
    formData.append("isFeatured", String(payload.isFeatured));
  }

  return request<ProductSpace>("/product-spaces/admin/upload", {
    method: "POST",
    body: formData,
  });
}

/**
 * Admin: cập nhật title/description/visibility/featured.
 */
export function updateProductSpace(
  id: string,
  payload: UpdateProductSpacePayload,
): Promise<ProductSpace> {
  return request<ProductSpace>(
    `/product-spaces/admin/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Admin: gắn một product point (toạ độ 0..100 + productId) lên Moodboard.
 */
export function addProductPoint(
  spaceId: string,
  point: { productId: string; x: number; y: number },
): Promise<ProductSpace> {
  return request<ProductSpace>(
    `/product-spaces/admin/${encodeURIComponent(spaceId)}/points`,
    {
      method: "POST",
      body: JSON.stringify(point),
    },
  );
}

/**
 * Admin: cập nhật vị trí / sản phẩm của một point đã gắn.
 */
export function updateProductPoint(
  spaceId: string,
  pointId: string,
  point: { productId: string; x: number; y: number },
): Promise<ProductSpace> {
  return request<ProductSpace>(
    `/product-spaces/admin/${encodeURIComponent(spaceId)}/points/${encodeURIComponent(pointId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(point),
    },
  );
}

/**
 * Admin: gỡ một product point khỏi Moodboard.
 */
export function removeProductPoint(
  spaceId: string,
  pointId: string,
): Promise<ProductSpace> {
  return request<ProductSpace>(
    `/product-spaces/admin/${encodeURIComponent(spaceId)}/points/${encodeURIComponent(pointId)}`,
    {
      method: "DELETE",
    },
  );
}
