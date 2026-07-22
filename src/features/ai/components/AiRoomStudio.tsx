"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { roomPresets } from "../mock/roomScan";
import type { HotspotItem, SavedDesign, ViewMode } from "../types";

type IconName =
  | "camera"
  | "check"
  | "compass"
  | "external"
  | "eye"
  | "heart"
  | "help"
  | "image"
  | "layout"
  | "move"
  | "plus"
  | "refresh"
  | "spark"
  | "upload";

type ActiveHotspotItem = HotspotItem & {
  optionIndex: number;
};

const viewModes: { icon: IconName; id: ViewMode; label: string }[] = [
  { icon: "eye", id: "3d", label: "3D" },
  { icon: "compass", id: "2d", label: "2D" },
  { icon: "layout", id: "layout", label: "Layout" },
];

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    camera:
      "M4 8h3l1.5-2h7L17 8h3v11H4V8Zm8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    check: "m5 12 4 4L19 6",
    compass: "m16 8-3 8-5 2 3-8 5-2Zm-4 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    external: "M14 4h6v6m0-6-9 9m-5-5v12h12v-5",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
    help: "M9.1 9a3 3 0 1 1 5.8 1c-.9 1.2-2.1 1.4-2.7 2.6M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    image: "M4 5h16v14H4V5Zm3 10 3.5-4 2.5 3 2-2.2 3 3.2M8 9h.01",
    layout: "M4 5h16v14H4V5Zm0 5h16M10 10v9",
    move: "M12 3v18m0-18-3 3m3-3 3 3m-3 15-3-3m3 3 3-3M3 12h18m-18 0 3-3m-3 3 3 3m15-3-3-3m3 3-3 3",
    plus: "M12 5v14M5 12h14",
    refresh: "M3 12a9 9 0 0 1 15.4-6.4L21 8m0-5v5h-5M21 12a9 9 0 0 1-15.4 6.4L3 16m0 5v-5h5",
    spark:
      "m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z",
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function customizationKey(presetId: string, itemId: string) {
  return `${presetId}:${itemId}`;
}

