export type CartItem = {
  id: string;
  name: string;
  category: string;
  style: string;
  material: string;
  dimensions: string;
  priceVND: number;
  quantity: number;
  image: string;
  productHref?: string;
  source?: "catalog" | "store";
  stock?: number;
};

export type PromoCode = {
  code: string;
  discount: number;
  description: string;
};
