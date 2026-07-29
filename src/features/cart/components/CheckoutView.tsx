"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSessionUser } from "@/src/features/auth/services/session";
import { initialCartItems, promoCodes } from "../mock/cartItems";
import {
  clearStoredPromoCode,
  getStoredCartItems,
  getStoredPromoCode,
  saveStoredCartItems,
  subscribeCartItems,
} from "../services/cartStorage";
import { saveCheckoutOrder } from "../services/orderStorage";
import type { CartItem } from "../types";

const FREE_SHIPPING_THRESHOLD = 15000000;

type CheckoutStep = 1 | 2 | 3 | 4;
type ShippingMethod = "standard" | "express" | "pickup";
type PaymentMethod = "cod" | "bank" | "card";

type CustomerForm = {
  address: string;
  city: string;
  district: string;
  email: string;
  name: string;
  note: string;
  phone: string;
};

type CardForm = {
  cvv: string;
  expiry: string;
  name: string;
  number: string;
};

type Confirmation = {
  email: string;
  id: string;
  paymentLabel: string;
  shippingLabel: string;
  totalVND: number;
};

const initialCustomerForm: CustomerForm = {
  address: "",
  city: "TP. Hồ Chí Minh",
  district: "",
  email: "",
  name: "",
  note: "",
  phone: "",
};

const initialCardForm: CardForm = {
  cvv: "",
  expiry: "",
  name: "",
  number: "",
};

