"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bath,
  Bed,
  BookOpen,
  Bookmark,
  ChevronDown,
  Eye,
  Grid3X3,
  Heart,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Sofa,
  Sun,
  Tag,
  Utensils,
} from "lucide-react";
import type { Moodboard } from "../types";
import { fetchMoodboards } from "../services/moodboardsService";
import {
  getSavedMoodboardIds,
  saveMoodboardMeta,
  subscribeSavedMoodboards,
  toggleSavedMoodboard,
  type SavedMoodboard,
} from "@/src/features/profile/services/wishlistStorage";

const ROOM_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "living_room", label: "Phòng khách" },
  { id: "bedroom", label: "Phòng ngủ" },
  { id: "kitchen", label: "Bếp" },
  { id: "bathroom", label: "Phòng tắm" },
  { id: "office", label: "Phòng làm việc" },
  { id: "dining_room", label: "Phòng ăn" },
  { id: "outdoor", label: "Ngoài trời" },
  { id: "other", label: "Khác" },
];

const ROOM_ICONS: Record<string, typeof Bed> = {
  living_room: Sofa,
  bedroom: Bed,
  kitchen: Utensils,
  bathroom: Bath,
  study: BookOpen,
  office: BookOpen,
  dining_room: Utensils,
  dining: Utensils,
  outdoor: Sun,
  other: LayoutGrid,
};

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Nhiều ♥ nhất" },
  { value: "most_viewed", label: "Nhiều lượt xem" },
];

