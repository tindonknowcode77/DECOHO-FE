import type { Metadata } from "next";
import { Lora, Be_Vietnam_Pro } from "next/font/google";
import Navigation from "@/src/components/layout/Navigation";
import PageTransition from "@/src/components/layout/PageTransition";
import FloatingFeedbackButton from "@/src/features/feedback/components/FloatingFeedbackButton";
import "./globals.css";

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DECOHO",
  description:
    "DECOHO giúp phân tích không gian, gợi ý phong cách và kết nối mua sắm nội thất cho ngôi nhà Việt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`h-full antialiased ${lora.variable} ${beVietnamPro.variable}`}
    >
      <body className="min-h-full bg-[#f7f3ec] font-sans antialiased">
        <Navigation />
        <PageTransition>{children}</PageTransition>
        <FloatingFeedbackButton />
      </body>
    </html>
  );
}
