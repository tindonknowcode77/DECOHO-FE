"use client";

import * as React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/src/lib/utils";

export type InfiniteMovingCardItem = {
  id?: string | number;
  title?: string;
  description?: string;
  image?: string;
  avatar?: string;
  name?: string;
  role?: string;
  rating?: number;
  tags?: string[];
};

export type InfiniteMovingCardsProps<
  T extends InfiniteMovingCardItem = InfiniteMovingCardItem,
> = {
  items: T[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
  cardClassName?: string;
  maskClassName?: string;
  gap?: number;
  loop?: boolean;
  showGradientMask?: boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
};

const SPEED_PX_PER_SEC: Record<
  NonNullable<InfiniteMovingCardsProps["speed"]>,
  number
> = {
  slow: 26,
  normal: 44,
  fast: 74,
};

function renderStars(rating: number) {
  const stars = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: stars }, (_, i) => (
    <span key={`star-${i}`} className="text-amber-400">
      ★
    </span>
  ));
}

export function InfiniteMovingCards<
  T extends InfiniteMovingCardItem = InfiniteMovingCardItem,
>({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
  cardClassName,
  maskClassName,
  gap = 16,
  loop = true,
  showGradientMask = true,
  renderItem,
}: InfiniteMovingCardsProps<T>) {
  const reduceMotion = useReducedMotion() === true;
  const x = useMotionValue(0);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [singleWidth, setSingleWidth] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);

  const safeItems = items ?? [];
  const repeatCount =
    loop && safeItems.length > 0
      ? Math.max(2, Math.ceil(6 / safeItems.length))
      : 1;
  const renderedItems = React.useMemo(() => {
    if (!loop || safeItems.length === 0) return safeItems;
    const result: T[] = [];
    for (let i = 0; i < repeatCount; i += 1) {
      result.push(...safeItems);
    }
    return result;
  }, [loop, repeatCount, safeItems]);

  React.useLayoutEffect(() => {
    const viewportNode = viewportRef.current;
    const trackNode = trackRef.current;
    if (!viewportNode || !trackNode) return;

    const measure = () => {
      const full = trackNode.scrollWidth;
      const widthPerSet =
        loop && repeatCount > 0 ? (full + gap) / repeatCount : full;
      setSingleWidth(widthPerSet);
      setViewportWidth(viewportNode.clientWidth);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewportNode);
    observer.observe(trackNode);
    return () => observer.disconnect();
  }, [gap, loop, repeatCount, safeItems.length]);

  React.useEffect(() => {
    if (singleWidth <= 0) return;
    x.set(direction === "right" ? -singleWidth : 0);
  }, [direction, singleWidth, x]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || safeItems.length === 0) return;
    if (!loop && safeItems.length <= 1) return;
    if (pauseOnHover && hovered) return;
    if (singleWidth <= 0) return;

    const velocity = SPEED_PX_PER_SEC[speed] * (delta / 1000);
    const nextRaw = x.get() + (direction === "left" ? -velocity : velocity);

    if (loop) {
      let wrapped = nextRaw;
      if (direction === "left" && wrapped <= -singleWidth)
        wrapped += singleWidth;
      if (direction === "right" && wrapped >= 0) wrapped -= singleWidth;
      x.set(wrapped);
      return;
    }

    if (direction === "left") {
      const limit = -Math.max(0, singleWidth - viewportWidth);
      x.set(Math.max(limit, nextRaw));
    } else {
      x.set(Math.min(0, nextRaw));
    }
  });

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={pauseOnHover ? () => setHovered(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setHovered(false) : undefined}
    >
      <div ref={viewportRef} className="overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex w-max py-2"
          style={{
            x: reduceMotion ? 0 : x,
            gap,
          }}
        >
          {renderedItems.map((item, idx) => {
            const key = `${item.id ?? "item"}-${idx}`;
            if (renderItem) {
              return (
                <div key={key} className={cn("shrink-0", cardClassName)}>
                  {renderItem(item, idx)}
                </div>
              );
            }

            return (
              <article
                key={key}
                className={cn(
                  "shrink-0 overflow-hidden rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] shadow-xs transition-transform hover:-translate-y-0.5 hover:border-[#2f6f5e]/50 hover:bg-white",
                  cardClassName,
                )}
                style={{
                  minWidth: "min(20rem, calc(100vw - 4rem))",
                  maxWidth: 356,
                }}
              >
                {item.image ? (
                  <div className="h-36 w-full overflow-hidden border-b border-[#ded6c9]">
                    <img
                      src={item.image}
                      alt={item.title ?? "Card image"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="space-y-3 p-5">
                  {item.title ? (
                    <h3 className="text-base font-semibold tracking-tight text-[#17211b]">
                      {item.title}
                    </h3>
                  ) : null}
                  {item.description ? (
                    <p className="text-sm leading-relaxed text-[#5c645a]">
                      {item.description}
                    </p>
                  ) : null}

                  {typeof item.rating === "number" ? (
                    <div className="flex items-center gap-0.5 text-sm">
                      {renderStars(item.rating)}
                    </div>
                  ) : null}

                  {item.tags?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#e2ddd1] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#5c645a]"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {item.avatar || item.name || item.role ? (
                    <div className="flex items-center gap-2.5 pt-1">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name ?? "Avatar"}
                          className="size-8 rounded-full border border-[#ded6c9] object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div>
                        {item.name ? (
                          <p className="text-xs font-bold text-[#17211b]">
                            {item.name}
                          </p>
                        ) : null}
                        {item.role ? (
                          <p className="text-[10px] text-[#708164]">
                            {item.role}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>

      {showGradientMask ? (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 bg-gradient-to-r from-white via-white/70 to-transparent",
              maskClassName,
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-white via-white/70 to-transparent",
              maskClassName,
            )}
          />
        </>
      ) : null}
    </div>
  );
}

export default InfiniteMovingCards;
