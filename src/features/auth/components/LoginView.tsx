"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import { demoStoreCredentials, demoStoreSessionUser } from "@/src/features/store/mock/storeDemo";
import { saveSessionUser } from "../services/session";
import type { LoginFormState } from "../types";

type IconName = "arrow" | "home" | "lock" | "mail" | "shield" | "spark";

const heroImage =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=85&w=1400";

function Icon({ name }: { name: IconName }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    home: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v11H6V10Zm6 5v2",
    mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
    shield: "M12 3 19 6v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Zm0 5v4m0 4h.01",
    spark:
      "m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z",
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

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M21.6 12.2c0-.7-.1-1.3-.2-1.9h-9.2v3.7h5.3a4.5 4.5 0 0 1-2 2.9v2.4h3.2c1.9-1.7 2.9-4.2 2.9-7.1Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 21.8c2.7 0 5-0.9 6.6-2.5l-3.2-2.4c-.9.6-2 .9-3.4.9a5.9 5.9 0 0 1-5.5-4H3.4v2.5a10 10 0 0 0 8.8 5.5Z"
        fill="#34A853"
      />
      <path
        d="M6.7 13.8a6 6 0 0 1 0-3.7V7.6H3.4a10 10 0 0 0 0 8.7l3.3-2.5Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9a9.8 9.8 0 0 0-6.7-2.6 10 10 0 0 0-8.8 5.5l3.3 2.5a5.9 5.9 0 0 1 5.5-4Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginView() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField<TField extends keyof LoginFormState>(
    field: TField,
    value: LoginFormState[TField],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function completeLogin(name: string, email: string, targetPath = "/") {
    saveSessionUser({
      email,
      name,
      remember: form.remember,
    });
    router.push(targetPath);
  }

  function completeStoreLogin() {
    saveSessionUser({
      ...demoStoreSessionUser,
      remember: form.remember,
    });
    router.push("/");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Email không đúng định dạng.");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.email.trim().toLowerCase() === demoStoreCredentials.email) {
      if (form.password !== demoStoreCredentials.password) {
        setError("Mật khẩu Store demo là store123.");
        return;
      }

      setIsLoading(true);

      window.setTimeout(() => {
        setIsLoading(false);
        completeStoreLogin();
      }, 650);
      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      completeLogin(form.email.split("@")[0].toUpperCase(), form.email.trim());
    }, 900);
  }

  function handleDemoLogin() {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      completeLogin("Nguyễn Minh Anh", "demo.designer@gmail.com");
    }, 650);
  }

  function handleStoreDemoLogin() {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      completeStoreLogin();
    }, 650);
  }

  return (
    <main className="grid min-h-screen bg-[#f7f3ec] text-[#1f2421] lg:grid-cols-12">
      <section className="relative hidden overflow-hidden bg-[#1f2421] lg:col-span-7 lg:flex lg:items-end">
        <Image
          alt="Không gian nội thất cao cấp"
          className="h-full w-full object-cover opacity-80"
          fill
          priority
          sizes="60vw"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2421] via-[#1f2421]/45 to-transparent" />

        <div className="relative z-10 max-w-2xl p-12 text-white">
          <p className="inline-flex items-center gap-2 rounded-md border border-[#d89b47]/35 bg-[#d89b47]/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f7d79a]">
            <Icon name="spark" />
            Trí tuệ nhân tạo kiến tạo không gian
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Nâng tầm không gian sống của bạn.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
            DECOHO giúp phân tích mặt bằng, gợi ý phong cách, chọn sản phẩm và
            chuẩn bị giỏ hàng nội thất trong một quy trình liền mạch.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-white/20 pt-7">
            {[
              ["100k+", "Mẫu thiết kế AI"],
              ["04s", "Phân tích tức thời"],
              ["98.5%", "Khách hàng hài lòng"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-white/65">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:col-span-5">
        <div className="w-full max-w-md">
          <Link
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#646a61] hover:text-[#1f2421]"
            href="/"
          >
            <Icon name="home" />
            Về trang chủ
          </Link>

          <div className="mb-8">
            <BrandLogo className="h-16 w-56" variant="horizontal" />
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold">Chào mừng quay trở lại</h2>
            <p className="mt-2 text-sm leading-6 text-[#646a61]">
              Đăng nhập để tiếp tục quản lý hồ sơ, bản phân tích AI và giỏ hàng
              nội thất của bạn.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-md border border-[#efc2bc] bg-[#fff1ee] p-3 text-sm text-[#9b5148]">
              <span className="mt-0.5">
                <Icon name="shield" />
              </span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-xs font-bold uppercase text-[#51564f]">Email của bạn</span>
              <span className="relative mt-2 block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                  <Icon name="mail" />
                </span>
                <input
                  autoComplete="email"
                  className="h-12 w-full rounded-md border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/15"
                  id="login-email"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  value={form.email}
                />
              </span>
            </label>

            <label className="block">
              <span className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#51564f]">Mật khẩu</span>
                <Link
                  className="text-xs font-bold text-[#b46f2c] hover:text-[#8a5d25]"
                  href="/forgot-password"
                >
                  Quên mật khẩu?
                </Link>
              </span>
              <span className="relative mt-2 block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                  <Icon name="lock" />
                </span>
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-md border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/15"
                  id="login-password"
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                />
              </span>
            </label>

            <label className="flex w-fit items-center gap-2 text-sm font-semibold text-[#646a61]">
              <input
                checked={form.remember}
                className="h-4 w-4 rounded border-[#ded6c9] accent-[#2f6f5e]"
                id="remember-me"
                onChange={(event) => updateField("remember", event.target.checked)}
                type="checkbox"
              />
              Ghi nhớ đăng nhập
            </label>

            <button
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#1f2421] px-5 text-sm font-bold text-white transition hover:bg-[#2f352f] disabled:opacity-60"
              disabled={isLoading}
              id="login-submit-btn"
              type="submit"
            >
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Đăng nhập ngay
                  <Icon name="arrow" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <hr className="border-[#ded6c9]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f7f3ec] px-3 text-xs font-semibold text-[#646a61]">
              Hoặc đăng nhập nhanh
            </span>
          </div>

          <div className="grid gap-3">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#ecd5ab] bg-[#fff7e8] px-4 text-xs font-bold uppercase text-[#8a5d25] transition hover:bg-[#fbe9c3]"
              id="demo-login-btn"
              onClick={handleDemoLogin}
              type="button"
            >
              <Icon name="spark" />
              Dùng thử bản demo
            </button>

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#b7dfc4] bg-[#eefbf2] px-4 text-xs font-bold uppercase text-[#23643b] transition hover:bg-[#dff1e6]"
              id="store-demo-login-btn"
              onClick={handleStoreDemoLogin}
              type="button"
            >
              <Icon name="shield" />
              Dùng thử Store demo
            </button>

            {/* <p className="rounded-md border border-[#ded6c9] bg-white px-3 py-2 text-xs leading-5 text-[#646a61]">
              Store demo: <strong>{demoStoreCredentials.email}</strong> /{" "}
              <strong>{demoStoreCredentials.password}</strong>
            </p> */}

            <div className="grid grid-cols-3 gap-3">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#ded6c9] bg-white text-xs font-bold"
                type="button"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-md border border-[#ded6c9] bg-white text-xs font-bold text-[#1877f2]"
                type="button"
              >
                Facebook
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-md border border-[#ded6c9] bg-white text-xs font-bold"
                type="button"
              >
                Apple
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#646a61]">
            Chưa có tài khoản?{" "}
            <Link className="font-bold text-[#b46f2c] hover:text-[#8a5d25]" href="/register">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
