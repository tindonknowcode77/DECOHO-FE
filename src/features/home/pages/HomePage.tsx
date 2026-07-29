import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/src/components/common/BrandLogo";

const roomMoments = [
  {
    index: "01",
    title: "Chạm vào sản phẩm",
    description:
      "Khám phá sofa, bàn trà và vật liệu ngay trong những không gian nội thất hoàn chỉnh.",
    href: "/product-space",
    action: "Mở Product Space",
    icon: "scan",
  },
  {
    index: "02",
    title: "Chọn đúng gu",
    description:
      "Thử bảng màu, vật liệu và sản phẩm phù hợp với nhịp sống, diện tích và ngân sách.",
    href: "/products",
    action: "Xem sản phẩm",
    icon: "palette",
  },
  {
    index: "03",
    title: "Bước vào không gian",
    description:
      "Kéo thả nội thất, quan sát tỷ lệ thật và xem căn phòng của bạn từ mọi góc độ trong 3D.",
    href: "/showroom",
    action: "Mở phòng 3D",
    icon: "cube",
  },
] as const;

const principles = [
  "Bản phối được xây từ căn phòng và thói quen của bạn.",
  "Sản phẩm hiển thị cùng kích thước, vật liệu và bối cảnh sử dụng.",
  "Quyết định đẹp hơn trước khi mua và thi công.",
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

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12 4.2 4L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.3"
      />
    </svg>
  );
}

