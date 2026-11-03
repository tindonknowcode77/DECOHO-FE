import { Smartphone } from "lucide-react";
import MagneticText from "@/src/components/common/MagneticText";

const apps = [
  {
    title: "Trợ lý AI cá nhân hoá",
    description: "Gợi ý layout, tông màu và sản phẩm phù hợp với không gian của bạn.",
    background: "from-[#d8e9f5] to-[#bcd9ed]",
    accent: "#7e9a3f",
  },
  {
    title: "Thiết kế 3D trực quan",
    description: "Trải nghiệm phòng mẫu 3D và đặt sản phẩm trong không gian thực.",
    background: "from-[#f5e6c8] to-[#e8d29f]",
    accent: "#d89b47",
  },
  {
    title: "Mua sắm thông minh",
    description: "So sánh giá, theo dõi giảm giá và đặt hàng từ nhà cung cấp uy tín.",
    background: "from-[#d8eedb] to-[#b8dcc0]",
    accent: "#2f6f5e",
  },
];

export default function ComingSoonApps() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-[#78933c]">
          Sắp ra mắt
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
          <MagneticText strength={14}>Ứng dụng DECOHO</MagneticText>
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {apps.map((app) => (
          <article
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${app.background} p-6 transition hover:-translate-y-1 hover:shadow-xl`}
            key={app.title}
          >
            <span
              className="absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-black text-white"
              style={{ backgroundColor: app.accent }}
            >
              MỚI
            </span>

            <div className="mt-12 max-w-[60%]">
              <h3 className="font-serif text-xl font-bold text-[#2f6f5e] sm:text-2xl">
                <MagneticText strength={12}>{app.title}</MagneticText>
              </h3>
              <p className="mt-3 text-xs leading-6 text-[#2f6f5e]/70 sm:text-sm">
                {app.description}
              </p>
            </div>

            <div className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2f6f5e]/15 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-[#2f6f5e] backdrop-blur-sm">
                <Smartphone className="h-3.5 w-3.5" />
                Sắp có mặt trên iOS & Android
              </span>
            </div>

            <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
          </article>
        ))}
      </div>
    </section>
  );
}
