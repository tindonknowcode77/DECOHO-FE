import type { CartItem } from "../types";

const ORDER_STORAGE_KEY = "decoho_orders_v1";

export type CheckoutOrder = {
  id: string;
  createdAt: string;
  customer: {
    address: string;
    city: string;
    district: string;
    email: string;
    name: string;
    note: string;
    phone: string;
  };
  discountVND: number;
  items: CartItem[];
  paymentMethod: string;
  promoCode: string | null;
  shippingFeeVND: number;
  shippingMethod: string;
  status: "confirmed";
  subtotalVND: number;
  totalVND: number;
};

export function saveCheckoutOrder(order: CheckoutOrder) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const rawOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);
    const orders = rawOrders ? (JSON.parse(rawOrders) as CheckoutOrder[]) : [];
    window.localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify([order, ...orders].slice(0, 20)),
    );
  } catch {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([order]));
  }
}
