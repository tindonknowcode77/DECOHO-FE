import type { Product } from "../types";

export function getPurchaseLink(product: Product | null) {
  if (!product?.productLink) return null;
  try {
    const url = new URL(product.productLink.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const isShopee = /(^|\.)shopee\.vn$/.test(url.hostname) || url.hostname === "shope.ee";
    return {
      href: url.href,
      label: isShopee || product.ecommercePlatform?.toLowerCase() === "shopee"
        ? "Mua trên Shopee"
        : "Xem nơi bán",
    };
  } catch {
    return null;
  }
}
