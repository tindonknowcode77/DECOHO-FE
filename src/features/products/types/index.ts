export type ProductStatus = "hot" | "new" | "sale";

export type ProductStyle = string;

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  priceVND: number;
  originalPriceVND: number;
  discountPercentage: number;
  stock: number;
  availability: string;
  dimensions: string;
  material: string;
  color: string;
  image: string;
  images: string[];
  tags: string[];
  style: ProductStyle;
  styleName: string;
  description: string;
  rating: number;
  reviewsCount: number;
  status?: ProductStatus;
  specifications: Record<string, string>;
};
