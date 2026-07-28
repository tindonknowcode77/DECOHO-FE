import { getProducts } from "@/src/features/products/services/productService";
import ProductSpaceView from "../components/ProductSpaceView";

export default async function ProductSpacePage() {
  const products = await getProducts().catch(() => []);

  return <ProductSpaceView initialProducts={products} />;
}
