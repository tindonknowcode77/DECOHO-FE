import { apiClient } from './axios';

export type ProductFavoriteResponse = {
  _id: string;
  userId: string;
  productId: string;
  createdAt: string;
};

export const productFavoritesService = {
  getAll: (token: string) =>
    apiClient.get<ProductFavoriteResponse[]>('/product-favorites', { token }),

  getIds: (token: string) =>
    apiClient.get<string[]>('/product-favorites/ids', { token }),

  add: (token: string, productId: string) =>
    apiClient.post<{ liked: boolean }, undefined>(
      `/product-favorites/${productId}`,
      undefined,
      { token },
    ),

  remove: (token: string, productId: string) =>
    apiClient.delete<{ liked: boolean }>(`/product-favorites/${productId}`, {
      token,
    }),
};
