import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/src/features/products/mock/products";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
      <section className="mx-auto grid max-w-6xl gap-8 rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm md:grid-cols-[0.9fr_1.1fr] md:p-8">
        <Image
          alt={product.name}
          className="aspect-square w-full rounded-md object-cover"
          height={760}
          priority
          sizes="(min-width: 768px) 45vw, 100vw"
          src={product.image}
          width={760}
        />

        <div>
          <Link className="text-sm font-bold text-[#2f6f5e]" href="/products">
            Quay lại catalog
          </Link>
          <p className="mt-5 w-fit rounded bg-[#f7f3ec] px-2 py-1 text-xs font-bold uppercase text-[#6f746d]">
            {product.category} | {product.styleName}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-3 text-sm font-bold text-[#b46f2c]">
            {product.rating} sao từ {product.reviewsCount} đánh giá
          </p>
          <p className="mt-6 text-3xl font-bold">{formatPrice(product.priceVND)}</p>
          <p className="mt-6 text-sm leading-7 text-[#646a61]">{product.description}</p>

          <div className="mt-6 grid gap-3 rounded-md bg-[#fbf7ef] p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-bold">Kích thước</p>
              <p className="mt-1 text-[#646a61]">{product.dimensions}</p>
            </div>
            <div>
              <p className="font-bold">Vật liệu</p>
              <p className="mt-1 text-[#646a61]">{product.material}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-[#51564f]">Thông số</h2>
            {Object.entries(product.specifications).map(([key, value]) => (
              <div className="flex justify-between gap-4 border-b border-[#eee7dc] py-3 text-sm" key={key}>
                <span className="text-[#646a61]">{key}</span>
                <span className="text-right font-semibold">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-md bg-[#d89b47] px-5 py-3 text-center text-sm font-bold text-[#1f2421]"
              href="/cart"
            >
              Xem giỏ hàng
            </Link>
            <a
              className="rounded-md bg-[#2f6f5e] px-5 py-3 text-center text-sm font-bold text-white"
              href={`https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Tìm trên Shopee
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
