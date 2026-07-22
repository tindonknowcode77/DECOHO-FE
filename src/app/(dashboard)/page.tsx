import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/src/components/common/BrandLogo";

const heroImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=85&w=1800";

const styles = [
  {
    name: "Japandi",
    tone: "Gỗ sáng, vải thô, đường nét gọn",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=700",
  },
  {
    name: "Indochine",
    tone: "Mây tre, họa tiết nhiệt đới, chất hoài cổ",
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=700",
  },
  {
    name: "Modern",
    tone: "Mặt phẳng sạch, đá, kính và ánh sáng",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=700",
  },
];

const steps = [
  "Tải ảnh hoặc chọn phòng mẫu",
  "AI đọc bố cục, ánh sáng và vật liệu",
  "Nhận gợi ý sản phẩm và bản phối 3D",
];

const highlights = [
  {
    title: "Phân tích không gian",
    text: "Nhận diện hiện trạng phòng, vùng ánh sáng, lối đi và điểm nhấn cần tối ưu.",
  },
  {
    title: "Gợi ý sản phẩm",
    text: "Liên kết sofa, bàn, đèn, thảm và đồ trang trí theo ngân sách thực tế.",
  },
  {
    title: "Showroom 3D",
    text: "Xem thử cách đồ nội thất xuất hiện trong không gian trước khi quyết định.",
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[#1f2421]">
      <section className="relative isolate overflow-hidden bg-[#1f2421]">
        <Image
          alt="Phòng khách hiện đại với sofa sáng màu và ánh nắng tự nhiên"
          className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
          sizes="100vw"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171b18]/90 via-[#1f2421]/64 to-[#1f2421]/26" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f7f3ec] via-[#f7f3ec]/72 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl items-center px-5 py-12 text-white sm:px-8 lg:min-h-[560px] lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold uppercase">
              <SparkIcon />
              Thiết kế nội thất bằng AI cho nhà Việt
            </div>

            <BrandLogo className="h-36 w-80 max-w-full" theme="light" variant="stacked" />
            <p className="mt-5 max-w-2xl text-xl font-medium leading-8 text-[#f7ead7] sm:text-2xl">
              Biến ảnh căn phòng thành bản phối nội thất, danh sách sản phẩm và trải
              nghiệm showroom 3D chỉ trong một quy trình.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d89b47] px-6 py-3 text-sm font-bold text-[#1f2421] transition hover:bg-[#e4aa5b]"
                href="/ai"
              >
                Phân tích bằng AI
                <ArrowIcon />
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                href="/showroom"
              >
                Xem showroom 3D
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative z-20 mx-auto -mt-14 grid max-w-7xl scroll-mt-24 gap-3 px-5 sm:grid-cols-3 sm:px-8 lg:-mt-16"
        id="process"
      >
        {steps.map((step, index) => (
          <div
            className="rounded-md border border-[#ded6c9] bg-[#fffaf1] p-5 shadow-sm"
            key={step}
          >
            <span className="text-xs font-bold text-[#b46f2c]">0{index + 1}</span>
            <p className="mt-2 text-sm font-semibold text-[#2b302b]">{step}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-bold uppercase text-[#2f6f5e]">Không gian thông minh</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Một home studio cho toàn bộ hành trình trang trí nhà.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#646a61]">
            DECOHO kết nối cảm hứng, phân tích AI, catalog sản phẩm và phòng
            mẫu 3D để bạn chọn nội thất có căn cứ hơn, nhanh hơn và ít rủi ro
            hơn.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <article className="rounded-md bg-white p-5 shadow-sm" key={item.title}>
              <h3 className="text-base font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#676d64]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#263a34] py-14 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-[#d89b47]">Phong cách nổi bật</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Chọn gu thiết kế trước khi mua từng món đồ.
              </h2>
            </div>
            <Link
              className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-[#263a34]"
              href="/products"
            >
              Xem catalog
              <ArrowIcon />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {styles.map((style) => (
              <article className="overflow-hidden rounded-md bg-white text-[#1f2421]" key={style.name}>
                <Image
                  alt={`Không gian nội thất phong cách ${style.name}`}
                  className="h-48 w-full object-cover"
                  height={360}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  src={style.image}
                  width={560}
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold">{style.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#646a61]">{style.tone}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="grid grid-cols-2 gap-4">
          <Image
            alt="Góc bàn ăn với ghế gỗ và đèn trang trí"
            className="h-64 w-full rounded-md object-cover"
            height={520}
            sizes="(min-width: 1024px) 30vw, 50vw"
            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800"
            width={520}
          />
          <Image
            alt="Phòng ngủ sáng với chất liệu vải và gỗ"
            className="mt-8 h-64 w-full rounded-md object-cover"
            height={520}
            sizes="(min-width: 1024px) 30vw, 50vw"
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800"
            width={520}
          />
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-[#b46f2c]">Từ ý tưởng đến thi công</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Gợi ý đẹp phải đi cùng kích thước, ngân sách và cách sống.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#646a61]">
            Trang home này mở đường cho các module đã chuẩn bị trong dự án:
            catalog sản phẩm, showroom, AI assistant, project cá nhân và bộ
            designer 3D.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2421] px-5 py-3 text-sm font-bold text-white"
              href="/products"
            >
              Khám phá sản phẩm
              <ArrowIcon />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cfc6b8] px-5 py-3 text-sm font-bold text-[#1f2421]"
              href="/register"
            >
              Tạo tài khoản
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#ded6c9] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#62675f] sm:flex-row">
          <BrandLogo className="h-12 w-40" variant="horizontal" />
          <p>AI interior platform for modern homes.</p>
        </div>
      </footer>
    </main>
  );
}
