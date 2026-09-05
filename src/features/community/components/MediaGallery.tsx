"use client";

import Image from "next/image";
import { useState } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { CommunityMedia } from "../types";

export default function MediaGallery({ media }: { media: CommunityMedia[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!media?.length) {
    return <div className="grid aspect-[16/10] place-items-center bg-[#f6f2eb] text-sm text-[#7b8078]">Chưa có ảnh/video</div>;
  }

  const current = media[active];
  const count = media.length;

  function openLightbox(index: number) {
    setLightbox(index);
  }

  function closeLightbox() {
    setLightbox(null);
  }

  function nextLightbox() {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % count);
  }

  function prevLightbox() {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + count) % count);
  }

  const layout = (() => {
    if (count === 1) return "single";
    if (count === 2) return "double";
    if (count === 3) return "triple";
    return "grid";
  })();

  return (
    <>
      <div className="relative bg-[#2f6f5e]">
        {layout === "single" && (
          <button className="block w-full" onClick={() => openLightbox(0)}>
            <MediaItem media={current} className="aspect-[16/10]" priority />
          </button>
        )}

        {layout === "double" && (
          <div className="grid grid-cols-2 gap-0.5">
            {media.map((item, idx) => (
              <button key={idx} className="relative block aspect-square overflow-hidden" onClick={() => openLightbox(idx)}>
                <MediaItem media={item} className="aspect-square" />
              </button>
            ))}
          </div>
        )}

        {layout === "triple" && (
          <div className="grid grid-cols-2 gap-0.5">
            <button className="relative row-span-2 block aspect-square overflow-hidden" onClick={() => openLightbox(0)}>
              <MediaItem media={media[0]} className="aspect-square h-full" />
            </button>
            <button className="relative block aspect-square overflow-hidden" onClick={() => openLightbox(1)}>
              <MediaItem media={media[1]} className="aspect-square" />
            </button>
            <button className="relative block aspect-square overflow-hidden" onClick={() => openLightbox(2)}>
              <MediaItem media={media[2]} className="aspect-square" />
            </button>
          </div>
        )}

        {layout === "grid" && (
          <div className="grid grid-cols-2 gap-0.5">
            {media.slice(0, 4).map((item, idx) => (
              <button key={idx} className="relative block aspect-square overflow-hidden" onClick={() => openLightbox(idx)}>
                <MediaItem media={item} className="aspect-square" />
                {idx === 3 && count > 4 && (
                  <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-bold text-white">
                    +{count - 4}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {count > 1 && layout !== "double" && layout !== "triple" && layout !== "grid" && (
        <div className="flex justify-center gap-1.5 bg-[#2f6f5e] pb-3">
          {media.map((_, idx) => (
            <button
              aria-label={`Xem ảnh ${idx + 1}`}
              className={`h-1.5 rounded-full transition ${idx === active ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
              key={idx}
              onClick={() => setActive(idx)}
            />
          ))}
        </div>
      )}

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4" onClick={closeLightbox}>
          <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); closeLightbox(); }}>
            <X size={20} />
          </button>
          {count > 1 && (
            <>
              <button className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>
                <ChevronLeft size={24} />
              </button>
              <button className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <MediaItem media={media[lightbox]} className="max-h-[90vh] max-w-[90vw] rounded" unoptimizedLarge />
          </div>
          {count > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {lightbox + 1} / {count}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function MediaItem({ media, className = "", priority, unoptimizedLarge }: { media: CommunityMedia; className?: string; priority?: boolean; unoptimizedLarge?: boolean }) {
  if (media.type === "video") {
    return (
      <div className={`relative bg-black ${className}`}>
        <video
          className="h-full w-full object-cover"
          controls={unoptimizedLarge}
          playsInline
          poster={media.thumbnailUrl}
          preload={unoptimizedLarge ? "metadata" : "none"}
        >
          <source src={media.url} />
        </video>
        {!unoptimizedLarge && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#2f6f5e] shadow-lg">
            <Play size={20} fill="currentColor" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        alt="Ảnh bài viết"
        className="object-cover"
        fill
        priority={priority}
        sizes={unoptimizedLarge ? "(max-width: 90vw) 100vw" : "(max-width: 1024px) 100vw, 680px"}
        src={media.url}
        unoptimized
      />
    </div>
  );
}
