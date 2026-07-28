"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import {
  demoAdminCredentials,
  demoAdminSessionUser,
} from "@/src/features/admin/mock/adminDemo";
import { demoStoreCredentials, demoStoreSessionUser } from "@/src/features/store/mock/storeDemo";
import GoogleSignInButton from "./GoogleSignInButton";
import { saveSessionUser } from "../services/session";
import type { LoginFormState } from "../types";

type IconName = "arrow" | "home" | "lock" | "mail" | "shield" | "spark";

const heroImage = "/images/decoho-home-interior-v2.png";

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

  function completeAdminLogin() {
    saveSessionUser({
      ...demoAdminSessionUser,
      remember: form.remember,
    });
    router.push("/admin");
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

    const normalizedEmail = form.email.trim().toLowerCase();

    if (normalizedEmail === demoAdminCredentials.email) {
      if (form.password !== demoAdminCredentials.password) {
        setError("Mật khẩu Admin demo là admin123.");
        return;
      }

      setIsLoading(true);

      window.setTimeout(() => {
        setIsLoading(false);
        completeAdminLogin();
      }, 650);
      return;
    }

    if (normalizedEmail === demoStoreCredentials.email) {
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

  function handleAdminDemoLogin() {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      completeAdminLogin();
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
        <div className="w-full max-w-[400px]">
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
              Hoặc tiếp tục với
            </span>
          </div>

          <div className="grid gap-3">
            <GoogleSignInButton
              onError={setError}
              remember={form.remember}
            />

            <div className="relative py-1 text-center">
              <hr className="border-[#ded6c9]" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f7f3ec] px-3 text-[10px] font-bold uppercase text-[#7b7f78]">
                Tài khoản demo
              </span>
            </div>

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

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#c8c3dd] bg-[#f3f1fa] px-4 text-xs font-bold uppercase text-[#51477e] transition hover:bg-[#e8e4f5]"
              id="admin-demo-login-btn"
              onClick={handleAdminDemoLogin}
              type="button"
            >
              <Icon name="shield" />
              Dùng thử Admin demo
            </button>

            {/* <p className="rounded-md border border-[#ded6c9] bg-white px-3 py-2 text-xs leading-5 text-[#646a61]">
              Store demo: <strong>{demoStoreCredentials.email}</strong> /{" "}
              <strong>{demoStoreCredentials.password}</strong>
            </p> */}

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
