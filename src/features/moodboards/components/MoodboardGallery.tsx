"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Bookmark,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Sofa,
  X,
} from "lucide-react";
import {
  getSavedMoodboardIds,
  saveMoodboardMeta,
  subscribeSavedMoodboards,
  toggleSavedMoodboard,
} from "@/src/features/profile/services/wishlistStorage";

type Board = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  roomType?: string;
  tags?: string[];
  likes?: number;
  createdAt?: string;
  authorName?: string;
  productPoints?: unknown[];
};
const rooms = [
  ["all", "Tất cả"],
  ["living_room", "Phòng khách"],
  ["bedroom", "Phòng ngủ"],
  ["kitchen", "Bếp"],
  ["bathroom", "Phòng tắm"],
  ["office", "Phòng làm việc"],
  ["dining_room", "Phòng ăn"],
  ["outdoor", "Ngoài trời"],
  ["other", "Khác"],
];
const palettes = [
  ["#e9e2d4", "#949b80", "#b48160"],
  ["#e7ded5", "#ae927f", "#756d5c"],
  ["#dfe4db", "#748c77", "#b4aa8b"],
];
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
const roomKey = (s?: string) =>
  s === "study" ? "office" : s === "dining" ? "dining_room" : s === "living" ? "living_room" : s;

