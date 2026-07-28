"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  getSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";
import { demoStoreProducts } from "@/src/features/store/mock/storeDemo";
import {
  getStoredStoreProducts,
  saveStoredStoreProducts,
  subscribeStoreProducts,
} from "@/src/features/store/services/productQueue";
import type {
  StoreProduct,
  StoreProductStatus,
} from "@/src/features/store/types";
import { demoAdminCredentials } from "../mock/adminDemo";

type AdminView = "queue" | "products" | "activity";
type StatusFilter = "all" | StoreProductStatus;
type IconName =
  | "arrow"
  | "check"
  | "clock"
  | "close"
  | "cube"
  | "eye"
  | "history"
  | "package"
  | "search"
  | "shield"
  | "store";

const adminInitialProducts = demoStoreProducts.map((product) => ({
  ...product,
  status:
    product.status === "review"
      ? ("pending_review" as const)
      : product.status,
  storeId: product.storeId ?? "store-moc-an",
  storeName: product.storeName ?? "Mộc An Furniture",
}));

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "m5 12 4 4L19 6",
    clock: "M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    close: "M6 6l12 12M18 6 6 18",
    cube: "m21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8m9 5v8",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    history: "M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-2v6l4 2",
    package: "M21 8v8l-9 5-9-5V8l9-5 9 5Zm-9 5 9-5M12 13 3 8m5-3.2 9 5",
    search: "m21 21-4.4-4.4m2.4-5.1a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5",
    store: "M4 10h16l-1-6H5l-1 6Zm2 0v10h12V10M9 20v-6h6v6",
  };

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function formatPrice(priceVND: number) {
  return `${new Intl.NumberFormat("vi-VN").format(priceVND)} VND`;
}

