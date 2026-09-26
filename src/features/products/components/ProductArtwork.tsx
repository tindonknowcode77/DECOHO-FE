"use client";

import Image from "next/image";
import { useState } from "react";
import { groupArtwork } from "../utils/catalog";
import ProductIllustration from "./ProductIllustration";

export default function ProductArtwork({
  src,
  name,
  category,
  sizes = "(max-width: 640px) 50vw, 350px",
}: {
  src?: string;
  name: string;
  category: string;
  sizes?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const { tone } = groupArtwork(category);
  if (src && src !== failedSource)
    return (
      <Image
        src={src}
        alt={name}
        fill
        unoptimized
        sizes={sizes}
        onError={() => setFailedSource(src)}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    );
  return (
    <div
      role="img"
      aria-label={`${name}: chưa có ảnh sản phẩm`}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: tone }}
    >
      <div className="absolute bottom-[16%] left-[19%] h-[67%] w-[62%] rounded-t-full bg-white/30" />
      <div className="absolute bottom-[17%] h-[8%] w-[48%] rounded-[50%] bg-[#344331]/10 blur-md" />
      <ProductIllustration category={category} />
      <span className="absolute bottom-3 left-0 right-0 text-center text-[9px] uppercase tracking-[0.15em] text-[#536049]/70 sm:text-[10px]">
        Minh họa danh mục
      </span>
    </div>
  );
}
