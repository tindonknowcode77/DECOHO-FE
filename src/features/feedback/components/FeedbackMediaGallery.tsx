"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import type { FeedbackMedia } from "../types";

export default function FeedbackMediaGallery({
  media,
}: {
  media?: FeedbackMedia[];
}) {
  const [activeItem, setActiveItem] = useState<FeedbackMedia | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-1">
        {media.map((item, idx) => (
          <button
            key={`${item.url}-${idx}`}
            type="button"
            onClick={() => setActiveItem(item)}
            className="group relative h-16 w-16 overflow-hidden rounded-xl border border-[#ded6c9] bg-[#f7f3ec] transition hover:border-[#2f6f5e]"
            title={item.type === "video" ? "Xem video đánh giá" : "Phóng to ảnh đánh giá"}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white transition group-hover:bg-black/45">
                  <Play size={16} className="fill-white" />
                </span>
              </>
            ) : (
              <img
                src={item.thumbnailUrl || item.url}
                alt={`Ảnh đánh giá ${idx + 1}`}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            )}
          </button>
        ))}
      </div>

      {activeItem && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setActiveItem(null)}
        >
          <button
            type="button"
            aria-label="Đóng xem ảnh/video"
            onClick={() => setActiveItem(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-[#17211b] shadow-lg transition hover:bg-white"
          >
            <X size={20} />
          </button>

          <div
            className="max-h-[88vh] max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.type === "video" ? (
              <video
                src={activeItem.url}
                controls
                autoPlay
                playsInline
                className="max-h-[85vh] max-w-full"
              />
            ) : (
              <img
                src={activeItem.url}
                alt="Ảnh thực tế khi nhận hàng"
                className="max-h-[85vh] max-w-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