function FeatureIcon({
  name,
}: {
  name: (typeof roomMoments)[number]["icon"];
}) {
  const paths = {
    cube: "m21 16-9 5-9-5m18 0v-8l-9-5-9 5v8m18-8-9 5-9-5m9 5v10",
    palette:
      "M12 3a9 9 0 1 0 0 18h1.4a1.6 1.6 0 0 0 0-3.2h-.8a1.7 1.7 0 0 1 0-3.4h1.9A5.5 5.5 0 0 0 20 8.9C20 5.6 16.4 3 12 3Zm-4.7 8.2h.01m3.2-3.1h.01m3.8 0h.01m2.2 3.3h.01",
    scan: "M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3m3-4h10",
  };

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f8f4ed] pt-2 text-[#1d2721]">
      <section className="relative isolate mx-2 min-h-[620px] overflow-hidden rounded-lg bg-[#192a24] text-white shadow-[0_18px_50px_rgba(31,40,33,.16)] sm:mx-3 lg:min-h-[680px]">
        <video
          aria-label="Không gian phòng ăn và phòng khách hiện đại"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover object-center"
          disablePictureInPicture
          loop
          muted
          playsInline
          poster="/images/decoho-home-hero-v2.png"
          preload="auto"
        >
          <source
            src="/videos/decoho-home-hero.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,31,26,.92)_0%,rgba(23,37,30,.74)_35%,rgba(23,37,30,.2)_69%,rgba(18,29,24,.16)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8f4ed] to-transparent" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-5 pb-24 pt-14 sm:px-8 lg:min-h-[680px] lg:pb-28">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#24382f]/65 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#f4c978] backdrop-blur-sm">
              <SparkIcon />
              Nội thất mang dấu ấn của bạn
            </p>
            <h1 className="mt-7 text-5xl font-bold leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              DECOHO
            </h1>
            <p className="mt-5 max-w-xl text-xl font-medium leading-8 text-[#f5ead9] sm:text-2xl">
              Nhìn thấy căn nhà bạn đang mơ ước, trước khi đặt một món đồ
              vào giỏ hàng.
            </p>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/76">
              Quét không gian, thử nhiều phương án nội thất và bước vào bản
              phối 3D được tạo cho chính ngôi nhà của bạn.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e4a33c] px-5 py-3.5 text-sm font-bold text-[#17251f] shadow-sm transition hover:bg-[#f2bc61]"
                href="/product-space"
              >
                Khám phá Product Space
                <ArrowIcon />
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                href="/showroom"
              >
                Khám phá showroom 3D
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 px-8 lg:flex lg:items-center lg:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/58">
            Một ngôi nhà, nhiều cách để sống
          </p>
          <a
            className="inline-flex items-center gap-2 text-sm font-bold text-[#f6d28d] transition hover:text-white"
            href="#journey"
          >
            Khám phá hành trình
            <ArrowIcon />
          </a>
        </div>
      </section>

      <section
        className="relative z-10 mx-auto -mt-12 max-w-7xl px-5 sm:-mt-14 sm:px-8"
        id="journey"
      >
        <div className="rounded-lg border border-[#d8cfbe] bg-[#fffdf8] p-5 shadow-[0_18px_45px_rgba(54,42,25,.12)] sm:p-7">
          <div className="flex flex-col gap-2 border-b border-[#e7dfd1] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a76227]">
                Hành trình không gian
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#1d2721] sm:text-3xl">
                Ba bước để căn nhà thành của riêng bạn.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#647068]">
              Từ hiện trạng đến một căn phòng có thể chạm, đo và trải nghiệm
              trong 3D.
            </p>
          </div>

          <div className="mt-2 grid divide-y divide-[#e7dfd1] md:grid-cols-3 md:divide-x md:divide-y-0">
            {roomMoments.map((moment) => (
              <Link
                className="group block px-0 py-6 md:px-5 md:first:pl-0"
                href={moment.href}
                key={moment.index}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#b8732d]">
                    {moment.index}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-md border border-[#d8cfbe] bg-white text-[#2e705f] shadow-sm transition group-hover:border-[#2e705f] group-hover:bg-[#2e705f] group-hover:text-white">
                    <FeatureIcon name={moment.icon} />
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#1d2721]">
                  {moment.title}
                </h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[#667068]">
                  {moment.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#246252] transition group-hover:gap-3">
                  {moment.action}
                  <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-9 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -left-3 -top-3 h-full w-full rounded-lg border border-[#d99639]/70 sm:-left-5 sm:-top-5" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#dfd4c3] shadow-[0_16px_40px_rgba(65,50,31,.14)]">
            <Image
              alt="Phòng khách với sofa thấp, bàn gỗ và ánh nắng ấm"
              className="h-full w-full object-cover"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src="/images/decoho-home-interior-v2.png"
            />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#8a765e]">
            Một buổi chiều trong căn nhà của bạn
          </p>
        </div>

        <div className="order-1 lg:order-2 lg:pl-10">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a76227]">
            Không chỉ là một bản vẽ
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-[#1d2721] sm:text-5xl">
            Thiết kế bắt đầu từ cảm giác bạn muốn trở về mỗi ngày.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#5e675f]">
            DECOHO giúp bạn chuyển những điều khó gọi tên thành một phương án
            rõ ràng: màu sắc, ánh sáng, vật liệu và từng món đồ đặt đúng chỗ.
          </p>
          <ul className="mt-8 space-y-4 border-y border-[#ded5c5] py-6">
            {principles.map((principle) => (
              <li
                className="flex gap-3 text-sm font-semibold leading-6 text-[#314039]"
                key={principle}
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2c705f] text-white">
                  <CheckIcon />
                </span>
                {principle}
              </li>
            ))}
          </ul>
          <Link
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-[#d6c9b6] bg-white px-4 py-3 text-sm font-bold text-[#1d2721] shadow-sm transition hover:border-[#d99639] hover:text-[#a76227]"
            href="/process"
          >
            Xem quy trình thiết kế
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="border-y border-[#ded5c5] bg-[#eee9e0] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8b6548]">
                Moodboard · Living room
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-[#1d2721] sm:text-5xl">
                Contemporary Calm
              </h2>
              <p className="mt-5 max-w-md text-base leading-8 text-[#606960]">
                Một không gian đương đại cân bằng giữa đường nét mềm, bảng màu
                trung tính và những bề mặt gỗ ấm. Mỗi chi tiết được chọn để căn
                phòng thanh lịch nhưng vẫn gần gũi.
              </p>

              <div className="mt-8 border-y border-[#d3c9ba] py-6">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#737970]">
                  Bảng màu chủ đạo
                </p>
                <div className="mt-4 flex gap-2">
                  {[
                    { color: "#eeeae2", name: "Warm white" },
                    { color: "#c4c0b8", name: "Stone" },
                    { color: "#8a8b76", name: "Sage" },
                    { color: "#76533b", name: "Walnut" },
                    { color: "#cdb99b", name: "Oatmeal" },
                    { color: "#383a38", name: "Charcoal" },
                  ].map((swatch) => (
                    <span
                      className="group relative h-10 flex-1 rounded-sm border border-black/10 shadow-sm"
                      key={swatch.name}
                      style={{ backgroundColor: swatch.color }}
                      title={swatch.name}
                    >
                      <span className="pointer-events-none absolute left-1/2 top-12 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#1d2721] px-2 py-1 text-[10px] font-bold text-white group-hover:block">
                        {swatch.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
                {[
                  ["Phong cách", "Contemporary"],
                  ["Không khí", "Tĩnh · Ấm"],
                  ["Vật liệu", "Gỗ · Boucle"],
                  ["Điểm nhấn", "Sage green"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-[#83877f]">{label}</p>
                    <p className="mt-1 font-bold text-[#303a34]">{value}</p>
                  </div>
                ))}
              </div>

              <Link
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#1d2721] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8b6548]"
                href="/products"
              >
                Khám phá sản phẩm cùng phong cách
                <ArrowIcon />
              </Link>
            </div>

            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[#d2c8ba] bg-white shadow-[0_20px_55px_rgba(54,43,30,.14)]">
                <Image
                  alt="Moodboard phòng khách Contemporary Calm với sofa xanh sage, ghế boucle, gỗ walnut và bảng màu trung tính"
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  src="/images/moodboards/contemporary-living-moodboard-v2.png"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#777d76]">
                <p>Concept 01 · Phòng khách đương đại</p>
                <p className="font-bold uppercase tracking-[0.08em]">
                  Sage · Walnut · Boucle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-2 overflow-hidden rounded-lg bg-[#173e34] py-16 text-white shadow-[0_18px_50px_rgba(28,57,48,.15)] sm:mx-3 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.11em] text-[#f1bd62]">
                Bộ công cụ cho ngôi nhà thật
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
                Đừng chỉ xem nội thất. Hãy thử sống trong đó.
              </h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-[#d9e2d9]">
              Chạm vào từng điểm trong căn phòng, thay món đồ bạn chưa ưng ý
              và giữ lại phương án phù hợp nhất cho dự án của mình.
            </p>
          </div>

          <div className="mt-10 grid border-t border-white/20 md:grid-cols-3">
            {[
              {
                number: "PS",
                title: "Chạm để khám phá",
                text: "Xem thông tin và giá của từng món đồ ngay trong không gian.",
                href: "/product-space",
                label: "Mở Product Space",
              },
              {
                number: "3D",
                title: "Kiểm tra trong tỷ lệ thật",
                text: "Xoay, chọn và xem thông tin từng món nội thất trong phòng.",
                href: "/showroom",
                label: "Mở showroom",
              },
              {
                number: "ST",
                title: "Chọn từ Store đã duyệt",
                text: "Khám phá sản phẩm có thông tin, giá và cửa hàng minh bạch.",
                href: "/store",
                label: "Ghé Store",
              },
            ].map((tool, index) => (
              <article
                className={`py-7 ${
                  index === 0
                    ? "md:pr-8"
                    : "border-t border-white/20 md:border-l md:border-t-0 md:px-8"
                }`}
                key={tool.number}
              >
                <span className="inline-grid h-14 min-w-14 place-items-center rounded-lg bg-white/10 px-2 text-3xl font-bold text-[#f1bd62]">
                  {tool.number}
                </span>
                <h3 className="mt-8 text-xl font-bold">{tool.title}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[#d9e2d9]">
                  {tool.text}
                </p>
                <Link
                  className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-bold text-white transition hover:border-[#f1bd62] hover:text-[#f1bd62]"
                  href={tool.href}
                >
                  {tool.label}
                  <ArrowIcon />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="rounded-lg border border-[#ded5c5] bg-white px-6 py-8 shadow-[0_12px_36px_rgba(57,45,29,.08)] sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a76227]">
              Sẵn sàng để bắt đầu?
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-[#1d2721] sm:text-4xl">
              Căn nhà của bạn đã có câu chuyện. Mình giúp bạn nhìn thấy nó.
            </h2>
          </div>
          <Link
            className="mt-6 inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#1d2721] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a76227] sm:mt-0"
            href="/register"
          >
            Tạo tài khoản miễn phí
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <footer className="mx-2 mb-2 rounded-lg border border-[#ded5c5] bg-[#f2ede4] px-5 py-8 sm:mx-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <BrandLogo className="h-12 w-40" variant="horizontal" />
          <div className="flex gap-5 text-sm font-semibold text-[#59635b]">
            <Link
              className="transition hover:text-[#a76227]"
              href="/products"
            >
              Sản phẩm
            </Link>
            <Link
              className="transition hover:text-[#a76227]"
              href="/showroom"
            >
              Phòng mẫu 3D
            </Link>
            <Link className="transition hover:text-[#a76227]" href="/store">
              Store
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
