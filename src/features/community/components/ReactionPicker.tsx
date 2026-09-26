"use client";

import { useEffect, useRef, useState } from "react";
import { REACTION_LIST, REACTION_META, type ReactionType } from "../types";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerType = useRef("mouse");
  const hoverTimer = useRef<{ id?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    const timer = hoverTimer.current;
    return () => clearTimeout(timer.id);
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

  function handleClickTrigger(event: React.MouseEvent<HTMLButtonElement>) {
    if (busy) return;
    if (event.detail === 0 || pointerType.current !== "mouse") {
      setOpen((value) => !value);
      return;
    }
    const fallback: ReactionType = myReaction ?? "like";
    onPick(fallback);
  }

  function handlePick(type: ReactionType) {
    if (busy) return;
    setOpen(false);
    onPick(type);
  }

  const triggerStyle = myReaction
    ? { color: REACTION_META[myReaction].color }
    : undefined;

  return (
    <div
      className="relative inline-flex"
      onPointerEnter={() => clearTimeout(hoverTimer.current.id)}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        clearTimeout(hoverTimer.current.id);
        hoverTimer.current.id = setTimeout(() => {
          setOpen(false);
          setHoverIdx(null);
        }, 200);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
      ref={containerRef}
    >
      <button
        aria-label="Bày tỏ cảm xúc"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
          myReaction ? "bg-[#fef2f2]" : "text-[#626960] hover:bg-[#f6f2eb]"
        }`}
        disabled={busy}
        onPointerDown={(event) => { pointerType.current = event.pointerType; }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !busy) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && !busy) {
            clearTimeout(hoverTimer.current.id);
            setOpen(true);
          }
        }}
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
                role="menuitem"
                disabled={busy}
                className="flex flex-col items-center"
                key={type}
                onClick={() => handlePick(type)}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{
                  transform: `translateY(${hoverIdx === idx ? -8 : 0}px) scale(${scale})`,
                  transition: "transform 120ms ease",
                }}
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