export default function AiRoomStudio() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const currentPreset = roomPresets[activePresetIndex];
  const [customizations, setCustomizations] = useState<Record<string, number>>({});
  const [selectedHotspotId, setSelectedHotspotId] = useState(currentPreset.items[0].id);
  const [tickedItemIds, setTickedItemIds] = useState<string[]>(
    currentPreset.items.map((item) => item.id),
  );
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPinDragMode, setIsPinDragMode] = useState(false);
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);
  const [pinOverrides, setPinOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [notice, setNotice] = useState<"applied" | "saved" | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const activeItems = useMemo<ActiveHotspotItem[]>(() => {
    return currentPreset.items.map((item) => {
      const optionIndex = customizations[customizationKey(currentPreset.id, item.id)] ?? 0;
      const option = item.options[optionIndex] ?? item.options[0];
      const pinOverride = pinOverrides[customizationKey(currentPreset.id, item.id)];

      return {
        ...item,
        ...option,
        category: item.category,
        id: item.id,
        optionIndex,
        options: item.options,
        reason: item.reason,
        x: pinOverride?.x ?? item.x,
        y: pinOverride?.y ?? item.y,
      };
    });
  }, [currentPreset, customizations, pinOverrides]);

  const selectedItem =
    activeItems.find((item) => item.id === selectedHotspotId) ?? activeItems[0];

  const totalComboPrice = useMemo(
    () => activeItems.reduce((total, item) => total + item.priceVND, 0),
    [activeItems],
  );

  const selectedComboPrice = useMemo(
    () =>
      activeItems
        .filter((item) => tickedItemIds.includes(item.id))
        .reduce((total, item) => total + item.priceVND, 0),
    [activeItems, tickedItemIds],
  );

  const roomBackground = customBgImage ?? currentPreset.bgImage;

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function showNotice(type: "applied" | "saved") {
    setNotice(type);
    window.setTimeout(() => setNotice(null), 2400);
  }

  function updateCustomBackground(file: File) {
    if (!file.type.startsWith("image/")) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setCustomBgImage(nextUrl);
    setIsPinDragMode(true);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      updateCustomBackground(file);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];

    if (file) {
      updateCustomBackground(file);
    }
  }

  function handleSwapOption(itemId: string, optionIndex: number) {
    setCustomizations((current) => ({
      ...current,
      [customizationKey(currentPreset.id, itemId)]: optionIndex,
    }));
    setTickedItemIds((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    );
  }

  function toggleItemTicked(itemId: string) {
    setTickedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  }

  function handlePresetSelect(index: number) {
    const nextPreset = roomPresets[index];

    setActivePresetIndex(index);
    setSelectedHotspotId(nextPreset.items[0]?.id ?? "");
    setTickedItemIds(nextPreset.items.map((item) => item.id));
    setCustomBgImage(null);
    setIsPinDragMode(false);
    setDraggingPinId(null);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingPinId || !viewportRef.current) {
      return;
    }

    const rect = viewportRef.current.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 6, 94);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 8, 90);

    setPinOverrides((current) => ({
      ...current,
      [customizationKey(currentPreset.id, draggingPinId)]: { x, y },
    }));
  }

  function handlePinPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    setSelectedHotspotId(itemId);

    if (!isPinDragMode) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingPinId(itemId);
  }

  function handleSaveDesign() {
    const timestamp = new Date();

    setSavedDesigns((current) => [
      {
        date: timestamp.toLocaleDateString("vi-VN"),
        name: `Bản phối ${current.length + 1}`,
        presetName: currentPreset.vietnameseName,
        total: selectedComboPrice,
      },
      ...current,
    ]);
    showNotice("saved");
  }

  function handleApplyCombo() {
    showNotice("applied");
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#1f2421] sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#b46f2c] shadow-sm">
              <Icon name="spark" />
              AI Preview Studio
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Quét phòng, ghim sản phẩm và thử nhiều phương án nội thất.
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-md border border-[#ded6c9] bg-white p-2 shadow-sm">
            <div className="min-w-24 rounded-md bg-[#fbf7ef] px-3 py-2 text-center">
              <p className="text-lg font-black text-[#2f6f5e]">{currentPreset.areaDesc}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a7662]">
                Diện tích
              </p>
            </div>
            <div className="min-w-24 rounded-md bg-[#fbf7ef] px-3 py-2 text-center">
              <p className="text-lg font-black text-[#2f6f5e]">{activeItems.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a7662]">
                Hotspot
              </p>
            </div>
            <div className="min-w-24 rounded-md bg-[#fbf7ef] px-3 py-2 text-center">
              <p className="text-lg font-black text-[#2f6f5e]">{tickedItemIds.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a7662]">
                Đã chọn
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#ded6c9] bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type="file"
                />
                {viewModes.map((mode) => (
                  <button
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black transition ${
                      viewMode === mode.id
                        ? "bg-[#1f2421] text-[#ffdc18]"
                        : "bg-[#f7f3ec] text-[#51564f] hover:bg-[#eee7dc]"
                    }`}
                    key={`toolbar-${mode.id}`}
                    onClick={() => setViewMode(mode.id)}
                    type="button"
                  >
                    <Icon name={mode.icon} />
                    {mode.label}
                  </button>
                ))}
                <button
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black transition ${
                    customBgImage
                      ? "bg-[#2f6f5e] text-white"
                      : "bg-[#f7f3ec] text-[#51564f] hover:bg-[#eee7dc]"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Icon name={customBgImage ? "check" : "upload"} />
                  {customBgImage ? "Ảnh của bạn" : "Tải ảnh"}
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black transition ${
                    isPinDragMode
                      ? "bg-[#d89b47] text-[#1f2421]"
                      : "bg-[#f7f3ec] text-[#51564f] hover:bg-[#eee7dc]"
                  }`}
                  onClick={() => setIsPinDragMode((current) => !current)}
                  type="button"
                >
                  <Icon name="move" />
                  {isPinDragMode ? "Đang ghim" : "Di chuyển ghim"}
                </button>
              </div>

              <div className="flex max-w-full gap-2 overflow-x-auto">
                {roomPresets.map((preset, index) => (
                  <button
                    className={`shrink-0 rounded-md border px-3 py-2 text-xs font-black transition ${
                      activePresetIndex === index && !customBgImage
                        ? "border-[#1f2421] bg-[#1f2421] text-white"
                        : "border-[#ded6c9] bg-[#fbf7ef] text-[#51564f] hover:border-[#d89b47]"
                    }`}
                    key={`preset-toolbar-${preset.id}`}
                    onClick={() => handlePresetSelect(index)}
                    type="button"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <section
              className={`relative min-h-[720px] overflow-hidden rounded-md border shadow-sm sm:min-h-[760px] ${
                dragOver ? "border-[#d89b47] bg-[#fff7e8]" : "border-[#ded6c9] bg-[#d7cdbc]"
              }`}
              onDragLeave={() => setDragOver(false)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDrop={handleDrop}
              onPointerLeave={() => setDraggingPinId(null)}
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDraggingPinId(null)}
              ref={viewportRef}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                style={{
                  backgroundImage: `url(${roomBackground})`,
                  transform:
                    viewMode === "3d"
                      ? "scale(1.02)"
                      : viewMode === "2d"
                        ? "scale(1)"
                        : "scale(1.04)",
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,36,33,0.42),rgba(31,36,33,0.08)_48%,rgba(255,255,255,0.1))]" />

              {viewMode === "2d" && (
                <div className="absolute inset-5 border border-white/65 bg-white/10">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:44px_44px]" />
                  <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-black text-[#1f2421]">
                    {currentPreset.sizeDesc}
                  </span>
                </div>
              )}

              {viewMode === "layout" && (
                <div className="absolute inset-5 border-2 border-white/80 bg-[#1f2421]/35 p-4">
                  <div className="relative h-full w-full">
                    {activeItems.map((item) => (
                      <button
                        className={`absolute rounded-md border px-2 py-1 text-left text-[10px] font-bold transition ${
                          selectedHotspotId === item.id
                            ? "border-[#ffdc18] bg-[#ffdc18] text-[#1f2421]"
                            : "border-white/65 bg-white/20 text-white"
                        }`}
                        key={`layout-${item.id}`}
                        onClick={() => setSelectedHotspotId(item.id)}
                        style={{
                          left: `${clamp(item.x - 5, 0, 88)}%`,
                          top: `${clamp(item.y - 4, 0, 90)}%`,
                          width: item.id === "sofa" ? "18%" : "13%",
                        }}
                        type="button"
                      >
                        {item.category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="hidden">
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  type="file"
                />
                {viewModes.map((mode) => (
                  <button
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black transition ${
                      viewMode === mode.id
                        ? "bg-[#1f2421] text-[#ffdc18]"
                        : "bg-white/90 text-[#51564f] hover:bg-white"
                    }`}
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    type="button"
                  >
                    <Icon name={mode.icon} />
                    {mode.label}
                  </button>
                ))}
                <button
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black transition ${
                    customBgImage
                      ? "bg-[#2f6f5e] text-white"
                      : "bg-white/90 text-[#51564f] hover:bg-white"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Icon name={customBgImage ? "check" : "upload"} />
                  {customBgImage ? "Ảnh của bạn" : "Tải ảnh"}
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black transition ${
                    isPinDragMode
                      ? "bg-[#d89b47] text-[#1f2421]"
                      : "bg-white/90 text-[#51564f] hover:bg-white"
                  }`}
                  onClick={() => setIsPinDragMode((current) => !current)}
                  type="button"
                >
                  <Icon name="move" />
                  {isPinDragMode ? "Đang ghim" : "Di chuyển"}
                </button>
              </div>

              <div className="hidden">
                <p className="text-xs font-bold uppercase tracking-wide text-[#b46f2c]">
                  {currentPreset.name}
                </p>
                <p className="text-sm font-black text-[#1f2421]">
                  {currentPreset.vietnameseName}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {roomPresets.map((preset, index) => (
                    <button
                      className={`relative aspect-video overflow-hidden rounded-md border transition ${
                        activePresetIndex === index && !customBgImage
                          ? "border-[#1f2421] ring-2 ring-[#1f2421]"
                          : "border-[#eee7dc] opacity-75 hover:opacity-100"
                      }`}
                      key={preset.id}
                      onClick={() => handlePresetSelect(index)}
                      type="button"
                    >
                      <Image
                        alt={preset.name}
                        className="object-cover"
                        fill
                        sizes="110px"
                        src={preset.bgImage}
                      />
                      <span className="absolute inset-x-1 bottom-1 rounded-md bg-[#1f2421]/80 px-1 py-0.5 text-[9px] font-bold text-white">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {activeItems.map((item) => {
                const isSelected = selectedHotspotId === item.id;
                const isTicked = tickedItemIds.includes(item.id);

                return (
                  <button
                    aria-label={`Chọn ${item.name}`}
                    className={`absolute z-20 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 transition ${
                      isSelected
                        ? "border-[#ffdc18] bg-[#ffdc18] text-[#1f2421] shadow-[0_0_0_6px_rgba(255,220,24,0.25),0_0_26px_rgba(255,220,24,0.65)]"
                        : "border-[#ffdc18] bg-[#1f2421]/70 text-[#ffdc18] hover:bg-[#ffdc18] hover:text-[#1f2421]"
                    } ${isPinDragMode ? "cursor-move" : "cursor-pointer"}`}
                    key={item.id}
                    onClick={() => setSelectedHotspotId(item.id)}
                    onPointerDown={(event) => handlePinPointerDown(event, item.id)}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    type="button"
                  >
                    {isTicked ? <Icon name="check" /> : <Icon name="plus" />}
                    {isSelected && (
                      <span className="absolute left-1/2 top-11 min-w-36 -translate-x-1/2 rounded-md bg-white px-3 py-2 text-left text-xs font-bold text-[#1f2421] shadow-lg">
                        {item.name}
                        <span className="mt-1 block text-[10px] font-black uppercase text-[#b46f2c]">
                          {formatPrice(item.priceVND)}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}

              <div
                className="absolute z-30 w-[min(280px,calc(100%-2rem))] rounded-md border border-white/45 bg-white/95 p-3 text-[#1f2421] shadow-2xl shadow-black/20 backdrop-blur"
                style={{
                  left: `${clamp(selectedItem.x + 4, 2, 68)}%`,
                  top: `${clamp(selectedItem.y + 7, 9, 70)}%`,
                }}
              >
                <div className="flex gap-3">
                  <Image
                    alt={selectedItem.name}
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                    height={56}
                    src={selectedItem.image}
                    width={56}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b46f2c]">
                      {selectedItem.category}
                    </p>
                    <h2 className="mt-1 truncate text-sm font-black">{selectedItem.name}</h2>
                    <p className="mt-1 text-xs font-black text-[#2f6f5e]">
                      {formatPrice(selectedItem.priceVND)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#646a61]">
                  {selectedItem.reason}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    className="rounded-md border border-[#ded6c9] bg-[#fbf7ef] px-2 py-2 text-xs font-black text-[#51564f] hover:border-[#d89b47]"
                    onClick={() =>
                      handleSwapOption(
                        selectedItem.id,
                        (selectedItem.optionIndex + 1) % selectedItem.options.length,
                      )
                    }
                    type="button"
                  >
                    Đổi mẫu
                  </button>
                  <button
                    className={`rounded-md px-2 py-2 text-xs font-black ${
                      tickedItemIds.includes(selectedItem.id)
                        ? "bg-[#1f2421] text-white"
                        : "bg-[#2f6f5e] text-white"
                    }`}
                    onClick={() => toggleItemTicked(selectedItem.id)}
                    type="button"
                  >
                    {tickedItemIds.includes(selectedItem.id) ? "Bỏ chọn" : "Chọn"}
                  </button>
                </div>
              </div>

              {dragOver && (
                <div className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-[#1f2421]/35">
                  <div className="rounded-md border border-[#d89b47] bg-[#fff7e8] px-5 py-4 text-center shadow-2xl">
                    <p className="text-sm font-black text-[#8a5d25]">Thả ảnh vào đây</p>
                    <p className="mt-1 text-xs text-[#8a7662]">DECOHO sẽ dùng ảnh này làm nền phòng</p>
                  </div>
                </div>
              )}

              <div className="hidden">
                <div className="rounded-md border border-white/40 bg-white/92 p-3 shadow-2xl shadow-black/20 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                      Đồ nội thất trong ảnh
                    </p>
                    <button
                      className="text-xs font-bold text-[#2f6f5e] hover:underline"
                      onClick={() =>
                        setTickedItemIds((current) =>
                          current.length === activeItems.length
                            ? []
                            : activeItems.map((item) => item.id),
                        )
                      }
                      type="button"
                    >
                      {tickedItemIds.length === activeItems.length ? "Bỏ chọn" : "Chọn tất cả"}
                    </button>
                  </div>

                  <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                    {activeItems.map((item) => {
                      const isSelected = item.id === selectedHotspotId;
                      const isTicked = tickedItemIds.includes(item.id);

                      return (
                        <button
                          className={`flex items-center gap-2 rounded-md border p-2 text-left transition ${
                            isSelected
                              ? "border-[#1f2421] bg-[#1f2421] text-white"
                              : "border-[#eee7dc] bg-[#fbf7ef] text-[#51564f] hover:border-[#d89b47]"
                          }`}
                          key={`dock-${item.id}`}
                          onClick={() => setSelectedHotspotId(item.id)}
                          type="button"
                        >
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                              isTicked
                                ? "border-[#2f6f5e] bg-[#2f6f5e] text-white"
                                : "border-[#ded6c9] bg-white text-transparent"
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleItemTicked(item.id);
                            }}
                          >
                            <Icon name="check" />
                          </span>
                          <Image
                            alt={item.name}
                            className="h-11 w-11 shrink-0 rounded-md object-cover"
                            height={44}
                            src={item.image}
                            width={44}
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-black">{item.name}</span>
                            <span
                              className={`mt-1 block text-[10px] uppercase tracking-wide ${
                                isSelected ? "text-white/60" : "text-[#8a7662]"
                              }`}
                            >
                              {item.category}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-md border border-white/40 bg-white/94 p-3 shadow-2xl shadow-black/20 backdrop-blur">
                  <div className="flex gap-3">
                    <Image
                      alt={selectedItem.name}
                      className="h-24 w-24 shrink-0 rounded-md object-cover"
                      height={96}
                      src={selectedItem.image}
                      width={96}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                        {selectedItem.category}
                      </p>
                      <h2 className="mt-1 truncate text-lg font-black text-[#1f2421]">
                        {selectedItem.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#646a61]">
                        {selectedItem.reason}
                      </p>
                      <p className="mt-2 text-sm font-black text-[#2f6f5e]">
                        {formatPrice(selectedItem.priceVND)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {selectedItem.options.map((option, optionIndex) => {
                      const isCurrent = selectedItem.optionIndex === optionIndex;

                      return (
                        <button
                          className={`rounded-md border px-2 py-2 text-left transition ${
                            isCurrent
                              ? "border-[#1f2421] bg-[#1f2421] text-white"
                              : "border-[#eee7dc] bg-[#fbf7ef] text-[#51564f] hover:border-[#d89b47]"
                          }`}
                          key={`inline-option-${option.name}`}
                          onClick={() => handleSwapOption(selectedItem.id, optionIndex)}
                          type="button"
                        >
                          <span className="block truncate text-[11px] font-black">
                            {option.name}
                          </span>
                          <span
                            className={`mt-1 block truncate text-[10px] ${
                              isCurrent ? "text-white/60" : "text-[#8a7662]"
                            }`}
                          >
                            {formatPrice(option.priceVND)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <div className="rounded-md bg-[#fbf7ef] px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#8a7662]">
                        Đã chọn {tickedItemIds.length}/{activeItems.length}
                      </p>
                      <p className="mt-1 text-sm font-black text-[#2f6f5e]">
                        {formatPrice(selectedComboPrice)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#8a7662]">
                        Gốc {formatPrice(totalComboPrice)}
                      </p>
                    </div>
                    <button
                      className="inline-flex h-full items-center justify-center gap-2 rounded-md bg-[#f7f3ec] px-3 py-2 text-xs font-black text-[#1f2421] hover:bg-[#eee7dc]"
                      onClick={handleSaveDesign}
                      type="button"
                    >
                      <Icon name="heart" />
                      Lưu
                    </button>
                    <button
                      className="inline-flex h-full items-center justify-center gap-2 rounded-md bg-[#2f6f5e] px-3 py-2 text-xs font-black text-white hover:bg-[#285f51]"
                      onClick={handleApplyCombo}
                      type="button"
                    >
                      <Icon name="check" />
                      Mua
                    </button>
                  </div>

                  {savedDesigns.length > 0 && (
                    <p className="mt-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#8a7662]">
                      Đã lưu {savedDesigns.length} bản phối
                    </p>
                  )}
                </div>
              </div>

            </section>

            {false && (
              <section className="hidden">
              <div className="rounded-md border border-[#ded6c9] bg-white p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <Image
                    alt={selectedItem.name}
                    className="h-24 w-24 rounded-md object-cover"
                    height={96}
                    src={selectedItem.image}
                    width={96}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b46f2c]">
                      {selectedItem.category} thiết kế riêng
                    </p>
                    <h2 className="mt-1 text-2xl font-black leading-tight text-[#1f2421]">
                      {selectedItem.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#646a61]">{selectedItem.reason}</p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-[#eee7dc] bg-[#fbf7ef] px-3 py-2">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-[#8a7662]">
                      Kích thước
                    </dt>
                    <dd className="mt-1 text-xs font-black text-[#1f2421]">
                      {selectedItem.dimensions}
                    </dd>
                  </div>
                  <div className="rounded-md border border-[#eee7dc] bg-[#fbf7ef] px-3 py-2">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-[#8a7662]">
                      Chất liệu
                    </dt>
                    <dd className="mt-1 text-xs font-black text-[#1f2421]">
                      {selectedItem.material}
                    </dd>
                  </div>
                  <div className="rounded-md border border-[#eee7dc] bg-[#fbf7ef] px-3 py-2">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-[#8a7662]">
                      Đơn giá
                    </dt>
                    <dd className="mt-1 text-sm font-black text-[#2f6f5e]">
                      {formatPrice(selectedItem.priceVND)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-md border border-[#dfeadf] bg-[#f4faf5] p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[#2f6f5e]">
                      <Icon name="help" />
                    </span>
                    <p className="text-sm leading-6 text-[#51564f]">
                      AI chọn món này vì tỉ lệ, màu và vật liệu đang khớp với khu vực
                      được ghim trong phòng.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7662]">
                    Tùy biến thay thế
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {selectedItem.options.map((option, optionIndex) => {
                      const isCurrent = selectedItem.optionIndex === optionIndex;

                      return (
                        <button
                          className={`flex items-center justify-between gap-3 rounded-md border p-2 text-left transition ${
                            isCurrent
                              ? "border-[#1f2421] bg-[#1f2421] text-white"
                              : "border-[#eee7dc] bg-white text-[#51564f] hover:border-[#d89b47]"
                          }`}
                          key={option.name}
                          onClick={() => handleSwapOption(selectedItem.id, optionIndex)}
                          type="button"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Image
                              alt={option.name}
                              className="h-10 w-10 shrink-0 rounded-md object-cover"
                              height={40}
                              src={option.image}
                              width={40}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold">
                                {option.name}
                              </span>
                              <span
                                className={`mt-0.5 block truncate text-[10px] ${
                                  isCurrent ? "text-white/60" : "text-[#8a7662]"
                                }`}
                              >
                                {option.material}
                              </span>
                            </span>
                          </span>
                          <span
                            className={`text-[11px] font-black ${
                              isCurrent ? "text-[#ffdc18]" : "text-[#2f6f5e]"
                            }`}
                          >
                            {formatPrice(option.priceVND)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-[#ded6c9] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b46f2c]">
                  Liên kết nhanh
                </p>
                <div className="mt-3 grid gap-2">
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d89b47] px-4 py-3 text-sm font-black text-[#1f2421]"
                    href="/showroom"
                  >
                    Xem 3D
                    <Icon name="external" />
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#ded6c9] px-4 py-3 text-sm font-bold text-[#1f2421]"
                    href="/products"
                  >
                    Catalog sản phẩm
                    <Icon name="external" />
                  </Link>
                </div>
              </div>
            </section>
            )}
          </div>

          {false && (
            <aside className="hidden">
            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 border-b border-[#eee7dc] pb-3 text-sm font-black uppercase tracking-wide">
                <Icon name="camera" />
                Cấu hình ảnh nền phòng
              </h2>

              <div
                className={`mt-4 cursor-pointer rounded-md border-2 border-dashed p-5 text-center transition ${
                  customBgImage
                    ? "border-[#2f6f5e] bg-[#f4faf5]"
                    : "border-[#ded6c9] bg-[#fbf7ef] hover:border-[#d89b47]"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  type="file"
                />
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-md bg-white text-[#2f6f5e]">
                  <Icon name={customBgImage ? "check" : "upload"} />
                </span>
                <p className="mt-3 text-sm font-black">
                  {customBgImage ? "Đã nạp ảnh phòng thực tế" : "Tải ảnh phòng thực tế"}
                </p>
                <p className="mt-1 text-xs text-[#646a61]">JPG, PNG hoặc kéo thả vào khung lớn</p>
              </div>

              {customBgImage && (
                <div className="mt-3 rounded-md border border-[#ecd5ab] bg-[#fff7e8] p-3">
                  <div className="flex items-center gap-2 text-xs font-black text-[#8a5d25]">
                    <Icon name="move" />
                    Định vị lại điểm ghim
                  </div>
                  <button
                    className={`mt-3 w-full rounded-md border px-3 py-2 text-xs font-black transition ${
                      isPinDragMode
                        ? "border-[#d89b47] bg-[#d89b47] text-[#1f2421]"
                        : "border-[#ecd5ab] bg-white text-[#8a5d25] hover:bg-[#fff7e8]"
                    }`}
                    onClick={() => setIsPinDragMode((current) => !current)}
                    type="button"
                  >
                    {isPinDragMode ? "Hoàn tất căn chỉnh ghim" : "Bật chế độ di chuyển ghim"}
                  </button>
                </div>
              )}

              <div className="mt-5 border-t border-[#eee7dc] pt-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7662]">
                  Không gian mẫu
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {roomPresets.map((preset, index) => (
                    <button
                      className={`relative aspect-video overflow-hidden rounded-md border transition ${
                        activePresetIndex === index && !customBgImage
                          ? "border-[#1f2421] ring-2 ring-[#1f2421]"
                          : "border-[#eee7dc] opacity-70 hover:opacity-100"
                      }`}
                      key={preset.id}
                      onClick={() => handlePresetSelect(index)}
                      type="button"
                    >
                      <Image
                        alt={preset.name}
                        className="object-cover"
                        fill
                        sizes="120px"
                        src={preset.bgImage}
                      />
                      <span className="absolute inset-x-1 bottom-1 rounded-md bg-[#1f2421]/80 px-1 py-0.5 text-[9px] font-bold text-white">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#eee7dc] pb-3">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
                  <Icon name="layout" />
                  Đồ nội thất trong phòng
                </h2>
                <button
                  className="text-xs font-bold text-[#2f6f5e] hover:underline"
                  onClick={() =>
                    setTickedItemIds((current) =>
                      current.length === activeItems.length
                        ? []
                        : activeItems.map((item) => item.id),
                    )
                  }
                  type="button"
                >
                  {tickedItemIds.length === activeItems.length ? "Bỏ chọn" : "Chọn tất cả"}
                </button>
              </div>

              <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {activeItems.map((item) => {
                  const isSelected = item.id === selectedHotspotId;
                  const isTicked = tickedItemIds.includes(item.id);

                  return (
                    <button
                      className={`flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left transition ${
                        isSelected
                          ? "border-[#1f2421] bg-[#1f2421] text-white"
                          : "border-[#eee7dc] bg-[#fbf7ef] text-[#51564f] hover:border-[#d89b47]"
                      }`}
                      key={item.id}
                      onClick={() => setSelectedHotspotId(item.id)}
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                            isTicked
                              ? "border-[#2f6f5e] bg-[#2f6f5e] text-white"
                              : "border-[#ded6c9] bg-white text-transparent"
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleItemTicked(item.id);
                          }}
                        >
                          <Icon name="check" />
                        </span>
                        <Image
                          alt={item.name}
                          className="h-10 w-10 shrink-0 rounded-md object-cover"
                          height={40}
                          src={item.image}
                          width={40}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-black">{item.name}</span>
                          <span
                            className={`mt-1 block text-[10px] uppercase tracking-wide ${
                              isSelected ? "text-white/60" : "text-[#8a7662]"
                            }`}
                          >
                            {item.category}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`text-[11px] font-black ${
                          isSelected ? "text-[#ffdc18]" : "text-[#2f6f5e]"
                        }`}
                      >
                        {formatPrice(item.priceVND)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-[#eee7dc] pt-4">
                <div className="flex justify-between text-xs text-[#8a7662]">
                  <span>Tổng combo gốc</span>
                  <span className="font-black">{formatPrice(totalComboPrice)}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-xs font-black uppercase tracking-wide">Đã tích chọn</span>
                  <span className="text-lg font-black text-[#2f6f5e]">
                    {formatPrice(selectedComboPrice)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f7f3ec] px-3 py-2 text-xs font-black text-[#1f2421] hover:bg-[#eee7dc]"
                    onClick={handleSaveDesign}
                    type="button"
                  >
                    <Icon name="heart" />
                    Lưu thiết kế
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2f6f5e] px-3 py-2 text-xs font-black text-white hover:bg-[#285f51]"
                    onClick={handleApplyCombo}
                    type="button"
                  >
                    <Icon name="check" />
                    Mua {tickedItemIds.length} món
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 border-b border-[#eee7dc] pb-3 text-sm font-black uppercase tracking-wide">
                <Icon name="heart" />
                Lịch sử lưu bản phối
              </h2>

              {savedDesigns.length > 0 ? (
                <div className="mt-4 max-h-44 space-y-2 overflow-y-auto pr-1">
                  {savedDesigns.map((design) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-md border border-[#eee7dc] bg-[#fbf7ef] p-3 text-xs"
                      key={`${design.name}-${design.date}`}
                    >
                      <span>
                        <span className="block font-black">{design.name}</span>
                        <span className="mt-1 block text-[#8a7662]">
                          {design.presetName} | {design.date}
                        </span>
                      </span>
                      <span className="font-black text-[#2f6f5e]">
                        {formatPrice(design.total)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-md bg-[#fbf7ef] p-4 text-center text-xs text-[#8a7662]">
                  Chưa có bản phối nào được lưu.
                </p>
              )}
            </section>
              </aside>
            )}
        </div>
      </section>

      {notice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-md border border-white/15 bg-[#1f2421] px-5 py-3 text-white shadow-2xl">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#d89b47] text-[#1f2421]">
            <Icon name={notice === "saved" ? "heart" : "check"} />
          </span>
          <span>
            <span className="block text-sm font-black">
              {notice === "saved" ? "Đã lưu thiết kế" : "Đã áp dụng combo"}
            </span>
            <span className="mt-1 block text-xs text-white/60">
              {notice === "saved"
                ? "Bản phối đã được lưu trong lịch sử tạm."
                : "Các món đã chọn đã được đưa vào luồng mua sắm demo."}
            </span>
          </span>
        </div>
      )}
    </main>
  );
}
