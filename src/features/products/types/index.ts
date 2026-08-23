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
  __raw?: Record<string, unknown>;
};

/**
 * Phiên bản rút gọn của `Product` dùng khi chỉ cần hiển thị / chọn nhanh.
 * Thường dùng ở danh sách chọn sản phẩm (ví dụ: gắn vào Product Space point).
 *
 * Khai báo bằng `Pick` để khi `Product` đổi → `ProductLite` tự cập nhật,
 * tránh lặp lại shape.
 */
export type ProductLite = Pick<
  Product,
  "id" | "name" | "image" | "priceVND" | "brand" | "category"
>;
