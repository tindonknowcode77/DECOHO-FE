"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSessionUser, subscribeSessionUser } from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";
import {
  demoStoreLeads,
  demoStoreProducts,
  storeFlowSteps,
} from "../mock/storeDemo";
import type { StoreFlowStep, StoreLead, StoreProduct } from "../types";

type IconName =
  | "arrow"
  | "box"
  | "check"
  | "clock"
  | "cube"
  | "eye"
  | "lead"
  | "login"
  | "package"
  | "spark"
  | "store"
  | "upload";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    box: "M4 7h16v10H4V7Zm3-3h10l3 3H4l3-3Z",
    check: "m5 12 4 4L19 6",
    clock: "M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    cube: "m21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8m9 5v8",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    lead: "M16 21v-2a4 4 0 0 0-8 0v2m4-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 10v-2a3 3 0 0 0-2-2.8M18 4.4a4 4 0 0 1 0 7.2",
    login: "M14 17l5-5-5-5M19 12H7m4-8H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5",
    package: "M21 8v8l-9 5-9-5V8l9-5 9 5Zm-9 5 9-5M12 13 3 8m5-3.2 9 5",
    spark:
      "m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z",
    store: "M4 10h16l-1-6H5l-1 6Zm2 0v10h12V10M9 20v-6h6v6M4 10a3 3 0 0 0 6 0m0 0a3 3 0 0 0 6 0m0 0a3 3 0 0 0 6 0",
    upload: "M12 16V4m-5 5 5-5 5 5M5 20h14",
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

function flowStatusClass(status: StoreFlowStep["status"], isSelected: boolean) {
  if (isSelected) {
    return "border-[#1f2421] bg-[#1f2421] text-white";
  }

  if (status === "completed") {
    return "border-[#b7dfc4] bg-[#eefbf2] text-[#23643b]";
  }

  if (status === "active") {
    return "border-[#ecd5ab] bg-[#fff7e8] text-[#8a5d25]";
  }

  return "border-[#ded6c9] bg-white text-[#646a61]";
}

function modelStatusLabel(status: StoreProduct["modelStatus"]) {
  const labels = {
    missing: "Chưa upload",
    ready: "Đã có 3D",
    reviewing: "Đang duyệt",
  };

  return labels[status];
}

function leadStatusLabel(status: StoreLead["status"]) {
  const labels = {
    new: "Lead mới",
    quoted: "Đã báo giá",
    scheduled: "Đã hẹn",
  };

  return labels[status];
}

