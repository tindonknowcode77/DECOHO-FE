import { apiClient } from "./axios";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
};

export const authService = {
  login: (payload: AuthCredentials) =>
    apiClient.post<AuthResponse, AuthCredentials>("/auth/login", payload),
  register: (payload: AuthCredentials) =>
    apiClient.post<AuthResponse, AuthCredentials>("/auth/register", payload),
};
