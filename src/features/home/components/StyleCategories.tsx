import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Sparkles } from "lucide-react";

const styles = [
  {
    title: "Cozy Bedroom",
    stats: "76 Moodboards · 184 ♥",
    image: "/images/product-space/soft-evening.png",
  },
  {
    title: "Japandi",
    stats: "54 Moodboards · 142 ♥",
    image: "/images/product-space/organic-calm.png",
  },
  {
    title: "Boho Haven",
    stats: "63 Moodboards · 198 ♥",
    image: "/images/product-space/urban-warmth.png",
  },
  {
    title: "Soft Neutral",
    stats: "48 Moodboards · 121 ♥",
    image: "/images/moodboards/contemporary-living-moodboard-v2.png",
  },
  {
    title: "Study Nook",
    stats: "39 Moodboards · 87 ♥",
    image: "/images/product-space/urban-warmth.png",
  },
  {
    title: "Small Space",
    stats: "27 Moodboards · 64 ♥",
    image: "/images/product-space/soft-evening.png",
  },
];

export default function StyleCategories() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#d89b47]" strokeWidth={2.5} />
          <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Khám phá theo phong cách
          </h2>
        </div>
        <Link
            className="inline-flex items-center gap-1 text-sm font-bold text-[#78933c] hover:text-[#2f6f5e]"
            href="/product-space"
        >
          Xem tất cả <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {styles.map((style) => (
          <Link
            className="group overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1"
            href="/product-space"
            key={style.title}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                alt={style.title}
                className="object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(min-width:1024px) 16vw,33vw"
                src={style.image}
              />
              <button
                aria-label="Lưu"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white"
                type="button"
              >
                <Bookmark className="h-4 w-4 text-[#2f6f5e]" />
              </button>
            </div>
            <div className="px-1 pt-3">
              <h3 className="font-bold text-[#2f6f5e]">{style.title}</h3>
              <p className="mt-1 text-xs text-[#646a61]">{style.stats}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
