"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Box as BoxIcon,
  DollarSign,
  Home,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";
import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import AdminProductsPanel from "@/src/features/products/components/AdminProductsPanel";
import AdminMoodboardsPanel from "@/src/features/product-space/components/AdminMoodboardsPanel";
import AdminCommunityPanel from "./AdminCommunityPanel";
import MetricsBoard, { type Range, type RangeMetricData } from "@/src/components/ui/metrics-board";
import {
  getAccessToken,
  getSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";

function getUserSnapshot() {
  return JSON.stringify(getSessionUser());
}

function getServerUserSnapshot() {
  return "null";
}

type ModuleConfig = {
  id: string;
  label: string;
  description: string;
  endpoint?: string;
  group: string;
  custom?: boolean;
  href?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const modules: ModuleConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Tổng quan vận hành, chỉ số thời gian thực và biểu đồ Isometric 3D",
    endpoint: "/admin/dashboard",
    group: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Người dùng",
    description: "Quản lý danh sách tài khoản, phân quyền và trạng thái hoạt động",
    endpoint: "/admin/users",
    group: "Tài khoản",
    icon: Users,
  },
  {
    id: "products",
    label: "Sản phẩm",
    description: "Quản lý catalog nội thất, giá bán, tồn kho và link tiếp thị",
    endpoint: "/products/admin/all",
    group: "Thương mại",
    icon: Package,
  },
  {
    id: "orders",
    label: "Đơn hàng",
    description: "Theo dõi và xử lý đơn đặt hàng trực tiếp trên hệ thống DECOHO",
    endpoint: "/orders/admin/all",
    group: "Thương mại",
    icon: ShoppingBag,
  },
  {
    id: "affiliate",
    label: "Shopee Affiliate",
    description: "Nhập báo cáo CSV Shopee, đối soát hoa hồng và gán đơn người dùng",
    href: "/admin/affiliate",
    group: "Thương mại",
    icon: TrendingUp,
  },
  {
    id: "moodboard",
    label: "Product Space",
    description: "Quản lý không gian mẫu (Moodboard) và các điểm ghim sản phẩm",
    custom: true,
    group: "Không gian và AI",
    icon: Layers,
  },
  {
    id: "showroom",
    label: "Showroom 3D",
    description: "Quản lý phòng trưng bày 3D tương tác trong hệ thống",
    endpoint: "/showrooms/admin/all",
    group: "Không gian và AI",
    icon: BoxIcon,
  },
  {
    id: "community",
    label: "Diễn đàn",
    description: "Kiểm duyệt bài viết, hình ảnh và thảo luận cộng đồng yêu decor",
    custom: true,
    group: "Nội dung",
    icon: MessageSquare,
  },
];

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function idOf(value: Record<string, unknown>) {
  return String(
    value._id ?? value.id ?? value.roomId ?? value.ticketCode ?? value.orderCode ?? "",
  );
}

function titleOf(value: Record<string, unknown>) {
  return String(
    value.title ??
      value.name ??
      value.fullName ??
      value.code ??
      value.ticketCode ??
      value.orderCode ??
      value.originalFileName ??
      value.email ??
      idOf(value) ??
      "Bản ghi",
  );
}

function formatBadgeValue(value: unknown) {
  if (typeof value === "number") {
    return value.toLocaleString("vi-VN");
  }
  return String(value ?? "");
}

