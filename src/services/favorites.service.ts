import { apiClient } from './axios';

export type FavoriteResponse = {
  _id: string;
  userId: string;
  decorPlanId: string;
  createdAt: string;
};

export const favoritesService = {
  getAll: (token: string) =>
    apiClient.get<FavoriteResponse[]>('/favorites', { token }),

  getIds: (token: string) =>
    apiClient.get<{ _id: string }[]>('/favorites/ids', { token }),

  add: (token: string, decorPlanId: string) =>
    apiClient.post<FavoriteResponse, undefined>(
      `/favorites/${decorPlanId}`,
      undefined,
      { token },
    ),

  remove: (token: string, decorPlanId: string) =>
    apiClient.delete<{ success: boolean }>(`/favorites/${decorPlanId}`, {
      token,
    }),

  check: (token: string, decorPlanId: string) =>
    apiClient.get<{ isFavorited: boolean }>(
      `/favorites/${decorPlanId}/check`,
      { token },
    ),
};
