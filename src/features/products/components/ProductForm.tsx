"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  type CreateProductPayload,
} from "../services/productService";
import type { Product } from "../types";

type CategoryOption = { id: string; name: string };

type Props = {
  initial?: Product | null;
  onSaved?: (product: Product) => void;
  onCancel?: () => void;
};

const ECOM_PLATFORMS = [
  "",
  "Shopee",
  "Lazada",
  "Tiki",
  "Sendo",
  "Amazon",
  "IKEA",
  "Other",
];

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

type FormState = {
  name: string;
  price: string;
  image: string;
  imagesText: string;
  category: string;
  brand: string;
  description: string;
  discount: string;
  stock: string;
  material: string;
  color: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  weight: string;
  origin: string;
  warranty: string;
  tagsText: string;
  styleTagsText: string;
  ecommercePlatform: string;
  productLink: string;
};

type ApiProductLite = {
  category?: string;
  brand?: string;
  description?: string;
  dimensions?:
    | { length?: string; width?: string; height?: string }
    | string;
  weight?: string;
  origin?: string;
  warranty?: string;
  styleTags?: string[];
  tags?: string[];
  images?: string[];
  ecommercePlatform?: string;
  productLink?: string;
  discount?: number | string;
  stock?: number | string;
  rating?: number | string;
  reviews?: number | string;
  sku?: string;
};

function pickRecord(product: Product): ApiProductLite {
  const raw = (product as unknown as { __raw?: ApiProductLite }).__raw;
  if (raw && typeof raw === "object") return raw;
  return {};
}

function fromProduct(p?: Product | null): FormState {
  const meta = p ? pickRecord(p) : {};
  const dimensions =
    meta.dimensions && typeof meta.dimensions === "object"
      ? meta.dimensions
      : undefined;
  return {
    name: p?.name ?? "",
    price: p ? String(p.originalPriceVND || p.priceVND) : "",
    image: p?.image ?? "",
    imagesText: (meta.images ?? p?.images ?? [])
      .filter((v) => v && v !== p?.image)
      .join("\n"),
    category: meta.category ?? p?.category ?? "",
    brand: meta.brand ?? p?.brand ?? "",
    description: meta.description ?? p?.description ?? "",
    discount: meta.discount !== undefined ? String(meta.discount) : p ? String(p.discountPercentage ?? 0) : "0",
    stock: meta.stock !== undefined ? String(meta.stock) : p ? String(p.stock ?? 0) : "0",
    material: (productSpec(p, "Chất liệu") as string | undefined) ?? "",
    color: meta.color ?? p?.color ?? "",
    dimensionLength: dimensions?.length ?? "",
    dimensionWidth: dimensions?.width ?? "",
    dimensionHeight: dimensions?.height ?? "",
    weight: meta.weight ?? "",
    origin: meta.origin ?? "",
    warranty: meta.warranty ?? "",
    tagsText: (meta.tags ?? p?.tags ?? []).join(", "),
    styleTagsText: (meta.styleTags ?? []).join(", "),
    ecommercePlatform: meta.ecommercePlatform ?? "",
    productLink: meta.productLink ?? "",
  };
}

function productSpec(p: Product | null | undefined, key: string): string | undefined {
  if (!p?.specifications) return undefined;
  const entry = Object.entries(p.specifications).find(
    ([k]) => k.trim().toLowerCase() === key.toLowerCase(),
  );
  return entry?.[1];
}

