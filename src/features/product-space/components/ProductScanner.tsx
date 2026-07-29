"use client";

import Image from "next/image";
import {
  Check,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  ScanLine,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

type DetectedProduct = {
  id: number;
  name: string;
  category: string;
  material: string;
  color: string;
  confidence: number;
  confirmed: boolean;
};

const suggestedProducts: DetectedProduct[] = [
  {
    category: "Sofa",
    color: "Kem",
    confidence: 94,
    confirmed: false,
    id: 1,
    material: "Vải boucle",
    name: "Sofa cong 3 chỗ",
  },
  {
    category: "Bàn trà",
    color: "Nâu tự nhiên",
    confidence: 87,
    confirmed: false,
    id: 2,
    material: "Gỗ sồi",
    name: "Bàn trà tròn thấp",
  },
  {
    category: "Đèn trang trí",
    color: "Trắng ngà",
    confidence: 78,
    confirmed: false,
    id: 3,
    material: "Vải và kim loại",
    name: "Đèn sàn chụp vải",
  },
];

export default function ProductScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState<DetectedProduct[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [preview],
  );

  function selectFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Vui lòng chọn một tệp hình ảnh.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Dung lượng ảnh tối đa là 10 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setProducts([]);
    setMessage("");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  function scanImage() {
    if (!preview || isScanning) return;
    setIsScanning(true);
    setProducts([]);
    setMessage("");

    timerRef.current = setTimeout(() => {
      setProducts(suggestedProducts);
      setIsScanning(false);
    }, 1600);
  }

  function updateProduct(
    id: number,
    field: "name" | "category" | "material" | "color",
    value: string,
  ) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, [field]: value } : product,
      ),
    );
  }

  function confirmProduct(id: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, confirmed: true } : product,
      ),
    );
    setEditingId(null);
  }

  function addManualProduct() {
    const id = Date.now();
    setProducts((current) => [
      ...current,
      {
        category: "Chưa phân loại",
        color: "Chưa cập nhật",
        confidence: 100,
        confirmed: false,
        id,
        material: "Chưa cập nhật",
        name: "Sản phẩm mới",
      },
    ]);
    setEditingId(id);
  }

  const confirmedCount = products.filter(
    (product) => product.confirmed,
  ).length;

  return (
    <section
      className="mt-7 overflow-hidden rounded-2xl border border-[#d7cdbc] bg-white shadow-[0_18px_48px_rgba(54,43,30,.1)]"
      id="ai-product-scanner"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[#e6ded1] bg-[#17211d] px-5 py-5 text-white sm:flex-row sm:items-center sm:px-7">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#efbd68]">
            <Sparkles className="h-4 w-4" />
            Tính năng nổi bật
          </p>
          <h2 className="mt-2 text-2xl font-bold">AI Product Scanner</h2>
          <p className="mt-1 text-sm text-white/70">
            Tải ảnh lên, AI tìm đồ vật và đề xuất thông tin sản phẩm.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[#efbd68]/40 bg-[#efbd68]/10 px-3 py-1.5 text-xs font-bold text-[#f5cf8e]">
          AI đề xuất · Bạn xác nhận
        </span>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.08fr_.92fr]">
        <div>
          <div
            className={`relative grid min-h-[360px] place-items-center overflow-hidden rounded-xl border-2 border-dashed transition ${
              isDragging
                ? "border-[#2f6f5e] bg-[#e9f2ed]"
                : "border-[#cbc1b2] bg-[#faf8f4]"
            }`}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
          >
            {preview ? (
              <>
                <Image
                  alt="Ảnh không gian được tải lên"
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  src={preview}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

                {products.length > 0 && (
                  <>
                    <span className="absolute bottom-[18%] left-[12%] h-[30%] w-[55%] rounded-lg border-2 border-[#f2b552] bg-[#f2b552]/10">
                      <span className="absolute -top-7 left-0 rounded bg-[#f2b552] px-2 py-1 text-[10px] font-bold">
                        Sofa · 94%
                      </span>
                    </span>
                    <span className="absolute bottom-[14%] right-[12%] h-[18%] w-[26%] rounded-lg border-2 border-white/90">
                      <span className="absolute -top-7 right-0 rounded bg-white px-2 py-1 text-[10px] font-bold">
                        Bàn trà · 87%
                      </span>
                    </span>
                  </>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <span className="max-w-[60%] truncate rounded-full bg-black/55 px-3 py-2 text-xs font-bold text-white">
                    {fileName}
                  </span>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold shadow"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Đổi ảnh
                  </button>
                </div>
              </>
            ) : (
              <button
                className="flex max-w-sm flex-col items-center px-6 py-12 text-center"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e4eee8] text-[#2f6f5e]">
                  <Upload className="h-7 w-7" />
                </span>
                <strong className="mt-4 text-base">
                  Kéo thả ảnh căn phòng vào đây
                </strong>
                <span className="mt-2 text-sm leading-6 text-[#737970]">
                  hoặc bấm để chọn ảnh JPG, PNG, WEBP · tối đa 10 MB
                </span>
              </button>
            )}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onFileChange}
              ref={fileInputRef}
              type="file"
            />
          </div>

          <button
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2f6f5e] px-5 text-sm font-bold text-white transition hover:bg-[#255949] disabled:cursor-not-allowed disabled:bg-[#b8bbb7]"
            disabled={!preview || isScanning}
            onClick={scanImage}
            type="button"
          >
            {isScanning ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                AI đang phân tích hình ảnh...
              </>
            ) : (
              <>
                <ScanLine className="h-5 w-5" />
                Quét sản phẩm trong ảnh
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-[#828780]">
            Bản hiện tại minh họa luồng nhận diện; cần nối Vision API để quét
            dữ liệu thật.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Kết quả nhận diện</h3>
              <p className="mt-1 text-xs text-[#747a73]">
                {products.length
                  ? `${confirmedCount}/${products.length} sản phẩm đã xác nhận`
                  : "Chưa có sản phẩm"}
              </p>
            </div>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2f6f5e]"
              onClick={addManualProduct}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Tạo thủ công
            </button>
          </div>

          {products.length === 0 ? (
            <div className="mt-4 grid min-h-[405px] place-items-center rounded-xl border border-[#e4ddd2] bg-[#fbfaf7] p-8 text-center">
              <div>
                <ScanLine className="mx-auto h-10 w-10 text-[#aaa9a4]" />
                <p className="mt-3 text-sm font-bold text-[#666c66]">
                  Kết quả sẽ xuất hiện tại đây
                </p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-[#8a8e89]">
                  AI sẽ đề xuất tên, danh mục, chất liệu, màu sắc và độ tin cậy
                  cho từng đồ vật.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 max-h-[405px] space-y-3 overflow-y-auto pr-1">
              {products.map((product) => {
                const isEditing = editingId === product.id;

                return (
                  <article
                    className={`rounded-xl border p-4 ${
                      product.confirmed
                        ? "border-[#b8d5c7] bg-[#f0f7f3]"
                        : "border-[#e5d6b9] bg-[#fffaf0]"
                    }`}
                    key={product.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                              product.confirmed
                                ? "bg-[#d5e9df] text-[#22614f]"
                                : "bg-[#f4e2bd] text-[#875919]"
                            }`}
                          >
                            {product.confirmed
                              ? "Đã xác nhận"
                              : "AI đề xuất"}
                          </span>
                          <span className="text-[11px] font-bold text-[#6c726c]">
                            Tin cậy {product.confidence}%
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {(
                              [
                                ["name", product.name],
                                ["category", product.category],
                                ["material", product.material],
                                ["color", product.color],
                              ] as const
                            ).map(([field, value]) => (
                              <input
                                className={`h-9 rounded-md border border-[#d4cab9] bg-white px-2 text-xs outline-none focus:border-[#2f6f5e] ${
                                  field === "name" ? "col-span-2 font-bold" : ""
                                }`}
                                key={field}
                                onChange={(event) =>
                                  updateProduct(
                                    product.id,
                                    field,
                                    event.target.value,
                                  )
                                }
                                value={value}
                              />
                            ))}
                          </div>
                        ) : (
                          <>
                            <h4 className="mt-2 truncate text-sm font-bold">
                              {product.name}
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-[#686e68]">
                              {product.category} · {product.material} ·{" "}
                              {product.color}
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        aria-label={`Xóa ${product.name}`}
                        className="text-[#92958f] hover:text-[#a13c31]"
                        onClick={() =>
                          setProducts((current) =>
                            current.filter((item) => item.id !== product.id),
                          )
                        }
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-[#cdc3b4] bg-white text-xs font-bold"
                        onClick={() =>
                          setEditingId((current) =>
                            current === product.id ? null : product.id,
                          )
                        }
                        type="button"
                      >
                        {isEditing ? (
                          <X className="h-3.5 w-3.5" />
                        ) : (
                          <Pencil className="h-3.5 w-3.5" />
                        )}
                        {isEditing ? "Đóng" : "Chỉnh sửa"}
                      </button>
                      <button
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#2f6f5e] text-xs font-bold text-white disabled:bg-[#94b1a5]"
                        disabled={product.confirmed}
                        onClick={() => confirmProduct(product.id)}
                        type="button"
                      >
                        {product.confirmed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {product.confirmed ? "Đã lưu" : "Xác nhận"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {message && (
        <p className="border-t border-[#e6ded1] bg-[#fff5e6] px-5 py-3 text-center text-xs font-bold text-[#8a5b17]">
          {message}
        </p>
      )}
    </section>
  );
}
