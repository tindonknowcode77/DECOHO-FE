"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Rất chưa hài lòng (1 sao)",
  2: "Cần cải thiện (2 sao)",
  3: "Bình thường (3 sao)",
  4: "Hài lòng (4 sao)",
  5: "Rất tuyệt vời! (5 sao)",
};

export default function StarRating({
  value,
  onChange,
  interactive = false,
  size = 20,
  showLabel = false,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`transition duration-150 ${
                interactive
                  ? "cursor-pointer transform hover:scale-115 active:scale-95 focus:outline-none"
                  : "cursor-default"
              }`}
              aria-label={`Đánh giá ${star} sao`}
            >
              <Star
                size={size}
                className={`${
                  isFilled
                    ? "fill-[#f59e0b] text-[#f59e0b]"
                    : "fill-transparent text-[#d1d5db]"
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && displayRating > 0 && (
        <span className="text-xs font-semibold text-[#667266] animate-fadeIn">
          {RATING_LABELS[displayRating]}
        </span>
      )}
    </div>
  );
}
