import Image from "next/image";
import Link from "next/link";

const combos = [
  { title: "Pistachio Dreams", mood: "Tươi · Dịu · Ấm", image: "/images/product-space/organic-calm.png", badge: "Bán chạy" },
  { title: "Minimal Japandi", mood: "Gọn · Mộc · Bình yên", image: "/images/product-space/urban-warmth.png", badge: "Yêu thích" },
  { title: "Peachy Pastels", mood: "Sáng · Vui · Mềm mại", image: "/images/product-space/soft-evening.png", badge: "Mới" },
  { title: "Contemporary Calm", mood: "Thanh lịch · Tự nhiên", image: "/images/moodboards/contemporary-living-moodboard-v2.png", badge: "Hot" },
];
const savedBoards = [
  { title: "Cozy Green", count: "12 món", image: "/images/product-space/organic-calm.png" },
  { title: "Dream Workspace", count: "8 món", image: "/images/product-space/urban-warmth.png" },
  { title: "Soft Bedroom", count: "10 món", image: "/images/product-space/soft-evening.png" },
];

function Arrow() { return <span aria-hidden="true">→</span>; }

export default function HomePage() {
  return <main className="home-compact overflow-hidden bg-[#fffaf3] text-[#20251f]">
    <section className="relative mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 md:grid-cols-[.9fr_1.1fr] md:items-center lg:gap-10 lg:py-16">
      <div className="relative z-10">
        <p className="font-accent text-lg font-bold text-[#759139]">Ngôi nhà thật · Cảm hứng thật ✦</p>
        <h1 className="mt-5 text-5xl font-black leading-[.92] tracking-[-.055em] sm:text-6xl lg:text-7xl">TRANG TRÍ<br/><span className="text-[#ef6e61]">ĐÚNG CHẤT.</span></h1>
        <p className="mt-6 max-w-lg text-lg font-bold leading-8">Căn phòng của bạn, phong cách của bạn, cộng đồng của bạn ♡</p>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[#697067]">Khám phá không gian thật, lưu moodboard, thử nội thất bằng AI và tìm sản phẩm phù hợp chỉ trong vài chạm.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link className="rounded-xl bg-[#91b447] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#91b447]/20 transition hover:-translate-y-0.5" href="/product-space">Khám phá Moodboard <Arrow/></Link><Link className="rounded-xl border-2 border-[#273027] bg-white px-6 py-3 text-sm font-black transition hover:bg-[#fff0eb]" href="/ai">Tìm gu căn phòng <Arrow/></Link></div>
        <div className="mt-9 grid max-w-lg grid-cols-3 divide-x divide-[#e2d8c8] rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">{[["25K+","Người yêu decor"],["1M+","Không gian"],["4.9 ★","Cộng đồng"]].map(([value,label])=><div className="px-3 text-center" key={label}><p className="text-lg font-black text-[#759139]">{value}</p><p className="mt-1 text-[10px] font-bold text-[#777c74]">{label}</p></div>)}</div>
      </div>
      <div className="relative min-h-[480px]">
        <div className="absolute inset-4 overflow-hidden rounded-[42%_18%_38%_20%] border-[8px] border-white bg-[#e9ddca] shadow-[0_25px_60px_rgba(75,57,34,.18)]"><Image alt="Phòng khách DECOHO" className="object-cover" fill priority sizes="(min-width:1024px) 55vw,100vw" src="/images/decoho-home-interior-v2.png"/></div>
        <div className="absolute right-0 top-4 w-44 rotate-6 rounded-lg border-[6px] border-white bg-white p-2 shadow-xl"><div className="relative aspect-[4/3] overflow-hidden rounded"><Image alt="Góc nội thất" className="object-cover" fill sizes="180px" src="/images/product-space/urban-warmth.png"/></div><p className="mt-2 text-xs font-black">Good vibes, every day ✦</p></div>
        <div className="font-accent absolute bottom-2 left-3 rotate-[-5deg] rounded-sm bg-[#c8e976] px-5 py-4 text-base font-black shadow-md">YOUR SPACE.<br/>SO YOUR VIBE. ♡</div>
        <div className="absolute left-6 top-1 text-5xl text-[#f2c749]">✦</div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
      <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-[#ef6e61]">Được cộng đồng yêu thích</p><h2 className="mt-2 text-3xl font-black">Combo nội thất chọn sẵn</h2></div><Link className="text-sm font-black" href="/products">Xem tất cả <Arrow/></Link></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{combos.map((combo)=><Link className="group overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl" href="/products" key={combo.title}><div className="relative aspect-[4/3] overflow-hidden"><Image alt={combo.title} className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(min-width:1024px) 25vw,50vw" src={combo.image}/><span className="absolute left-3 top-3 rounded-full bg-[#ef6e61] px-3 py-1 text-[10px] font-black text-white">{combo.badge}</span></div><div className="p-4"><h3 className="font-black">{combo.title}</h3><p className="mt-1 text-xs text-[#737970]">{combo.mood}</p><p className="mt-3 text-sm font-black text-[#759139]">Khám phá combo <Arrow/></p></div></Link>)}</div>
    </section>

    <section className="border-y border-[#eadfce] bg-[#fff5ec] py-12"><div className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 lg:grid-cols-2">
      <article className="relative overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-7"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#20251f] text-sm font-black text-white">4</span><p className="mt-5 text-xs font-black uppercase tracking-widest text-[#795cc9]">Gu của bạn là gì?</p><h2 className="mt-2 text-3xl font-black">Tìm phong cách căn phòng ♡</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#6b726a]">Trả lời vài câu hỏi vui để DECOHO gợi ý bảng màu, vật liệu và phong cách hợp với bạn.</p><div className="mt-6 flex items-end justify-between gap-4"><Link className="rounded-xl bg-[#91b447] px-5 py-3 text-sm font-black text-white" href="/ai">Bắt đầu ngay <Arrow/></Link><div className="grid grid-cols-2 gap-2">{["Minimal","Boho","Pastel","Modern"].map((style)=><span className="rounded-lg bg-[#f5f0e8] px-3 py-2 text-xs font-black" key={style}>{style}</span>)}</div></div><span className="absolute right-5 top-5 rotate-6 rounded-full bg-[#9c7bea] px-4 py-3 text-xs font-black text-white">SO ME!</span></article>
      <article className="relative overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-7"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#20251f] text-sm font-black text-white">5</span><p className="mt-5 text-xs font-black uppercase tracking-widest text-[#ef6e61]">Mua thông minh</p><h2 className="mt-2 text-3xl font-black">Planner ngân sách</h2><p className="mt-3 text-sm leading-6 text-[#6b726a]">Lên kế hoạch căn phòng, theo dõi chi phí và chọn sản phẩm trong ngân sách.</p><div className="mt-6 rounded-2xl bg-[#f8f5ef] p-5"><div className="flex justify-between text-xs font-bold"><span>Ngân sách dự kiến</span><span>Đã sử dụng 58%</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-white"><div className="h-full w-[58%] rounded-full bg-[#a8ca5c]"/></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div><b>15 triệu</b><br/>Tổng</div><div><b>8.7 triệu</b><br/>Đã chọn</div><div><b>6.3 triệu</b><br/>Còn lại</div></div></div><Link className="mt-5 inline-block text-sm font-black text-[#759139]" href="/cart">Lập kế hoạch <Arrow/></Link></article>
    </div></section>

    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-[#759139]">Ý tưởng ở cùng một nơi</p><h2 className="mt-2 text-3xl font-black">Moodboard đã lưu</h2></div><Link className="text-sm font-black" href="/product-space">Xem Moodboard <Arrow/></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{savedBoards.map((board)=><Link className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white p-3" href="/product-space" key={board.title}><div className="relative aspect-[4/3] overflow-hidden rounded-xl"><Image alt={board.title} className="object-cover" fill sizes="25vw" src={board.image}/></div><h3 className="mt-3 font-black">{board.title}</h3><p className="text-xs text-[#777c74]">{board.count}</p></Link>)}<Link className="grid min-h-52 place-items-center rounded-2xl border-2 border-dashed border-[#d9cfbf] bg-[#fffaf3] text-center transition hover:border-[#91b447]" href="/product-space"><div><span className="text-4xl">＋</span><p className="mt-2 text-sm font-black">Moodboard mới</p></div></Link></div></section>

    <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8"><div className="rounded-3xl bg-[#242a25] px-7 py-10 text-white sm:px-10"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#c7e977]">Được tạo cho thế hệ yêu decor</p><h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">TRANG TRÍ · KẾT NỐI · TRUYỀN CẢM HỨNG ♡</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Quét sản phẩm bằng AI, thử trong showroom 3D, lưu moodboard và mua sắm từ supplier đã được duyệt.</p></div><Link className="rounded-xl bg-[#ef6e61] px-6 py-4 text-sm font-black text-white" href="/register">Tạo tài khoản miễn phí <Arrow/></Link></div></div></section>
  </main>;
}
