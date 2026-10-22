"use client";

import { usePathname } from "next/navigation";
import BrandLogo from "@/src/components/common/BrandLogo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <footer className="border-t border-[#ded6c9] bg-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          {/* Brand Column */}
          <div className="max-w-md">
            <BrandLogo variant="horizontal" />
            <p className="mt-3 text-sm leading-relaxed text-[#646a61]">
              DECOHO — Nền tảng thiết kế nội thất thông minh bằng AI, kết nối
              bạn với không gian sống mơ ước.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex flex-wrap gap-3">
            {[
              {
                label: "Facebook",
                href: "https://www.facebook.com/profile.php?id=61590553962441",
                path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z",
              },
              {
                label: "Instagram",
                href: "https://instagram.com/decoho",
                path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 2.2c-3.2 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.5-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.5-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.5.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.5.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.5-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.5-.1-4.7-.1zm0 3.7c2.1 0 3.9 1.7 3.9 3.9s-1.7 3.9-3.9 3.9S8.1 14.1 8.1 12s1.7-3.9 3.9-3.9zm0 6.4c1.4 0 2.5-1.1 2.5-2.5S13.4 9.5 12 9.5 9.5 10.6 9.5 12s1.1 2.5 2.5 2.5zm4.9-6.6c.5 0 .9-.4.9-.9s-.4-.9-.9-.9-.9.4-.9.9.4.9.9.9z",
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
      </div>
    </footer>
  );
}
