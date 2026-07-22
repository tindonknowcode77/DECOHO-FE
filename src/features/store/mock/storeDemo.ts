import type { AuthSessionUser } from "@/src/features/auth/types";
import type { StoreFlowStep, StoreLead, StoreProduct } from "../types";

export const demoStoreCredentials = {
  email: "store.demo@decoho.vn",
  password: "store123",
};

export const demoStoreSessionUser: AuthSessionUser = {
  email: demoStoreCredentials.email,
  name: "Mộc An Store",
  phone: "0908 888 168",
  registeredAt: "2026-07-20T08:30:00.000Z",
  role: "store",
  storeId: "store-moc-an",
  storeName: "Mộc An Furniture",
  storeStatus: "approved",
};

export const storeFlowSteps: StoreFlowStep[] = [
  {
    id: "register",
    title: "Đăng ký Store",
    description: "Tạo tài khoản người bán, khai báo email, số điện thoại và ngành hàng.",
    metric: "Hoàn tất",
    status: "completed",
  },
  {
    id: "approval",
    title: "Chờ Admin duyệt",
    description: "Admin kiểm tra hồ sơ cửa hàng, ngành hàng và quyền đăng bán.",
    metric: "Đã duyệt",
    status: "completed",
  },
  {
    id: "profile",
    title: "Tạo hồ sơ cửa hàng",
    description: "Cập nhật logo, mô tả, địa chỉ showroom, bảo hành và khu vực giao hàng.",
    metric: "92%",
    status: "completed",
  },
  {
    id: "post-product",
    title: "Đăng sản phẩm",
    description: "Nhập tên, giá, chất liệu, kích thước, ảnh sản phẩm và tồn kho.",
    metric: "24 sản phẩm",
    status: "completed",
  },
  {
    id: "upload-3d",
    title: "Upload Model 3D",
    description: "Tải file GLB/GLTF để khách xem sản phẩm trong phòng mẫu 3D.",
    metric: "18 model",
    status: "active",
  },
  {
    id: "manage",
    title: "Quản lý sản phẩm",
    description: "Theo dõi trạng thái duyệt, tồn kho, giá bán và sản phẩm thiếu model.",
    metric: "6 cần xử lý",
    status: "active",
  },
  {
    id: "analytics",
    title: "Theo dõi lượt xem",
    description: "Xem lượt hiển thị, click sản phẩm, tỉ lệ chuyển đổi và nguồn traffic.",
    metric: "12.480 views",
    status: "active",
  },
  {
    id: "leads",
    title: "Nhận khách hàng",
    description: "Nhận lead từ khách xem 3D, yêu cầu báo giá hoặc đặt lịch showroom.",
    metric: "9 lead mới",
    status: "active",
  },
];

export const demoStoreProducts: StoreProduct[] = [
  {
    id: "sofa-sora-190",
    name: "Sofa Sora Japandi 190",
    category: "Sofa",
    priceVND: 8900000,
    stock: 12,
    views: 3260,
    conversionRate: 4.8,
    modelStatus: "ready",
    status: "active",
  },
  {
    id: "table-koto-80",
    name: "Bàn trà tròn Ash Koto",
    category: "Bàn trà",
    priceVND: 3200000,
    stock: 24,
    views: 2180,
    conversionRate: 3.9,
    modelStatus: "ready",
    status: "active",
  },
  {
    id: "chair-linen-curve",
    name: "Ghế lounge Linen Curve",
    category: "Ghế",
    priceVND: 5800000,
    stock: 8,
    views: 1460,
    conversionRate: 2.6,
    modelStatus: "reviewing",
    status: "review",
  },
  {
    id: "cabinet-annam",
    name: "Kệ An Nam 2 tầng",
    category: "Kệ",
    priceVND: 4200000,
    stock: 0,
    views: 940,
    conversionRate: 1.7,
    modelStatus: "missing",
    status: "draft",
  },
];

export const demoStoreLeads: StoreLead[] = [
  {
    id: "lead-1",
    customerName: "Minh Anh",
    need: "Cần combo phòng khách Japandi 18m2",
    productName: "Sofa Sora Japandi 190",
    budgetVND: 18000000,
    source: "Showroom 3D",
    status: "new",
  },
  {
    id: "lead-2",
    customerName: "Hoàng Nam",
    need: "Muốn xem mẫu bàn trà ngoài đời",
    productName: "Bàn trà tròn Ash Koto",
    budgetVND: 5000000,
    source: "AI Preview",
    status: "scheduled",
  },
  {
    id: "lead-3",
    customerName: "Linh House",
    need: "Báo giá 6 ghế lounge cho homestay",
    productName: "Ghế lounge Linen Curve",
    budgetVND: 35000000,
    source: "Catalog",
    status: "quoted",
  },
];
