import { getAccessToken } from "@/src/features/auth/services/session";

export interface TrackClickParams {
  productId?: string;
  productName?: string;
  productLink?: string;
  source?: string;
}

/**
 * Gửi ghi nhận 1 lượt click mua Shopee về backend DECOHO để hiển thị trong Admin
 */
export function trackShopeeClick(params: TrackClickParams): void {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
    const token = getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = JSON.stringify({
      productId: params.productId,
      productName: params.productName,
      productLink: params.productLink,
      source: params.source ?? "web",
    });

    // Ưu tiên navigator.sendBeacon nếu khả dụng và không có custom header,
    // hoặc dùng fetch kèm keepalive: true để đảm bảo không bị browser hủy khi mở tab mới
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function" && !token) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(`${base}/affiliate/track-click`, blob);
    } else {
      void fetch(`${base}/affiliate/track-click`, {
        method: "POST",
        headers,
        body: payload,
        keepalive: true,
      }).catch((err) => {
        console.debug("Shopee click tracking request error:", err);
      });
    }
  } catch (err) {
    console.debug("Failed to dispatch trackShopeeClick:", err);
  }
}
