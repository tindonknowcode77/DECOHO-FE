import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/src/features/cart/components/AddToCartButton";
import ProductImage from "../components/ProductImage";
import {
  getProductById,
  getProducts,
  getRecommendedProducts,
} from "../services/productService";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const [product, products] = await Promise.all([
    getProductById(id),
    getProducts().catch(() => []),
  ]);

  if (!product) {
    notFound();
  }

  const recommendedProducts = getRecommendedProducts(product, products);

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-8 text-[#1f2421] sm:px-8 sm:py-10">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-[#d6ded8] bg-white px-3 py-2 text-sm font-bold text-[#2f6f5e] shadow-sm transition hover:border-[#2f6f5e] hover:bg-[#eef6f2]"
            href="/products"
          >
            <span aria-hidden="true">←</span>
            Quay lại catalog
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7b7f78]">
            {product.category} · {product.sku}
          </p>
        </div>

        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
          <div className="overflow-hidden rounded-lg border border-[#ded6c9] bg-white p-3 shadow-[0_12px_36px_rgba(57,45,29,.09)]">
            <ProductImage
              alt={product.name}
              className="aspect-[4/3] w-full rounded-md object-cover"
              height={760}
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              src={product.image}
              width={920}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-1 pt-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#7b7f78]">
                  Hình ảnh sản phẩm
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {product.brand} · {product.category}
                </p>
              </div>
              <span className="rounded-full bg-[#eef6f2] px-3 py-1.5 text-xs font-bold text-[#2f6f5e]">
                {product.styleName}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[#ded6c9] bg-white p-5 shadow-[0_12px_36px_rgba(57,45,29,.09)] sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f7f3ec] px-2.5 py-1 text-[11px] font-bold uppercase text-[#6f746d]">
                {product.category}
              </span>
              <span className="rounded-full bg-[#eef6f2] px-2.5 py-1 text-[11px] font-bold uppercase text-[#2f6f5e]">
                {product.styleName}
              </span>
              {product.discountPercentage > 0 && (
                <span className="rounded-full bg-[#bc3d2b] px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                  Giảm {product.discountPercentage}%
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-[#646a61]">
              {product.brand} · SKU {product.sku}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-lg font-bold text-[#b46f2c]">
                {product.rating}
              </span>
              <span className="text-sm font-semibold text-[#b46f2c]">sao</span>
              <span className="h-1 w-1 rounded-full bg-[#c9c0b3]" />
              <span className="text-sm text-[#646a61]">
                {product.reviewsCount} đánh giá
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-[#eee7dc] pt-5">
              <p className="text-3xl font-bold">
                {formatPrice(product.priceVND)}
              </p>
              {product.discountPercentage > 0 && (
                <p className="pb-1 text-sm text-[#848982] line-through">
                  {formatPrice(product.originalPriceVND)}
                </p>
              )}
            </div>

            <p className="mt-5 text-sm leading-7 text-[#646a61]">
              {product.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#e8dfd2] bg-[#e8dfd2] text-sm">
              {[
                ["Kích thước", product.dimensions],
                ["Vật liệu", product.material],
                ["Màu sắc", product.color],
                ["Tồn kho", `${product.stock} sản phẩm`],
              ].map(([label, value]) => (
                <div className="min-w-0 bg-[#fcfaf6] p-3" key={label}>
                  <p className="text-xs font-bold text-[#51564f]">{label}</p>
                  <p className="mt-1 break-words text-[#646a61]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <AddToCartButton
                item={{
                  id: `catalog-${product.id}`,
                  category: product.category,
                  dimensions: product.dimensions,
                  image: product.image,
                  material: product.material,
                  name: product.name,
                  priceVND: product.priceVND,
                  productHref: `/products/${product.id}`,
                  source: "catalog",
                  stock: product.stock,
                  style: product.styleName,
                }}
              />
              <a
                className="rounded-md bg-[#2f6f5e] px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#285f51]"
                href={`https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Tìm trên Shopee
              </a>
            </div>
            <Link
              className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[#ded6c9] bg-[#fcfaf6] px-5 py-3 text-sm font-bold text-[#51564f] transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
              href="/cart"
            >
              Xem giỏ hàng hiện tại
            </Link>
          </div>
        </div>

        <section className="mt-6 rounded-lg border border-[#ded6c9] bg-white p-5 shadow-[0_10px_30px_rgba(57,45,29,.07)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#b46f2c]">
                Chi tiết sản phẩm
              </p>
              <h2 className="mt-2 text-2xl font-bold">Thông số kỹ thuật</h2>
              <p className="mt-3 text-sm leading-6 text-[#646a61]">
                Thông tin vật liệu, xuất xứ và chính sách đi kèm sản phẩm.
              </p>
            </div>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div
                  className="flex min-h-14 items-center justify-between gap-4 border-b border-[#eee7dc] py-3 text-sm"
                  key={key}
                >
                  <span className="text-[#646a61]">{key}</span>
                  <span className="text-right font-semibold">{value}</span>
                </div>
              ))}
              <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#eee7dc] py-3 text-sm">
                <span className="text-[#646a61]">Tình trạng</span>
                <span className="text-right font-semibold text-[#2f6f5e]">
                  {product.availability}
                </span>
              </div>
            </div>
          </div>
        </section>
      </section>

      {recommendedProducts.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl">
          <div className="flex flex-col justify-between gap-3 border-b border-[#ded6c9] pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#b46f2c]">
                Phù hợp với lựa chọn của bạn
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Sản phẩm có thể bạn sẽ thích
              </h2>
            </div>
            <Link
              className="rounded-md border border-[#cfc6b8] bg-white px-3 py-2 text-sm font-bold text-[#2f6f5e] transition hover:border-[#2f6f5e]"
              href="/products"
            >
              Xem toàn bộ catalog
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedProducts.map((recommendedProduct) => (
              <Link
                className="group overflow-hidden rounded-lg border border-[#ded6c9] bg-white shadow-[0_8px_24px_rgba(57,45,29,.07)] transition duration-300 hover:-translate-y-1 hover:border-[#c8bba7] hover:shadow-[0_18px_38px_rgba(57,45,29,.13)]"
                href={`/products/${recommendedProduct.id}`}
                key={recommendedProduct.id}
              >
                <div className="relative h-48 overflow-hidden bg-[#eee7dc]">
                  <ProductImage
                    alt={recommendedProduct.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    height={320}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    src={recommendedProduct.image}
                    width={480}
                  />
                  {recommendedProduct.discountPercentage > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#bc3d2b] px-2.5 py-1 text-[11px] font-bold text-white">
                      -{recommendedProduct.discountPercentage}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-[#2f6f5e]">
                    {recommendedProduct.category}
                  </p>
                  <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-bold leading-6 group-hover:text-[#2f6f5e]">
                    {recommendedProduct.name}
                  </h3>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="font-bold">
                      {formatPrice(recommendedProduct.priceVND)}
                    </p>
                    <p className="text-xs font-bold text-[#b46f2c]">
                      {recommendedProduct.rating} sao
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