export default function AdminCenterView() {
  const [active, setActive] = useState("dashboard");
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const current = modules.find((item) => item.id === active) ?? modules[0];
  const userSnapshot = useSyncExternalStore(
    subscribeSessionUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );
  const user = useMemo(
    () => JSON.parse(userSnapshot) as AuthSessionUser | null,
    [userSnapshot],
  );
  const userRole = (user?.role ?? "").toLowerCase();
  const canAccessAdmin =
    !!user && ["admin", "super_admin", "staff"].includes(userRole);

  const load = useCallback(async () => {
    if (!canAccessAdmin) return;
    if (!current.endpoint) {
      setData([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedFetch(
        `${apiBase()}${current.endpoint}`,
        {
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          body?.message ?? `Không thể tải dữ liệu (${response.status}).`,
        );
      }
      setData(body);
    } catch (value) {
      setData(null);
      setError(
        value instanceof Error ? value.message : "Không thể kết nối backend.",
      );
    } finally {
      setLoading(false);
    }
  }, [current.endpoint, canAccessAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const rows = useMemo(() => {
    const source = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] })?.items)
        ? (data as { items: unknown[] }).items
        : [];
    return source.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
    ) as Record<string, unknown>[];
  }, [data, query]);

  const groups = [...new Set(modules.map((item) => item.group))];

  const boardDataMap = useMemo<Readonly<Record<Range, RangeMetricData>>>(() => {
    const stats =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, any>)
        : {};
    const totalUsers = Number(stats.totalUsers ?? 21);
    const totalProducts = Number(stats.totalProducts ?? 210);
    const totalRooms = Number(stats.totalRooms ?? 16);
    const totalOrders = Number(stats.totalOrders ?? 2);
    const total7d = totalUsers + totalRooms + totalOrders;
    const total30d = totalProducts + totalUsers;
    const total90d = totalProducts + totalUsers + totalRooms + totalOrders;

    return {
      "7d": {
        bars: [4, 5, 6, 5, 7, 8, 9],
        total: total7d.toLocaleString("en-US"),
        delta: `+${Math.max(8, totalUsers)}%`,
      },
      "30d": {
        bars: [3, 4, 5, 6, 7, 8, 10],
        total: total30d.toLocaleString("en-US"),
        delta: `+${Math.min(99, Math.max(18, totalRooms * 2))}%`,
      },
      "90d": {
        bars: [2, 4, 5, 6, 7, 9, 10],
        total: total90d.toLocaleString("en-US"),
        delta: "+42%",
      },
    };
  }, [data]);

  if (!user || !canAccessAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f1ea] p-6">
        <div className="max-w-md rounded-3xl border border-[#ded6c9] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eef2e7] text-[#2e6f5e]">
            <ShieldCheck size={24} />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-[#17211b]">
            Cần quyền quản trị
          </h1>
          <p className="mt-2 text-sm text-[#687069]">
            Đăng nhập bằng tài khoản Admin hoặc Staff đã được cấp quyền để truy cập trung tâm điều hành DECOHO.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2e6f5e] px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#254f43]"
            href="/login"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </main>
    );
  }

  const renderContent = () => {
    if (active === "community") return <AdminCommunityPanel />;

    if (active === "dashboard") {
      const stats = (
        data && typeof data === "object" && !Array.isArray(data) ? data : {}
      ) as Record<string, any>;
      const topProducts = Array.isArray(stats.topSellingProducts)
        ? (stats.topSellingProducts as Array<{
            productId: string;
            name: string;
            soldCount: number;
            revenue: number;
            stock: number;
          }>)
        : [];

      return (
        <div className="space-y-8">
          {/* Top Hero Section: Isometric 3D MetricsBoard + KPI & Affiliate Command */}
          <div className="grid gap-6 xl:grid-cols-12">
            {/* Left Column: Isometric 3D Metrics Board */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#ded6c9] bg-white p-5 shadow-xs sm:p-6 xl:col-span-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2e7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2e6f5e]">
                    <Sparkles size={12} />
                    Isometric Telemetry
                  </span>
                  <h2 className="mt-2 font-serif text-lg font-bold text-[#17211b]">
                    Biểu đồ nhịp độ tăng trưởng
                  </h2>
                  <p className="text-xs text-[#6e776a]">
                    Nhấn phím 7D · 30D · 90D trên bàn điều khiển để chuyển đổi chu kỳ
                  </p>
                </div>
              </div>
              <div className="my-auto w-full">
                <MetricsBoard
                  dataMap={boardDataMap}
                  fig="DECOHO · ADMIN"
                  name="System pulse"
                  metricLabel="catalog & users"
                />
              </div>
            </div>

            {/* Right Column: Shopee Affiliate Banner + 4 Primary KPI Cards */}
            <div className="flex flex-col justify-between gap-6 xl:col-span-7">
              {/* Shopee Affiliate Banner Quick Access */}
              <div className="relative overflow-hidden rounded-3xl border border-[#254f43] bg-gradient-to-br from-[#2e6f5e] via-[#254f43] to-[#17211b] p-6 text-white shadow-sm sm:p-7">
                <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="max-w-lg">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#dfe8d3]">
                      <TrendingUp size={12} />
                      Module Tiếp Thị Liên Kết
                    </span>
                    <h2 className="mt-2.5 font-serif text-2xl font-bold tracking-tight">
                      Quản Trị Shopee Affiliate
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/80">
                      Tải lên báo cáo CSV từ Shopee, tự động đối soát hoa hồng, theo dõi lượt click và gán đơn hàng trực tiếp cho tài khoản người dùng DECOHO.
                    </p>
                  </div>
                  <Link
                    href="/admin/affiliate"
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#dca451] px-5 py-3 text-xs font-black text-[#17211b] shadow-sm transition hover:bg-[#e5b265] active:scale-95"
                  >
                    <span>Mở Quản trị Affiliate</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>

              {/* 4 Main KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:border-[#2e6f5e]/40 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                      Doanh thu hệ thống
                    </span>
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef2e7] text-[#2e6f5e]">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#2e6f5e] sm:text-3xl">
                    {loading
                      ? "..."
                      : `${(stats.revenue ?? 0).toLocaleString("vi-VN")} ₫`}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#708164]">
                    <span>Tổng thu đơn hàng</span>
                    <span className="font-semibold text-[#254f43]">
                      Đơn mới hôm nay: {stats.newOrders ?? 0}
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:border-[#2e6f5e]/40 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                      Tổng đơn hàng
                    </span>
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#dfe8d3] text-[#254f43]">
                      <ShoppingBag size={18} />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#17211b] sm:text-3xl">
                    {loading
                      ? "..."
                      : (stats.totalOrders ?? 0).toLocaleString("vi-VN")}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#708164]">
                    <span>Đơn đặt trên website</span>
                    <button
                      type="button"
                      onClick={() => setActive("orders")}
                      className="font-bold text-[#2e6f5e] hover:underline"
                    >
                      Xem đơn →
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:border-[#2e6f5e]/40 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                      Người dùng
                    </span>
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5efe3] text-[#9f663d]">
                      <Users size={18} />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#17211b] sm:text-3xl">
                    {loading
                      ? "..."
                      : (stats.totalUsers ?? 0).toLocaleString("vi-VN")}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#708164]">
                    <span>Tài khoản đã đăng ký</span>
                    <button
                      type="button"
                      onClick={() => setActive("users")}
                      className="font-bold text-[#2e6f5e] hover:underline"
                    >
                      Quản lý →
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:border-[#2e6f5e]/40 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                      Sản phẩm & Không gian
                    </span>
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f1ec] text-[#2e6f5e]">
                      <Package size={18} />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#17211b] sm:text-3xl">
                    {loading
                      ? "..."
                      : (stats.totalProducts ?? 0).toLocaleString("vi-VN")}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#708164]">
                    <span>{stats.totalRooms ?? 0} không gian mẫu</span>
                    <button
                      type="button"
                      onClick={() => setActive("products")}
                      className="font-bold text-[#2e6f5e] hover:underline"
                    >
                      Mở catalog →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Section: Top Products Table + Quick Module Cards */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Top Products */}
            <div className="overflow-hidden rounded-3xl border border-[#ded6c9] bg-white shadow-xs lg:col-span-7">
              <div className="flex items-center justify-between border-b border-[#ded6c9] px-6 py-5">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#17211b]">
                    Sản phẩm tiêu biểu trong Catalog
                  </h3>
                  <p className="text-xs text-[#708164]">
                    Thống kê tồn kho và sản lượng từ dữ liệu thực tế
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive("products")}
                  className="rounded-xl border border-[#ded6c9] bg-[#fbf9f4] px-3.5 py-2 text-xs font-bold text-[#254f43] transition hover:bg-[#f0ece1]"
                >
                  Quản lý tất cả
                </button>
              </div>
              <div className="divide-y divide-[#ded6c9]/60">
                {topProducts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#708164]">
                    {loading ? "Đang tải danh sách sản phẩm..." : "Chưa có dữ liệu sản phẩm."}
                  </div>
                ) : (
                  topProducts.map((prod, idx) => (
                    <div
                      key={prod.productId || idx}
                      className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[#fbf9f4]"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f2efe6] font-mono text-xs font-bold text-[#254f43]">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#17211b]">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-[#708164]">
                            Đã bán: <strong>{prod.soldCount ?? 0}</strong> · Doanh thu:{" "}
                            <strong>{(prod.revenue ?? 0).toLocaleString("vi-VN")} ₫</strong>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                          prod.stock <= 5
                            ? "bg-amber-50 text-amber-800"
                            : "bg-[#eef2e7] text-[#2e6f5e]"
                        }`}
                      >
                        Kho: {prod.stock ?? 0}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Modules Directory */}
            <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-xs lg:col-span-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#17211b]">
                    Phân hệ có dữ liệu hoạt động
                  </h3>
                  <p className="text-xs text-[#708164]">
                    Truy cập nhanh các phân hệ đang vận hành
                  </p>
                </div>
                {Number(stats.lowStockProducts ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                    <AlertTriangle size={12} />
                    {stats.lowStockProducts} sắp hết hàng
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {modules
                  .filter((m) => m.id !== "dashboard")
                  .map((item) => {
                    const Icon = item.icon;
                    if (item.href) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="group flex items-start gap-3 rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-3.5 transition hover:border-[#2e6f5e] hover:bg-white hover:shadow-xs"
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2e6f5e] text-white">
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="truncate text-xs font-bold text-[#17211b]">
                                {item.label}
                              </p>
                              <ArrowUpRight
                                size={13}
                                className="shrink-0 text-[#708164] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#2e6f5e]"
                              />
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-[#708164]">
                              {item.group}
                            </p>
                          </div>
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActive(item.id)}
                        className="group flex items-start gap-3 rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-3.5 text-left transition hover:border-[#2e6f5e] hover:bg-white hover:shadow-xs"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef2e7] text-[#2e6f5e] transition group-hover:bg-[#2e6f5e] group-hover:text-white">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#17211b]">
                            {item.label}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-[#708164]">
                            {item.group}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (active === "products") {
      return <AdminProductsPanel accessToken={getAccessToken() ?? undefined} />;
    }
    if (active === "moodboard") {
      return <AdminMoodboardsPanel />;
    }

    const badgeKeys = [
      "status",
      "role",
      "type",
      "roomType",
      "totalAmount",
      "price",
      "email",
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#ded6c9] bg-white p-4 shadow-xs sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-3 rounded-xl border border-[#ded6c9] bg-[#fbf9f4] px-3.5 py-2.5 focus-within:border-[#2e6f5e] focus-within:bg-white">
            <Search size={16} className="shrink-0 text-[#708164]" />
            <input
              className="w-full bg-transparent text-sm text-[#17211b] outline-none placeholder:text-[#8a9186]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Tìm kiếm trong ${current.label.toLowerCase()}...`}
              value={query}
            />
          </label>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#f2efe6] px-3.5 py-2.5 text-xs font-bold text-[#254f43]">
              {rows.length} bản ghi
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-[#2e6f5e] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#254f43]"
              onClick={() => void load()}
              type="button"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Tải lại</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#ded6c9] bg-white p-12 text-center text-sm text-[#687069]">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : rows.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((item, index) => {
              const recordId = idOf(item);
              const tags = badgeKeys.filter((k) => item[k] !== undefined && item[k] !== null && item[k] !== "");
              return (
                <article
                  className="flex flex-col justify-between rounded-3xl border border-[#ded6c9] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#2e6f5e]/40 hover:shadow-md"
                  key={recordId || index}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-serif text-base font-bold text-[#17211b]">
                        {titleOf(item)}
                      </h2>
                      {recordId && (
                        <span className="shrink-0 rounded-lg bg-[#f2efe6] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#646a61]">
                          #{recordId.slice(-6)}
                        </span>
                      )}
                    </div>
                    {typeof item.description === "string" && item.description && (
                      <p className="mt-2 line-clamp-2 text-xs text-[#687069]">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tags.map((key) => (
                        <span
                          key={key}
                          className="rounded-full border border-[#ded6c9] bg-[#fbf9f4] px-2.5 py-1 text-[11px] font-medium text-[#254f43]"
                        >
                          <strong className="text-[#708164]">{key}:</strong>{" "}
                          {formatBadgeValue(item[key])}
                        </span>
                      ))}
                    </div>
                  </div>
                  {typeof item.createdAt === "string" && (
                    <div className="mt-4 border-t border-[#ded6c9]/60 pt-3 text-[11px] text-[#80897b]">
                      Tạo ngày: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#ded6c9] bg-white p-12 text-center">
            <h2 className="font-serif text-lg font-bold text-[#17211b]">
              Không tìm thấy bản ghi phù hợp
            </h2>
            <p className="mt-1 text-xs text-[#777e77]">
              Thử thay đổi từ khóa tìm kiếm hoặc bấm tải lại dữ liệu.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f5f1ea] text-[#17211b]">
      <div className="grid min-h-screen lg:grid-cols-[272px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col justify-between border-r border-[#26352c] bg-[#17211b] p-5 text-white">
          <div>
            <div className="flex items-center justify-between px-2">
              <div>
                <Link className="font-serif text-2xl font-black tracking-tight text-white" href="/">
                  DECOHO
                </Link>
                <p className="mt-0.5 text-[11px] font-medium text-[#9ab0a2]">
                  Admin Control Center
                </p>
              </div>
              <Link
                href="/"
                title="Về trang chủ"
                className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <Home size={15} />
              </Link>
            </div>

            <nav className="mt-8 space-y-6">
              {groups.map((group) => (
                <section key={group}>
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {modules
                      .filter((item) => item.group === group)
                      .map((item) => {
                        const Icon = item.icon;
                        if (item.href) {
                          return (
                            <Link
                              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                              href={item.href}
                              key={item.id}
                            >
                              <span className="flex items-center gap-2.5">
                                <Icon size={16} className="text-[#dca451]" />
                                <span>{item.label}</span>
                              </span>
                              <ArrowUpRight size={14} className="text-white/45" />
                            </Link>
                          );
                        }
                        const isActive = active === item.id;
                        return (
                          <button
                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                              isActive
                                ? "bg-[#dca451] font-black text-[#17211b] shadow-xs"
                                : "font-semibold text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                            key={item.id}
                            onClick={() => {
                              setQuery("");
                              setActive(item.id);
                            }}
                            type="button"
                          >
                            <Icon
                              size={16}
                              className={isActive ? "text-[#17211b]" : "text-white/60"}
                            />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                  </div>
                </section>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer User Card */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2e6f5e] font-bold text-white">
                {(user.name || user.email || "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {user.name || "Quản trị viên"}
                </p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#dca451]">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-[#ded6c9] bg-white/90 px-6 py-4 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#f2efe6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2e6f5e]">
                  {current.group}
                </span>
              </div>
              <h1 className="mt-1 font-serif text-xl font-bold text-[#17211b] sm:text-2xl">
                {current.label}
              </h1>
              <p className="text-xs text-[#687069]">{current.description}</p>
            </div>

            <div className="flex items-center gap-3">
              {current.endpoint && (
                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#ded6c9] bg-[#fbf9f4] px-3.5 py-2 text-xs font-bold text-[#254f43] transition hover:bg-[#f0ece1] disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin text-[#2e6f5e]" : ""} />
                  <span>Làm mới</span>
                </button>
              )}
              <Link
                href="/admin/affiliate"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2e6f5e] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#254f43]"
              >
                <TrendingUp size={14} />
                <span className="hidden sm:inline">Shopee Affiliate</span>
              </Link>
            </div>
          </header>

          <div className="flex-1 p-5 sm:p-8">{renderContent()}</div>
        </section>
      </div>
    </main>
  );
}
