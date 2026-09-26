"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Ellipsis } from "lucide-react";

export default function PostOptions({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    root.current
      ?.querySelector<HTMLButtonElement>("[data-actions] button:not(:disabled)")
      ?.focus();
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div
      ref={root}
      className="relative ml-auto shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
        if (open && ["ArrowDown", "ArrowUp"].includes(event.key)) {
          const buttons = Array.from(
            root.current?.querySelectorAll<HTMLButtonElement>(
              "[data-actions] button:not(:disabled)",
            ) ?? [],
          );
          if (!buttons.length) return;
          event.preventDefault();
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          buttons[
            (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length
          ]?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label="Tùy chọn bài viết"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid h-9 w-9 place-items-center rounded-full text-[#74816b] hover:bg-[#edf2e6]"
      >
        <Ellipsis size={22} />
      </button>
      {open && (
        <div
          data-actions
          role="group"
          aria-label="Thao tác bài viết"
          className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-[#e0e5d7] bg-white p-2 shadow-xl [&_button]:flex [&_button]:w-full [&_button]:items-center [&_button]:justify-start [&_button]:gap-3 [&_button]:rounded-lg [&_button]:border-0 [&_button]:px-3 [&_button]:py-3 [&_button]:text-left [&_button]:text-sm [&_button:hover]:bg-[#f2f5ec] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#2f6f5e]"
        >
          {children}
        </div>
      )}
    </div>
  );
}
