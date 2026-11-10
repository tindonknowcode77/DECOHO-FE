import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";
import type { FeedbackSubmission, ProductFeedbackStats } from "../types";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");

export async function submitFeedback(data: FeedbackSubmission) {
  const base = getBaseUrl();
  const res = await authenticatedFetch(`${base}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Không thể gửi phản hồi (${res.status})`);
  }

  return res.json();
}

export async function getProductFeedback(productId: string): Promise<ProductFeedbackStats> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/feedback/product/${encodeURIComponent(productId)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Không thể lấy đánh giá sản phẩm (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export async function getPublicFeedbacks(params?: {
  type?: string;
  limit?: number;
  page?: number;
}): Promise<import("../types").PublicFeedbackResponse> {
  const base = getBaseUrl();
  const searchParams = new URLSearchParams();
  if (params?.type && params.type !== "ALL") searchParams.set("type", params.type);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.page) searchParams.set("page", String(params.page));

  const qs = searchParams.toString();
  const url = `${base}/feedback/public${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Không thể tải đánh giá cộng đồng (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
