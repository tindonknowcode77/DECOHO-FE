import Footer from "@/src/components/layout/Footer";

/**
 * Layout cho các trang chính (home, products, product-space, ...).
 * Chứa Footer ở cuối trang.
 *
 * Lưu ý: route group `(auth)` không dùng layout này — đó là lý do
 * trang login / register không hiển thị Footer.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
