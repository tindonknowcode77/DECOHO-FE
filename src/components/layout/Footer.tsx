"use client";

import Link from "next/link";
import BrandLogo from "@/src/components/common/BrandLogo";

const footerLinks = {
  khám_phá: [
    { label: "Trang chủ", href: "/" },
    { label: "Moodboards", href: "/product-space" },
    { label: "Diễn đàn", href: "/community" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Phòng mẫu 3D", href: "/showroom" },
  ],
  tài_khoản: [
    { label: "Đăng nhập", href: "/login" },
    { label: "Đăng ký", href: "/register" },
    { label: "Tài khoản của tôi", href: "/profile" },
    { label: "Yêu thích", href: "/wishlist" },
    { label: "Giỏ hàng", href: "/cart" },
  ],
  hỗ_trợ: [
    { label: "Trung tâm trợ giúp", href: "/help" },
    { label: "Chính sách đổi trả", href: "/return-policy" },
    { label: "Chính sách vận chuyển", href: "/shipping" },
    { label: "Liên hệ", href: "/contact" },
  ],
  công_ty: [
    { label: "Giới thiệu", href: "/about" },
    { label: "Tin tức", href: "/news" },
    { label: "Tuyển dụng", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[#ded6c9] bg-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <BrandLogo variant="horizontal" />
            <p className="mt-4 text-sm leading-relaxed text-[#646a61]">
              DECOHO — Nền tảng thiết kế nội thất thông minh bằng AI, kết nối
              bạn với không gian sống mơ ước.
            </p>
            {/* Social Icons */}
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                {
                  label: "Facebook",
                  href: "https://facebook.com/decoho",
                  path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z",
                },
                {
                  label: "YouTube",
                  href: "https://youtube.com/@decoho",
                  path: "M23.5 6.2c-.3-1-1.1-1.8-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5c-1 .3-1.8 1.1-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1 1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5c1-.3 1.8-1.1 2.1-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z",
                },
                {
                  label: "WhatsApp",
                  href: "https://wa.me/decoho",
                  path: "M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.2-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.2.8.9-3.1-.2-.3c-.9-1.4-1.3-2.9-1.3-4.4 0-4.4 3.6-8 8-8s8 3.6 8 8-3.5 8.4-7.5 8.4z",
                },
                {
                  label: "Instagram",
                  href: "https://instagram.com/decoho",
                  path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 2.2c-3.2 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.5-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.5-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.5.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.5.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.5-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.5-.1-4.7-.1zm0 3.7c2.1 0 3.9 1.7 3.9 3.9s-1.7 3.9-3.9 3.9S8.1 14.1 8.1 12s1.7-3.9 3.9-3.9zm0 6.4c1.4 0 2.5-1.1 2.5-2.5S13.4 9.5 12 9.5 9.5 10.6 9.5 12s1.1 2.5 2.5 2.5zm4.9-6.6c.5 0 .9-.4.9-.9s-.4-.9-.9-.9-.9.4-.9.9.4.9.9.9z",
                },
                {
                  label: "X",
                  href: "https://x.com/decoho",
                  path: "M18.244 2H21.5l-7.5 8.567L22.875 22h-6.844l-5.36-7.012L4.5 22H1.244l8.02-9.165L1.125 2h7.022l4.847 6.41L18.244 2zm-2.4 18.026h1.895L7.31 3.857H5.282l10.562 16.169z",
                },
                {
                  label: "TikTok",
                  href: "https://tiktok.com/@decoho",
                  path: "M19.6 6.3c-1.4-.8-2.5-2.1-3-3.6h-3.4v13.4c0 1.7-1.4 3-3 3s-3-1.4-3-3 1.4-3 3-3c.3 0 .6.1.9.2v-3.5c-.3 0-.6-.1-.9-.1-3.5 0-6.4 2.9-6.4 6.4s2.9 6.4 6.4 6.4 6.4-2.9 6.4-6.4V9.5c1.2.8 2.7 1.3 4.3 1.3V7.4c-.5 0-1-.4-1.3-1.1z",
                },
              ].map((social) => (
                <a
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2f6f5e] bg-white text-[#2f6f5e] transition hover:bg-[#2f6f5e] hover:text-white"
                  href={social.href}
                  key={social.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#2f6f5e]">
                {key.replace("_", " ")}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
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
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#eee7dc]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 sm:px-8 md:flex-row">
          <p className="text-xs text-[#646a61]">
            © 2026 DECOHO. Mọi quyền được bảo lưu.
          </p>
          <div className="flex gap-5 text-xs text-[#646a61]">
            <Link className="transition hover:text-[#2f6f5e]" href="/privacy">
              Chính sách bảo mật
            </Link>
            <Link className="transition hover:text-[#2f6f5e]" href="/terms">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
