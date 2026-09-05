import { getAccessToken } from "@/src/features/auth/services/session";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderAddress = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  note?: string;
};

export type OrderSummary = {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  promotionCode?: string;
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO" | "CREDIT_CARD";

export type Order = {
  _id: string;
  orderCode: string;
  userId: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  promotionCode?: string;
  createdAt: string;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    actor?: string;
    note?: string;
  }>;
};

export type CreateOrderPayload = {
  items: Array<{ productId: string; quantity: number }>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  promotionCode?: string;
};

export type PromoValidation = {
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  message?: string;
  finalDiscount?: number;
};

function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    return response.text().then((text) => {
      try {
        const data = JSON.parse(text);
        throw new Error(data.message ?? data.error ?? `Lỗi ${response.status}`);
      } catch {
        throw new Error(`Lỗi ${response.status}: ${text.slice(0, 200)}`);
      }
    });
  }
  return response.json() as Promise<T>;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Order>(response);
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await fetch(`${API_BASE}/orders/mine`, {
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  });

  return handleResponse<Order[]>(response);
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/mine/${id}`, {
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  });

  return handleResponse<Order>(response);
}

export async function validatePromoCode(
  code: string,
  subtotal: number,
  productIds: string[] = [],
  categoryIds: string[] = [],
  supplierIds: string[] = [],
): Promise<PromoValidation> {
  const response = await fetch(`${API_BASE}/promotions/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ code, subtotal, productIds, categoryIds, supplierIds }),
  });

  const data = await handleResponse<{
    valid: boolean;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minimumOrderAmount: number;
    maximumDiscountAmount?: number;
    message?: string;
    finalDiscount?: number;
  }>(response);

  return {
    ...data,
    code: data.code.toUpperCase(),
  };
}

export async function getBankAccountInfo(): Promise<{
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
}> {
  const response = await fetch(`${API_BASE}/payments/bank-info`, {
    headers: { Accept: "application/json" },
  });

  if (response.ok) {
    return handleResponse(response);
  }
  return {
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountHolder: "CTY TNHH DECOHO",
    branch: "Chi nhánh TP.HCM",
  };
}

export async function createVNPayPayment(orderId: string, amount: number): Promise<{ paymentUrl: string }> {
  const response = await fetch(`${API_BASE}/payments/vnpay/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ orderId, amount }),
  });

  return handleResponse<{ paymentUrl: string }>(response);
}

export async function createMoMoPayment(orderId: string, amount: number): Promise<{ paymentUrl: string }> {
  const response = await fetch(`${API_BASE}/payments/momo/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ orderId, amount }),
  });

  return handleResponse<{ paymentUrl: string }>(response);
}
