import { ApiError, apiClient } from "@/src/services/axios";
import { getAccessToken } from "@/src/features/auth/services/session";
import {
  type WishlistProduct,
  saveProductMeta,
  getWishlistProductIds,
  toggleWishlistProduct,
} from "./wishlistStorage";

type ProductFavoriteDoc = {
  _id: string;
  userId: string;
  productId: string;
  createdAt: string;
};

type ProductListItem = {
  id: string;
  name: string;
  priceVND?: number;
  image?: string;
  category?: string;
  brand?: string;
  style?: string;
};

/**
 * Tải danh sách sản phẩm yêu thích từ backend, đồng bộ vào localStorage
 * để UI hiển thị đầy đủ metadata.
 */
export async function loadFavoritesFromBackend(
  onLoaded: (items: WishlistProduct[]) => void,
): Promise<void> {
  const token = getAccessToken();
  if (!token) return;

  try {
    const docs = await apiClient.get<ProductFavoriteDoc[]>("/product-favorites", {
      token,
    });
    const ids = docs.map((d) => d.productId);
    const products = await fetchProductsByIds(ids, token);

    const wishlistProducts: WishlistProduct[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      priceVND: p.priceVND,
      image: p.image,
      category: p.category,
      brand: p.brand,
      style: p.style,
      savedAt: Date.now(),
    }));

    wishlistProducts.forEach(saveProductMeta);

    const existingIds = new Set(getWishlistProductIds());
    ids.forEach((id) => {
      if (!existingIds.has(id)) toggleWishlistProduct(id);
    });

    onLoaded(wishlistProducts);
  } catch (value) {
    if (!(value instanceof ApiError)) {
      console.error("loadFavoritesFromBackend failed", value);
    }
  }
}

async function fetchProductsByIds(
  ids: string[],
  token: string,
): Promise<ProductListItem[]> {
  if (ids.length === 0) return [];
  try {
    const result = await apiClient.get<ProductListItem[]>(
      `/products?ids=${ids.join(",")}`,
      { token },
    );
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}
