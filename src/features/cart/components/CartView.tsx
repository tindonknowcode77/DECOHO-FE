"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import { initialCartItems, promoCodes } from "../mock/cartItems";
import {
  clearStoredPromoCode,
  getStoredCartItems,
  getStoredPromoCode,
  saveStoredCartItems,
  saveStoredPromoCode,
  subscribeCartItems,
} from "../services/cartStorage";
import type { CartItem } from "../types";

const FREE_SHIPPING_THRESHOLD = 15000000;
const DEFAULT_SHIPPING_FEE = 250000;

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function Icon({ name }: { name: "cart" | "trash" | "plus" | "minus" | "arrow" | "shield" | "ticket" | "check" }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m5 16.5h.01M18 19.5h.01",
    check: "m5 12 4 4L19 6",
    minus: "M6 12h12",
    plus: "M12 5v14M5 12h14",
    shield: "M12 3 19 6v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Z",
    ticket: "M4 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4h16a2 2 0 0 1 0-4 2 2 0 0 0 0-4H4Zm8 1v6",
    trash: "M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3",
  };

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function CartView() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCartItems(getStoredCartItems(initialCartItems));

      const storedCode = getStoredPromoCode();
      const storedPromo = promoCodes.find((promo) => promo.code === storedCode);

      if (storedPromo) {
        setAppliedPromo(storedPromo.code);
        setPromoDiscount(storedPromo.discount);
        setPromoInput(storedPromo.code);
      }

      setHasLoadedCart(true);
    }, 0);
    const unsubscribe = subscribeCartItems(
      (items) => {
        setCartItems(items);
        setHasLoadedCart(true);
      },
      initialCartItems,
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.priceVND * item.quantity, 0),
    [cartItems],
  );
  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const discountAmount = subtotal * promoDiscount;
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  const total = subtotal - discountAmount + shippingFee;
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  function updateQuantity(id: string, delta: number) {
    const nextItems = cartItems.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: Math.min(
              Math.max(item.quantity + delta, 1),
              item.stock ?? Number.POSITIVE_INFINITY,
            ),
          }
        : item,
    );
    setCartItems(nextItems);
    saveStoredCartItems(nextItems);
  }

  function removeItem(id: string) {
    const nextItems = cartItems.filter((item) => item.id !== id);
    setCartItems(nextItems);
    saveStoredCartItems(nextItems);
  }

  function applyPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = promoInput.trim().toUpperCase();
    const promo = promoCodes.find((item) => item.code === code);

    if (!code) {
      setPromoMessage("Vui lòng nhập mã giảm giá.");
      return;
    }

    if (!promo) {
      setAppliedPromo(null);
      setPromoDiscount(0);
      setPromoMessage("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      clearStoredPromoCode();
      return;
    }

    setAppliedPromo(promo.code);
    setPromoDiscount(promo.discount);
    setPromoMessage(`Áp dụng thành công ${promo.code}: ${promo.description}.`);
    saveStoredPromoCode(promo.code);
  }

  function removePromo() {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoInput("");
    setPromoMessage("");
    clearStoredPromoCode();
  }

  if (!hasLoadedCart) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-12 text-[#1f2421]">
        <section className="mx-auto max-w-7xl">
          <div className="h-10 w-64 animate-pulse rounded-md bg-[#e9e1d5]" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
            <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
            <div className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />
          </div>
        </section>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-12 text-[#1f2421]">
        <section className="mx-auto flex max-w-md flex-col items-center rounded-md bg-white p-8 text-center shadow-sm">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-[#f7f3ec] text-[#2f6f5e]">
            <Icon name="cart" />
          </span>
          <h1 className="mt-6 text-2xl font-bold">Giỏ hàng đang trống</h1>
          <p className="mt-3 text-sm leading-6 text-[#646a61]">
            Bạn chưa chọn món nội thất nào. Hãy khám phá catalog hoặc chạm vào
            sản phẩm trong một không gian hoàn chỉnh.
          </p>
          <div className="mt-6 grid w-full gap-3">
            <Link
              className="rounded-md bg-[#1f2421] px-5 py-3 text-sm font-bold text-white"
              href="/products"
            >
              Khám phá sản phẩm
            </Link>
            <Link
              className="rounded-md border border-[#ded6c9] px-5 py-3 text-sm font-bold text-[#1f2421]"
              href="/product-space"
            >
              Mở Moodboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-[#ded6c9] pb-6 md:flex-row md:items-end">
          <div>
            <Link aria-label="DECOHO home" className="inline-flex" href="/">
              <BrandLogo className="h-9 w-32" variant="horizontal" />
            </Link>
            <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-[#2f6f5e] text-white">
                <Icon name="cart" />
              </span>
              Giỏ hàng nội thất
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#646a61]">
              Quản lý các sản phẩm đã chọn cho bản phối DECOHO, áp mã ưu đãi và
              xem chi phí vận chuyển trước khi thanh toán.
            </p>
          </div>
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-md border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-bold text-[#1f2421]"
            href="/products"
          >
            Tiếp tục mua sắm
            <Icon name="arrow" />
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
          <section className="overflow-hidden rounded-md border border-[#ded6c9] bg-white shadow-sm">
            {cartItems.map((item) => (
              <article
                className="grid gap-4 border-b border-[#eee7dc] p-5 last:border-b-0 sm:grid-cols-[112px_1fr] lg:grid-cols-[112px_1fr_auto]"
                key={item.id}
              >
                <Link
                  aria-label={`Xem ${item.name}`}
                  className="block overflow-hidden rounded-md"
                  href={item.productHref ?? "/products"}
                >
                  <Image
                    alt={item.name}
                    className="h-28 w-full rounded-md object-cover transition hover:scale-[1.03] sm:w-28"
                    height={160}
                    sizes="112px"
                    src={item.image}
                    unoptimized={item.image.startsWith("data:")}
                    width={160}
                  />
                </Link>

                <div className="min-w-0">
                  <p className="w-fit rounded bg-[#f7f3ec] px-2 py-1 text-xs font-bold uppercase text-[#6f746d]">
                    {item.category} | {item.style}
                  </p>
                  <h2 className="mt-3 text-lg font-bold">
                    <Link
                      className="transition hover:text-[#2f6f5e]"
                      href={item.productHref ?? "/products"}
                    >
                      {item.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-[#646a61]">KT: {item.dimensions}</p>
                  <p className="mt-1 text-sm text-[#646a61]">{item.material}</p>
                </div>

                <div className="flex min-w-0 flex-col items-start gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-1 lg:min-w-52 lg:flex-col lg:items-end">
                  <p className="text-lg font-bold">{formatPrice(item.priceVND * item.quantity)}</p>
                  <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:w-auto">
                    <div className="flex items-center rounded-md border border-[#ded6c9] bg-[#fbf7ef] p-1">
                      <button
                        aria-label={`Giảm số lượng ${item.name}`}
                        className="rounded p-2 text-[#62675f] hover:bg-white disabled:opacity-40"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.id, -1)}
                        type="button"
                      >
                        <Icon name="minus" />
                      </button>
                      <span className="w-9 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        aria-label={`Tăng số lượng ${item.name}`}
                        className="rounded p-2 text-[#62675f] hover:bg-white disabled:opacity-40"
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        onClick={() => updateQuantity(item.id, 1)}
                        type="button"
                      >
                        <Icon name="plus" />
                      </button>
                    </div>
                    <button
                      aria-label={`Xóa ${item.name}`}
                      className="rounded-md p-3 text-[#9b5148] hover:bg-[#fff1ee]"
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="space-y-5">
            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase text-[#51564f]">
                <Icon name="ticket" />
                Mã giảm giá
              </h2>

              {appliedPromo ? (
                <div className="mt-4 flex items-center justify-between rounded-md border border-[#b7dfc4] bg-[#eefbf2] p-3 text-sm text-[#23643b]">
                  <span className="flex items-center gap-2 font-bold">
                    <Icon name="check" />
                    {appliedPromo}
                  </span>
                  <button
                    className="text-xs font-bold text-[#9b5148]"
                    onClick={removePromo}
                    type="button"
                  >
                    Xóa mã
                  </button>
                </div>
              ) : (
                <form className="mt-4 flex gap-2" onSubmit={applyPromo}>
                  <input
                    className="min-w-0 flex-1 rounded-md border border-[#ded6c9] bg-[#fbf7ef] px-3 py-3 text-sm font-semibold uppercase outline-none focus:border-[#2f6f5e]"
                    onChange={(event) => setPromoInput(event.target.value)}
                    placeholder="DECOHO10"
                    type="text"
                    value={promoInput}
                  />
                  <button
                    className="rounded-md bg-[#1f2421] px-4 py-3 text-sm font-bold text-white"
                    type="submit"
                  >
                    Áp dụng
                  </button>
                </form>
              )}

              {promoMessage && (
                <p className="mt-3 text-xs leading-5 text-[#646a61]">{promoMessage}</p>
              )}

              {!appliedPromo && (
                <div className="mt-4 rounded-md bg-[#f7f3ec] p-3 text-xs leading-5 text-[#646a61]">
                  Mã dùng thử: <strong>DECOHO10</strong> hoặc <strong>KIENTAO5</strong>.
                </div>
              )}
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase text-[#51564f]">Tóm tắt đơn hàng</h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between text-[#646a61]">
                  <span>Tạm tính ({itemCount} món)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-[#2f6f5e]">
                    <span>Khuyến mãi ({promoDiscount * 100}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#646a61]">
                  <span>Vận chuyển và lắp đặt</span>
                  <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                </div>

                {shippingFee > 0 && (
                  <p className="rounded-md bg-[#fff7e8] p-3 text-xs leading-5 text-[#9a662a]">
                    Mua thêm {formatPrice(amountToFreeShipping)} để được miễn phí vận
                    chuyển.
                  </p>
                )}

                <div className="border-t border-[#eee7dc] pt-4">
                  <div className="flex items-end justify-between">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="text-2xl font-bold">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#d89b47] px-5 py-3 text-sm font-bold text-[#1f2421] transition hover:bg-[#e4aa5b]"
                href="/checkout"
              >
                Tiến hành thanh toán
                <Icon name="arrow" />
              </Link>

              <p className="mt-5 flex items-center justify-center gap-2 border-t border-[#eee7dc] pt-4 text-xs text-[#646a61]">
                <Icon name="shield" />
                Thanh toán được bảo mật theo chuẩn SSL.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
