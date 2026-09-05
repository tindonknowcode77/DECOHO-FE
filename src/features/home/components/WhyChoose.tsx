import { Home, Sparkles, Tag, Leaf, Truck } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Tuyển chọn AI mỗi ngày",
    description: "Mỗi ngày có gợi ý decor mới từ AI dành riêng cho bạn.",
  },
  {
    icon: Sparkles,
    title: "Hỗ trợ thiết kế AI",
    description: "Trợ lý AI đề xuất layout, tông màu, phụ kiện theo không gian.",
  },
  {
    icon: Tag,
    title: "Giá tốt mỗi ngày",
    description: "Sản phẩm decor giá tốt từ nhà cung cấp uy tín.",
  },
  {
    icon: Leaf,
    title: "Bền vững & thân thiện",
    description: "Sản phẩm thân thiện môi trường, hỗ trợ nghệ nhân địa phương.",
  },
  {
    icon: Truck,
    title: "Giao nhanh toàn quốc",
    description: "Vận chuyển nhanh chóng tận nơi trong 24h.",
  },
];

export default function WhyChoose() {
  return (
    <section className="border-y border-[#e8e1d4] bg-[#faf6ee] py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Vì sao chọn DECOHO?
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="text-center" key={feature.title}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#7e9a3f]/15">
                  <Icon className="h-6 w-6 text-[#2f6f5e]" strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#2f6f5e]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#646a61]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
