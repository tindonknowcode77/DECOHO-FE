import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const spaces = [
  { label: "Phòng khách", active: true },
  { label: "Phòng ngủ", active: false },
  { label: "Phòng làm việc", active: false },
  { label: "Bếp", active: false },
  { label: "Phòng tắm", active: false },
];

const pins = [
  { top: "15%", left: "20%", label: "Đèn bàn" },
  { top: "65%", left: "12%", label: "Thảm lông" },
  { top: "45%", right: "8%", label: "Tranh treo" },
];

export default function ShopBySpace() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="grid gap-8 rounded-3xl bg-[#f5efe3] p-6 sm:p-8 md:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:p-10">
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Mua theo không gian
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#646a61]">
              Chọn một không gian bạn yêu thích dưới 30m² và xem các sản phẩm
              được gợi ý phù hợp với phong cách của bạn.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {spaces.map((space) => (
                <button
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                    space.active
                      ? "border-[#2f6f5e] bg-[#2f6f5e] text-white"
                      : "border-[#ded6c9] bg-white text-[#2f6f5e] hover:border-[#2f6f5e]"
                  }`}
                  key={space.label}
                  type="button"
                >
                  {space.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 hidden md:block">
            <h3 className="font-serif text-xl font-bold">
              Bắt đầu với phòng nhỏ chưa tới 4m²?
            </h3>
            <Link
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f6f5e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2f3431]"
              href="/products"
            >
              Xem gợi ý sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-3">
              <Link
                className="inline-flex items-center gap-1 text-sm font-bold text-[#78933c] hover:text-[#2f6f5e]"
                href="/products"
              >
                Xem tất cả không gian <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-[6px] border-white bg-[#e9ddca] shadow-xl">
            <Image
              alt="Phòng ngủ vintage"
              className="object-cover"
              fill
              sizes="(min-width:1024px) 55vw,100vw"
              src="/images/product-space/soft-evening.png"
            />

            {pins.map((pin) => (
              <div
                className="absolute flex items-center gap-2"
                key={pin.label}
                style={pin}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border-[3px] border-white bg-[#d89b47] text-xs font-bold text-white shadow-lg">
                  ✦
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-md">
                  {pin.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
