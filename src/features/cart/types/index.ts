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
};

export type PromoCode = {
  code: string;
  discount: number;
  description: string;
};