export default function MoodboardsExplorePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadMoodboards = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const items = await fetchMoodboards();
      setMoodboards(items);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách moodboards. Vui lòng thử lại.",
      );
      setMoodboards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMoodboards();
  }, [loadMoodboards]);

  useEffect(() => {
    setSavedIds(new Set(getSavedMoodboardIds()));
    return subscribeSavedMoodboards((ids) => setSavedIds(new Set(ids)));
  }, []);

  const filtered = useMemo(() => {
    let result = moodboards;

    if (activeTab !== "all") {
      result = result.filter((m) => m.roomType === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(query) ||
          m.authorName?.toLowerCase().includes(query) ||
          m.tags?.some((t) => t.toLowerCase().includes(query)),
      );
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.likes ?? 0) - (a.likes ?? 0);
        case "most_viewed":
          return (b.views ?? 0) - (a.views ?? 0);
        case "oldest":
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
        default: // newest
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      }
    });
  }, [moodboards, activeTab, sortBy, searchQuery]);

  const themesByTag = useMemo(() => {
    const map = new Map<string, Moodboard[]>();
    moodboards.forEach((m) => {
      m.tags?.forEach((tag) => {
        const list = map.get(tag) ?? [];
        list.push(m);
        map.set(tag, list);
      });
    });
    return Array.from(map.entries())
      .map(([tag, boards]) => ({
        cover: boards[0]?.imageUrl ?? "",
        count: boards.length,
        boards,
        tag,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [moodboards]);

  const roomsByType = useMemo(() => {
    return ROOM_TABS.filter((tab) => tab.id !== "all")
      .map((tab) => {
        const boards = moodboards.filter((m) => m.roomType === tab.id);
        return { id: tab.id, label: tab.label, boards, count: boards.length };
      })
      .filter((group) => group.count > 0);
  }, [moodboards]);

  function toggleSave(board: Moodboard) {
    const id = String(board.moodboardId ?? board._id ?? board.id ?? "");
    if (!id) return;
    const nowSaved = toggleSavedMoodboard(id);
    if (nowSaved) {
      const meta: SavedMoodboard = {
        author: board.authorName ?? "Ẩn danh",
        id,
        image: board.imageUrl ?? "",
        productCount: board.productsCount ?? board.productPoints?.length ?? 0,
        roomType: board.roomType,
        savedAt: Date.now(),
        title: board.title ?? "Moodboard không tên",
      };
      saveMoodboardMeta(meta);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf6ee]">
      {/* Page Header */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[#646a61]">
              <Link className="transition hover:text-[#2f6f5e]" href="/">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-[#2f6f5e]">Moodboards</span>
            </nav>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Khám phá Moodboards
            </h1>
            <p className="mt-2 text-sm text-[#646a61]">
              {loading
                ? "Đang tải danh sách moodboards..."
                : loadError
                  ? "Không thể tải moodboards — vui lòng thử lại"
                  : `Cộng đồng đã tạo ${moodboards.length.toLocaleString("vi-VN")} moodboards để bạn tham khảo`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[var(--header-height,64px)] z-30 border-y border-[#e8e1d4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ROOM_TABS.map((tab) => (
              <button
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-[#2f6f5e] text-white"
                    : "border border-[#e8e1d4] text-[#2f6f5e] hover:border-[#2f6f5e]"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="appearance-none rounded-full border border-[#e8e1d4] bg-white px-4 py-2 pr-8 text-xs font-bold text-[#2f6f5e] focus:border-[#2f6f5e] focus:outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#646a61]"
                strokeWidth={2.5}
              />
            </div>

            <div className="flex rounded-full border border-[#e8e1d4]">
              <button
                className={`grid h-9 w-9 place-items-center rounded-l-full transition ${
                  viewMode === "grid" ? "bg-[#2f6f5e] text-white" : "bg-white text-[#646a61]"
                }`}
                onClick={() => setViewMode("grid")}
                type="button"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                className={`grid h-9 w-9 place-items-center rounded-r-full transition ${
                  viewMode === "list" ? "bg-[#2f6f5e] text-white" : "bg-white text-[#646a61]"
                }`}
                onClick={() => setViewMode("list")}
                type="button"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              className="hidden items-center gap-1.5 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] transition hover:border-[#2f6f5e] sm:flex"
              type="button"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Moodboard Grid */}
      <div className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        {loading ? (
          <div className="grid min-h-[400px] place-items-center">
            <div className="text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e8e1d4] border-t-[#7e9a3f]" />
              <p className="mt-4 text-sm text-[#646a61]">Đang tải moodboards...</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="grid min-h-[400px] place-items-center text-center">
            <div>
              <Sofa className="mx-auto h-16 w-16 text-[#d9d1c4]" strokeWidth={1.5} />
              <h2 className="mt-6 text-xl font-bold text-[#bc3d2b]">
                Không tải được moodboards
              </h2>
              <p className="mt-2 text-sm text-[#646a61]">{loadError}</p>
              <button
                className="mt-4 rounded-full border border-[#2f6f5e] px-5 py-2 text-sm font-bold transition hover:bg-[#f7f3ec]"
                onClick={() => void loadMoodboards()}
                type="button"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid min-h-[400px] place-items-center text-center">
            <div>
              <Sofa className="mx-auto h-16 w-16 text-[#d9d1c4]" strokeWidth={1.5} />
              <h2 className="mt-6 text-xl font-bold text-[#2f6f5e]">
                Không tìm thấy moodboard nào
              </h2>
              <p className="mt-2 text-sm text-[#646a61]">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                className="mt-4 rounded-full border border-[#2f6f5e] px-5 py-2 text-sm font-bold transition hover:bg-[#f7f3ec]"
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                type="button"
              >
                Xoá bộ lọc
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((board) => {
              const id = String(board.moodboardId ?? board._id ?? board.id ?? "");
              const isSaved = savedIds.has(id);
              return (
                <article
                  className="group overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  key={id}
                >
                  <Link href={`/moodboards/${id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f3ec]">
                      {board.imageUrl ? (
                        <Image
                          alt={board.title ?? "Moodboard"}
                          className="object-cover transition duration-500 group-hover:scale-105"
                          fill
                          sizes="(min-width:1280px) 25vw,(min-width:768px) 33vw,50vw"
                          src={board.imageUrl}
                          unoptimized
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-sm text-[#898d86]">
                          Chưa có ảnh
                        </div>
                      )}

                      <button
                        aria-label={isSaved ? "Bỏ lưu" : "Lưu moodboard"}
                        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur transition hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSave(board);
                        }}
                        type="button"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isSaved ? "text-[#d89b47]" : "text-[#2f6f5e]"}`}
                          fill={isSaved ? "currentColor" : "none"}
                        />
                      </button>

                      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-bold backdrop-blur">
                        <Heart className="h-3.5 w-3.5 text-[#ef6e61]" fill="currentColor" />
                        {board.likes ?? 0}
                      </div>

                      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-bold backdrop-blur">
                        <Eye className="h-3.5 w-3.5 text-[#2f6f5e]" />
                        {board.views ?? 0}
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/moodboards/${id}`}>
                      <h3 className="font-bold text-[#2f6f5e] transition hover:text-[#7e9a3f]">
                        {board.title ?? "Moodboard không tên"}
                      </h3>
                    </Link>
                    <p className="mt-1.5 text-xs text-[#646a61]">
                      By {board.authorName ?? "Ẩn danh"} ·{" "}
                      {board.productsCount ?? board.productPoints?.length ?? 0} sản phẩm
                    </p>

                    {board.tags && board.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {board.tags.slice(0, 3).map((tag) => (
                          <span
                            className="rounded-full bg-[#f5f0e8] px-2.5 py-1 text-[10px] font-bold text-[#646a61]"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((board) => {
              const id = String(board.moodboardId ?? board._id ?? board.id ?? "");
              const isSaved = savedIds.has(id);
              return (
                <article
                  className="flex gap-4 overflow-hidden rounded-2xl bg-white p-4 transition hover:shadow-lg"
                  key={id}
                >
                  <Link className="shrink-0" href={`/moodboards/${id}`}>
                    <div className="relative h-24 w-32 overflow-hidden rounded-xl bg-[#f7f3ec] sm:h-32 sm:w-44">
                      {board.imageUrl && (
                        <Image
                          alt={board.title ?? "Moodboard"}
                          className="object-cover"
                          fill
                          sizes="176px"
                          src={board.imageUrl}
                          unoptimized
                        />
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/moodboards/${id}`}>
                          <h3 className="font-bold text-[#2f6f5e] transition hover:text-[#7e9a3f]">
                            {board.title ?? "Moodboard không tên"}
                          </h3>
                        </Link>
                        <button
                          aria-label={isSaved ? "Bỏ lưu" : "Lưu"}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e8e1d4] transition hover:bg-[#f7f3ec]"
                          onClick={() => toggleSave(board)}
                          type="button"
                        >
                          <Bookmark
                            className={`h-4 w-4 ${isSaved ? "text-[#d89b47]" : "text-[#646a61]"}`}
                            fill={isSaved ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-[#646a61]">
                        By {board.authorName ?? "Ẩn danh"}
                      </p>
                      {board.tags && board.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {board.tags.map((tag) => (
                            <span
                              className="rounded-full bg-[#f5f0e8] px-2 py-0.5 text-[10px] font-bold text-[#646a61]"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs text-[#646a61]">
                        <Heart className="h-3.5 w-3.5 text-[#ef6e61]" fill="currentColor" />
                        {board.likes ?? 0}
                      </span>
                      <span className="text-xs text-[#646a61]">
                        {board.productsCount ?? board.productPoints?.length ?? 0} sản phẩm
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-8 text-center">
            <button
              className="rounded-full border border-[#2f6f5e] px-8 py-3 text-sm font-bold transition hover:bg-[#f7f3ec]"
              type="button"
            >
              Tải thêm moodboards
            </button>
          </div>
        )}
      </div>

      {/* Themes by tag */}
      {themesByTag.length > 0 && (
        <section className="mx-auto mt-12 max-w-7xl px-5 pb-12 sm:px-8">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf3e9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#5b7a32]">
                <Tag className="h-3.5 w-3.5" />
                Theo chủ đề
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#2f6f5e] sm:text-3xl">
                Bộ sưu tập theo chủ đề
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themesByTag.map((theme) => {
              const firstId = String(theme.boards[0]?.moodboardId ?? theme.boards[0]?._id ?? theme.boards[0]?.id ?? "");
              return (
                <Link
                  className="group relative overflow-hidden rounded-2xl border border-[#e8e1d4] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  href={`/moodboards/${firstId}`}
                  key={theme.tag}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#f7f3ec]">
                    {theme.cover ? (
                      <Image
                        alt={theme.tag}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(min-width:1024px) 33vw,(min-width:640px) 50vw,100vw"
                        src={theme.cover}
                        unoptimized
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-[#898d86]">
                        Chưa có ảnh
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2f3a2c]/70 via-[#2f3a2c]/20 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-center justify-between gap-2 text-white">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                          Chủ đề
                        </p>
                        <h3 className="mt-1 font-serif text-xl font-bold leading-tight">
                          {theme.tag}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#2f6f5e]">
                        {theme.count} moodboards
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Explore by room */}
      {roomsByType.length > 0 && (
        <section className="mx-auto mt-4 max-w-7xl px-5 pb-16 sm:px-8">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#b56a3d]">
                <LayoutGrid className="h-3.5 w-3.5" />
                Theo phòng
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#2f6f5e] sm:text-3xl">
                Khám phá theo phòng
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roomsByType.map((room) => {
              const Icon = ROOM_ICONS[room.id] ?? LayoutGrid;
              return (
                <Link
                  className="group flex flex-col items-center rounded-2xl border border-[#e8e1d4] bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  href={`/moodboards?room=${room.id}`}
                  key={room.id}
                >
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#eaf3e9] to-[#f5efe3] text-[#2f6f5e] ring-4 ring-white shadow-md transition group-hover:scale-110">
                    <Icon className="h-10 w-10" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 font-bold text-[#2f6f5e] transition group-hover:text-[#7e9a3f]">
                    {room.label}
                  </h3>
                  <span className="mt-1 rounded-full bg-[#f5f0e8] px-2.5 py-1 text-[11px] font-bold text-[#646a61]">
                    {room.count} moodboards
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
