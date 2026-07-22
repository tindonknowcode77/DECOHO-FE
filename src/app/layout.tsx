import type { Metadata } from "next";
import Navigation from "@/src/components/layout/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "DECOHO | Thiết kế nội thất bằng AI",
  description:
    "DECOHO giúp phân tích không gian, gợi ý phong cách và kết nối mua sắm nội thất cho ngôi nhà Việt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full bg-[#f7f3ec]">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
