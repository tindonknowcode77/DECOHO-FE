"use client";

import Image, {
  type ImageLoaderProps,
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

function passthroughLoader({ src }: ImageLoaderProps) {
  return src;
}

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
      loader={passthroughLoader}
      onError={() => setCurrentSource(FALLBACK_IMAGE)}
      src={currentSource}
      unoptimized
    />
  );
}
