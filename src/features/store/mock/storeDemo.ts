import type { StoreFlowStep, StoreLead, StoreProduct } from "../types";

// Cấu hình giao diện quy trình; dữ liệu nghiệp vụ được lấy từ backend.
export const storeFlowSteps: StoreFlowStep[] = [
  { id: "register", title: "Đăng ký cửa hàng", description: "Khai báo thông tin supplier.", metric: "Bước 1", status: "completed" },
  { id: "approval", title: "Chờ Admin duyệt", description: "Admin kiểm tra và duyệt hồ sơ.", metric: "Bước 2", status: "active" },
  { id: "profile", title: "Hoàn thiện hồ sơ", description: "Cập nhật thông tin cửa hàng.", metric: "Bước 3", status: "active" },
  { id: "post-product", title: "Đăng sản phẩm", description: "Tạo sản phẩm và gửi duyệt.", metric: "Bước 4", status: "active" },
];

export const demoStoreProducts: StoreProduct[] = [];
export const demoStoreLeads: StoreLead[] = [];
