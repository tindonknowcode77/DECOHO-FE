import { apiClient } from "./axios";

export type AiScannedProduct = {
  name: string;
  category: string;
  material: string;
  color: string;
  style: string;
  dimensions: string;
  confidence: number;
};

export type AiScanResponse = {
  id: string;
  roomType: string;
  dominantColors: string[];
  products: AiScannedProduct[];
  createdAt?: string;
};

export const aiScannerService = {
  scanImage(image: File) {
    const formData = new FormData();
    formData.append("image", image);

    return apiClient.post<AiScanResponse, FormData>(
      "/ai-scanner/scan",
      formData,
    );
  },
};
