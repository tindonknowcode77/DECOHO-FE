import type { StoreProduct } from "../types";

const STORE_PRODUCTS_KEY = "decoho_store_products_v2";
const STORE_PRODUCTS_CHANGE_EVENT = "decoho-store-products-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function parseProducts(value: string | null): StoreProduct[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoreProduct>[];

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .filter(
        (product): product is StoreProduct =>
          typeof product.id === "string" &&
          typeof product.name === "string" &&
          typeof product.category === "string" &&
          typeof product.priceVND === "number" &&
          typeof product.stock === "number" &&
          typeof product.views === "number" &&
          typeof product.conversionRate === "number" &&
          (product.status === "active" ||
            product.status === "draft" ||
            product.status === "pending_review" ||
            product.status === "rejected" ||
            product.status === "review") &&
          (product.modelStatus === "missing" ||
            product.modelStatus === "ready" ||
            product.modelStatus === "reviewing"),
      )
      .map((product) => ({
        ...product,
        dimensions: typeof product.dimensions === "string" ? product.dimensions : undefined,
        image: typeof product.image === "string" ? product.image : undefined,
        material: typeof product.material === "string" ? product.material : undefined,
        rejectionReason:
          typeof product.rejectionReason === "string" ? product.rejectionReason : undefined,
        reviewedAt: typeof product.reviewedAt === "string" ? product.reviewedAt : undefined,
        reviewedBy: typeof product.reviewedBy === "string" ? product.reviewedBy : undefined,
        storeId: typeof product.storeId === "string" ? product.storeId : undefined,
        storeName: typeof product.storeName === "string" ? product.storeName : undefined,
        status:
          product.status === "review" ? "pending_review" : product.status,
        submittedAt: typeof product.submittedAt === "string" ? product.submittedAt : undefined,
      }));
  } catch {
    return null;
  }
}

export function getStoredStoreProducts(fallbackProducts: StoreProduct[]) {
  if (!isBrowser()) {
    return fallbackProducts;
  }

  return parseProducts(window.localStorage.getItem(STORE_PRODUCTS_KEY)) ?? fallbackProducts;
}

export function saveStoredStoreProducts(products: StoreProduct[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORE_PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(
    new CustomEvent<StoreProduct[]>(STORE_PRODUCTS_CHANGE_EVENT, {
      detail: products,
    }),
  );
}

export function subscribeStoreProducts(
  callback: (products: StoreProduct[]) => void,
  fallbackProducts: StoreProduct[],
) {
  if (!isBrowser()) {
    return () => {};
  }

  function handleCustomEvent(event: Event) {
    const products = (event as CustomEvent<StoreProduct[]>).detail;
    callback(Array.isArray(products) ? products : fallbackProducts);
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === STORE_PRODUCTS_KEY) {
      callback(parseProducts(event.newValue) ?? fallbackProducts);
    }
  }

  window.addEventListener(STORE_PRODUCTS_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(STORE_PRODUCTS_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
  };
}