const stepLabels = [
  "Nhận hàng",
  "Vận chuyển",
  "Thanh toán",
  "Xác nhận",
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function createOrderId() {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `DCH-${datePart}-${randomPart}`;
}

export default function CheckoutView() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [step, setStep] = useState<CheckoutStep>(1);
  const [customer, setCustomer] = useState<CustomerForm>(initialCustomerForm);
  const [card, setCard] = useState<CardForm>(initialCardForm);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCartItems(getStoredCartItems(initialCartItems));
      setPromoCode(getStoredPromoCode());

      const sessionUser = getSessionUser();
      if (sessionUser) {
        setCustomer((current) => ({
          ...current,
          email: sessionUser.email,
          name: sessionUser.name,
        }));
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
    () =>
      cartItems.reduce(
        (total, item) => total + item.priceVND * item.quantity,
        0,
      ),
    [cartItems],
  );
  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const activePromo = promoCodes.find((promo) => promo.code === promoCode);
  const discountVND = subtotal * (activePromo?.discount ?? 0);
  const shippingFeeVND =
    shippingMethod === "pickup"
      ? 0
      : shippingMethod === "express"
        ? 450000
        : subtotal >= FREE_SHIPPING_THRESHOLD
          ? 0
          : 250000;
  const totalVND = subtotal - discountVND + shippingFeeVND;

  const shippingOptions = [
    {
      description: "Giao và lắp đặt trong 3-5 ngày làm việc.",
      fee:
        subtotal >= FREE_SHIPPING_THRESHOLD
          ? "Miễn phí"
          : formatPrice(250000),
      icon: Truck,
      id: "standard" as const,
      label: "Giao tiêu chuẩn",
    },
    {
      description: "Ưu tiên giao trong 1-2 ngày tại khu vực hỗ trợ.",
      fee: formatPrice(450000),
      icon: PackageCheck,
      id: "express" as const,
      label: "Giao nhanh",
    },
    {
      description: "Nhận tại showroom Mộc An, Quận 2, TP.HCM.",
      fee: "Miễn phí",
      icon: Store,
      id: "pickup" as const,
      label: "Nhận tại showroom",
    },
  ];

  const paymentOptions = [
    {
      description: "Thanh toán khi sản phẩm được giao và kiểm tra.",
      icon: WalletCards,
      id: "cod" as const,
      label: "Thanh toán khi nhận hàng",
    },
    {
      description: "Thông tin chuyển khoản hiển thị sau khi đặt đơn.",
      icon: Landmark,
      id: "bank" as const,
      label: "Chuyển khoản ngân hàng",
    },
    {
      description: "Thanh toán thẻ demo, không phát sinh giao dịch thật.",
      icon: CreditCard,
      id: "card" as const,
      label: "Thẻ tín dụng hoặc ghi nợ",
    },
  ];

  function updateCustomer(field: keyof CustomerForm, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function updateCard(field: keyof CardForm, value: string) {
    setCard((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [`card-${field}`]: "" }));
  }

  function goToStep(nextStep: CheckoutStep) {
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      document
        .getElementById("checkout-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function validateCustomer() {
    const nextErrors: Record<string, string> = {};

    if (!customer.name.trim()) nextErrors.name = "Vui lòng nhập họ và tên.";
    if (!/^[0-9+\s.-]{9,15}$/.test(customer.phone.trim())) {
      nextErrors.phone = "Số điện thoại chưa hợp lệ.";
    }
    if (
      customer.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())
    ) {
      nextErrors.email = "Email chưa đúng định dạng.";
    }
    if (!customer.address.trim()) nextErrors.address = "Vui lòng nhập địa chỉ.";
    if (!customer.district.trim()) {
      nextErrors.district = "Vui lòng nhập quận hoặc huyện.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validatePayment() {
    if (paymentMethod !== "card") {
      setErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};
    if (card.number.replace(/\s/g, "").length < 12) {
      nextErrors["card-number"] = "Số thẻ cần ít nhất 12 chữ số.";
    }
    if (!card.name.trim()) nextErrors["card-name"] = "Vui lòng nhập tên trên thẻ.";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      nextErrors["card-expiry"] = "Nhập theo định dạng MM/YY.";
    }
    if (!/^\d{3,4}$/.test(card.cvv)) {
      nextErrors["card-cvv"] = "CVV gồm 3 hoặc 4 chữ số.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function continueCheckout(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (step === 1 && !validateCustomer()) return;
    if (step === 3 && !validatePayment()) return;
    if (step < 4) goToStep((step + 1) as CheckoutStep);
  }

  function placeOrder() {
    const orderId = createOrderId();
    const shippingLabel =
      shippingOptions.find((option) => option.id === shippingMethod)?.label ??
      "Giao tiêu chuẩn";
    const paymentLabel =
      paymentOptions.find((option) => option.id === paymentMethod)?.label ??
      "Thanh toán khi nhận hàng";

    saveCheckoutOrder({
      createdAt: new Date().toISOString(),
      customer: {
        ...customer,
        address: customer.address.trim(),
        district: customer.district.trim(),
        email: customer.email.trim(),
        name: customer.name.trim(),
        note: customer.note.trim(),
        phone: customer.phone.trim(),
      },
      discountVND,
      id: orderId,
      items: cartItems,
      paymentMethod,
      promoCode: activePromo?.code ?? null,
      shippingFeeVND,
      shippingMethod,
      status: "confirmed",
      subtotalVND: subtotal,
      totalVND,
    });
    saveStoredCartItems([]);
    clearStoredPromoCode();
    setConfirmation({
      email: customer.email.trim(),
      id: orderId,
      paymentLabel,
      shippingLabel,
      totalVND,
    });
  }

  if (!hasLoadedCart) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-72 animate-pulse rounded-md bg-[#e9e1d5]" />
          <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_380px]">
            <div className="h-[520px] animate-pulse rounded-lg bg-white" />
            <div className="h-[420px] animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (confirmation) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-12 text-[#1f2421] sm:px-8">
        <section className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-[#d8cebf] bg-white shadow-[0_18px_50px_rgba(57,45,29,.12)]">
          <div className="bg-[#173b2d] px-6 py-10 text-center text-white sm:px-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/12">
              <CheckCircle2 className="h-9 w-9 text-[#f0bd65]" />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#f0bd65]">
              Đặt hàng thành công
            </p>
            <h1 className="mt-2 text-3xl font-bold">Cảm ơn bạn đã chọn DECOHO</h1>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Đơn hàng đã được ghi nhận và cửa hàng sẽ sớm xác nhận lịch giao.
            </p>
          </div>

          <div className="p-6 sm:p-9">
            <div className="grid gap-4 border-b border-[#eee7dc] pb-7 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-[#7b7f78]">Mã đơn hàng</p>
                <p className="mt-2 text-xl font-bold text-[#2f6f5e]">
                  {confirmation.id}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase text-[#7b7f78]">Tổng thanh toán</p>
                <p className="mt-2 text-xl font-bold">
                  {formatPrice(confirmation.totalVND)}
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#646a61]">Vận chuyển</dt>
                <dd className="text-right font-bold">{confirmation.shippingLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#646a61]">Thanh toán</dt>
                <dd className="text-right font-bold">{confirmation.paymentLabel}</dd>
              </div>
              {confirmation.email && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#646a61]">Xác nhận qua</dt>
                  <dd className="break-all text-right font-bold">{confirmation.email}</dd>
                </div>
              )}
            </dl>

            {paymentMethod === "bank" && (
              <div className="mt-6 rounded-md border border-[#ecd5ab] bg-[#fff7e8] p-4 text-sm leading-6 text-[#765022]">
                Nội dung chuyển khoản: <strong>{confirmation.id}</strong>. Bộ phận
                chăm sóc khách hàng sẽ gửi thông tin tài khoản xác nhận.
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2421] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2f6f5e]"
                href="/products"
              >
                Tiếp tục mua sắm
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-md border border-[#ded6c9] px-5 py-3 text-sm font-bold transition hover:bg-[#f7f3ec]"
                href="/"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-12 text-[#1f2421]">
        <section className="mx-auto max-w-md rounded-lg border border-[#ded6c9] bg-white p-8 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#2f6f5e]" />
          <h1 className="mt-5 text-2xl font-bold">Chưa có sản phẩm để thanh toán</h1>
          <p className="mt-3 text-sm leading-6 text-[#646a61]">
            Thêm sản phẩm vào giỏ rồi quay lại để bắt đầu đặt hàng.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1f2421] px-5 py-3 text-sm font-bold text-white"
            href="/products"
          >
            Mở catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#1f2421] sm:px-8 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 border-b border-[#ded6c9] pb-6 sm:flex-row sm:items-end">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2f6f5e] transition hover:text-[#1f2421]"
              href="/cart"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại giỏ hàng
            </Link>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Thanh toán đơn hàng</h1>
            <p className="mt-2 text-sm text-[#646a61]">
              Hoàn tất thông tin theo từng bước trước khi xác nhận mua.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-[#eef6f2] px-3 py-2 text-xs font-bold text-[#2f6f5e]">
            <ShieldCheck className="h-4 w-4" />
            Dữ liệu thanh toán demo được bảo mật
          </span>
        </div>

        <ol className="mt-6 grid grid-cols-4 overflow-hidden rounded-lg border border-[#ded6c9] bg-white shadow-sm">
          {stepLabels.map((label, index) => {
            const stepNumber = (index + 1) as CheckoutStep;
            const isComplete = stepNumber < step;
            const isActive = stepNumber === step;

            return (
              <li
                className={`flex min-w-0 items-center justify-center gap-2 border-r border-[#eee7dc] px-2 py-3 text-center text-xs font-bold last:border-r-0 sm:px-4 sm:text-sm ${
                  isActive
                    ? "bg-[#173b2d] text-white"
                    : isComplete
                      ? "bg-[#eefbf2] text-[#23643b]"
                      : "text-[#7b7f78]"
                }`}
                key={label}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    isActive ? "bg-white/15" : "bg-[#f1ece4]"
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section
            className="scroll-mt-24 rounded-lg border border-[#ded6c9] bg-white p-5 shadow-sm sm:p-7"
            id="checkout-panel"
          >
            {step === 1 && (
              <form onSubmit={continueCheckout}>
                <div className="flex items-start gap-3 border-b border-[#eee7dc] pb-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eef6f2] text-[#2f6f5e]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">Thông tin nhận hàng</h2>
                    <p className="mt-1 text-sm text-[#646a61]">
                      Cửa hàng dùng thông tin này để xác nhận và giao sản phẩm.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {[
                    { field: "name" as const, label: "Họ và tên", placeholder: "Nguyễn Minh Anh", type: "text" },
                    { field: "phone" as const, label: "Số điện thoại", placeholder: "0908 123 456", type: "tel" },
                    { field: "email" as const, label: "Email (không bắt buộc)", placeholder: "ban@example.com", type: "email" },
                    { field: "district" as const, label: "Quận / huyện", placeholder: "Quận 2", type: "text" },
                  ].map((field) => (
                    <label className="block" key={field.field}>
                      <span className="text-sm font-bold text-[#51564f]">{field.label}</span>
                      <input
                        className={`mt-2 h-12 w-full rounded-md border bg-[#fcfaf6] px-4 text-sm outline-none transition focus:ring-2 focus:ring-[#2f6f5e]/10 ${
                          errors[field.field]
                            ? "border-[#bc3d2b]"
                            : "border-[#ded6c9] focus:border-[#2f6f5e]"
                        }`}
                        onChange={(event) => updateCustomer(field.field, event.target.value)}
                        placeholder={field.placeholder}
                        type={field.type}
                        value={customer[field.field]}
                      />
                      {errors[field.field] && (
                        <span className="mt-1 block text-xs text-[#bc3d2b]">
                          {errors[field.field]}
                        </span>
                      )}
                    </label>
                  ))}

                  <label className="block">
                    <span className="text-sm font-bold text-[#51564f]">Tỉnh / thành phố</span>
                    <select
                      className="mt-2 h-12 w-full rounded-md border border-[#ded6c9] bg-[#fcfaf6] px-4 text-sm outline-none focus:border-[#2f6f5e]"
                      onChange={(event) => updateCustomer("city", event.target.value)}
                      value={customer.city}
                    >
                      <option>TP. Hồ Chí Minh</option>
                      <option>Hà Nội</option>
                      <option>Đà Nẵng</option>
                      <option>Cần Thơ</option>
                      <option>Tỉnh / thành khác</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-[#51564f]">Địa chỉ cụ thể</span>
                    <input
                      className={`mt-2 h-12 w-full rounded-md border bg-[#fcfaf6] px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f6f5e]/10 ${
                        errors.address
                          ? "border-[#bc3d2b]"
                          : "border-[#ded6c9] focus:border-[#2f6f5e]"
                      }`}
                      onChange={(event) => updateCustomer("address", event.target.value)}
                      placeholder="Số nhà, tên đường"
                      value={customer.address}
                    />
                    {errors.address && (
                      <span className="mt-1 block text-xs text-[#bc3d2b]">
                        {errors.address}
                      </span>
                    )}
                  </label>
                </div>

                <label className="mt-5 block">
                  <span className="text-sm font-bold text-[#51564f]">Ghi chú giao hàng</span>
                  <textarea
                    className="mt-2 min-h-24 w-full resize-y rounded-md border border-[#ded6c9] bg-[#fcfaf6] px-4 py-3 text-sm outline-none focus:border-[#2f6f5e]"
                    onChange={(event) => updateCustomer("note", event.target.value)}
                    placeholder="Thời gian nhận hàng, yêu cầu lắp đặt..."
                    value={customer.note}
                  />
                </label>

                <button
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#173b2d] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#285f51] sm:w-auto"
                  type="submit"
                >
                  Chọn vận chuyển
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {step === 2 && (
              <div>
                <div className="flex items-start gap-3 border-b border-[#eee7dc] pb-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eef6f2] text-[#2f6f5e]">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">Phương thức vận chuyển</h2>
                    <p className="mt-1 text-sm text-[#646a61]">
                      Chọn tốc độ giao hàng phù hợp với không gian của bạn.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {shippingOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = shippingMethod === option.id;

                    return (
                      <label
                        className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition ${
                          isSelected
                            ? "border-[#2f6f5e] bg-[#eef6f2]"
                            : "border-[#ded6c9] hover:border-[#b9c9bf]"
                        }`}
                        key={option.id}
                      >
                        <input
                          checked={isSelected}
                          className="sr-only"
                          name="shipping"
                          onChange={() => setShippingMethod(option.id)}
                          type="radio"
                        />
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-[#2f6f5e] shadow-sm">
                          <OptionIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <strong className="text-sm">{option.label}</strong>
                            <strong className="text-sm text-[#2f6f5e]">{option.fee}</strong>
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[#646a61]">
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={`mt-2 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                            isSelected
                              ? "border-[#2f6f5e] bg-[#2f6f5e] text-white"
                              : "border-[#bdb6aa]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#ded6c9] px-5 py-3 text-sm font-bold"
                    onClick={() => goToStep(1)}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#173b2d] px-5 py-3 text-sm font-bold text-white"
                    onClick={() => continueCheckout()}
                    type="button"
                  >
                    Chọn thanh toán
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex items-start gap-3 border-b border-[#eee7dc] pb-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eef6f2] text-[#2f6f5e]">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
                    <p className="mt-1 text-sm text-[#646a61]">
                      Đây là luồng demo, hệ thống không thu tiền thật.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {paymentOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = paymentMethod === option.id;

                    return (
                      <label
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${
                          isSelected
                            ? "border-[#2f6f5e] bg-[#eef6f2]"
                            : "border-[#ded6c9] hover:border-[#b9c9bf]"
                        }`}
                        key={option.id}
                      >
                        <input
                          checked={isSelected}
                          className="sr-only"
                          name="payment"
                          onChange={() => {
                            setPaymentMethod(option.id);
                            setErrors({});
                          }}
                          type="radio"
                        />
                        <OptionIcon className="h-6 w-6 shrink-0 text-[#2f6f5e]" />
                        <span className="min-w-0 flex-1">
                          <strong className="block text-sm">{option.label}</strong>
                          <span className="mt-1 block text-xs leading-5 text-[#646a61]">
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                            isSelected
                              ? "border-[#2f6f5e] bg-[#2f6f5e] text-white"
                              : "border-[#bdb6aa]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-5 grid gap-4 rounded-lg border border-[#ded6c9] bg-[#fcfaf6] p-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className="text-xs font-bold uppercase text-[#646a61]">Số thẻ</span>
                      <input
                        className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm outline-none ${
                          errors["card-number"] ? "border-[#bc3d2b]" : "border-[#ded6c9]"
                        }`}
                        inputMode="numeric"
                        onChange={(event) =>
                          updateCard(
                            "number",
                            event.target.value.replace(/[^\d\s]/g, "").slice(0, 19),
                          )
                        }
                        placeholder="4242 4242 4242 4242"
                        value={card.number}
                      />
                      {errors["card-number"] && (
                        <span className="mt-1 block text-xs text-[#bc3d2b]">{errors["card-number"]}</span>
                      )}
                    </label>
                    <label className="sm:col-span-2">
                      <span className="text-xs font-bold uppercase text-[#646a61]">Tên trên thẻ</span>
                      <input
                        className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm outline-none ${
                          errors["card-name"] ? "border-[#bc3d2b]" : "border-[#ded6c9]"
                        }`}
                        onChange={(event) => updateCard("name", event.target.value)}
                        placeholder="NGUYEN MINH ANH"
                        value={card.name}
                      />
                      {errors["card-name"] && (
                        <span className="mt-1 block text-xs text-[#bc3d2b]">{errors["card-name"]}</span>
                      )}
                    </label>
                    <label>
                      <span className="text-xs font-bold uppercase text-[#646a61]">Hết hạn</span>
                      <input
                        className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm outline-none ${
                          errors["card-expiry"] ? "border-[#bc3d2b]" : "border-[#ded6c9]"
                        }`}
                        inputMode="numeric"
                        onChange={(event) => updateCard("expiry", event.target.value.slice(0, 5))}
                        placeholder="MM/YY"
                        value={card.expiry}
                      />
                      {errors["card-expiry"] && (
                        <span className="mt-1 block text-xs text-[#bc3d2b]">{errors["card-expiry"]}</span>
                      )}
                    </label>
                    <label>
                      <span className="text-xs font-bold uppercase text-[#646a61]">CVV</span>
                      <input
                        className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm outline-none ${
                          errors["card-cvv"] ? "border-[#bc3d2b]" : "border-[#ded6c9]"
                        }`}
                        inputMode="numeric"
                        onChange={(event) =>
                          updateCard("cvv", event.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="123"
                        type="password"
                        value={card.cvv}
                      />
                      {errors["card-cvv"] && (
                        <span className="mt-1 block text-xs text-[#bc3d2b]">{errors["card-cvv"]}</span>
                      )}
                    </label>
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#ded6c9] px-5 py-3 text-sm font-bold"
                    onClick={() => goToStep(2)}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#173b2d] px-5 py-3 text-sm font-bold text-white"
                    onClick={() => continueCheckout()}
                    type="button"
                  >
                    Xem lại đơn hàng
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex items-start gap-3 border-b border-[#eee7dc] pb-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eef6f2] text-[#2f6f5e]">
                    <PackageCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">Xác nhận đơn hàng</h2>
                    <p className="mt-1 text-sm text-[#646a61]">
                      Kiểm tra lần cuối trước khi gửi đơn đến cửa hàng.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-[#a76227]">Người nhận</p>
                    <p className="mt-2 font-bold">{customer.name}</p>
                    <p className="mt-1 text-sm leading-6 text-[#646a61]">
                      {customer.phone}
                      {customer.email ? ` · ${customer.email}` : ""}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#646a61]">
                      {customer.address}, {customer.district}, {customer.city}
                    </p>
                    <button
                      className="mt-3 text-xs font-bold text-[#2f6f5e]"
                      onClick={() => goToStep(1)}
                      type="button"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#a76227]">Giao hàng và thanh toán</p>
                    <p className="mt-2 font-bold">
                      {shippingOptions.find((option) => option.id === shippingMethod)?.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#646a61]">
                      {paymentOptions.find((option) => option.id === paymentMethod)?.label}
                    </p>
                    <button
                      className="mt-3 text-xs font-bold text-[#2f6f5e]"
                      onClick={() => goToStep(2)}
                      type="button"
                    >
                      Chỉnh sửa lựa chọn
                    </button>
                  </div>
                </div>

                <div className="mt-7 border-t border-[#eee7dc] pt-6">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#51564f]">
                    <input
                      checked={termsAccepted}
                      className="mt-1 accent-[#2f6f5e]"
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      type="checkbox"
                    />
                    Tôi xác nhận thông tin đơn hàng là chính xác và đồng ý để DECOHO
                    cùng cửa hàng liên hệ xử lý đơn.
                  </label>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#ded6c9] px-5 py-3 text-sm font-bold"
                    onClick={() => goToStep(3)}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </button>
                  <button
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#d89b47] px-5 py-3 text-sm font-bold text-[#1f2421] transition hover:bg-[#e4aa55] disabled:cursor-not-allowed disabled:bg-[#d7d3cb] disabled:text-[#7b7f78]"
                    disabled={!termsAccepted}
                    onClick={placeOrder}
                    type="button"
                  >
                    Xác nhận đặt hàng · {formatPrice(totalVND)}
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-[#ded6c9] bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-[#eee7dc] pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingBag className="h-5 w-5 text-[#2f6f5e]" />
                Đơn hàng
              </h2>
              <Link className="text-xs font-bold text-[#2f6f5e]" href="/cart">
                Chỉnh sửa
              </Link>
            </div>

            <div className="max-h-72 space-y-4 overflow-y-auto py-5 pr-1">
              {cartItems.map((item) => (
                <div className="flex gap-3" key={item.id}>
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#eee7dc]">
                    <Image
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      src={item.image}
                      unoptimized={item.image.startsWith("data:")}
                    />
                    <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-bl-md bg-[#1f2421] px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold leading-5">{item.name}</p>
                    <p className="mt-1 text-xs text-[#7b7f78]">{item.category}</p>
                  </div>
                  <p className="shrink-0 text-xs font-bold">
                    {formatPrice(item.priceVND * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <dl className="space-y-3 border-t border-[#eee7dc] pt-5 text-sm">
              <div className="flex justify-between gap-3 text-[#646a61]">
                <dt>Tạm tính ({itemCount} món)</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {activePromo && (
                <div className="flex justify-between gap-3 text-[#2f6f5e]">
                  <dt>Ưu đãi {activePromo.code}</dt>
                  <dd>-{formatPrice(discountVND)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 text-[#646a61]">
                <dt>Vận chuyển</dt>
                <dd>{shippingFeeVND === 0 ? "Miễn phí" : formatPrice(shippingFeeVND)}</dd>
              </div>
              <div className="flex items-end justify-between gap-3 border-t border-[#eee7dc] pt-4">
                <dt className="font-bold">Tổng cộng</dt>
                <dd className="text-xl font-bold">{formatPrice(totalVND)}</dd>
              </div>
            </dl>

            <p className="mt-5 flex items-center justify-center gap-2 rounded-md bg-[#eef6f2] px-3 py-2 text-xs text-[#2f6f5e]">
              <ShieldCheck className="h-4 w-4" />
              Không lưu thông tin thẻ demo
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
