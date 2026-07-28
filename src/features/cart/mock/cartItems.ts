import type { CartItem, PromoCode } from "../types";

export const promoCodes: PromoCode[] = [
  {
    code: "DECOHO10",
    description: "Giảm 10% tổng đơn hàng",
    discount: 0.1,
  },
  {
    code: "KIENTAO5",
    description: "Giảm 5% tổng đơn hàng",
    discount: 0.05,
  },
];

export const initialCartItems: CartItem[] = [
  {
    id: "sofa-japandi-01",
    name: "Sofa vải boucle Mori",
    category: "Sofa",
    style: "Japandi",
    material: "Vải boucle, khung gỗ tần bì",
    dimensions: "220 x 92 x 78 cm",
    priceVND: 18900000,
    quantity: 1,
    image: "/images/product-space/organic-calm.png",
    productHref: "/products/1",
    source: "catalog",
  },
  {
    id: "table-indochine-02",
    name: "Bàn trà mây gỗ Đông Dương",
    category: "Bàn trà",
    style: "Indochine",
    material: "Gỗ sồi, mây đan tự nhiên",
    dimensions: "110 x 60 x 42 cm",
    priceVND: 7200000,
    quantity: 1,
    image: "/images/product-space/urban-warmth.png",
    productHref: "/products/2",
    source: "catalog",
  },
  {
    id: "lamp-modern-03",
    name: "Đèn sàn Arc Brass",
    category: "Đèn",
    style: "Modern",
    material: "Thép sơn tĩnh điện, chao vải",
    dimensions: "42 x 42 x 168 cm",
    priceVND: 3450000,
    quantity: 2,
    image: "/images/product-space/soft-evening.png",
    productHref: "/products/3",
    source: "catalog",
  },
];
