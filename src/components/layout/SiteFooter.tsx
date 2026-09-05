import Link from "next/link";
import { Camera, Play } from "lucide-react";

const columns = [
  {
    title: "VỀ DECOHO",
    links: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Diễn đàn", href: "/community" },
      { label: "Sản phẩm", href: "/products" },
    ],
  },
  {
    title: "HỖ TRỢ",
    links: [
      { label: "Trung tâm hỗ trợ", href: "/help" },
      { label: "Liên hệ", href: "/contact" },
      { label: "Điều khoản", href: "/terms" },
      { label: "Chính sách", href: "/privacy" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#e8e1d4] bg-[#faf6ee]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span className="font-serif text-3xl font-bold text-[#d89b47]">
              DECOHO
            </span>
            <p className="mt-4 max-w-xs text-sm leading-7 text-[#646a61]">
              Tạo cảm hứng, hỗ trợ cùng bạn hoàn thiện không gian sống — bằng AI
              và diễn đàn yêu decor.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:bg-[#2f6f5e] hover:text-white"
                href="#"
              >
                <span className="font-black text-xs">f</span>
              </Link>
              <Link
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:bg-[#2f6f5e] hover:text-white"
                href="#"
              >
                <Camera className="h-4 w-4" />
              </Link>
              <Link
                aria-label="YouTube"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e1d4] bg-white text-[#2f6f5e] transition hover:bg-[#2f6f5e] hover:text-white"
                href="#"
              >
                <Play className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#2f6f5e]">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-sm text-[#646a61] transition hover:text-[#2f6f5e]"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#2f6f5e]">
              LIÊN HỆ
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#646a61]">
              <li>hello@decoho.vn</li>
              <li>0901 234 567</li>
              <li>Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#e8e1d4] pt-6 text-xs text-[#646a61] sm:flex-row sm:items-center">
          <p>© 2026 DECOHO. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link className="hover:text-[#2f6f5e]" href="/about">
              Về chúng tôi
            </Link>
            <Link className="hover:text-[#2f6f5e]" href="/news">
              Tin tức
            </Link>
            <Link className="hover:text-[#2f6f5e]" href="/partners">
              Đối tác
            </Link>
            <Link className="hover:text-[#2f6f5e]" href="/careers">
              Tuyển dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
