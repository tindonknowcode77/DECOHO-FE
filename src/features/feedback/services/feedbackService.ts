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
