import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronDown, Sparkles } from "lucide-react";

const boards = [
  { title: "Retro Vinyl Lounge", author: "Mộc Trà", likes: 312, image: "/images/product-space/urban-warmth.png", saved: false },
  { title: "Warm Study Corner", author: "Bảo An", likes: 198, image: "/images/product-space/organic-calm.png", saved: true },
  { title: "Soft Minimal Bedroom", author: "Phương Linh", likes: 421, image: "/images/product-space/soft-evening.png", saved: false },
  { title: "Color Pop Bedroom", author: "Mỹ Duyên", likes: 256, image: "/images/moodboards/contemporary-living-moodboard-v2.png", saved: false },
  { title: "Pastel Dream Room", author: "Khánh Vy", likes: 187, image: "/images/product-space/soft-evening.png", saved: false },
  { title: "Japandi Curve Living", author: "Thanh Hà", likes: 342, image: "/images/product-space/organic-calm.png", saved: true },
  { title: "Cozy Neutral Retreat", author: "Ngọc Trinh", likes: 278, image: "/images/moodboards/contemporary-living-moodboard-v2.png", saved: false },
  { title: "Cheerful Bedroom", author: "Hà My", likes: 164, image: "/images/product-space/urban-warmth.png", saved: false },
  { title: "Compact & Cozy", author: "Tú Anh", likes: 219, image: "/images/product-space/soft-evening.png", saved: false },
  { title: "Zen × Plant Corner", author: "Trúc Linh", likes: 295, image: "/images/product-space/organic-calm.png", saved: true },
];

export default function FeaturedMoodboards() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#d89b47]" strokeWidth={2.5} />
          <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Moodboard nổi bật
          </h2>
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-full border border-[#e8e1d4] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
          type="button"
        >
          Sắp xếp: Mới nhất
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {boards.map((board) => (
          <Link
            className="group overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1"
            href="/product-space"
            key={board.title}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                alt={board.title}
                className="object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(min-width:1024px) 18vw,33vw"
                src={board.image}
              />
              <button
                aria-label="Lưu moodboard"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur transition hover:bg-white"
                type="button"
              >
                <Bookmark
                  className={`h-4 w-4 ${board.saved ? "text-[#d89b47]" : "text-[#2f6f5e]"}`}
                  fill={board.saved ? "currentColor" : "none"}
                />
              </button>
            </div>
            <div className="px-1 pt-3">
              <h3 className="font-bold text-[#2f6f5e]">{board.title}</h3>
              <p className="mt-1 text-xs text-[#646a61]">
                By {board.author} · ♥ {board.likes}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
