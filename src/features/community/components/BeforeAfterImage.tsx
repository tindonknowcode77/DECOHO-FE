"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function BeforeAfterImage({ before, after }: { before: string; after: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);

  function move(clientX: number) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }

  return (
    <div
      className="relative aspect-[16/10] cursor-ew-resize select-none overflow-hidden bg-[#e9e2d7]"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        move(event.clientX);
      }}
      onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && move(event.clientX)}
      ref={frame}
    >
      <Image alt="Không gian sau khi cải tạo" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 680px" src={after} unoptimized />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image alt="Không gian trước khi cải tạo" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 680px" src={before} unoptimized />
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-[#252921]/80 px-3 py-1 text-[11px] font-bold text-white">TRƯỚC</span>
      <span className="absolute right-3 top-3 rounded-full bg-[#7f9e37] px-3 py-1 text-[11px] font-bold text-white">SAU</span>
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${position}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#79953a] text-sm font-bold text-white shadow-lg">↔</span>
      </div>
    </div>
  );
}