function splitList(value: string) {
  return value
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProductForm({ initial, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => fromProduct(initial));
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase()}/categories`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Array<Record<string, unknown>>) => {
        const list: CategoryOption[] = (Array.isArray(rows) ? rows : [])
          .map((row) => ({
            id: String(row.id ?? row._id ?? ""),
            name: String(row.name ?? ""),
          }))
          .filter((c) => c.id && c.name);
        const seen = new Set<string>();
        const dedup = list.filter((c) => {
          const key = c.name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setCategories(dedup);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onUpload = useCallback(async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadProductImage(file);
      setField("image", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload thất bại.");
    } finally {
      setUploading(false);
    }
  }, [setField]);

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const price = Math.round(Number(form.price.replace(/[^\d.]/g, "")));
      if (!form.name.trim() || !Number.isFinite(price) || price <= 0) {
        throw new Error("Vui lòng nhập tên và giá hợp lệ (> 0).");
      }

      const images = splitList(form.imagesText);
      const trimmedImage = form.image.trim();
      const allImages = trimmedImage
        ? [trimmedImage, ...images.filter((u) => u !== trimmedImage)]
        : images;

      const payload: CreateProductPayload = {
        name: form.name.trim(),
        price,
        ...(trimmedImage ? { image: trimmedImage } : {}),
        ...(allImages.length ? { images: allImages } : {}),
        category: form.category.trim() || undefined,
        brand: form.brand.trim() || undefined,
        description: form.description.trim() || undefined,
        discount: form.discount ? Number(form.discount) : 0,
        stock: form.stock ? Number(form.stock) : 0,
        material: form.material.trim() || undefined,
        color: form.color.trim() || undefined,
        dimensions:
          form.dimensionLength || form.dimensionWidth || form.dimensionHeight
            ? {
                length: form.dimensionLength.trim() || undefined,
                width: form.dimensionWidth.trim() || undefined,
                height: form.dimensionHeight.trim() || undefined,
              }
            : undefined,
        weight: form.weight.trim() || undefined,
        origin: form.origin.trim() || undefined,
        warranty: form.warranty.trim() || undefined,
        tags: splitList(form.tagsText),
        styleTags: splitList(form.styleTagsText),
        ecommercePlatform: form.ecommercePlatform || undefined,
        productLink: form.productLink.trim() || undefined,
      };

      const saved = initial?.id
        ? await updateProduct(initial.id, payload)
        : await createProduct(payload);

      onSaved?.(saved);
      if (!initial) {
        setForm(fromProduct(null));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }, [form, initial, onSaved]);

  const heading = useMemo(
    () => (initial?.id ? `Chỉnh sửa: ${initial.name}` : "Đăng sản phẩm mới"),
    [initial],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-[#e5dfd2] bg-white p-6 shadow-sm"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#17211b]">{heading}</h2>
          <p className="mt-1 text-xs text-[#777e77]">
            Sản phẩm của Admin sẽ tự động được duyệt (APPROVED) và hiển thị trên trang khách hàng ngay.
          </p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#dcd5c3] px-3 py-1.5 text-xs font-semibold text-[#17211b] hover:bg-[#faf6ec]"
          >
            ← Quay lại danh sách
          </button>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Tên sản phẩm *</span>
          <input
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="VD: Sofa góc L Dexon"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Giá bán (VND) *</span>
          <input
            required
            inputMode="numeric"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="2490000"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Danh mục</span>
          <input
            list="category-list"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="Phòng khách, Phòng ngủ..."
          />
          <datalist id="category-list">
            {categories.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Thương hiệu</span>
          <input
            value={form.brand}
            onChange={(e) => setField("brand", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="DECOHO"
          />
        </label>

        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-bold text-[#17211b]">Mô tả</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="Mô tả chi tiết, vật liệu, kích thước, cách bảo quản..."
          />
        </label>

        <div className="md:col-span-2">
          <span className="mb-1 block text-sm font-bold text-[#17211b]">Ảnh chính</span>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={form.image}
              onChange={(e) => setField("image", e.target.value)}
              className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
              placeholder="https://res.cloudinary.com/..."
            />
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#dcd5c3] bg-[#faf6ec] px-4 py-2.5 text-sm font-bold text-[#17211b] hover:bg-[#f1ebda]">
              {uploading ? "Đang tải lên..." : "Upload từ máy"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          {form.image ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-[#e5dfd2] bg-[#faf6ec]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image}
                alt={form.name || "preview"}
                className="max-h-48 w-full object-contain"
              />
            </div>
          ) : null}
        </div>

        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-bold text-[#17211b]">Album ảnh phụ (mỗi URL 1 dòng)</span>
          <textarea
            rows={3}
            value={form.imagesText}
            onChange={(e) => setField("imagesText", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder={"https://...jpg\nhttps://...png"}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Giảm giá (%)</span>
          <input
            inputMode="numeric"
            value={form.discount}
            onChange={(e) => setField("discount", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="0 - 100"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Tồn kho</span>
          <input
            inputMode="numeric"
            value={form.stock}
            onChange={(e) => setField("stock", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="0"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Chất liệu</span>
          <input
            value={form.material}
            onChange={(e) => setField("material", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="Gỗ sồi, vải bố..."
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Màu sắc</span>
          <input
            value={form.color}
            onChange={(e) => setField("color", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="Nâu vàng tự nhiên"
          />
        </label>

        <fieldset className="md:col-span-2 rounded-lg border border-dashed border-[#dcd5c3] p-4">
          <legend className="px-2 text-xs font-bold uppercase tracking-widest text-[#777e77]">
            Kích thước (cm)
          </legend>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-semibold text-[#687069]">Dài</span>
              <input
                value={form.dimensionLength}
                onChange={(e) => setField("dimensionLength", e.target.value)}
                className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2 focus:border-[#2f6f5e] focus:outline-none"
                placeholder="120"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-semibold text-[#687069]">Rộng</span>
              <input
                value={form.dimensionWidth}
                onChange={(e) => setField("dimensionWidth", e.target.value)}
                className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2 focus:border-[#2f6f5e] focus:outline-none"
                placeholder="60"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-semibold text-[#687069]">Cao</span>
              <input
                value={form.dimensionHeight}
                onChange={(e) => setField("dimensionHeight", e.target.value)}
                className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2 focus:border-[#2f6f5e] focus:outline-none"
                placeholder="75"
              />
            </label>
          </div>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Khối lượng</span>
          <input
            value={form.weight}
            onChange={(e) => setField("weight", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="15 kg"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Xuất xứ</span>
          <input
            value={form.origin}
            onChange={(e) => setField("origin", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="Việt Nam"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Bảo hành</span>
          <input
            value={form.warranty}
            onChange={(e) => setField("warranty", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="12 tháng"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Style tags (phân cách dấu phẩy)</span>
          <input
            value={form.styleTagsText}
            onChange={(e) => setField("styleTagsText", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="minimalist, scandinavian"
          />
        </label>

        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-bold text-[#17211b]">Tags (phân cách dấu phẩy)</span>
          <input
            value={form.tagsText}
            onChange={(e) => setField("tagsText", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="phòng khách, sofa"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Sàn thương mại</span>
          <select
            value={form.ecommercePlatform}
            onChange={(e) => setField("ecommercePlatform", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
          >
            {ECOM_PLATFORMS.map((option) => (
              <option key={option || "none"} value={option}>
                {option || "— Không chọn —"}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-bold text-[#17211b]">Link ngoài (Shopee, Tiki...)</span>
          <input
            type="url"
            value={form.productLink}
            onChange={(e) => setField("productLink", e.target.value)}
            className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5 focus:border-[#2f6f5e] focus:outline-none"
            placeholder="https://shopee.vn/..."
          />
        </label>
      </div>

      <footer className="flex items-center justify-end gap-3 border-t border-[#e5dfd2] pt-5">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#dcd5c3] px-4 py-2.5 text-sm font-bold text-[#17211b] hover:bg-[#faf6ec]"
          >
            Huỷ
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-lg bg-[#2f6f5e] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#265a4c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Đang lưu..."
            : initial?.id
              ? "Cập nhật sản phẩm"
              : "Đăng sản phẩm"}
        </button>
      </footer>
    </form>
  );
}
