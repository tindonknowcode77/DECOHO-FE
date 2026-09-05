"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addProductPoint,
  removeProductPoint,
  updateProductPoint,
  updateProductSpace,
} from "../services/productSpaceService";
import type { ProductLite } from "@/src/features/products/types";
import {
  PRODUCT_POINT_PERCENT_MAX,
  PRODUCT_POINT_PERCENT_MIN,
  type ProductPoint,
  type ProductPointCoord,
  type ProductSpace,
} from "../types";

type Props = {
  space: ProductSpace;
  products: ProductLite[];
  onChange: (next: ProductSpace) => void;
  onDeleteSpace?: () => void;
  onBack: () => void;
};

type View = { mode: "view" } | { mode: "edit"; point: ProductPoint };

export default function MoodboardEditor({
  space,
  products,
  onChange,
  onBack,
  onDeleteSpace,
}: Props) {
  const [title, setTitle] = useState(space.title ?? "");
  const [description, setDescription] = useState(space.description ?? "");
  const [isPublic, setIsPublic] = useState(Boolean(space.isPublic));
  const [isFeatured, setIsFeatured] = useState(Boolean(space.isFeatured));
  const [savingMeta, setSavingMeta] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>({ mode: "view" });
  const [pickingPoint, setPickingPoint] = useState<ProductLite | null>(null);
  const [workingPoints, setWorkingPoints] = useState(space.productPoints ?? []);
  const [pendingCoord, setPendingCoord] = useState<ProductPointCoord | null>(null);

  const productIndex = useMemo(() => {
    const map = new Map<string, ProductLite>();
    for (const product of products) map.set(String(product.id), product);
    return map;
  }, [products]);

  const resolveProduct = useCallback(
    (point: ProductPoint): ProductLite | undefined => {
      const id =
        typeof point.productId === "string"
          ? point.productId
          : point.productId &&
              typeof point.productId === "object" &&
              "id" in point.productId
            ? String(point.productId.id ?? point.productId._id ?? "")
            : "";
      if (id && productIndex.has(id)) return productIndex.get(id);
      if (point.product?.id) return productIndex.get(String(point.product.id));
      if (point.product?.name) {
        // Fallback khi product point trỏ tới SP đã bị xoá khỏi catalog.
        const fallbackImage = point.product.image ?? point.product.images?.[0] ?? "";
        return {
          id: "",
          name: point.product.name,
          image: fallbackImage,
          priceVND: 0,
          brand: "",
          category: "",
        };
      }
      return undefined;
    },
    [productIndex],
  );

  const saveMeta = useCallback(async () => {
    setSavingMeta(true);
    setError("");
    try {
      const next = await updateProductSpace(space._id ?? space.id ?? "", {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        isPublic,
        isFeatured,
      });
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được thay đổi.");
    } finally {
      setSavingMeta(false);
    }
  }, [space.id, space._id, title, description, isPublic, isFeatured, onChange]);

  const handleImageClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!pickingPoint) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const range = PRODUCT_POINT_PERCENT_MAX - PRODUCT_POINT_PERCENT_MIN;
      const x = Math.round(((event.clientX - rect.left) / rect.width) * range + PRODUCT_POINT_PERCENT_MIN);
      const y = Math.round(((event.clientY - rect.top) / rect.height) * range + PRODUCT_POINT_PERCENT_MIN);
      setPendingCoord({
        x: Math.max(PRODUCT_POINT_PERCENT_MIN, Math.min(PRODUCT_POINT_PERCENT_MAX, x)),
        y: Math.max(PRODUCT_POINT_PERCENT_MIN, Math.min(PRODUCT_POINT_PERCENT_MAX, y)),
      });
    },
    [pickingPoint],
  );

  const confirmAddPoint = useCallback(async () => {
    if (!pickingPoint || !pendingCoord) return;
    const spaceId = space._id ?? space.id ?? "";
    setError("");
    try {
      const next = await addProductPoint(spaceId, {
        productId: pickingPoint.id,
        x: pendingCoord.x,
        y: pendingCoord.y,
      });
      setWorkingPoints(next.productPoints ?? []);
      onChange(next);
      setPickingPoint(null);
      setPendingCoord(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thêm được điểm.");
    }
  }, [pickingPoint, pendingCoord, space.id, space._id, onChange]);

  const removePoint = useCallback(
    async (point: ProductPoint) => {
      const pointId = point._id ?? point.id ?? "";
      if (!pointId) return;
      const confirmed = window.confirm("Xoá điểm này?");
      if (!confirmed) return;
      setError("");
      try {
        const next = await removeProductPoint(
          space._id ?? space.id ?? "",
          pointId,
        );
        setWorkingPoints(next.productPoints ?? []);
        onChange(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không xoá được điểm.");
      }
    },
    [space.id, space._id, onChange],
  );

  const movePoint = useCallback(
    async (point: ProductPoint) => {
      const id = point._id ?? point.id ?? "";
      const rangeText = `${PRODUCT_POINT_PERCENT_MIN}..${PRODUCT_POINT_PERCENT_MAX}`;
      const target = prompt(
        `Nhập toạ độ mới dạng 'x,y' (${rangeText}). Ví dụ: 45,60`,
        `${Math.round(point.x ?? 0)},${Math.round(point.y ?? 0)}`,
      );
      if (!target) return;
      const [xs, ys] = target.split(",").map((s) => Number(s.trim()));
      if (
        !Number.isFinite(xs) ||
        !Number.isFinite(ys) ||
        xs < PRODUCT_POINT_PERCENT_MIN ||
        xs > PRODUCT_POINT_PERCENT_MAX ||
        ys < PRODUCT_POINT_PERCENT_MIN ||
        ys > PRODUCT_POINT_PERCENT_MAX
      ) {
        window.alert("Toạ độ không hợp lệ.");
        return;
      }
      const productId =
        typeof point.productId === "string"
          ? point.productId
          : String(point.productId?.id ?? point.productId?._id ?? "");
      if (!productId) {
        window.alert("Không tìm thấy productId.");
        return;
      }
      try {
        const next = await updateProductPoint(
          space._id ?? space.id ?? "",
          id,
          { productId, x: xs, y: ys },
        );
        setWorkingPoints(next.productPoints ?? []);
        onChange(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không cập nhật được điểm.");
      }
    },
    [space.id, space._id, onChange],
  );

  const points = workingPoints ?? [];

  return (
    <div className="space-y-6 rounded-2xl border border-[#e5dfd2] bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            className="text-xs font-semibold text-[#777e77] hover:text-[#17211b]"
            onClick={onBack}
            type="button"
          >
            ← Quay lại danh sách
          </button>
          <h2 className="mt-2 text-2xl font-black text-[#17211b]">
            {space.title || "Moodboard"}
          </h2>
          <p className="text-xs text-[#777e77]">
            ID: <code className="text-[10px]">{space._id ?? space.id}</code>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onDeleteSpace ? (
            <button
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
              onClick={onDeleteSpace}
              type="button"
            >
              Xoá Moodboard
            </button>
          ) : null}
          <button
            className="rounded-lg bg-[#2f6f5e] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#265a4c] disabled:opacity-60"
            disabled={savingMeta}
            onClick={() => void saveMeta()}
            type="button"
          >
            {savingMeta ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Bố cục điểm sản phẩm</h3>
            {pickingPoint ? (
              <span className="rounded-full bg-[#fff5dc] px-3 py-1 text-[11px] font-bold text-[#7c5a14]">
                Đang chọn: {pickingPoint.name}
              </span>
            ) : (
              <span className="text-xs text-[#777e77]">
                Chọn sản phẩm bên phải → click lên ảnh để ghim.
              </span>
            )}
          </div>

          <div
            className={`relative mt-3 overflow-hidden rounded-2xl border bg-[#f5f1ea] ${
              pickingPoint ? "cursor-crosshair" : ""
            }`}
            onClick={handleImageClick}
          >
            {space.imageUrl ? (
              <img
                alt={space.title ?? "Moodboard"}
                className="block h-auto w-full"
                src={space.imageUrl}
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-sm text-[#777e77]">
                Moodboard chưa có ảnh.
              </div>
            )}

            {points.map((point) => {
              const product = resolveProduct(point);
              return (
                <button
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  key={point._id ?? point.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setView({ mode: "edit", point });
                  }}
                  style={{
                    left: `${point.x ?? 0}%`,
                    top: `${point.y ?? 0}%`,
                  }}
                  title={product?.name ?? "Sản phẩm"}
                  type="button"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white shadow ring-2 ring-[#2f6f5e]">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-[#2f6f5e] text-[10px] font-black text-white">
                      {(product?.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </span>
                </button>
              );
            })}

            {pendingCoord ? (
              <span
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pendingCoord.x}%`, top: `${pendingCoord.y}%` }}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dca451] ring-2 ring-white shadow">
                  +
                </span>
              </span>
            ) : null}
          </div>

          {pickingPoint && pendingCoord ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#dca451] bg-[#fff8e7] p-3 text-sm">
              <span>
                Sẽ ghim <strong>{pickingPoint.name}</strong> tại ({pendingCoord.x},{" "}
                {pendingCoord.y}).
              </span>
              <button
                className="ml-auto rounded-lg bg-[#2f6f5e] px-3 py-1.5 text-xs font-bold text-white"
                onClick={() => void confirmAddPoint()}
                type="button"
              >
                Xác nhận
              </button>
              <button
                className="rounded-lg border border-[#dcd5c3] px-3 py-1.5 text-xs font-bold"
                onClick={() => {
                  setPendingCoord(null);
                  setPickingPoint(null);
                }}
                type="button"
              >
                Huỷ
              </button>
            </div>
          ) : null}

          {view.mode === "edit" && view.point ? (
            <div className="mt-3 rounded-xl border border-[#e5dfd2] bg-[#faf6ec] p-4 text-sm">
              <p className="font-black">
                {resolveProduct(view.point)?.name ?? "Sản phẩm"}
              </p>
              <p className="text-xs text-[#777e77]">
                Tọa độ: ({Math.round(view.point.x ?? 0)},{" "}
                {Math.round(view.point.y ?? 0)})
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-lg border border-[#dcd5c3] px-3 py-1.5 text-xs font-bold"
                  onClick={() => void movePoint(view.point as ProductPoint)}
                  type="button"
                >
                  Đổi toạ độ
                </button>
                <button
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700"
                  onClick={() => void removePoint(view.point as ProductPoint)}
                  type="button"
                >
                  Xoá điểm
                </button>
                <button
                  className="ml-auto text-xs font-semibold text-[#777e77]"
                  onClick={() => setView({ mode: "view" })}
                  type="button"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-[#e5dfd2] bg-[#faf6ec] p-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#777e77]">
              Thông tin chung
            </h3>
            <label className="mt-3 block text-xs">
              <span className="mb-1 block font-bold">Tiêu đề</span>
              <input
                className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2"
                maxLength={160}
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </label>
            <label className="mt-3 block text-xs">
              <span className="mb-1 block font-bold">Mô tả</span>
              <textarea
                className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2"
                maxLength={1000}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                value={description}
              />
            </label>
            <label className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <input
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                type="checkbox"
              />
              Công khai với diễn đàn
            </label>
            <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
              <input
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
                type="checkbox"
              />
              Nổi bật (featured)
            </label>
          </div>

          <div className="rounded-xl border border-[#e5dfd2] bg-[#faf6ec] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#777e77]">
                Kho sản phẩm
              </h3>
              <span className="text-[10px] text-[#777e77]">{products.length}</span>
            </div>
            <p className="mt-1 text-xs text-[#777e77]">
              Bấm 1 sản phẩm rồi click lên ảnh để ghim điểm mới.
            </p>
            <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1 text-sm">
              {products.length === 0 ? (
                <li className="text-xs text-[#777e77]">Chưa load được danh sách sản phẩm.</li>
              ) : (
                products.map((product) => (
                  <li key={product.id}>
                    <button
                      className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition ${
                        pickingPoint?.id === product.id
                          ? "border-[#2f6f5e] bg-[#e8f4ef]"
                          : "border-transparent hover:bg-white"
                      }`}
                      onClick={() => {
                        setPickingPoint(product);
                        setPendingCoord(null);
                        setView({ mode: "view" });
                      }}
                      type="button"
                    >
                      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-[#eee]">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={product.name}
                            className="h-full w-full object-cover"
                            src={product.image}
                          />
                        ) : null}
                      </span>
                      <span className="flex-1 truncate font-semibold text-[#17211b]">
                        {product.name}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
