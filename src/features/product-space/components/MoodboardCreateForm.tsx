"use client";

import { useCallback, useState } from "react";
import { createProductSpaceAsAdmin } from "../services/productSpaceService";
import {
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  type ProductSpace,
  type RoomType,
} from "../types";

type Props = {
  onSaved: (created: ProductSpace) => void;
  onCancel: () => void;
};

export default function MoodboardCreateForm({ onSaved, onCancel }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("living_room");
  const [width, setWidth] = useState("4");
  const [length, setLength] = useState("4");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onFile = useCallback((next: File | null) => {
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : "");
  }, []);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!file) {
        setError("Vui lòng chọn ảnh phòng.");
        return;
      }
      const w = Number(width);
      const l = Number(length);
      if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(l) || l <= 0) {
        setError("Chiều dài và chiều rộng phải > 0.");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        const created = await createProductSpaceAsAdmin(
          {
            roomType,
            width: w,
            length: l,
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            isPublic,
            isFeatured,
          },
          file,
        );
        onSaved(created);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không tạo được Moodboard.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      file,
      width,
      length,
      roomType,
      title,
      description,
      isPublic,
      isFeatured,
      onSaved,
    ],
  );

  return (
    <form
      className="space-y-6 rounded-2xl border border-[#e5dfd2] bg-white p-6 shadow-sm"
      onSubmit={onSubmit}
    >
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17211b]">
            Tạo Moodboard mới
          </h2>
          <p className="text-xs text-[#777e77]">
            Upload ảnh phòng kèm metadata. Moodboard sẽ được admin tạo thẳng, có
            thể ghim sản phẩm ngay.
          </p>
        </div>
        <button
          className="text-xs font-semibold text-[#777e77] hover:text-[#17211b]"
          onClick={onCancel}
          type="button"
        >
          ← Huỷ
        </button>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-bold">Ảnh phòng *</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="w-full rounded-lg border border-[#dcd5c3] bg-white px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-[#2f6f5e] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
            onChange={(event) =>
              onFile(event.target.files?.[0] ?? null)
            }
            required
            type="file"
          />
          {preview ? (
            <div className="mt-3 overflow-hidden rounded-xl border bg-[#faf6ec]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Preview"
                className="max-h-64 w-full object-contain"
                src={preview}
              />
            </div>
          ) : null}
        </label>

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-bold">Loại phòng *</span>
            <select
              className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5"
              onChange={(event) => setRoomType(event.target.value as RoomType)}
              value={roomType}
            >
              {ROOM_TYPES.map((value) => (
                <option key={value} value={value}>
                  {ROOM_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block font-bold">Rộng (m) *</span>
              <input
                className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5"
                min="0.1"
                onChange={(event) => setWidth(event.target.value)}
                required
                step="0.1"
                type="number"
                value={width}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-bold">Dài (m) *</span>
              <input
                className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5"
                min="0.1"
                onChange={(event) => setLength(event.target.value)}
                required
                step="0.1"
                type="number"
                value={length}
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-bold">Tiêu đề</span>
            <input
              className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5"
              maxLength={160}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="VD: Phòng khách Japandi ấm cúng"
              value={title}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-bold">Mô tả</span>
            <textarea
              className="w-full rounded-lg border border-[#dcd5c3] px-3 py-2.5"
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Cảm hứng, vật liệu chính, mood tổng thể..."
              rows={3}
              value={description}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                type="checkbox"
              />
              Công khai
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
                type="checkbox"
              />
              Nổi bật
            </label>
          </div>
        </div>
      </div>

      <footer className="flex justify-end gap-3 border-t border-[#e5dfd2] pt-5">
        <button
          className="rounded-lg border border-[#dcd5c3] px-4 py-2.5 text-sm font-bold hover:bg-[#faf6ec]"
          onClick={onCancel}
          type="button"
        >
          Huỷ
        </button>
        <button
          className="rounded-lg bg-[#2f6f5e] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#265a4c] disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Đang upload..." : "Tạo Moodboard"}
        </button>
      </footer>
    </form>
  );
}
