"use client";

import { useEffect, useRef, useState } from "react";
import {
  REACTION_LIST,
  REACTION_META,
  type ReactionType,
} from "../types";

type ReactionPickerProps = {
  myReaction: ReactionType | null;
  busy?: boolean;
  onPick: (type: ReactionType) => void;
  children: React.ReactNode;
};

export default function ReactionPicker({
  myReaction,
  busy,
  onPick,
  children,
}: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleEnter() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  function handleLeave() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 200);
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleClickTrigger() {
    if (busy) return;
    const fallback: ReactionType = myReaction ?? "like";
    onPick(fallback);
  }

  function handlePick(type: ReactionType) {
    setOpen(false);
    onPick(type);
  }

  const triggerStyle = myReaction
    ? { color: REACTION_META[myReaction].color }
    : undefined;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={containerRef}
    >
      <button
        aria-label="Bày tỏ cảm xúc"
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
          myReaction
            ? "bg-[#fef2f2]"
            : "text-[#626960] hover:bg-[#f6f2eb]"
        }`}
        disabled={busy}
        onClick={handleClickTrigger}
        style={triggerStyle}
        type="button"
      >
        {children}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 z-30 mb-2 flex items-end gap-1 rounded-full bg-white px-3 py-2 shadow-xl ring-1 ring-[#e8e1d4]"
          role="menu"
        >
          {REACTION_LIST.map((type, idx) => {
            const meta = REACTION_META[type];
            const scale = hoverIdx === null ? 1 : hoverIdx === idx ? 1.6 : 1.1;
            return (
              <button
                aria-label={meta.label}
                className="flex flex-col items-center"
                key={type}
                onClick={() => handlePick(type)}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ transform: `translateY(${hoverIdx === idx ? -8 : 0}px) scale(${scale})`, transition: "transform 120ms ease" }}
                type="button"
              >
                <span className="text-2xl leading-none">{meta.emoji}</span>
                {hoverIdx === idx && (
                  <span className="mt-1 whitespace-nowrap rounded-full bg-[#2f6f5e] px-2 py-0.5 text-[10px] font-bold text-white">
                    {meta.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
