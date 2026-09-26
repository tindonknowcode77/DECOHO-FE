"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./HomeExperience.module.css";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Layers3,
  Leaf,
  MessageCircle,
  Sofa,
} from "lucide-react";
import { getProducts } from "@/src/features/products/services/productService";
import type { Product } from "@/src/features/products/types";
import ProductCard from "@/src/features/products/components/ProductCard";
import CatalogQuickView from "@/src/features/products/components/CatalogQuickView";
import type { ProductSpace } from "@/src/features/product-space/types";

type Post = {
  _id: string;
  description?: string;
  userId?: { fullName?: string };
  media?: { url?: string; type?: string; thumbnailUrl?: string }[];
};
async function loadList<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(
    /\/$/,
    "",
  );
  const response = await fetch(`${base}/${path}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`Không tải được dữ liệu (${response.status}).`);
  const body = await response.json();
  const items = Array.isArray(body) ? body : body?.items;
  if (!Array.isArray(items)) throw new Error("Dữ liệu trả về chưa hợp lệ.");
  return items;
}
const loadBoards = (signal: AbortSignal) =>
  loadList<ProductSpace>("product-spaces", signal);
const loadPosts = (signal: AbortSignal) =>
  loadList<Post>("community/posts?page=1&limit=3", signal);
function useHomeData<T>(loader: (signal: AbortSignal) => Promise<T[]>) {
  const [state, setState] = useState<{
    data: T[];
    loading: boolean;
    error: string;
  }>({ data: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: "" });
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setState({
            data: [],
            loading: false,
            error:
              e instanceof Error ? e.message : "Chưa kết nối được máy chủ.",
          });
      });
    return () => controller.abort();
  }, [loader, revision]);
  return {
    ...state,
    retry: () => {
      setState((s) => ({ ...s, loading: true, error: "" }));
      setRevision((r) => r + 1);
    },
  };
}

function DataArea({
  state,
  children,
  empty,
}: {
  state: {
    loading: boolean;
    error: string;
    data: unknown[];
    retry: () => void;
  };
  children: ReactNode;
  empty: string;
}) {
  if (state.loading)
    return (
      <div
        aria-label="Đang tải nội dung"
        className="grid grid-cols-2 gap-5 md:grid-cols-3"
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl bg-[#e9e9df] motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  if (state.error)
    return (
      <div
        role="alert"
        className="rounded-2xl border border-[#dedfd3] bg-white p-8 text-center"
      >
        <p className="text-sm text-[#76816d]">{state.error}</p>
        <button
          onClick={state.retry}
          className="mt-4 rounded-full bg-[#2f6f5e] px-5 py-2 text-sm text-white"
        >
          Thử lại
        </button>
      </div>
    );
  if (!state.data.length)
    return (
      <div className="rounded-2xl border border-dashed border-[#d3dacb] p-10 text-center text-sm text-[#75816c]">
        {empty}
      </div>
    );
  return children;
}

function Photo({
  src,
  alt,
  sizes = "(max-width: 640px) 100vw, 33vw",
}: {
  src?: string;
  alt: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState<string>();
  return src && src !== failed ? (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className="object-cover transition duration-700 group-hover:scale-105"
      onError={() => setFailed(src)}
    />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#e9e6dc] text-[#8a9680]">
      <Sofa size={46} strokeWidth={1} />
      <span className="text-[10px] uppercase tracking-widest">
        Đang cập nhật ảnh
      </span>
    </div>
  );
}

function Heading({
  eyebrow,
  title,
  href,
  label,
}: {
  eyebrow: string;
  title: string;
  href: string;
  label: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#899078]">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-3 text-xs font-semibold text-[#2f6f5e] hover:underline"
      >
        {label}
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}

export default function HomeExperience() {
  const pageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!pageRef.current || !("IntersectionObserver" in window)) return;
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const animation = entry.target.animate(
          [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.08 });
    pageRef.current.querySelectorAll("section:not(:first-child), section[aria-label]").forEach(section => observer.observe(section));
    const stop = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
    preference.addEventListener("change", stop);
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); preference.removeEventListener("change", stop); };
  }, []);
  const products = useHomeData(getProducts);
  const boards = useHomeData(loadBoards);
  const posts = useHomeData(loadPosts);
  const [quick, setQuick] = useState<Product | null>(null);
  return (
    <main ref={pageRef} className={`${styles.page} overflow-hidden bg-[#f8f6f0] text-[#293d32]`}>
      <section className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:px-12 lg:py-14">
        <div className="py-3 lg:py-8">
          <p className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#798a69]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b59566]" />
            Decorate your home. Define your style.
          </p>
          <h1 className="text-[44px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">
            Nhà là nơi
            <br />
            bạn được là
            <br />
            <span className="font-serif font-normal italic text-[#65805b]">
              chính mình.
            </span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#7a8271]">
            Từ một góc nhỏ đến cả tổ ấm. Cùng DECOHO tìm cảm hứng, chọn nội thất
            và tạo nên không gian mang dấu ấn của bạn.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/product-space"
              className="inline-flex items-center gap-5 rounded-full bg-[#2f6f5e] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#245b4c]"
            >
              Khám phá cảm hứng
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-3 border-t border-[#e0e3d6] pt-5">
            <Leaf size={24} strokeWidth={1.2} className="text-[#7e916c]" />
            <p className="text-xs leading-5 text-[#879079]">
              Ít hơn một chút. Đúng với bạn hơn một chút.
              <br />
              <span className="text-[#536849]">
                Bắt đầu từ điều bạn yêu thích.
              </span>
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] rounded-tl-[90px] sm:aspect-[6/5]">
            <Image
              src="/images/product-space/organic-calm.png"
              alt="Góc cảm hứng phòng khách với ánh sáng tự nhiên và chất liệu gỗ"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <span className="absolute right-5 top-5 rounded-full border border-white/60 bg-white/85 px-4 py-2 text-[10px] uppercase tracking-[0.17em]">
              Góc cảm hứng · Natural living
            </span>
          </div>
          <div className={`${styles.heroCaption} absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-white/95 px-5 py-4 shadow-lg shadow-black/5 backdrop-blur sm:bottom-7 sm:left-7 sm:right-7`}>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#8c927f]">
                Một chút mộc, một chút yên
              </p>
              <p className="mt-1 font-serif text-2xl">
                Ấm áp từ những điều giản dị
              </p>
            </div>
            <div className="ml-3 hidden gap-1 sm:flex">
              {["#e8dfcf", "#a6ad95", "#8e785f"].map((c) => (
                <span
                  key={c}
                  style={{ background: c }}
                  className="h-7 w-7 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="border-y border-[#e2e5d8] bg-[#edf0e7]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-7 sm:grid-cols-3">
          {[
            {
              icon: Layers3,
              title: "Gom ý tưởng",
              text: "Khám phá moodboard cho tổ ấm",
              href: "/product-space",
            },
            {
              icon: Sofa,
              title: "Chọn điều phù hợp",
              text: "Tìm nội thất theo phong cách của bạn",
              href: "/products",
            },
            {
              icon: MessageCircle,
              title: "Kết nối & sẻ chia",
              text: "Cùng cộng đồng kể chuyện không gian",
              href: "/community",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 sm:justify-center"
            >
              <item.icon
                size={25}
                strokeWidth={1.3}
                className="text-[#779366]"
              />
              <div>
                <p className="text-sm font-semibold group-hover:text-[#2f6f5e]">
                  {item.title}
                </p>
                <p className="mt-1 text-[11px] text-[#8a927e]">{item.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] space-y-16 px-5 py-14 sm:px-8 lg:space-y-20 lg:px-12 lg:py-20">
        <section aria-label="Moodboard trang chủ">
          <Heading
            eyebrow="Mỗi căn phòng, một câu chuyện"
            title="Cảm hứng cho không gian của bạn"
            href="/product-space"
            label="Tất cả moodboards"
          />
          <DataArea
            state={boards}
            empty="Chưa có moodboard công khai. Hãy quay lại để khám phá những ý tưởng mới."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {boards.data.slice(0, 3).map((board) => (
                <Link
                  key={String(board._id ?? board.id)}
                  href={`/product-space/${encodeURIComponent(String(board._id ?? board.id))}`}
                  className="group overflow-hidden rounded-2xl border border-[#e2e4d8] bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Photo
                      src={board.imageUrl}
                      alt={board.title ?? "Moodboard"}
                    />
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-[9px] font-medium uppercase tracking-widest text-[#879379]">
                      {board.productPoints?.length ?? 0} điểm ghim
                    </p>
                    <h3 className="flex items-start justify-between gap-3 text-lg font-semibold leading-snug">
                      {board.title ?? "Moodboard"}
                      <ArrowUpRight className="mt-1 shrink-0" size={18} />
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#808975]">
                      {board.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </DataArea>
        </section>
        <section aria-label="Sản phẩm trang chủ">
          <Heading
            eyebrow="Chi tiết nhỏ, khác biệt lớn"
            title="Tìm mảnh ghép cho tổ ấm"
            href="/products"
            label="Khám phá sản phẩm"
          />
          <DataArea
            state={products}
            empty="Danh mục sản phẩm đang được cập nhật."
          >
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {products.data.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuick}
                />
              ))}
            </div>
          </DataArea>
        </section>
        <section className="grid overflow-hidden rounded-[28px] bg-[#263f34] text-white md:grid-cols-2">
          <div className="relative min-h-64">
            <Image
              src="/images/product-space/soft-evening.png"
              alt="Không gian nội thất gợi ý cho thiết kế"
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs text-[#2f6f5e]">
              <Camera size={15} />
              Từ không gian của bạn
            </div>
          </div>
          <div className="p-8 sm:p-12">
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#bbc9aa]">
              Một khởi đầu mới
            </p>
            <h2 className="text-3xl font-medium leading-tight sm:text-4xl">
              Căn phòng quen.
              <br />
              <span className="font-serif italic text-[#d0d9bb]">
                Một góc nhìn khác.
              </span>
            </h2>
            <p className="mb-7 mt-5 max-w-sm text-sm leading-7 text-[#bcc8b7]">
              Tải ảnh căn phòng và khám phá gợi ý thiết kế cùng AI. Bắt đầu bằng
              chính không gian bạn đang sống.
            </p>
          </div>
        </section>
        <section aria-label="Cộng đồng trang chủ">
          <Heading
            eyebrow="Đẹp hơn khi cùng sẻ chia"
            title="Chuyện nhà, chuyện của chúng mình"
            href="/community"
            label="Ghé thăm diễn đàn"
          />
          <DataArea
            state={posts}
            empty="Chưa có bài viết công khai. Ghé diễn đàn để chia sẻ không gian của bạn."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data.slice(0, 3).map((post) => {
                const media = post.media?.[0];
                return (
                  <Link
                    key={post._id}
                    href={`/community/post/${encodeURIComponent(post._id)}`}
                    className="group overflow-hidden rounded-2xl border border-[#e2e4d8] bg-white"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Photo
                        src={
                          media?.type === "video"
                            ? media.thumbnailUrl
                            : media?.url
                        }
                        alt="Không gian được chia sẻ trong cộng đồng"
                      />
                      {media?.type === "video" && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs">
                          Video
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-[#829170]">
                        {post.userId?.fullName || "Thành viên DECOHO"}
                      </p>
                      <h3 className="mt-3 line-clamp-3 text-base font-medium leading-7">
                        {post.description || "Khám phá bài chia sẻ"}
                      </h3>
                      <p className="mt-5 flex items-center gap-2 text-xs text-[#2f6f5e]">
                        Đọc câu chuyện
                        <ArrowUpRight size={15} />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </DataArea>
        </section>
        <section className="border-t border-[#dce0d1] pt-10 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#8b947c]">
            Không cần hoàn hảo. Chỉ cần là bạn.
          </p>
          <h2 className="font-serif text-3xl italic text-[#58714c] sm:text-4xl">
            Tổ ấm bắt đầu từ một ý tưởng.
          </h2>
          <Link
            href="/product-space"
            className="mt-6 inline-flex items-center gap-4 text-sm font-semibold text-[#2f6f5e]"
          >
            Tìm ý tưởng của mình
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
      {quick && (
        <CatalogQuickView product={quick} onClose={() => setQuick(null)} />
      )}
    </main>
  );
}
