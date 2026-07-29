"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSessionUser, subscribeSessionUser } from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";
import { initialCartItems } from "@/src/features/cart/mock/cartItems";
import { addCartItem } from "@/src/features/cart/services/cartStorage";
import {
  demoStoreLeads,
  demoStoreProducts,
  storeFlowSteps,
} from "../mock/storeDemo";
import {
  getStoredStoreProducts,
  saveStoredStoreProducts,
  subscribeStoreProducts,
} from "../services/productQueue";
import type { StoreFlowStep, StoreLead, StoreProduct } from "../types";

type SellerTab = "overview" | "submit" | "products" | "leads";

type ProductFormState = {
  category: string;
  dimensions: string;
  image: string;
  material: string;
  name: string;
  priceVND: string;
  stock: string;
};

const emptyProductForm: ProductFormState = {
  category: "Sofa",
  dimensions: "",
  image: "",
  material: "",
  name: "",
  priceVND: "",
  stock: "",
};

const storeProductImages = [
  "/images/product-space/organic-calm.png",
  "/images/product-space/urban-warmth.png",
  "/images/product-space/soft-evening.png",
];

type IconName =
  | "arrow"
  | "box"
  | "cart"
  | "check"
  | "clock"
  | "copy"
  | "cube"
  | "eye"
  | "lead"
  | "login"
  | "package"
  | "phone"
  | "send"
  | "shield"
  | "spark"
  | "store"
  | "upload";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    box: "M4 7h16v10H4V7Zm3-3h10l3 3H4l3-3Z",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m5 16.5h.01M18 19.5h.01",
    check: "m5 12 4 4L19 6",
    clock: "M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    copy: "M8 8h10v12H8V8Zm-4 8V4h10",
    cube: "m21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8m9 5v8",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    lead: "M16 21v-2a4 4 0 0 0-8 0v2m4-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 10v-2a3 3 0 0 0-2-2.8M18 4.4a4 4 0 0 1 0 7.2",
    login: "M14 17l5-5-5-5M19 12H7m4-8H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5",
    package: "M21 8v8l-9 5-9-5V8l9-5 9 5Zm-9 5 9-5M12 13 3 8m5-3.2 9 5",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z",
    send: "M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
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

function productStatusLabel(status: StoreProduct["status"]) {
  const labels = {
    active: "Đã public",
    draft: "Bản nháp",
    pending_review: "Chờ Admin duyệt",
    rejected: "Admin từ chối",
    review: "Đang rà soát",
  };

  return labels[status];
}

function productStatusClass(status: StoreProduct["status"]) {
  if (status === "active") {
    return "bg-[#eefbf2] text-[#23643b]";
  }

  if (status === "pending_review" || status === "review") {
    return "bg-[#fff7e8] text-[#8a5d25]";
  }

  if (status === "rejected") {
    return "bg-[#fff1ee] text-[#bc3d2b]";
  }

  return "bg-[#f7f3ec] text-[#646a61]";
}

function leadStatusLabel(status: StoreLead["status"]) {
  const labels = {
    new: "Lead mới",
    quoted: "Đã báo giá",
    scheduled: "Đã hẹn",
  };

  return labels[status];
}

function leadStatusClass(status: StoreLead["status"]) {
  if (status === "new") {
    return "bg-[#fff7e8] text-[#8a5d25]";
  }

  if (status === "scheduled") {
    return "bg-[#eaf4ff] text-[#245c83]";
  }

  return "bg-[#eefbf2] text-[#23643b]";
}

function productAccent(index: number) {
  const accents = [
    "from-[#1f3b2b] to-[#c99a4a]",
    "from-[#2c475f] to-[#d8d1c4]",
    "from-[#5b4a35] to-[#b7dfc4]",
    "from-[#3c3d35] to-[#ead7bd]",
  ];

  return accents[index % accents.length];
}

