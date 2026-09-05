"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { getMyOrders, type Order, type OrderStatus } from "../services/orderApi";
import { getSessionUser, clearSessionUser } from "@/src/features/auth/services/session";

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  PENDING: { label: "Chờ xác nhận", color: "bg-[#fff7e8] text-[#9a662a] border-[#ecd5ab]", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-[#eef6f2] text-[#2f6f5e] border-[#b7dfc4]", icon: CheckCircle2 },
  PROCESSING: { label: "Đang xử lý", color: "bg-[#eef6f2] text-[#2f6f5e] border-[#b7dfc4]", icon: Package },
  SHIPPING: { label: "Đang giao", color: "bg-[#eef6f2] text-[#2f6f5e] border-[#b7dfc4]", icon: Truck },
  DELIVERED: { label: "Đã giao", color: "bg-[#eef4df] text-[#667c38] border-[#c5d9a4]", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", color: "bg-[#fff1ee] text-[#bc3d2b] border-[#f5c6c1]", icon: XCircle },
  REFUNDED: { label: "Đã hoàn tiền", color: "bg-[#fff1ee] text-[#bc3d2b] border-[#f5c6c1]", icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ thanh toán", color: "bg-[#fff7e8] text-[#9a662a]" },
  SUCCESS: { label: "Đã thanh toán", color: "bg-[#eef4df] text-[#667c38]" },
  FAILED: { label: "Thanh toán thất bại", color: "bg-[#fff1ee] text-[#bc3d2b]" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [authUser, setAuthUser] = useState<ReturnType<typeof getSessionUser>>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthUser(getSessionUser());
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;

    async function loadOrders() {
      if (!authUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getMyOrders();
        setOrders(data ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng";
        if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem đơn hàng.");
          clearSessionUser();
          setAuthUser(null);
        } else if (message.toLowerCase().includes("fetch") || message.toLowerCase().includes("network")) {
          setError("Không thể kết nối với máy chủ. Vui lòng đảm bảo backend đang chạy và thử lại.");
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [authReady, authUser]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!authReady) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="h-10 w-64 animate-pulse rounded-md bg-[#e9e1d5]" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-12 text-[#2f6f5e]">
        <section className="mx-auto max-w-2xl rounded-lg border border-[#ded6c9] bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-[#2f6f5e]" />
          <h1 className="mt-5 text-2xl font-bold">Vui lòng đăng nhập</h1>
          <p className="mt-3 text-sm leading-6 text-[#646a61]">
            Bạn cần đăng nhập để xem lịch sử đơn hàng.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#2f6f5e] px-5 py-3 text-sm font-bold text-white"
            href="/login"
          >
            Đăng nhập ngay
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#2f6f5e] sm:px-8 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 border-b border-[#ded6c9] pb-6 sm:flex-row sm:items-end">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2f6f5e] transition hover:text-[#2f6f5e]"
              href="/"
            >
              <ArrowLeft className="h-4 w-4" />
              Về trang chủ
            </Link>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Đơn hàng của tôi</h1>
            <p className="mt-2 text-sm text-[#646a61]">
              Theo dõi và quản lý các đơn hàng đã đặt.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b7f78]" />
            <input
              className="h-12 w-full rounded-lg border border-[#ded6c9] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#2f6f5e]"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã đơn, tên người nhận..."
              type="text"
              value={searchQuery}
            />
          </div>
          <select
            className="h-12 rounded-lg border border-[#ded6c9] bg-white px-4 text-sm outline-none focus:border-[#2f6f5e]"
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
            value={statusFilter}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-lg bg-white shadow-sm"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-lg border border-[#bc3d2b] bg-[#fff1ee] p-6 text-center">
            <p className="text-[#bc3d2b]">{error}</p>
            <div className="mt-4 flex justify-center gap-3">
              {error.includes("Phiên đăng nhập") ? (
                <Link
                  className="rounded-lg bg-[#2f6f5e] px-5 py-2 text-sm font-bold text-white"
                  href="/login"
                >
                  Đăng nhập lại
                </Link>
              ) : (
                <button
                  className="rounded-lg bg-[#bc3d2b] px-5 py-2 text-sm font-bold text-white"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-8 rounded-lg border border-[#ded6c9] bg-white p-8 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-[#7b7f78]" />
            <h2 className="mt-4 text-xl font-bold text-[#51564f]">Chưa có đơn hàng nào</h2>
            <p className="mt-2 text-sm text-[#7b7f78]">
              {searchQuery || statusFilter !== "ALL"
                ? "Không tìm thấy đơn hàng phù hợp với bộ lọc."
                : "Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên."}
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2f6f5e] px-5 py-3 text-sm font-bold text-white"
              href="/products"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const paymentStatus = paymentStatusConfig[order.paymentStatus];

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-lg border border-[#ded6c9] bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eee7dc] bg-[#fcfaf6] px-5 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#7b7f78]">Mã đơn hàng</p>
                        <p className="mt-1 text-lg font-bold text-[#2f6f5e]">
                          {order.orderCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#7b7f78]">Ngày đặt</p>
                        <p className="mt-1 text-sm text-[#646a61]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${status.color}`}
                      >
                        <StatusIcon className="mr-1 inline h-3 w-3" />
                        {status.label}
                      </span>
                      {order.paymentStatus && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${paymentStatus.color}`}
                        >
                          {paymentStatus.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{item.name}</p>
                            <p className="text-xs text-[#7b7f78]">
                              {item.quantity} x {formatPrice(item.unitPrice)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold">
                            {formatPrice(item.lineTotal)}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-[#7b7f78]">
                          +{order.items.length - 3} sản phẩm khác
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#eee7dc] pt-4">
                      <div className="text-sm text-[#646a61]">
                        <span>Thanh toán: </span>
                        <span className="font-bold">{order.paymentMethod}</span>
                        {order.promotionCode && (
                          <>
                            {" · "}
                            <span className="text-[#2f6f5e]">Mã: {order.promotionCode}</span>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#7b7f78]">Tổng cộng</p>
                        <p className="text-xl font-bold text-[#bc3d2b]">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        className="rounded-md border border-[#ded6c9] bg-white px-4 py-2 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
                        href={`/orders/${order._id}`}
                      >
                        Xem chi tiết
                      </Link>
                      {order.status === "DELIVERED" && (
                        <button
                          className="rounded-md border border-[#2f6f5e] bg-[#eef6f2] px-4 py-2 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#d5ede4]"
                        >
                          Đánh giá sản phẩm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