function BoardCover({ board, index }: { board: Board; index: number }) {
  const [failed, setFailed] = useState<string>();
  const colors = palettes[index % palettes.length];
  if (board.imageUrl && failed !== board.imageUrl)
    return (
      <Image
        src={board.imageUrl}
        alt={board.title ?? "Moodboard"}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition duration-700 group-hover:scale-105"
        onError={() => setFailed(board.imageUrl)}
      />
    );
  return (
    <div
      className="absolute inset-0 overflow-hidden p-7"
      style={{ background: colors[0] }}
    >
      <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full border border-white/50" />
      <div
        className="absolute bottom-8 left-8 right-8 top-8 flex items-center justify-center gap-3"
        aria-hidden="true"
      >
        <div
          className="h-[75%] w-[38%] rounded-t-full shadow-sm"
          style={{ background: colors[1] }}
        />
        <div className="flex h-[75%] w-[32%] flex-col gap-3">
          <div className="flex-1 bg-[#faf7f0] shadow-sm" />
          <div
            className="h-[40%] shadow-sm"
            style={{ background: colors[2] }}
          />
        </div>
      </div>
      <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-[#455344]">
        Bảng đang cập nhật ảnh
      </span>
    </div>
  );
}

export default function MoodboardGallery({
  source = "product-spaces",
  detailBase = "/product-space",
}: {
  source?: string;
  detailBase?: string;
}) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [room, setRoom] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [savedOnly, setSavedOnly] = useState(false);
  const [filters, setFilters] = useState(false);
  useEffect(() => {
    const timer = setTimeout(
      () => setSaved(new Set(getSavedMoodboardIds())),
      0,
    );
    const unsubscribe = subscribeSavedMoodboards((ids) =>
      setSaved(new Set(ids)),
    );
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL ?? "/backend-api"
        ).replace(/\/$/, "");
        const response = await fetch(`${base}/${source}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(
            `Máy chủ trả về ${response.status}. Vui lòng thử lại.`,
          );
        const body = await response.json();
        const items = Array.isArray(body) ? body : body?.items;
        if (!Array.isArray(items))
          throw new Error("Không đọc được danh sách moodboard.");
        if (!controller.signal.aborted)
          setBoards(items.filter((item) => item && (item._id || item.id)));
      } catch (value) {
        if (!controller.signal.aborted)
          setError(
            value instanceof Error
              ? value.message
              : "Không thể kết nối máy chủ.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [source, revision]);
  const filtered = useMemo(
    () =>
      boards
        .filter(
          (b) =>
            (room === "all" || roomKey(b.roomType) === room) &&
            (!savedOnly || saved.has(String(b._id ?? b.id))) &&
            normalize(
              [b.title, b.description, ...(b.tags ?? [])].join(" "),
            ).includes(normalize(query.trim())),
        )
        .sort((a, b) =>
          sort === "popular"
            ? (b.likes ?? 0) - (a.likes ?? 0)
            : sort === "name"
              ? (a.title ?? "").localeCompare(b.title ?? "", "vi")
              : (Date.parse(b.createdAt ?? "") || 0) -
                (Date.parse(a.createdAt ?? "") || 0),
        ),
    [boards, room, savedOnly, saved, query, sort],
  );
  function save(board: Board) {
    const id = String(board._id ?? board.id);
    if (toggleSavedMoodboard(id))
      saveMoodboardMeta({
        id,
        title: board.title ?? "Moodboard",
        image: board.imageUrl ?? "",
        author: board.authorName,
        roomType: board.roomType,
        productCount: board.productPoints?.length ?? 0,
        savedAt: Date.now(),
      });
  }
  function reset() {
    setRoom("all");
    setQuery("");
    setSavedOnly(false);
  }
  return (
    <main className="min-h-screen bg-[#f8f6f0] text-[#263e34]">
      <div className="mx-auto max-w-[1320px] px-5 pb-20 pt-6 sm:px-8 lg:px-12">
        <nav
          aria-label="Đường dẫn"
          className="mb-7 flex gap-3 text-xs text-[#7a8175]"
        >
          <Link href="/" className="hover:text-[#2f6f5e]">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-[#2f6f5e]">Moodboards</span>
        </nav>
        <section className="grid overflow-hidden rounded-[28px] bg-[#e9eee5] md:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col items-start justify-center px-7 py-10 sm:p-12">
            <span className="mb-5 text-[10px] font-bold uppercase tracking-[0.26em] text-[#63765d]">
              DECOHO · Không gian & cảm hứng
            </span>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
              Một ý tưởng nhỏ.
              <br />
              <span className="font-serif font-normal italic text-[#597553]">
                Một không gian riêng.
              </span>
            </h1>
            <p className="mb-7 mt-5 max-w-sm text-sm leading-7 text-[#677362]">
              Gom những điều bạn yêu thích. Khám phá cách màu sắc, chất liệu và
              nội thất cùng tạo nên một tổ ấm.
            </p>
            <a
              href="#moodboard-collection"
              className="inline-flex items-center gap-5 rounded-full bg-[#2f6f5e] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#245746]"
            >
              Khám phá bộ sưu tập <ArrowDown size={16} />
            </a>
          </div>
          <div className="relative min-h-64 md:min-h-[390px]">
            <Image
              src="/images/product-space/organic-calm.png"
              alt="Không gian nội thất với chất liệu và sắc màu tự nhiên"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#7c8375]">
                  Góc cảm hứng
                </p>
                <p className="mt-1 font-serif text-xl">Chạm vào sự bình yên</p>
              </div>
              <div className="flex -space-x-1">
                {["#e9e1d0", "#a2ac8d", "#827058"].map((c) => (
                  <span
                    key={c}
                    className="h-7 w-7 rounded-full border-2 border-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="moodboard-collection" className="scroll-mt-24 pt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.23em] text-[#8b8e7d]">
                Tìm cảm hứng của bạn
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Khám phá Moodboards
                <span className="ml-3 align-middle text-sm font-normal text-[#8a9180]">
                  {!loading && !error ? `(${boards.length})` : ""}
                </span>
              </h2>
            </div>
            <label className="flex w-full items-center gap-2 rounded-full border border-[#dedfd2] bg-white px-4 py-3 sm:w-72">
              <Search size={17} className="shrink-0 text-[#7d8979]" />
              <input
                aria-label="Tìm moodboard"
                placeholder="Tên, phong cách, chất liệu…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
              {query && (
                <button aria-label="Xóa tìm kiếm" onClick={() => setQuery("")}>
                  <X size={15} />
                </button>
              )}
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dedfd2] pb-5">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {rooms.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRoom(key)}
                  aria-pressed={room === key}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium transition ${room === key ? "bg-[#2f6f5e] text-white" : "bg-white text-[#64705e] hover:bg-[#e9eee5]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFilters(!filters)}
              aria-expanded={filters}
              className="inline-flex items-center gap-2 rounded-full border border-[#dedfd2] px-4 py-2 text-xs"
            >
              <SlidersHorizontal size={14} />
              Bộ lọc
              {savedOnly && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#2f6f5e]" />
              )}
            </button>
          </div>
          {filters && (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#e9eee5] p-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                  className="accent-[#2f6f5e]"
                />
                Chỉ xem moodboard đã lưu
              </label>
              <button onClick={reset} className="underline underline-offset-4">
                Đặt lại
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 py-6">
            <p aria-live="polite" className="text-xs text-[#7a8373]">
              {loading
                ? "Đang tìm cảm hứng…"
                : error
                  ? "Chưa tải được bộ sưu tập"
                  : `${filtered.length} moodboard dành cho bạn`}
            </p>
            <div className="flex items-center gap-3">
              <select
                aria-label="Sắp xếp moodboard"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="max-w-36 bg-transparent text-xs outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Yêu thích nhiều nhất</option>
                <option value="name">Tên A–Z</option>
              </select>
              <div className="hidden gap-1 border-l border-[#dedfd2] pl-3 sm:flex">
                {[
                  ["grid", LayoutGrid],
                  ["list", List],
                ].map(([key, Icon]) => {
                  const ViewIcon = Icon as typeof List;
                  return (
                    <button
                      key={String(key)}
                      aria-label={
                        key === "grid" ? "Dạng lưới" : "Dạng danh sách"
                      }
                      aria-pressed={view === key}
                      onClick={() => setView(String(key))}
                      className={`rounded-lg p-2 ${view === key ? "bg-[#e3e9de]" : "text-[#9a9f92]"}`}
                    >
                      <ViewIcon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {loading ? (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Đang tải moodboard"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-[#e9e9df] motion-reduce:animate-none"
                />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-3xl border border-[#e0d9c9] bg-white p-12 text-center"
            >
              <Sofa className="mx-auto mb-4 text-[#8b9a81]" size={36} />
              <h3 className="text-xl font-medium">Chưa tải được moodboards</h3>
              <p className="mt-2 text-sm text-[#777f70]">{error}</p>
              <button
                onClick={() => setRevision((n) => n + 1)}
                className="mt-5 rounded-full bg-[#2f6f5e] px-6 py-3 text-sm text-white"
              >
                Thử lại
              </button>
            </div>
          ) : !filtered.length ? (
            <div className="rounded-3xl border border-dashed border-[#d2d8c8] py-16 text-center">
              <Sofa className="mx-auto mb-4 text-[#99a68c]" size={40} />
              <h3 className="text-xl font-medium">
                {boards.length
                  ? "Chưa tìm thấy moodboard phù hợp"
                  : "Bộ sưu tập đang được chuẩn bị"}
              </h3>
              <p className="mt-2 text-sm text-[#7a8373]">
                {boards.length
                  ? "Thử một từ khóa hoặc không gian khác nhé."
                  : "Những ý tưởng mới sẽ sớm xuất hiện tại đây."}
              </p>
              {boards.length > 0 && (
                <button
                  onClick={reset}
                  className="mt-5 text-sm underline underline-offset-4"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid gap-5"
              }
            >
              {filtered.map((board, index) => {
                const id = String(board._id ?? board.id);
                const isSaved = saved.has(id);
                return (
                  <article
                    key={id}
                    className={`group overflow-hidden rounded-[22px] border border-[#e6e6dc] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#31482b]/5 ${view === "list" ? "sm:grid sm:grid-cols-[280px_1fr]" : ""}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Link
                        href={`${detailBase}/${encodeURIComponent(id)}`}
                        aria-label={`Xem ${board.title ?? "moodboard"}`}
                        className="absolute inset-0"
                      >
                        <BoardCover board={board} index={index} />
                      </Link>
                      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-medium backdrop-blur">
                        {rooms.find(
                          ([key]) => key === roomKey(board.roomType),
                        )?.[1] ?? "Không gian sống"}
                      </span>
                      <button
                        aria-label={
                          isSaved
                            ? `Bỏ lưu ${board.title}`
                            : `Lưu ${board.title}`
                        }
                        aria-pressed={isSaved}
                        onClick={() => save(board)}
                        className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full shadow-sm transition ${isSaved ? "bg-[#2f6f5e] text-white" : "bg-white/95 text-[#40553e] hover:bg-white"}`}
                      >
                        <Bookmark
                          size={16}
                          fill={isSaved ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <div className="flex flex-col justify-center p-5 sm:p-6">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {(board.tags ?? []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#8e967e]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold leading-snug tracking-tight">
                        <Link
                          href={`${detailBase}/${encodeURIComponent(id)}`}
                          className="hover:text-[#2f6f5e]"
                        >
                          {board.title ?? "Moodboard không tên"}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#808775]">
                        {board.description ||
                          "Khám phá ý tưởng cho không gian sống của bạn."}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-[#efefe7] pt-4">
                        <span className="text-[11px] text-[#85907b]">
                          {board.productPoints?.length ?? 0} điểm ghim
                        </span>
                        <Link
                          href={`${detailBase}/${encodeURIComponent(id)}`}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-[#2f6f5e]"
                        >
                          Khám phá <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#dee2d3] px-7 py-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl">
              Lưu lại điều khiến bạn rung động.
            </h2>
            <p className="mt-2 text-xs leading-6 text-[#7b8572]">
              Nhấn biểu tượng đánh dấu để giữ những ý tưởng yêu thích cho tổ ấm
              của mình.
            </p>
          </div>
          <button
            onClick={() => {
              setSavedOnly(true);
              setFilters(true);
              document
                .getElementById("moodboard-collection")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex shrink-0 items-center gap-3 rounded-full border border-[#8da184] px-5 py-3 text-xs font-medium"
          >
            <Bookmark size={15} />
            Xem bảng đã lưu
          </button>
        </div>
      </div>
    </main>
  );
}