export default function StoreDashboardView() {
  const [activeTab, setActiveTab] = useState<SellerTab>("overview");
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [isPublicPreview, setIsPublicPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState<StoreProduct[]>(demoStoreProducts);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [selectedStepId, setSelectedStepId] = useState("upload-3d");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const selectedStep =
    storeFlowSteps.find((step) => step.id === selectedStepId) ?? storeFlowSteps[0];
  const isStoreAccount = currentUser?.role === "store";
  const publicProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );

  const metrics = useMemo(() => {
    const totalViews = products.reduce((total, product) => total + product.views, 0);
    const readyModels = products.filter((product) => product.modelStatus === "ready").length;
    const activeProducts = products.filter((product) => product.status === "active").length;
    const pendingProducts = products.filter(
      (product) => product.status === "pending_review" || product.status === "review",
    ).length;
    const newLeads = demoStoreLeads.filter((lead) => lead.status === "new").length;

    return { activeProducts, newLeads, pendingProducts, readyModels, totalViews };
  }, [products]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentUser(getSessionUser());
      setProducts(getStoredStoreProducts(demoStoreProducts));
      setHasCheckedSession(true);
    }, 0);
    const unsubscribe = subscribeSessionUser((user) => {
      setCurrentUser(user);
      setHasCheckedSession(true);
    });
    const unsubscribeProducts = subscribeStoreProducts(
      setProducts,
      demoStoreProducts,
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
      unsubscribeProducts();
    };
  }, []);

  function persistProducts(nextProducts: StoreProduct[]) {
    setProducts(nextProducts);
    saveStoredStoreProducts(nextProducts);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      showNotice(`${label} đã được sao chép.`);
    } catch {
      showNotice(`${label}: ${value}`);
    }
  }

  function requestConsultation() {
    showNotice("Đã ghi nhận yêu cầu tư vấn. Cửa hàng sẽ liên hệ qua thông tin demo.");
  }

  function addStoreProductToCart(product: StoreProduct, index: number) {
    addCartItem(
      {
        id: `store-${product.id}`,
        category: product.category,
        dimensions: product.dimensions || "Thông số tại showroom",
        image:
          product.image ??
          storeProductImages[index % storeProductImages.length],
        material: product.material || "Vật liệu theo hồ sơ cửa hàng",
        name: product.name,
        priceVND: product.priceVND,
        productHref: "/store#store-products",
        quantity: 1,
        source: "store",
        stock: product.stock,
        style: product.storeName || "Mộc An",
      },
      initialCartItems,
    );
    showNotice(`${product.name} đã được thêm vào giỏ hàng.`);
  }

  function updateProductForm<TField extends keyof ProductFormState>(
    field: TField,
    value: ProductFormState[TField],
  ) {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleProductImage(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showNotice("Vui lòng chọn file ảnh JPG, PNG hoặc WebP.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showNotice("Ảnh sản phẩm cần nhỏ hơn 8 MB.");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();

    reader.onload = () => {
      const source = typeof reader.result === "string" ? reader.result : "";
      const image = new window.Image();

      image.onload = () => {
        const maxEdge = 1280;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");

        if (!context) {
          setIsProcessingImage(false);
          showNotice("Không thể xử lý ảnh này.");
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        updateProductForm("image", canvas.toDataURL("image/jpeg", 0.82));
        setIsProcessingImage(false);
      };
      image.onerror = () => {
        setIsProcessingImage(false);
        showNotice("File ảnh không hợp lệ.");
      };
      image.src = source;
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      showNotice("Không thể đọc file ảnh.");
    };
    reader.readAsDataURL(file);
  }

  function editProduct(product: StoreProduct) {
    setEditingProductId(product.id);
    setProductForm({
      category: product.category,
      dimensions: product.dimensions ?? "",
      image: product.image ?? "",
      material: product.material ?? "",
      name: product.name,
      priceVND: String(product.priceVND),
      stock: String(product.stock),
    });
    setActiveTab("submit");
  }

  function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const priceVND = Number(productForm.priceVND);
    const stock = Number(productForm.stock);

    if (
      !productForm.name.trim() ||
      !productForm.category.trim() ||
      !Number.isFinite(priceVND) ||
      !Number.isFinite(stock) ||
      priceVND <= 0 ||
      stock < 0
    ) {
      showNotice("Vui lòng nhập tên, ngành hàng, giá và tồn kho hợp lệ.");
      return;
    }

    const submittedAt = new Date().toISOString();
    const nextProducts = editingProductId
      ? products.map((product) =>
          product.id === editingProductId
            ? {
                ...product,
                category: productForm.category.trim(),
                dimensions: productForm.dimensions.trim(),
                image: productForm.image || product.image,
                material: productForm.material.trim(),
                name: productForm.name.trim(),
                priceVND,
                rejectionReason: undefined,
                reviewedAt: undefined,
                reviewedBy: undefined,
                status: "pending_review" as const,
                stock,
                submittedAt,
              }
            : product,
        )
      : [
          {
            category: productForm.category.trim(),
            conversionRate: 0,
            dimensions: productForm.dimensions.trim(),
            id: `pending-${Date.now()}`,
            image: productForm.image || undefined,
            material: productForm.material.trim(),
            modelStatus: "missing" as const,
            name: productForm.name.trim(),
            priceVND,
            status: "pending_review" as const,
            stock,
            storeId: currentUser?.storeId ?? "store-moc-an",
            storeName: currentUser?.storeName ?? "Mộc An Furniture",
            submittedAt,
            views: 0,
          },
          ...products,
        ];

    persistProducts(nextProducts);
    setProductForm(emptyProductForm);
    setEditingProductId(null);
    setActiveTab("products");
    showNotice(
      editingProductId
        ? "Đã lưu thay đổi và gửi lại sản phẩm cho Admin."
        : "Sản phẩm đã gửi lên Admin. Khách chỉ thấy sau khi được duyệt.",
    );
  }

  function updateProductStatus(id: string, status: StoreProduct["status"]) {
    const nextProducts = products.map((product) =>
      product.id === id
        ? {
            ...product,
            status,
            rejectionReason:
              status === "pending_review" ? undefined : product.rejectionReason,
            submittedAt:
              status === "pending_review"
                ? new Date().toISOString()
                : product.submittedAt,
          }
        : product,
    );

    persistProducts(nextProducts);
    showNotice(
      status === "pending_review"
        ? "Sản phẩm đã được gửi lại để Admin duyệt."
        : "Trạng thái sản phẩm đã được cập nhật.",
    );
  }

  function uploadDemoModel() {
    const targetProduct = products.find((product) => product.modelStatus === "missing");

    if (!targetProduct) {
      showNotice("Tất cả sản phẩm demo đã có hoặc đang duyệt model 3D.");
      return;
    }

    const nextProducts = products.map((product) =>
      product.id === targetProduct.id
        ? {
            ...product,
            modelStatus: "reviewing" as const,
            status: product.status === "draft" ? ("pending_review" as const) : product.status,
          }
        : product,
    );

    persistProducts(nextProducts);
    showNotice(`Model 3D của ${targetProduct.name} đã được gửi duyệt.`);
  }

  function showPublicPreview(productName: string) {
    showNotice(`${productName} đang mở ở hồ sơ cửa hàng công khai.`);
  }

  if (!hasCheckedSession) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-4 py-10 text-[#17211b]">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#ded6c9] bg-white p-8 shadow-sm">
          <div className="h-5 w-40 animate-pulse rounded bg-[#eadfce]" />
          <div className="mt-6 h-20 animate-pulse rounded bg-[#f7f3ec]" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="h-24 animate-pulse rounded bg-[#f7f3ec]" />
            <div className="h-24 animate-pulse rounded bg-[#f7f3ec]" />
            <div className="h-24 animate-pulse rounded bg-[#f7f3ec]" />
          </div>
        </div>
      </main>
    );
  }

  if (!isStoreAccount || isPublicPreview) {
    return (
      <main className="min-h-screen bg-[#f6f1e9] pb-2 text-[#17211b]">
        <section className="relative mx-2 mt-2 min-h-[560px] overflow-hidden rounded-lg bg-[#17211b] text-white sm:mx-3">
          <Image
            alt="Không gian nội thất Mộc An Furniture"
            className="object-cover object-center"
            fill
            priority
            sizes="100vw"
            src="/images/product-space/urban-warmth.png"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,32,24,.93)_0%,rgba(16,32,24,.76)_38%,rgba(16,32,24,.18)_78%,rgba(16,32,24,.12)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#13251d]/90 to-transparent" />

          <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-end px-5 pb-7 pt-20 sm:px-8 sm:pb-9">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#f3ca7d] backdrop-blur-md">
                <Icon name="shield" />
                Cửa hàng đã xác minh
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
                Mộc An Furniture
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/82 sm:text-lg">
                Nội thất gỗ và sofa theo tinh thần Japandi, được chọn để sống
                lâu cùng căn nhà thay vì chỉ đẹp trong một khoảnh khắc.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-md bg-[#e4a33c] px-5 py-3 text-sm font-bold text-[#17211b] shadow-sm transition hover:bg-[#f2bc61]"
                  href="#store-products"
                >
                  <Icon name="package" />
                  Xem bộ sưu tập
                </a>
                <Link
                  className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                  href="/showroom"
                >
                  <Icon name="cube" />
                  Trải nghiệm 3D
                </Link>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                  onClick={requestConsultation}
                  type="button"
                >
                  <Icon name="send" />
                  Yêu cầu tư vấn
                </button>
              </div>
            </div>

            <div className="mt-10 grid max-w-3xl border-y border-white/20 sm:grid-cols-3">
              {[
                ["Sản phẩm đã duyệt", publicProducts.length],
                ["Model xem trong 3D", metrics.readyModels],
                ["Lượt khách quan tâm", metrics.totalViews.toLocaleString("vi-VN")],
              ].map(([label, value], index) => (
                <div
                  className={`py-4 ${
                    index > 0
                      ? "border-t border-white/20 sm:border-l sm:border-t-0 sm:px-5"
                      : "sm:pr-5"
                  }`}
                  key={label}
                >
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {notice ? (
          <div className="mx-auto mt-5 max-w-7xl px-5 sm:px-8">
            <div className="rounded-lg border border-[#b7dfc4] bg-[#eefbf2] px-4 py-3 text-sm font-bold text-[#23643b] shadow-sm">
              {notice}
            </div>
          </div>
        ) : null}

        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a76227]">
              Showroom Thảo Điền
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Xem vật liệu thật, nhận tư vấn đúng nhu cầu.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#646a61]">
              28 Nguyễn Văn Hưởng, Thảo Điền, TP. Hồ Chí Minh · Phục vụ TP.HCM,
              Bình Dương và Đồng Nai.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="inline-flex min-h-12 items-center justify-between gap-4 rounded-md border border-[#d6ccbd] bg-white px-4 text-left text-sm font-bold shadow-sm transition hover:border-[#b9823b]"
              onClick={() => copyText("Hotline", "0908 888 168")}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Icon name="phone" />
                0908 888 168
              </span>
              <Icon name="copy" />
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-between gap-4 rounded-md border border-[#d6ccbd] bg-white px-4 text-left text-sm font-bold shadow-sm transition hover:border-[#b9823b]"
              onClick={() => copyText("Email", "store.demo@decoho.vn")}
              type="button"
            >
              <span>store.demo@decoho.vn</span>
              <Icon name="copy" />
            </button>
          </div>
        </section>

        <section
          className="border-y border-[#ddd3c4] bg-[#fbf8f2] py-12"
          id="store-products"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a76227]">
                  Bộ sưu tập đã duyệt
                </p>
                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                  Những món đồ làm nên căn phòng.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#646a61]">
                  Chỉ sản phẩm đã được Admin duyệt mới xuất hiện ở hồ sơ công khai.
                </p>
              </div>
              {isStoreAccount ? (
                <button
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-[#cdbb9f] bg-white px-4 py-3 text-sm font-bold transition hover:bg-[#fff7e8]"
                  onClick={() => setIsPublicPreview(false)}
                  type="button"
                >
                  <Icon name="store" />
                  Về Seller Center
                </button>
              ) : (
                <Link
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-[#cdbb9f] bg-white px-4 py-3 text-sm font-bold transition hover:bg-[#fff7e8]"
                  href="/login"
                >
                  <Icon name="login" />
                  Đăng nhập cửa hàng
                </Link>
              )}
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publicProducts.map((product, index) => (
                <article
                  className="group overflow-hidden rounded-lg border border-[#d8cebf] bg-white shadow-[0_8px_24px_rgba(57,45,29,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(57,45,29,.13)]"
                  key={product.id}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd4c6]">
                    <Image
                      alt={product.name}
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      src={
                        product.image ??
                        storeProductImages[index % storeProductImages.length]
                      }
                      unoptimized={product.image?.startsWith("data:")}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-bold uppercase text-[#2f6f5e] shadow-sm backdrop-blur">
                      {product.category}
                    </span>
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                      <Icon name="cube" />
                      {modelStatusLabel(product.modelStatus)}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold leading-6">{product.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#656b63]">
                          {product.material || "Gỗ tự nhiên"} ·{" "}
                          {product.dimensions || "Thông số tại showroom"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#eefbf2] px-2.5 py-1 text-[11px] font-bold text-[#23643b]">
                        Còn {product.stock}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 border-t border-[#eee7dc] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-bold">{formatPrice(product.priceVND)}</p>
                        <p className="mt-1 text-xs text-[#747a72]">
                          {product.views.toLocaleString("vi-VN")} lượt xem
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#d89b47] px-3 text-sm font-bold text-[#1f2421] transition hover:bg-[#e4aa55] disabled:cursor-not-allowed disabled:bg-[#d7d3cb]"
                          disabled={product.stock === 0}
                          onClick={() => addStoreProductToCart(product, index)}
                          type="button"
                        >
                          <Icon name="cart" />
                          {product.stock === 0 ? "Hết hàng" : "Thêm giỏ"}
                        </button>
                        <button
                          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1f2421] px-3 text-sm font-bold text-white transition hover:bg-[#2f6f5e]"
                          onClick={() => showPublicPreview(product.name)}
                          type="button"
                        >
                          <Icon name="eye" />
                          Xem nhanh
                        </button>
                        <button
                          aria-label={`Tư vấn ${product.name}`}
                          className="grid h-10 w-10 place-items-center rounded-md border border-[#cdbb9f] bg-white transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
                          onClick={requestConsultation}
                          title="Gửi tư vấn"
                          type="button"
                        >
                          <Icon name="send" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-col justify-between gap-6 rounded-lg bg-[#173e34] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#f1bd62]">
                Cần một phương án riêng?
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Kể Mộc An nghe về căn phòng của bạn.
              </h2>
            </div>
            <button
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md bg-[#e4a33c] px-5 py-3 text-sm font-bold text-[#17211b] transition hover:bg-[#f2bc61]"
              onClick={requestConsultation}
              type="button"
            >
              <Icon name="send" />
              Nhận tư vấn
            </button>
          </div>
        </section>
      </main>
    );
  }

  const tabs: { id: SellerTab; label: string; icon: IconName }[] = [
    { id: "overview", label: "Tổng quan", icon: "spark" },
    { id: "submit", label: "Đăng sản phẩm", icon: "upload" },
    { id: "products", label: "Sản phẩm", icon: "package" },
    { id: "leads", label: "Khách hàng", icon: "lead" },
  ];

  return (
    <main className="min-h-screen bg-[#f6f1e9] pb-10 text-[#17211b]">
      <section className="mx-2 mt-2 overflow-hidden rounded-lg bg-[#102118] text-white shadow-[0_18px_50px_rgba(31,40,33,.14)] sm:mx-3">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#f0c979]">
                <Icon name="store" />
                Seller Center
              </div>
              <h1 className="mt-4 text-4xl font-black md:text-5xl">
                {currentUser.storeName || "Mộc An Furniture"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/72 md:text-base">
                Quản lý hồ sơ cửa hàng, đăng sản phẩm, gửi model 3D và theo dõi lead. Sản phẩm mới
                luôn đi qua hàng chờ Admin trước khi hiển thị cho khách.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-[#f0b24a] px-5 py-3 text-sm font-black text-[#17211b] shadow-sm transition hover:bg-[#ffc567]"
                onClick={() => setActiveTab("submit")}
                type="button"
              >
                <Icon name="upload" />
                Đăng sản phẩm
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/16"
                onClick={uploadDemoModel}
                type="button"
              >
                <Icon name="cube" />
                Upload Model 3D
              </button>
            </div>
          </div>

          <div className="mt-8 grid border-y border-white/15 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Đã public", metrics.activeProducts, "package"],
              ["Chờ duyệt", metrics.pendingProducts, "clock"],
              ["Model 3D", metrics.readyModels, "cube"],
              ["Lượt xem", metrics.totalViews.toLocaleString("vi-VN"), "eye"],
              ["Lead mới", metrics.newLeads, "lead"],
            ].map(([label, value, icon], index) => (
              <div
                className={`py-4 ${
                  index > 0
                    ? "border-t border-white/15 sm:border-t-0 lg:border-l lg:px-4"
                    : "lg:pr-4"
                }`}
                key={label}
              >
                <div className="flex items-center justify-between text-white/70">
                  <p className="text-xs font-black uppercase tracking-[0.18em]">{label}</p>
                  <Icon name={icon as IconName} />
                </div>
                <p className="mt-3 text-3xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {notice ? (
          <div className="mb-5 rounded-lg border border-[#b7dfc4] bg-[#eefbf2] px-4 py-3 text-sm font-black text-[#23643b]">
            {notice}
          </div>
        ) : null}

        <div className="sticky top-20 z-30 flex gap-2 overflow-x-auto rounded-lg border border-[#ded6c9] bg-white/95 p-2 shadow-[0_8px_24px_rgba(57,45,29,.08)] backdrop-blur">
          {tabs.map((tab) => (
            <button
              className={`inline-flex min-w-fit items-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${
                activeTab === tab.id
                  ? "bg-[#1f2421] text-white"
                  : "text-[#4f584f] hover:bg-[#f7f3ec]"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <Icon name={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-lg border border-[#ded6c9] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#bd7a31]">
                    Flow cửa hàng
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{selectedStep.title}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#656b63]">
                    {selectedStep.description}
                  </p>
                </div>
                <span className="rounded-lg bg-[#fff7e8] px-3 py-2 text-sm font-black text-[#8a5d25]">
                  {selectedStep.metric}
                </span>
              </div>

              <div className="mt-5 grid gap-2 xl:grid-cols-2">
                {storeFlowSteps.map((step, index) => (
                  <button
                    className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${flowStatusClass(
                      step.status,
                      selectedStep.id === step.id,
                    )}`}
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    type="button"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-current/10 text-xs font-black">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-sm font-black">{step.title}</span>
                      <span className="mt-1 block text-xs font-bold opacity-75">{step.metric}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#ded6c9] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#bd7a31]">
                    Hồ sơ cửa hàng
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Mộc An Studio</h2>
                  <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#656b63]">
                    Nội thất gỗ, sofa và decor nhà phố. Hồ sơ đã được duyệt, có thể đăng sản phẩm
                    và nhận khách từ catalog, AI preview và showroom 3D.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eefbf2] px-3 py-2 text-xs font-black text-[#23643b]">
                  <Icon name="check" />
                  Đã duyệt cửa hàng
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  ["Hotline", "0908 888 168"],
                  ["Email", "store.demo@decoho.vn"],
                  ["Địa chỉ", "28 Nguyễn Văn Hưởng, Thảo Điền"],
                  ["Khu vực giao", "TP.HCM, Bình Dương, Đồng Nai"],
                ].map(([label, value]) => (
                  <button
                    className="rounded-lg border border-[#ded6c9] bg-[#fcfaf6] p-4 text-left transition hover:border-[#c99a4a] hover:bg-[#fff7e8]"
                    key={label}
                    onClick={() => copyText(label, value)}
                    type="button"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-[#9a6324]">
                      {label}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-3 text-sm font-black">
                      {value}
                      <Icon name="copy" />
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1f2421] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2d352f]"
                  onClick={() => setActiveTab("submit")}
                  type="button"
                >
                  <Icon name="upload" />
                  Đăng sản phẩm mới
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-[#cdbb9f] bg-white px-4 py-3 text-sm font-black transition hover:bg-[#fff7e8]"
                  onClick={() => setIsPublicPreview(true)}
                  type="button"
                >
                  <Icon name="eye" />
                  Xem hồ sơ public
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "submit" ? (
          <section className="mt-5 rounded-lg border border-[#ded6c9] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#bd7a31]">
                  Gửi Admin duyệt
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {editingProductId
                    ? "Chỉnh sửa và gửi lại sản phẩm"
                    : "Đăng sản phẩm mới"}
                </h2>
              </div>
              <p className="max-w-md text-sm font-semibold leading-6 text-[#656b63]">
                {editingProductId
                  ? "Cập nhật nội dung Admin yêu cầu. Bản mới sẽ quay lại hàng chờ và thay thế đúng sản phẩm cũ."
                  : "Sau khi gửi, trạng thái sẽ là Chờ Admin duyệt. Admin duyệt xong sản phẩm mới public ra trang cửa hàng."}
              </p>
            </div>

            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmitProduct}>
              <label className="grid gap-2 text-sm font-black">
                Tên sản phẩm
                <input
                  className="rounded-lg border border-[#d8cfbf] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#c99a4a]"
                  onChange={(event) => updateProductForm("name", event.target.value)}
                  placeholder="Ví dụ: Sofa Sora nỉ Hàn Quốc"
                  value={productForm.name}
                />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Danh mục
                <select
                  className="rounded-lg border border-[#d8cfbf] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#c99a4a]"
                  onChange={(event) => updateProductForm("category", event.target.value)}
                  value={productForm.category}
                >
                  <option>Sofa</option>
                  <option>Bàn trà</option>
                  <option>Ghế</option>
                  <option>Kệ</option>
                  <option>Đèn</option>
                  <option>Giường</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black">
                Giá bán
                <input
                  className="rounded-lg border border-[#d8cfbf] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#c99a4a]"
                  min="0"
                  onChange={(event) => updateProductForm("priceVND", event.target.value)}
                  placeholder="9500000"
                  type="number"
                  value={productForm.priceVND}
                />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Tồn kho
                <input
                  className="rounded-lg border border-[#d8cfbf] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#c99a4a]"
                  min="0"
                  onChange={(event) => updateProductForm("stock", event.target.value)}
                  placeholder="12"
                  type="number"
                  value={productForm.stock}
                />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Kích thước
                <input
                  className="rounded-lg border border-[#d8cfbf] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#c99a4a]"
                  onChange={(event) => updateProductForm("dimensions", event.target.value)}
                  placeholder="190 x 86 x 78 cm"
                  value={productForm.dimensions}
                />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Chất liệu
                <input
                  className="rounded-lg border border-[#d8cfbf] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#c99a4a]"
                  onChange={(event) => updateProductForm("material", event.target.value)}
                  placeholder="Nỉ Hàn Quốc, gỗ ash"
                  value={productForm.material}
                />
              </label>
              <div className="grid gap-4 rounded-lg border border-[#d8cfbf] bg-[#fcfaf6] p-4 md:col-span-2 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e8e0d4]">
                  {productForm.image ? (
                    <Image
                      alt="Ảnh sản phẩm đang tải lên"
                      className="object-cover"
                      fill
                      sizes="180px"
                      src={productForm.image}
                      unoptimized
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-[#7b817a]">
                      <Icon name="package" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black">Ảnh sản phẩm</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#656b63]">
                    Ảnh được tối ưu trước khi lưu vào bản demo cửa hàng.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#1f2421] px-4 text-sm font-black text-white transition hover:bg-[#2f6f5e]">
                      <Icon name="upload" />
                      {isProcessingImage ? "Đang xử lý..." : "Chọn ảnh"}
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={isProcessingImage}
                        onChange={(event) =>
                          handleProductImage(event.target.files?.[0])
                        }
                        type="file"
                      />
                    </label>
                    {productForm.image ? (
                      <button
                        className="h-10 rounded-md border border-[#d8cfbf] bg-white px-4 text-sm font-black text-[#bc3d2b]"
                        onClick={() => updateProductForm("image", "")}
                        type="button"
                      >
                        Xóa ảnh
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-[#d8cfbf] bg-[#fcfaf6] p-4 md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black">Model 3D</p>
                    <p className="mt-1 text-sm font-semibold text-[#656b63]">
                      Demo hiện mô phỏng upload. Nút Upload Model 3D sẽ chuyển sản phẩm thiếu model
                      sang trạng thái đang duyệt.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#cdbb9f] bg-white px-4 py-3 text-sm font-black transition hover:bg-[#fff7e8]"
                    onClick={uploadDemoModel}
                    type="button"
                  >
                    <Icon name="cube" />
                    Upload demo
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:col-span-2 sm:grid-cols-[1fr_auto]">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f2421] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2d352f]"
                  type="submit"
                >
                  <Icon name="send" />
                  {editingProductId
                    ? "Lưu và gửi lại Admin"
                    : "Gửi sản phẩm cho Admin duyệt"}
                </button>
                {editingProductId ? (
                  <button
                    className="rounded-lg border border-[#d8cfbf] bg-white px-5 py-3 text-sm font-black"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm(emptyProductForm);
                    }}
                    type="button"
                  >
                    Hủy chỉnh sửa
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="mt-5 rounded-lg border border-[#ded6c9] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#bd7a31]">
                  Quản lý sản phẩm
                </p>
                <h2 className="mt-2 text-2xl font-black">Trạng thái duyệt và model 3D</h2>
              </div>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#f0b24a] px-4 py-3 text-sm font-black text-[#17211b] transition hover:bg-[#ffc567]"
                onClick={() => setActiveTab("submit")}
                type="button"
              >
                <Icon name="upload" />
                Thêm sản phẩm
              </button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[880px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs font-black uppercase tracking-[0.16em] text-[#7b6f60]">
                  <tr>
                    <th className="px-3 py-2">Sản phẩm</th>
                    <th className="px-3 py-2">Giá</th>
                    <th className="px-3 py-2">Tồn</th>
                    <th className="px-3 py-2">Model</th>
                    <th className="px-3 py-2">Duyệt</th>
                    <th className="px-3 py-2">Hiệu quả</th>
                    <th className="px-3 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr className="bg-[#fcfaf6]" key={product.id}>
                      <td className="rounded-l-lg px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${productAccent(
                              index,
                            )} text-white`}
                          >
                            {product.image ? (
                              <Image
                                alt=""
                                className="object-cover"
                                fill
                                sizes="48px"
                                src={product.image}
                                unoptimized
                              />
                            ) : (
                              <Icon name="package" />
                            )}
                          </span>
                          <span>
                            <span className="block font-black">{product.name}</span>
                            <span className="mt-1 block text-xs font-bold text-[#656b63]">
                              {product.category}
                            </span>
                            {product.status === "rejected" &&
                            product.rejectionReason ? (
                              <span className="mt-1 block max-w-64 text-xs font-bold leading-5 text-[#bc3d2b]">
                                Admin: {product.rejectionReason}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-black">{formatPrice(product.priceVND)}</td>
                      <td className="px-3 py-3 font-bold">{product.stock}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#4f584f]">
                          {modelStatusLabel(product.modelStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${productStatusClass(
                            product.status,
                          )}`}
                        >
                          {productStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-bold text-[#656b63]">
                        {product.views.toLocaleString("vi-VN")} lượt xem · {product.conversionRate}%
                      </td>
                      <td className="rounded-r-lg px-3 py-3">
                        <div className="flex justify-end gap-2">
                          {product.status === "draft" ||
                          product.status === "rejected" ? (
                            <button
                              className="rounded-lg border border-[#d8cfbf] bg-white px-3 py-2 text-xs font-black transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
                              onClick={() => editProduct(product)}
                              type="button"
                            >
                              Chỉnh sửa
                            </button>
                          ) : null}
                          {product.status === "active" ? (
                            <button
                              className="rounded-lg border border-[#d8cfbf] bg-white px-3 py-2 text-xs font-black transition hover:bg-[#fff7e8]"
                              onClick={() => updateProductStatus(product.id, "draft")}
                              type="button"
                            >
                              Ẩn tạm
                            </button>
                          ) : product.status === "draft" ||
                            product.status === "rejected" ? (
                            <button
                              className="rounded-lg border border-[#d8cfbf] bg-white px-3 py-2 text-xs font-black transition hover:bg-[#fff7e8]"
                              onClick={() => updateProductStatus(product.id, "pending_review")}
                              type="button"
                            >
                              Gửi duyệt
                            </button>
                          ) : (
                            <span className="rounded-lg bg-[#fff7e8] px-3 py-2 text-xs font-black text-[#8a5d25]">
                              Đang chờ Admin
                            </span>
                          )}
                          <button
                            className="rounded-lg bg-[#1f2421] px-3 py-2 text-xs font-black text-white transition hover:bg-[#2d352f]"
                            onClick={() => showPublicPreview(product.name)}
                            type="button"
                          >
                            Xem
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "leads" ? (
          <section className="mt-5 rounded-lg border border-[#ded6c9] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#bd7a31]">
                  Khách hàng
                </p>
                <h2 className="mt-2 text-2xl font-black">Lead từ Catalog và Showroom 3D</h2>
              </div>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#cdbb9f] bg-white px-4 py-3 text-sm font-black transition hover:bg-[#fff7e8]"
                onClick={() => copyText("Hotline chăm sóc lead", "0908 888 168")}
                type="button"
              >
                <Icon name="phone" />
                Copy hotline
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {demoStoreLeads.map((lead) => (
                <article
                  className="rounded-lg border border-[#ded6c9] bg-[#fcfaf6] p-4"
                  key={lead.id}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{lead.customerName}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${leadStatusClass(
                            lead.status,
                          )}`}
                        >
                          {leadStatusLabel(lead.status)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#656b63]">
                          {lead.source}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#656b63]">
                        {lead.need}
                      </p>
                      <p className="mt-1 text-sm font-black">
                        {lead.productName} · Ngân sách {formatPrice(lead.budgetVND)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-[#cdbb9f] bg-white px-4 py-3 text-sm font-black transition hover:bg-[#fff7e8]"
                        onClick={() => copyText("Thông tin lead", `${lead.customerName} - ${lead.need}`)}
                        type="button"
                      >
                        Copy lead
                      </button>
                      <button
                        className="rounded-lg bg-[#1f2421] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2d352f]"
                        onClick={() => showNotice(`Đã đánh dấu liên hệ ${lead.customerName}.`)}
                        type="button"
                      >
                        Đã liên hệ
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
