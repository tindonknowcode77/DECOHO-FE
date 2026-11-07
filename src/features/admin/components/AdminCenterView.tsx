"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import AdminProductsPanel from "@/src/features/products/components/AdminProductsPanel";
import AdminMoodboardsPanel from "@/src/features/product-space/components/AdminMoodboardsPanel";
import AdminCommunityPanel from "./AdminCommunityPanel";
import { getAccessToken, getSessionUser, subscribeSessionUser } from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";

// Use a stable primitive snapshot; getSessionUser returns a new object each time.
function getUserSnapshot() {
  return JSON.stringify(getSessionUser());
}

function getServerUserSnapshot() {
  return "null";
}

type ModuleConfig = {
  id: string;
  label: string;
  endpoint?: string;
  group: string;
  custom?: boolean;
  href?: string;
};

const modules: ModuleConfig[] = [
  { id: "dashboard", label: "Dashboard", endpoint: "/admin/dashboard", group: "Tổng quan" },
  { id: "users", label: "Người dùng", endpoint: "/admin/users", group: "Tài khoản" },
  { id: "products", label: "Sản phẩm", endpoint: "/products/admin/all", group: "Thương mại" },
  { id: "orders", label: "Đơn hàng", endpoint: "/orders/admin/all", group: "Thương mại" },
  { id: "affiliate", label: "Shopee Affiliate", href: "/admin/affiliate", group: "Thương mại" },
  { id: "moodboard", label: "Product Space", custom: true, group: "Không gian và AI" },
  { id: "showroom", label: "Showroom 3D", endpoint: "/showrooms/admin/all", group: "Không gian và AI" },
  { id: "community", label: "Diễn đàn", custom: true, group: "Nội dung" },
];

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function idOf(value: Record<string, unknown>) {
  return String(value._id ?? value.id ?? value.roomId ?? value.ticketCode ?? value.orderCode ?? "");
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

function summaryOf(value: Record<string, unknown>) {
  const keys = ["status", "role", "type", "email", "roomType", "model", "price", "rating", "priority"];
  return keys
    .filter((key) => value[key] !== undefined)
    .map((key) => `${key}: ${String(value[key])}`)
    .join(" · ");
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
  const user = useMemo(() => JSON.parse(userSnapshot) as AuthSessionUser | null, [userSnapshot]);
  const userRole = (user?.role ?? "").toLowerCase();
  const canAccessAdmin = !!user && ["admin", "super_admin", "staff"].includes(userRole);

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
      const response = await authenticatedFetch(`${apiBase()}${current.endpoint}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? `Không thể tải dữ liệu (${response.status}).`);
      }
      setData(body);
    } catch (value) {
      setData(null);
      setError(value instanceof Error ? value.message : "Không thể kết nối backend.");
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

  if (!user || !canAccessAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f1ea] p-6">
        <div className="max-w-md rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-black">Cần quyền quản trị</h1>
          <p className="mt-3 text-sm text-[#687069]">
            Đăng nhập bằng tài khoản Admin hoặc Staff đã được cấp quyền.
          </p>
          <Link
            className="mt-5 inline-block rounded-lg bg-[#17211b] px-5 py-3 text-sm font-bold text-white"
            href="/login"
          >
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  const renderContent = () => {
    if (active === "community") return <AdminCommunityPanel />;

    // Render Dashboard Overview
    if (active === "dashboard") {
      const stats = (data && typeof data === "object" && !Array.isArray(data) ? data : {}) as Record<string, any>;
      return (
        <div className="space-y-6">
          {/* Shopee Affiliate Banner Quick Access */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#ded6c9] bg-gradient-to-r from-[#2e6f5e] to-[#254f43] p-6 text-white shadow-sm sm:flex-row sm:items-center">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#dfe8d3]">
                Module Tiếp Thị
              </span>
              <h2 className="mt-2 text-xl font-bold font-serif">Quản Trị Shopee Affiliate</h2>
              <p className="mt-1 text-xs text-white/80">
                Nhập báo cáo doanh số CSV, quản lý đơn hàng tiếp thị và đối soát hoa hồng Shopee cho DECOHO.
              </p>
            </div>
            <Link
              href="/admin/affiliate"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#2e6f5e] shadow-sm transition hover:bg-[#f7f3ec] active:scale-95"
            >
              <span>Mở Quản trị Affiliate</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                Doanh thu hệ thống
              </span>
              <p className="mt-2 text-2xl font-black text-[#2e6f5e]">
                {loading ? "..." : `${(stats.revenue ?? 0).toLocaleString("vi-VN")} ₫`}
              </p>
              <p className="mt-1 text-[11px] text-[#708164]">Tổng thu từ đơn hàng</p>
            </div>

            <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                Tổng đơn hàng
              </span>
              <p className="mt-2 text-2xl font-black text-[#254f43]">
                {loading ? "..." : (stats.totalOrders ?? 0).toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-[11px] text-[#708164]">Đơn hàng trên website</p>
            </div>

            <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                Người dùng
              </span>
              <p className="mt-2 text-2xl font-black text-[#254f43]">
                {loading ? "..." : (stats.totalUsers ?? 0).toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-[11px] text-[#708164]">Tài khoản đã đăng ký</p>
            </div>

            <div className="rounded-2xl border border-[#ded6c9] bg-white p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#708164]">
                Sản phẩm
              </span>
              <p className="mt-2 text-2xl font-black text-[#254f43]">
                {loading ? "..." : (stats.totalProducts ?? 0).toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-[11px] text-[#708164]">Mặt hàng trong catalog</p>
            </div>
          </div>

          {/* Sub KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#708164]">Không gian phòng</span>
              <p className="mt-1 text-lg font-bold text-[#254f43]">{stats.totalRooms ?? 0}</p>
            </div>
            <div className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#708164]">Đơn mới cần xử lý</span>
              <p className="mt-1 text-lg font-bold text-[#dca451]">{stats.newOrders ?? 0}</p>
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
    if (current.custom) {
      return (
        <div className="rounded-xl border bg-white p-12 text-center">
          <h2 className="font-black">Module này đang được xây dựng</h2>
          <p className="mt-2 text-sm text-[#777e77]">
            Sẽ sớm có mặt trong bản cập nhật tiếp theo.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <input
            className="h-11 rounded-lg border bg-white px-4 text-sm sm:w-80"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm trong dữ liệu..."
            value={query}
          />
          <button
            className="h-11 rounded-lg bg-[#2f6f5e] px-5 text-sm font-bold text-white"
            onClick={() => void load()}
            type="button"
          >
            Tải lại
          </button>
        </div>
        {loading ? (
          <div className="mt-6 rounded-xl border bg-white p-12 text-center text-sm">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : rows.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((item, index) => (
              <article
                className="rounded-xl border bg-white p-5 shadow-sm"
                key={idOf(item) || index}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-black">{titleOf(item)}</h2>
                  <span className="rounded bg-[#f2eee7] px-2 py-1 text-[10px]">{idOf(item)}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#687069]">
                  {summaryOf(item) || "Không có thông tin tóm tắt."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border bg-white p-12 text-center">
            <h2 className="font-black">Chưa có dữ liệu</h2>
            <p className="mt-2 text-sm text-[#777e77]">
              Module này không sử dụng dữ liệu mẫu. Dữ liệu sẽ xuất hiện khi backend có bản ghi thật.
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <main className="min-h-screen bg-[#f5f1ea] text-[#17211b]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#17211b] p-5 text-white">
          <Link className="text-2xl font-black" href="/">
            DECOHO
          </Link>
          <p className="mt-1 text-xs text-white/50">Admin Center</p>
          <nav className="mt-8 space-y-6">
            {groups.map((group) => (
              <section key={group}>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/35">
                  {group}
                </p>
                {modules
                  .filter((item) => item.group === group)
                  .map((item) =>
                    item.href ? (
                      <Link
                        className="mb-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        href={item.href}
                        key={item.id}
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight size={14} className="text-white/50" />
                      </Link>
                    ) : (
                      <button
                        className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          active === item.id
                            ? "bg-[#dca451] font-black text-[#17211b]"
                            : "text-white/70 hover:bg-white/10"
                        }`}
                        key={item.id}
                        onClick={() => setActive(item.id)}
                        type="button"
                      >
                        {item.label}
                      </button>
                    ),
                  )}
              </section>
            ))}
          </nav>
        </aside>
        <section>
          <header className="flex items-center justify-between border-b bg-white px-6 py-4">
            <div>
              <h1 className="text-xl font-black">{current.label}</h1>
              <p className="text-xs text-[#777e77]">
                {active === "products" || active === "moodboard"
                  ? "Module chuyên biệt với UI riêng"
                  : "Dữ liệu trực tiếp từ DECOHO Backend"}
              </p>
            </div>
            <div className="text-right text-sm">
              <strong>{user.name}</strong>
              <p className="text-xs uppercase text-[#777e77]">{user.role}</p>
            </div>
          </header>
          <div className="p-5 sm:p-8">{renderContent()}</div>
        </section>
      </div>
    </main>
  );
}
