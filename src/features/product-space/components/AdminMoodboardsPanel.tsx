"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts } from "@/src/features/products/services/productService";
import type { ProductLite } from "@/src/features/products/types";
import {
  listAllProductSpacesForAdmin,
} from "../services/productSpaceService";
import {
  ROOM_TYPE_LABELS,
  type ProductSpace,
  type RoomType,
} from "../types";
import MoodboardCreateForm from "./MoodboardCreateForm";
import MoodboardEditor from "./MoodboardEditor";

type View =
  | { mode: "list" }
  | { mode: "create" }
  | { mode: "edit"; space: ProductSpace };

export default function AdminMoodboardsPanel() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [spaces, setSpaces] = useState<ProductSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductLite[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, productList] = await Promise.all([
        listAllProductSpacesForAdmin(),
        getProducts().catch(() => []),
      ]);
      setSpaces(list);
      setProducts(
        productList.map((p) => ({
          id: String(p.id ?? p.sku ?? ""),
          name: p.name,
          image: p.image,
          priceVND: p.priceVND,
          brand: p.brand,
          category: p.category,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return spaces;
    return spaces.filter((space) => {
      const room = space.roomType ? ROOM_TYPE_LABELS[space.roomType] : "";
      return `${space.title ?? ""} ${space.description ?? ""} ${room}`
        .toLowerCase()
        .includes(q);
    });
  }, [spaces, query]);

  const counts = useMemo(
    () => ({
      total: spaces.length,
      public: spaces.filter((s) => s.isPublic).length,
      featured: spaces.filter((s) => s.isFeatured).length,
      points: spaces.reduce(
        (sum, s) => sum + (s.productPoints?.length ?? 0),
        0,
      ),
    }),
    [spaces],
  );

  if (view.mode === "create") {
    return (
      <MoodboardCreateForm
        onCancel={() => setView({ mode: "list" })}
        onSaved={(created) => {
          setSpaces((prev) => [created, ...prev]);
          setView({ mode: "edit", space: created });
        }}
      />
    );
  }

  if (view.mode === "edit") {
    return (
      <MoodboardEditor
        products={products}
        space={view.space}
        onBack={() => setView({ mode: "list" })}
        onChange={(next) => {
          setSpaces((prev) =>
            prev.map((s) =>
              String(s._id ?? s.id) === String(next._id ?? next.id) ? next : s,
            ),
          );
          setView({ mode: "edit", space: next });
        }}
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-[#17211b]">Moodboard</h2>
          <p className="text-xs text-[#777e77]">
            {counts.total} moodboard · {counts.public} công khai ·{" "}
            {counts.featured} nổi bật · {counts.points} điểm ghim
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#2f6f5e] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#265a4c] sm:self-auto"
          onClick={() => setView({ mode: "create" })}
          type="button"
        >
          + Tạo Moodboard
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="h-11 flex-1 rounded-lg border border-[#dcd5c3] bg-white px-4 text-sm focus:border-[#2f6f5e] focus:outline-none"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tiêu đề, mô tả, loại phòng..."
          value={query}
        />
        <button
          className="h-11 rounded-lg border border-[#dcd5c3] px-5 text-sm font-bold hover:bg-[#faf6ec]"
          onClick={() => void load()}
          type="button"
        >
          Tải lại
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#e5dfd2] bg-white p-12 text-center text-sm">
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5dfd2] bg-white p-12 text-center">
          <h3 className="text-lg font-black text-[#17211b]">Chưa có Moodboard nào</h3>
          <p className="mt-2 text-sm text-[#777e77]">
            Bấm <strong>Tạo Moodboard</strong> để upload ảnh và bắt đầu ghim sản phẩm.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((space) => {
            const id = String(space._id ?? space.id ?? "");
            const room = space.roomType
              ? ROOM_TYPE_LABELS[space.roomType as RoomType]
              : "Không gian";
            return (
              <button
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5dfd2] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={id}
                onClick={() => setView({ mode: "edit", space })}
                type="button"
              >
                <div className="relative aspect-[4/3] bg-[#faf6ec]">
                  {space.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={space.title ?? "Moodboard"}
                      className="h-full w-full object-cover"
                      src={space.imageUrl}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-[#777e77]">
                      Chưa có ảnh
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex gap-1">
                    {space.isFeatured ? (
                      <span className="rounded bg-[#dca451] px-2 py-0.5 text-[10px] font-black text-white">
                        NỔI BẬT
                      </span>
                    ) : null}
                    {space.isPublic ? (
                      <span className="rounded bg-[#2f6f5e] px-2 py-0.5 text-[10px] font-black text-white">
                        PUBLIC
                      </span>
                    ) : (
                      <span className="rounded bg-[#777e77] px-2 py-0.5 text-[10px] font-black text-white">
                        RIÊNG
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 font-black text-[#17211b]">
                    {space.title || "Moodboard"}
                  </h3>
                  <p className="text-xs text-[#777e77]">
                    {room} · {space.productPoints?.length ?? 0} sản phẩm
                  </p>
                  {space.description ? (
                    <p className="line-clamp-2 text-xs text-[#687069]">
                      {space.description}
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
