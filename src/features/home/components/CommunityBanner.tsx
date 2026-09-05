import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const polaroids = [
  { src: "/images/product-space/urban-warmth.png", user: "Mộc Trà", rotate: -6 },
  { src: "/images/product-space/soft-evening.png", user: "Bảo An", rotate: 4 },
  { src: "/images/moodboards/contemporary-living-moodboard-v2.png", user: "Phương Linh", rotate: -3 },
  { src: "/images/product-space/organic-calm.png", user: "Khánh Vy", rotate: 7 },
];

export default function CommunityBanner() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="grid gap-8 rounded-3xl bg-gradient-to-br from-[#f7f0e0] via-[#fbf5e8] to-[#e9ddca] p-6 sm:p-10 md:grid-cols-[1fr_1fr] lg:gap-12">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#78933c]">
            Diễn đàn DECOHO
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Nơi chia sẻ cảm hứng decor
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#646a61]">
            Chia sẻ không gian, hỏi đáp, gợi ý decor để không gian của bạn luôn
            mới mẻ và đầy cảm hứng cùng hàng nghìn thành viên yêu decor trên
            khắp Việt Nam.
          </p>
          <Link
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#2f6f5e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f3431]"
            href="/community"
          >
            Tham gia diễn đàn
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative grid h-[320px] grid-cols-2 grid-rows-2 gap-3 sm:h-[400px]">
          {polaroids.map((photo, index) => (
            <div
              className="relative overflow-hidden rounded-xl border-[6px] border-white bg-white shadow-xl transition hover:scale-105"
              key={photo.user}
              style={{
                transform: `rotate(${photo.rotate}deg)`,
                zIndex: index % 2 === 0 ? 1 : 2,
              }}
            >
              <div className="relative aspect-square">
                <Image
                  alt={`${photo.user} space`}
                  className="object-cover"
                  fill
                  sizes="(min-width:768px) 25vw,50vw"
                  src={photo.src}
                />
              </div>
              <div className="flex items-center gap-2 p-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d89b47] text-[10px] font-bold text-white">
                  {photo.user.slice(0, 1)}
                </span>
                <span className="font-accent text-xs font-bold text-[#2f6f5e]">
                  @{photo.user.replace(/\s/g, "").toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
