import {
  Armchair,
  BedDouble,
  Blocks,
  Flower2,
  LampFloor,
  LayoutGrid,
  PanelsTopLeft,
  Sofa,
  Table2,
} from "lucide-react";
import type { Product } from "../types";

export const PRODUCT_GROUPS = [
  { id: "all", label: "Tất cả", icon: LayoutGrid, tone: "#eaece1" },
  { id: "seating", label: "Sofa & ghế", icon: Sofa, tone: "#e6e9dc" },
  { id: "tables", label: "Bàn", icon: Table2, tone: "#f0e6d9" },
  { id: "storage", label: "Tủ & kệ", icon: PanelsTopLeft, tone: "#e4e9e4" },
  { id: "bedroom", label: "Giường & nệm", icon: BedDouble, tone: "#eee6e2" },
  { id: "lighting", label: "Đèn", icon: LampFloor, tone: "#f3ebd8" },
  { id: "decor", label: "Đồ trang trí", icon: Blocks, tone: "#e9e4db" },
  { id: "plants", label: "Cây & hoa", icon: Flower2, tone: "#e0e9dc" },
];
export function searchable(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
export function productGroup(product: Pick<Product, "category">) {
  const category = searchable(product.category);
  if (/cay|binh hoa|chau/.test(category)) return "plants";
  if (/den/.test(category)) return "lighting";
  if (/^(tu|ke)(\s|$)/.test(category)) return "storage";
  if (/ban/.test(category)) return "tables";
  if (/giuong|nem/.test(category)) return "bedroom";
  if (/sofa|ghe/.test(category) && !/goi/.test(category)) return "seating";
  return "decor";
}
export function groupArtwork(category: string) {
  const group = PRODUCT_GROUPS.find(
    (group) => group.id === productGroup({ category }),
  );
  return (
    group ?? { id: "decor", label: "Nội thất", icon: Armchair, tone: "#e9e4db" }
  );
}
export const PRICE_RANGES = [
  { id: "all", label: "Tất cả mức giá", min: 0, max: Infinity },
  { id: "under-500", label: "Dưới 500.000 ₫", min: 0, max: 500000 },
  { id: "500-2000", label: "500.000 – 2.000.000 ₫", min: 500000, max: 2000000 },
  {
    id: "2000-5000",
    label: "2.000.000 – 5.000.000 ₫",
    min: 2000000,
    max: 5000000,
  },
  { id: "over-5000", label: "Từ 5.000.000 ₫", min: 5000000, max: Infinity },
];
export const formatProductPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
