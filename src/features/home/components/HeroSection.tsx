import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="grid gap-8 md:grid-cols-[.9fr_1.1fr] md:items-center lg:gap-12">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#78933c]">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
            <span className="font-accent text-lg font-bold italic">
              Ngôi nhà thật · Cảm hứng thật
            </span>
          </div>

          <h1 className="mt-5 font-serif text-5xl font-black leading-[.95] tracking-tight sm:text-6xl lg:text-7xl">
            Trang trí đúng gu.
            <br />
            Sống trong không gian
            <br />
            <span className="text-[#d89b47]">bạn yêu.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#646a61]">
            Khám phá moodboards, sản phẩm decor được tuyển chọn và trợ lý AI cùng
            diễn đàn để chung tay hoàn thiện không gian sống của bạn.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[#2f6f5e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f3431]"
              href="/product-space"
            >
              Xem Moodboards
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2f6f5e] bg-white px-6 py-3 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
              href="/ai"
            >
              Tìm phong cách của tôi
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="absolute -left-3 top-12 hidden lg:block">
            <Heart
              className="h-6 w-6 text-[#ef6e61] opacity-80"
              strokeWidth={2}
              fill="currentColor"
            />
          </div>
        </div>

        <div className="relative min-h-[480px]">
          <div className="absolute inset-0 overflow-hidden rounded-[40%_18%_36%_22%] border-[8px] border-white bg-[#e9ddca] shadow-[0_25px_60px_rgba(75,57,34,.18)]">
            <Image
              alt="Phòng khách DECOHO"
              className="object-cover"
              fill
              priority
              sizes="(min-width:1024px) 55vw,100vw"
              src="/images/decoho-home-interior-v2.png"
            />
          </div>

          <div className="absolute right-2 top-6 w-44 rotate-6 rounded-lg border-[6px] border-white bg-white p-2 shadow-xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded">
              <Image
                alt="Góc nội thất"
                className="object-cover"
                fill
                sizes="180px"
                src="/images/product-space/urban-warmth.png"
              />
            </div>
            <p className="mt-2 text-xs font-bold">Good vibes, every day ✦</p>
          </div>

          <div className="absolute -bottom-2 left-6 hidden rotate-[-5deg] sm:block">
            <div className="rounded-xl bg-[#c8e976] px-5 py-4 font-accent text-base font-black text-[#2f6f5e] shadow-md">
              YOUR SPACE.
              <br />
              SO YOUR VIBE. ♡
            </div>
          </div>

          <div className="absolute right-12 -top-2 hidden text-5xl text-[#f2c749] lg:block">
            <Star className="h-12 w-12" fill="currentColor" strokeWidth={0} />
          </div>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full bg-[#7e9a3f] px-4 py-2 text-xs font-bold text-white shadow-lg">
            Phòng khách
          </div>

          <div className="absolute bottom-16 left-2 hidden rounded-full bg-white px-3 py-2 shadow-lg sm:block">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d89b47] text-[10px] font-bold text-white">
                AL
              </span>
              <span className="text-xs font-bold text-[#2f6f5e]">
                Sàn gỗ tự nhiên
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
