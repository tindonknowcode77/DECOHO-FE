export type StoreFlowStatus = "active" | "completed" | "pending";

export type StoreFlowStep = {
  id: string;
  title: string;
  description: string;
  metric: string;
  status: StoreFlowStatus;
};

export type StoreProductStatus = "active" | "draft" | "review";

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  priceVND: number;
  stock: number;
  views: number;
  conversionRate: number;
  modelStatus: "missing" | "ready" | "reviewing";
  status: StoreProductStatus;
};

export type StoreLead = {
  id: string;
  customerName: string;
  need: string;
  productName: string;
  budgetVND: number;
  source: string;
  status: "new" | "quoted" | "scheduled";
};
