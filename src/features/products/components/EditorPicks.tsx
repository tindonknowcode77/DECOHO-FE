"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    title: "Color Pop Corner",
    description: "Tông màu táo bạo cho người thích nổi bật",
    image: "/images/products/decor-collection-pop.png",
    count: 16,
    href: "/products?collection=color-pop",
    accent: "bg-[#F2D7D5]",
  },
  {
    title: "Retro Vibes",
    description: "Hơi thở thập niên 70 trong không gian hiện đại",
    image: "/images/products/decor-collection-retro.png",
    count: 22,
    href: "/products?collection=retro",
    accent: "bg-[#F2DBC1]",
  },
  {
    title: "Soft Neutrals",
    description: "Tối giản, tinh tế và đầy ấm áp",
    image: "/images/products/decor-collection-neutral.png",
    count: 24,
    href: "/products?collection=neutral",
    accent: "bg-[#E8DCC6]",
  },
  {
    title: "Study Nook",
    description: "Góc học tập & làm việc tại nhà",
    image: "/images/products/decor-collection-study.png",
    count: 18,
    href: "/products?collection=study",
    accent: "bg-[#D8E2D0]",
  },
];

export default function EditorPicks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Bộ sưu tập nổi bật
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#646a61]">
            Các phong cách được DECOHO tuyển chọn cho từng gu thẩm mỹ riêng
          </p>
        </div>
        <Link
          className="hidden items-center gap-1.5 text-sm font-bold text-[#2f6f5e] transition hover:text-[#7e9a3f] sm:inline-flex"
          href="/products"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <Link
            className="group block overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1 hover:shadow-xl"
            href={collection.href}
            key={collection.title}
          >
            <div
              className={`relative aspect-[4/3] overflow-hidden ${collection.accent}`}
            >
              {collection.image ? (
                <Image
                  alt={collection.title}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  fill
                  sizes="(min-width:1024px) 25vw,50vw"
                  src={collection.image}
                  unoptimized
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-[#898d86]">
                  {collection.title}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-base font-bold text-[#2f6f5e] transition group-hover:text-[#7e9a3f]">
                {collection.title}
              </h3>
              <p className="mt-1 text-xs text-[#646a61]">{collection.description}</p>
              <p className="mt-3 text-xs font-bold text-[#7e9a3f]">
                {collection.count} sản phẩm →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
