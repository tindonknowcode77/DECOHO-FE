"use client";

import Image, {
  type ImageProps,
} from "next/image";
import { useState } from "react";

type ProductImageProps = Omit<
  ImageProps,
  "loader" | "onError" | "src" | "unoptimized"
> & {
  src: string;
};

const FALLBACK_IMAGE = "/images/decoho-home-interior-v2.png";

export default function ProductImage({
  alt,
  src,
  ...imageProps
}: ProductImageProps) {
  const [currentSource, setCurrentSource] = useState(src || FALLBACK_IMAGE);

  return (
    <Image
      {...imageProps}
      alt={alt}
      onError={() => setCurrentSource(FALLBACK_IMAGE)}
      src={currentSource}
      unoptimized={
        currentSource.startsWith("data:") || currentSource.startsWith("blob:")
      }
    />
  );
}
