import { apiClient } from "./axios";

export type UploadResponse = {
  url: string;
  publicId?: string;
};

export const uploadService = {
  uploadFile: (file: File, token?: string) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<UploadResponse, FormData>("/upload", formData, { token });
  },
};