function formatDate(value?: string) {
  if (!value) {
    return "Chưa ghi nhận";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: StoreProduct["status"]) {
  const labels = {
    active: "Đã public",
    draft: "Bản nháp",
    pending_review: "Chờ duyệt",
    rejected: "Đã từ chối",
    review: "Đang rà soát",
  };

  return labels[status];
}

function statusClass(status: StoreProduct["status"]) {
  if (status === "active") {
    return "bg-[#e5f3eb] text-[#23643b]";
  }

  if (status === "rejected") {
    return "bg-[#fff0ed] text-[#ac3d30]";
  }

  if (status === "draft") {
    return "bg-[#eeece7] text-[#646a61]";
  }

  return "bg-[#fff3dc] text-[#8a5d25]";
}

function modelStatusLabel(status: StoreProduct["modelStatus"]) {
  const labels = {
    missing: "Thiếu model",
    ready: "3D sẵn sàng",
    reviewing: "Model đang duyệt",
  };

  return labels[status];
}

export default function AdminProductReviewView() {
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [products, setProducts] =
    useState<StoreProduct[]>(adminInitialProducts);
  const [activeView, setActiveView] = useState<AdminView>("queue");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [rejectProductId, setRejectProductId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentUser(getSessionUser());
      setProducts(getStoredStoreProducts(adminInitialProducts));
      setHasCheckedSession(true);
    }, 0);
    const unsubscribeSession = subscribeSessionUser((user) => {
      setCurrentUser(user);
      setHasCheckedSession(true);
    });
    const unsubscribeProducts = subscribeStoreProducts(
      setProducts,
      adminInitialProducts,
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribeSession();
      unsubscribeProducts();
    };
  }, []);

  const pendingProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === "pending_review" || product.status === "review",
      ),
    [products],
  );
  const approvedProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );
  const rejectedProducts = useMemo(
    () => products.filter((product) => product.status === "rejected"),
    [products],
  );
  const missingModels = useMemo(
    () => products.filter((product) => product.modelStatus === "missing"),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const source =
      activeView === "queue" ? pendingProducts : products;

    return source.filter((product) => {
      const matchesStatus =
        activeView === "queue" ||
        statusFilter === "all" ||
        product.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        (product.storeName ?? "Mộc An Furniture")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [activeView, pendingProducts, products, searchTerm, statusFilter]);

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ??
    visibleProducts[0];

  const activityProducts = useMemo(
    () =>
      products
        .filter((product) => product.reviewedAt)
        .sort(
          (first, second) =>
            new Date(second.reviewedAt ?? 0).getTime() -
            new Date(first.reviewedAt ?? 0).getTime(),
        ),
    [products],
  );

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function persistProducts(nextProducts: StoreProduct[]) {
    setProducts(nextProducts);
    saveStoredStoreProducts(nextProducts);
  }

  function reviewProduct(
    productId: string,
    status: "active" | "rejected" | "draft" | "pending_review",
    reason?: string,
  ) {
    const reviewedAt = new Date().toISOString();
    const nextProducts = products.map((product) =>
      product.id === productId
        ? {
            ...product,
            rejectionReason: status === "rejected" ? reason : undefined,
            reviewedAt,
            reviewedBy: currentUser?.email ?? demoAdminCredentials.email,
            status,
            submittedAt:
              status === "pending_review"
                ? new Date().toISOString()
                : product.submittedAt,
          }
        : product,
    );
    const product = products.find((item) => item.id === productId);

    persistProducts(nextProducts);
    showNotice(
      status === "active"
        ? `Đã duyệt và public ${product?.name ?? "sản phẩm"}.`
        : status === "rejected"
          ? `Đã gửi yêu cầu chỉnh sửa cho ${product?.storeName ?? "Store"}.`
          : status === "draft"
            ? `Đã gỡ ${product?.name ?? "sản phẩm"} khỏi Store public.`
            : `Đã đưa ${product?.name ?? "sản phẩm"} về hàng chờ.`,
    );
  }

  function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rejectProductId || rejectionReason.trim().length < 10) {
      showNotice("Lý do từ chối cần ít nhất 10 ký tự.");
      return;
    }

    reviewProduct(rejectProductId, "rejected", rejectionReason.trim());
    setRejectProductId(null);
    setRejectionReason("");
  }

  if (!hasCheckedSession) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="h-36 animate-pulse rounded-lg bg-[#dfe5df]" />
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="h-96 animate-pulse rounded-lg bg-white" />
            <div className="h-80 animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f1e9] px-5 py-12 text-[#17211b]">
        <section className="w-full max-w-xl rounded-lg border border-[#d8cebf] bg-white p-7 text-center shadow-[0_16px_45px_rgba(57,45,29,.1)] sm:p-9">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-[#e7f1ec] text-[#2f6f5e]">
            <Icon name="shield" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-[#b46f2c]">
            Khu vực quản trị riêng
          </p>
          <h1 className="mt-2 text-3xl font-bold">Cần tài khoản Admin</h1>
          <p className="mt-4 text-sm leading-7 text-[#646a61]">
            Tài khoản khách và Store không có quyền duyệt sản phẩm. Hãy đăng nhập
            bằng tài khoản Admin demo để mở trung tâm kiểm duyệt.
          </p>
          <div className="mt-5 rounded-lg bg-[#f7f3ec] p-4 text-sm">
            <p>
              <strong>{demoAdminCredentials.email}</strong>
            </p>
            <p className="mt-1 text-[#646a61]">
              Mật khẩu: <strong>{demoAdminCredentials.password}</strong>
            </p>
          </div>
          <Link
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#1f2421] px-5 text-sm font-bold text-white transition hover:bg-[#2f6f5e]"
            href="/login"
          >
            Đăng nhập Admin
            <Icon name="arrow" />
          </Link>
        </section>
      </main>
    );
  }

  const tabs: { id: AdminView; label: string; icon: IconName; count?: number }[] =
    [
      {
        count: pendingProducts.length,
        icon: "clock",
        id: "queue",
        label: "Hàng chờ duyệt",
      },
      {
        count: products.length,
        icon: "package",
        id: "products",
        label: "Tất cả sản phẩm",
      },
      {
        count: activityProducts.length,
        icon: "history",
        id: "activity",
        label: "Nhật ký",
      },
    ];

  return (
    <main className="min-h-screen bg-[#f6f1e9] pb-10 text-[#17211b]">
      <section className="mx-2 mt-2 overflow-hidden rounded-lg bg-[#13271e] text-white sm:mx-3">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#f0c979]">
                <Icon name="shield" />
                Admin Center
              </div>
              <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
                Kiểm duyệt hệ thống Store
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                Kiểm tra nội dung, giá, tồn kho và model 3D trước khi sản phẩm
                được hiển thị cho khách.
              </p>
            </div>
            <Link
              className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold transition hover:bg-white/20"
              href="/store"
            >
              <Icon name="eye" />
              Xem Store public
            </Link>
          </div>

          <div className="mt-8 grid border-y border-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Chờ duyệt", pendingProducts.length, "clock"],
              ["Đã public", approvedProducts.length, "check"],
              ["Đã từ chối", rejectedProducts.length, "close"],
              ["Thiếu model 3D", missingModels.length, "cube"],
            ].map(([label, value, icon], index) => (
              <div
                className={`py-4 ${
                  index > 0
                    ? "border-t border-white/15 sm:border-t-0 lg:border-l lg:px-5"
                    : "lg:pr-5"
                }`}
                key={label}
              >
                <div className="flex items-center justify-between text-white/60">
                  <p className="text-xs font-bold uppercase tracking-[0.08em]">
                    {label}
                  </p>
                  <Icon name={icon as IconName} />
                </div>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {notice && (
          <div className="mb-4 rounded-lg border border-[#b7dfc4] bg-[#eefbf2] px-4 py-3 text-sm font-bold text-[#23643b] shadow-sm">
            {notice}
          </div>
        )}

        <div className="sticky top-20 z-30 flex gap-2 overflow-x-auto rounded-lg border border-[#d8cebf] bg-white/95 p-2 shadow-[0_8px_24px_rgba(57,45,29,.08)] backdrop-blur">
          {tabs.map((tab) => (
            <button
              className={`inline-flex min-w-fit items-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition ${
                activeView === tab.id
                  ? "bg-[#1f2421] text-white"
                  : "text-[#51564f] hover:bg-[#f7f3ec]"
              }`}
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              type="button"
            >
              <Icon name={tab.icon} />
              {tab.label}
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${
                  activeView === tab.id ? "bg-white/15" : "bg-[#eee8de]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeView !== "activity" ? (
          <>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f746d]">
                  <Icon name="search" />
                </span>
                <input
                  className="h-11 w-full rounded-md border border-[#d8cebf] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm sản phẩm, danh mục hoặc Store..."
                  type="search"
                  value={searchTerm}
                />
              </label>

              {activeView === "products" && (
                <select
                  className="h-11 rounded-md border border-[#d8cebf] bg-white px-3 text-sm font-bold outline-none focus:border-[#2f6f5e]"
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  value={statusFilter}
                >
                  <option value="all">Mọi trạng thái</option>
                  <option value="pending_review">Chờ duyệt</option>
                  <option value="active">Đã public</option>
                  <option value="rejected">Đã từ chối</option>
                  <option value="draft">Bản nháp</option>
                </select>
              )}
            </div>

            <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-3">
                {visibleProducts.length === 0 ? (
                  <div className="rounded-lg border border-[#d8cebf] bg-white p-10 text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[#eef6f2] text-[#2f6f5e]">
                      <Icon name="check" />
                    </span>
                    <h2 className="mt-4 text-xl font-bold">
                      Không có sản phẩm phù hợp
                    </h2>
                    <p className="mt-2 text-sm text-[#646a61]">
                      Hàng chờ đã xử lý xong hoặc từ khóa chưa khớp.
                    </p>
                  </div>
                ) : (
                  visibleProducts.map((product) => (
                    <button
                      className={`grid w-full gap-4 rounded-lg border bg-white p-4 text-left transition sm:grid-cols-[1fr_auto] ${
                        selectedProduct?.id === product.id
                          ? "border-[#2f6f5e] shadow-[0_10px_28px_rgba(47,111,94,.12)]"
                          : "border-[#d8cebf] hover:border-[#b9ad9b]"
                      }`}
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      type="button"
                    >
                      <span>
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold">{product.name}</span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
                              product.status,
                            )}`}
                          >
                            {statusLabel(product.status)}
                          </span>
                        </span>
                        <span className="mt-2 block text-sm text-[#646a61]">
                          {product.storeName ?? "Mộc An Furniture"} ·{" "}
                          {product.category}
                        </span>
                        <span className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#747a72]">
                          <span>{formatPrice(product.priceVND)}</span>
                          <span>Tồn kho {product.stock}</span>
                          <span>{modelStatusLabel(product.modelStatus)}</span>
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-bold text-[#2f6f5e]">
                          {product.views.toLocaleString("vi-VN")} lượt xem
                        </span>
                        <span className="mt-2 block text-xs text-[#8a7662]">
                          Gửi {formatDate(product.submittedAt)}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </section>

              {selectedProduct && (
                <aside className="rounded-lg border border-[#d8cebf] bg-white p-5 shadow-[0_12px_32px_rgba(57,45,29,.08)] lg:sticky lg:top-40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#b46f2c]">
                        Hồ sơ kiểm duyệt
                      </p>
                      <h2 className="mt-2 text-xl font-bold">
                        {selectedProduct.name}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
                        selectedProduct.status,
                      )}`}
                    >
                      {statusLabel(selectedProduct.status)}
                    </span>
                  </div>

                  {selectedProduct.image && (
                    <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-lg bg-[#e8e0d4]">
                      <Image
                        alt={selectedProduct.name}
                        className="object-cover"
                        fill
                        sizes="360px"
                        src={selectedProduct.image}
                        unoptimized
                      />
                    </div>
                  )}

                  <dl className="mt-5 divide-y divide-[#eee7dc] border-y border-[#eee7dc] text-sm">
                    {[
                      ["Store", selectedProduct.storeName ?? "Mộc An Furniture"],
                      ["Danh mục", selectedProduct.category],
                      ["Giá bán", formatPrice(selectedProduct.priceVND)],
                      ["Tồn kho", `${selectedProduct.stock} sản phẩm`],
                      [
                        "Kích thước",
                        selectedProduct.dimensions || "Chưa cập nhật",
                      ],
                      ["Vật liệu", selectedProduct.material || "Chưa cập nhật"],
                      ["Model 3D", modelStatusLabel(selectedProduct.modelStatus)],
                    ].map(([label, value]) => (
                      <div
                        className="flex justify-between gap-4 py-3"
                        key={label}
                      >
                        <dt className="text-[#646a61]">{label}</dt>
                        <dd className="text-right font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {selectedProduct.rejectionReason && (
                    <div className="mt-4 rounded-lg border border-[#efc2bc] bg-[#fff1ee] p-3 text-sm leading-6 text-[#9b5148]">
                      <p className="font-bold">Lý do cần chỉnh sửa</p>
                      <p className="mt-1">{selectedProduct.rejectionReason}</p>
                    </div>
                  )}

                  {selectedProduct.status === "pending_review" ||
                  selectedProduct.status === "review" ? (
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2f6f5e] px-3 text-sm font-bold text-white transition hover:bg-[#285f51]"
                        onClick={() =>
                          reviewProduct(selectedProduct.id, "active")
                        }
                        type="button"
                      >
                        <Icon name="check" />
                        Duyệt public
                      </button>
                      <button
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#e1aaa1] bg-[#fff1ee] px-3 text-sm font-bold text-[#ac3d30]"
                        onClick={() => {
                          setRejectProductId(selectedProduct.id);
                          setRejectionReason("");
                        }}
                        type="button"
                      >
                        <Icon name="close" />
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-2">
                      {selectedProduct.status === "active" ? (
                        <button
                          className="h-11 rounded-md border border-[#d8cebf] bg-white px-4 text-sm font-bold transition hover:bg-[#fff7e8]"
                          onClick={() =>
                            reviewProduct(selectedProduct.id, "draft")
                          }
                          type="button"
                        >
                          Gỡ khỏi Store public
                        </button>
                      ) : (
                        <button
                          className="h-11 rounded-md bg-[#1f2421] px-4 text-sm font-bold text-white transition hover:bg-[#2f6f5e]"
                          onClick={() =>
                            reviewProduct(
                              selectedProduct.id,
                              "pending_review",
                            )
                          }
                          type="button"
                        >
                          Đưa lại vào hàng chờ
                        </button>
                      )}
                    </div>
                  )}
                </aside>
              )}
            </div>
          </>
        ) : (
          <section className="mt-5">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#b46f2c]">
                Hoạt động kiểm duyệt
              </p>
              <h2 className="mt-2 text-2xl font-bold">Nhật ký gần đây</h2>
            </div>
            <div className="space-y-3">
              {activityProducts.length === 0 ? (
                <div className="rounded-lg border border-[#d8cebf] bg-white p-8 text-center text-sm text-[#646a61]">
                  Chưa có thao tác kiểm duyệt trong phiên dữ liệu này.
                </div>
              ) : (
                activityProducts.map((product) => (
                  <article
                    className="flex flex-col justify-between gap-4 rounded-lg border border-[#d8cebf] bg-white p-4 sm:flex-row sm:items-center"
                    key={product.id}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#eef6f2] text-[#2f6f5e]">
                        <Icon
                          name={
                            product.status === "active"
                              ? "check"
                              : product.status === "rejected"
                                ? "close"
                                : "history"
                          }
                        />
                      </span>
                      <div>
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="mt-1 text-sm text-[#646a61]">
                          {product.reviewedBy ?? demoAdminCredentials.email} ·{" "}
                          {product.storeName ?? "Mộc An Furniture"}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
                          product.status,
                        )}`}
                      >
                        {statusLabel(product.status)}
                      </span>
                      <p className="mt-2 text-xs text-[#8a7662]">
                        {formatDate(product.reviewedAt)}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </section>

      {rejectProductId && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4">
          <form
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl"
            onSubmit={handleReject}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#bc3d2b]">
                  Yêu cầu chỉnh sửa
                </p>
                <h2 className="mt-2 text-2xl font-bold">Từ chối sản phẩm</h2>
              </div>
              <button
                aria-label="Đóng"
                className="grid h-9 w-9 place-items-center rounded-md bg-[#f7f3ec] text-[#646a61]"
                onClick={() => setRejectProductId(null)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#646a61]">
              Lý do sẽ hiển thị trong Seller Center để Store biết chính xác nội
              dung cần sửa.
            </p>
            <label className="mt-5 block text-sm font-bold">
              Lý do từ chối
              <textarea
                className="mt-2 min-h-32 w-full resize-y rounded-md border border-[#d8cebf] bg-[#fcfaf6] p-3 text-sm font-normal outline-none focus:border-[#bc3d2b] focus:ring-2 focus:ring-[#bc3d2b]/10"
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Ví dụ: Thiếu kích thước chi tiết và ảnh vật liệu thực tế..."
                value={rejectionReason}
              />
            </label>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="h-11 rounded-md border border-[#d8cebf] text-sm font-bold"
                onClick={() => setRejectProductId(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="h-11 rounded-md bg-[#bc3d2b] text-sm font-bold text-white"
                type="submit"
              >
                Gửi về Store
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