export default function StoreDashboardView() {
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState("upload-3d");
  const selectedStep =
    storeFlowSteps.find((step) => step.id === selectedStepId) ?? storeFlowSteps[0];
  const isStoreAccount = currentUser?.role === "store";

  const metrics = useMemo(() => {
    const totalViews = demoStoreProducts.reduce((total, product) => total + product.views, 0);
    const readyModels = demoStoreProducts.filter((product) => product.modelStatus === "ready").length;
    const activeProducts = demoStoreProducts.filter((product) => product.status === "active").length;
    const newLeads = demoStoreLeads.filter((lead) => lead.status === "new").length;

    return { activeProducts, newLeads, readyModels, totalViews };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentUser(getSessionUser());
      setHasCheckedSession(true);
    }, 0);
    const unsubscribe = subscribeSessionUser((user) => {
      setCurrentUser(user);
      setHasCheckedSession(true);
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  if (!hasCheckedSession) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
        <section className="mx-auto max-w-md rounded-md border border-[#ded6c9] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#646a61]">Đang kiểm tra tài khoản Store...</p>
        </section>
      </main>
    );
  }

  if (!isStoreAccount) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] text-[#1f2421]">
        <section className="border-b border-[#ded6c9] bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md bg-[#f7f3ec] px-3 py-2 text-xs font-black uppercase tracking-wider text-[#b46f2c]">
                <Icon name="store" />
                Cửa hàng đối tác DECOHO
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
                Mộc An Furniture
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#646a61]">
                Xưởng nội thất gỗ và vải linen theo phong cách Japandi, chuyên sofa,
                bàn trà, ghế lounge và kệ trang trí có thể xem thử trong phòng 3D.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2421] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2f352f]"
                  href="/products"
                >
                  Xem sản phẩm
                  <Icon name="arrow" />
                </Link>
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[#ded6c9] bg-white px-5 py-3 text-sm font-black text-[#1f2421] transition hover:bg-[#f7f3ec]"
                  href="/showroom"
                >
                  Xem phòng 3D
                </Link>
              </div>
            </div>

            <div className="rounded-md border border-[#ded6c9] bg-[#fbf7ef] p-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#eee7dc] pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7662]">
                    Trạng thái cửa hàng
                  </p>
                  <p className="mt-1 text-2xl font-black">Đã xác minh</p>
                </div>
                <span className="rounded-md bg-[#eefbf2] px-3 py-2 text-xs font-black text-[#23643b]">
                  Admin duyệt
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#8a7662]">Showroom</dt>
                  <dd className="text-right font-black">Quận 2, TP.HCM</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#8a7662]">Hotline</dt>
                  <dd className="text-right font-black">0908 888 168</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#8a7662]">Bảo hành</dt>
                  <dd className="text-right font-black">12 - 36 tháng</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#8a7662]">Giao hàng</dt>
                  <dd className="text-right font-black">TP.HCM và toàn quốc</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <div className="flex items-end justify-between gap-3 border-b border-[#eee7dc] pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                    Sản phẩm nổi bật
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Có thể xem thử với 3D</h2>
                </div>
                <Link className="text-sm font-black text-[#2f6f5e]" href="/products">
                  Xem tất cả
                </Link>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {demoStoreProducts.slice(0, 4).map((product) => (
                  <article
                    className="rounded-md border border-[#eee7dc] bg-[#fbf7ef] p-4"
                    key={product.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#8a7662]">
                          {product.category}
                        </p>
                        <h3 className="mt-1 text-lg font-black">{product.name}</h3>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-xs font-black ${
                          product.modelStatus === "ready"
                            ? "bg-[#eefbf2] text-[#23643b]"
                            : "bg-[#fff7e8] text-[#8a5d25]"
                        }`}
                      >
                        {product.modelStatus === "ready" ? "Có 3D" : "Sắp có 3D"}
                      </span>
                    </div>
                    <p className="mt-4 text-xl font-black">{formatPrice(product.priceVND)}</p>
                    <p className="mt-2 text-xs leading-5 text-[#646a61]">
                      Còn {product.stock} sản phẩm. Phù hợp phối cảnh phòng khách,
                      showroom và thiết kế AI của DECOHO.
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                Dịch vụ cửa hàng
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Tư vấn phối cảnh", "Gợi ý combo theo diện tích và phong cách."],
                  ["Xem mẫu 3D", "Một số sản phẩm có model GLB để đặt vào phòng."],
                  ["Đặt lịch showroom", "Hỗ trợ xem vật liệu, màu vải và mẫu gỗ."],
                ].map(([title, description]) => (
                  <div className="rounded-md bg-[#fbf7ef] p-4" key={title}>
                    <p className="font-black">{title}</p>
                    <p className="mt-2 text-xs leading-5 text-[#646a61]">{description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                Liên hệ cửa hàng
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <p className="rounded-md bg-[#fbf7ef] p-3">
                  <span className="block text-xs font-bold uppercase text-[#8a7662]">Email</span>
                  <span className="mt-1 block font-black">mocan@decoho.vn</span>
                </p>
                <p className="rounded-md bg-[#fbf7ef] p-3">
                  <span className="block text-xs font-bold uppercase text-[#8a7662]">Giờ mở cửa</span>
                  <span className="mt-1 block font-black">09:00 - 20:00</span>
                </p>
                <p className="rounded-md bg-[#fbf7ef] p-3">
                  <span className="block text-xs font-bold uppercase text-[#8a7662]">Địa chỉ</span>
                  <span className="mt-1 block font-black">12 An Phú, Quận 2, TP.HCM</span>
                </p>
              </div>
            </section>

            <section className="rounded-md border border-[#ecd5ab] bg-[#fff7e8] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a5d25]">
                Dành cho chủ Store
              </p>
              <p className="mt-2 text-sm leading-6 text-[#8a7662]">
                Đăng nhập bằng tài khoản Store để mở dashboard quản lý sản phẩm,
                model 3D, lượt xem và khách hàng.
              </p>
              <Link
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1f2421] px-4 py-3 text-sm font-black text-white"
                href="/login"
              >
                Đăng nhập Store
                <Icon name="login" />
              </Link>
            </section>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#1f2421] sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-[#b46f2c] shadow-sm">
              <Icon name="spark" />
              Store Seller Center
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              {currentUser.storeName ?? "Mộc An Furniture"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#646a61]">
              Tài khoản Store demo đã được Admin duyệt. Bạn có thể xem đủ flow đăng sản
              phẩm, upload model 3D, quản lý sản phẩm, analytics và lead khách hàng.
            </p>
          </div>

          <div className="rounded-md border border-[#b7dfc4] bg-[#eefbf2] px-4 py-3 text-sm">
            <p className="font-black text-[#23643b]">Trạng thái: Đã duyệt</p>
            <p className="mt-1 text-xs text-[#4e7a5c]">Store ID: {currentUser.storeId}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            { icon: "package" as IconName, label: "Sản phẩm active", value: metrics.activeProducts },
            { icon: "cube" as IconName, label: "Model 3D sẵn sàng", value: metrics.readyModels },
            { icon: "eye" as IconName, label: "Lượt xem", value: metrics.totalViews.toLocaleString("vi-VN") },
            { icon: "lead" as IconName, label: "Lead mới", value: metrics.newLeads },
          ].map((item) => (
            <div className="rounded-md border border-[#ded6c9] bg-white p-4 shadow-sm" key={item.label}>
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#f7f3ec] text-[#2f6f5e]">
                <Icon name={item.icon} />
              </span>
              <p className="mt-3 text-2xl font-black">{item.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#8a7662]">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-4">
            <section className="rounded-md border border-[#ded6c9] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                Flow Store
              </h2>
              <div className="mt-4 space-y-2">
                {storeFlowSteps.map((step, index) => {
                  const isSelected = selectedStep.id === step.id;

                  return (
                    <button
                      className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border p-3 text-left transition ${flowStatusClass(
                        step.status,
                        isSelected,
                      )}`}
                      key={step.id}
                      onClick={() => setSelectedStepId(step.id)}
                      type="button"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-white/40 text-xs font-black">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">{step.title}</span>
                        <span className="mt-1 block truncate text-xs opacity-70">{step.metric}</span>
                      </span>
                      <Icon name={step.status === "completed" ? "check" : "arrow"} />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-4 shadow-sm">
              <h2 className="text-base font-black">Bước đang xem</h2>
              <p className="mt-2 text-xl font-black text-[#1f2421]">{selectedStep.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#646a61]">{selectedStep.description}</p>
              <p className="mt-4 rounded-md bg-[#fbf7ef] px-3 py-2 text-sm font-black text-[#2f6f5e]">
                {selectedStep.metric}
              </p>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-[#eee7dc] pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                    Hồ sơ cửa hàng
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Mộc An Furniture</h2>
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2f6f5e] px-4 py-2 text-sm font-black text-white"
                  type="button"
                >
                  <Icon name="upload" />
                  Upload Model 3D
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-md bg-[#fbf7ef] p-4">
                  <p className="text-xs font-bold uppercase text-[#8a7662]">Ngành hàng</p>
                  <p className="mt-1 font-black">Sofa, bàn trà, ghế, kệ</p>
                </div>
                <div className="rounded-md bg-[#fbf7ef] p-4">
                  <p className="text-xs font-bold uppercase text-[#8a7662]">Showroom</p>
                  <p className="mt-1 font-black">Quận 2, TP.HCM</p>
                </div>
                <div className="rounded-md bg-[#fbf7ef] p-4">
                  <p className="text-xs font-bold uppercase text-[#8a7662]">Bảo hành</p>
                  <p className="mt-1 font-black">12 - 36 tháng</p>
                </div>
              </div>
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#eee7dc] pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                    Quản lý sản phẩm
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Sản phẩm & Model 3D</h2>
                </div>
                <button
                  className="hidden rounded-md bg-[#d89b47] px-4 py-2 text-sm font-black text-[#1f2421] sm:inline-flex"
                  type="button"
                >
                  Đăng sản phẩm
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#eee7dc] text-xs uppercase tracking-wide text-[#8a7662]">
                      <th className="py-3 pr-4">Sản phẩm</th>
                      <th className="py-3 pr-4">Giá</th>
                      <th className="py-3 pr-4">Tồn</th>
                      <th className="py-3 pr-4">Model 3D</th>
                      <th className="py-3 pr-4">Views</th>
                      <th className="py-3">CVR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoStoreProducts.map((product) => (
                      <tr className="border-b border-[#f1eadf]" key={product.id}>
                        <td className="py-3 pr-4">
                          <p className="font-black">{product.name}</p>
                          <p className="mt-1 text-xs text-[#8a7662]">{product.category}</p>
                        </td>
                        <td className="py-3 pr-4 font-black">{formatPrice(product.priceVND)}</td>
                        <td className="py-3 pr-4">{product.stock}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-black ${
                              product.modelStatus === "ready"
                                ? "bg-[#eefbf2] text-[#23643b]"
                                : product.modelStatus === "reviewing"
                                  ? "bg-[#fff7e8] text-[#8a5d25]"
                                  : "bg-[#fff1ee] text-[#bc3d2b]"
                            }`}
                          >
                            {modelStatusLabel(product.modelStatus)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-black">
                          {product.views.toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 font-black text-[#2f6f5e]">
                          {product.conversionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                  Theo dõi lượt xem
                </p>
                <h2 className="mt-1 text-2xl font-black">Nguồn traffic</h2>
                <div className="mt-5 space-y-3">
                  {[
                    ["Showroom 3D", 52],
                    ["AI Preview", 31],
                    ["Catalog", 17],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm font-bold">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[#eee7dc]">
                        <div
                          className="h-full rounded-full bg-[#2f6f5e]"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                  Nhận khách hàng
                </p>
                <h2 className="mt-1 text-2xl font-black">Lead mới</h2>
                <div className="mt-4 space-y-3">
                  {demoStoreLeads.map((lead) => (
                    <div className="rounded-md border border-[#eee7dc] bg-[#fbf7ef] p-3" key={lead.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{lead.customerName}</p>
                          <p className="mt-1 text-xs text-[#646a61]">{lead.need}</p>
                        </div>
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-[#2f6f5e]">
                          {leadStatusLabel(lead.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#8a7662]">
                        {lead.productName} | {formatPrice(lead.budgetVND)} | {lead.source}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
