import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  theme?: "dark" | "light";
  variant?: "horizontal" | "mark" | "stacked";
};

const logoByVariant = {
  horizontal: {
    alt: "DECOHO Decorate Your Home",
    defaultClassName: "h-12 w-44",
    sizes: "176px",
    src: "/images/decoho-logo-horizontal.png",
  },
  mark: {
    alt: "DECOHO",
    defaultClassName: "h-12 w-12",
    sizes: "48px",
    src: "/images/decoho-logo-mark.png",
  },
  stacked: {
    alt: "DECOHO Decorate Your Home",
    defaultClassName: "h-40 w-80",
    sizes: "320px",
    src: "/images/decoho-logo-full.png",
  },
};

export default function BrandLogo({
  className,
  variant = "horizontal",
}: BrandLogoProps) {
  const logo = logoByVariant[variant];

  return (
    <span
      className={`relative inline-block overflow-hidden align-middle ${
        className ?? logo.defaultClassName
      }`}
    >
      <Image
        alt={logo.alt}
        className="object-contain"
        fill
        sizes={logo.sizes}
        src={logo.src}
      />
    </span>
  );
}
