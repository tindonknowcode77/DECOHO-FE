export type ProductStatus = "hot" | "new" | "sale";

export type ProductStyle = "japandi" | "indochine" | "modern" | "classic";

export type Product = {
  id: string;
  name: string;
  category: string;
  priceVND: number;
  dimensions: string;
  material: string;
  image: string;
  style: ProductStyle;
  styleName: string;
  description: string;
  rating: number;
  reviewsCount: number;
  status?: ProductStatus;
  specifications: Record<string, string>;
};
