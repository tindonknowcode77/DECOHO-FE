"use client";

import Image from "next/image";
import { useState } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { CommunityMedia } from "../types";
import CommunityDialog from "./CommunityDialog";

export default function MediaGallery({ media }: { media: CommunityMedia[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (!media?.length) return null;
  const selected = active === null ? null : media[active % media.length];
  return (
    <>
      <div
        className={`grid gap-1 bg-[#eff1e9] ${media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {media.slice(0, 4).map((item, index) => (
          <button
            type="button"
            key={`${item.url}-${index}`}
            aria-label={`Xem ${item.type === "video" ? "video" : "ảnh"} ${index + 1}`}
            onClick={() => setActive(index)}
            className={`relative block overflow-hidden ${media.length === 1 ? "aspect-[4/3] max-h-[540px]" : "aspect-square"}`}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.url}
                  poster={item.thumbnailUrl}
                  preload="metadata"
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="rounded-full bg-white/90 p-3 text-[#31523e]">
                    <Play size={24} />
                  </span>
                </span>
              </>
            ) : (
              <Image
                src={item.url}
                alt={`Không gian được chia sẻ, ảnh ${index + 1}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition duration-500 hover:scale-[1.03]"
              />
            )}
            {index === 3 && media.length > 4 && (
              <span className="absolute inset-0 grid place-items-center bg-black/50 text-3xl font-semibold text-white">
                +{media.length - 4}
              </span>
            )}
          </button>
        ))}
      </div>
      {selected && active !== null && (
        <CommunityDialog
          title={`Ảnh & video · ${active + 1}/${media.length}`}
          onClose={() => setActive(null)}
        >
          <div className="relative min-h-0 flex-1 bg-[#17271e]">
            {selected.type === "video" ? (
              <video
                key={selected.url}
                src={selected.url}
                controls
                playsInline
                autoPlay
                className="h-[65dvh] w-full object-contain"
              />
            ) : (
              <div className="relative h-[65dvh] w-full">
                <Image
                  src={selected.url}
                  alt={`Ảnh ${active + 1}`}
                  fill
                  unoptimized
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
            )}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  onClick={() =>
                    setActive((active - 1 + media.length) % media.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#284b38]"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  aria-label="Ảnh tiếp theo"
                  onClick={() => setActive((active + 1) % media.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#284b38]"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </CommunityDialog>
      )}
    </>
  );
}
