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
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=700",
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
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=700",
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
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=700",
  },
];
