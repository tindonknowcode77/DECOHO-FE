"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import { saveSessionUser } from "../services/session";
import type { RegisterFormState } from "../types";

type IconName = "arrow" | "check" | "home" | "lock" | "mail" | "shield" | "spark" | "user";

const heroImage = "/images/decoho-home-interior-v2.png";

function Icon({ name }: { name: IconName }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "m5 12 4 4L19 6",
    home: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v11H6V10Zm6 5v2",
    mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
    shield: "M12 3 19 6v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Zm0 5v4m0 4h.01",
    spark:
      "m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z",
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
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

export default function RegisterView() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>({
    agreeTerms: false,
    confirmPassword: "",
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField<TField extends keyof RegisterFormState>(
    field: TField,
    value: RegisterFormState[TField],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Vui lòng nhập đầy đủ tất cả các trường.");
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

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    if (!form.agreeTerms) {
      setError("Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật.");
      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      saveSessionUser({
        email: form.email.trim(),
        name: form.name.trim(),
        registeredAt: new Date().toISOString(),
      });
      setIsLoading(false);
      router.push("/profile");
    }, 900);
  }

  return (
    <main className="grid min-h-screen bg-[#f7f3ec] text-[#1f2421] lg:grid-cols-12">
      <section className="relative hidden overflow-hidden bg-[#1f2421] lg:col-span-7 lg:flex lg:items-end">
        <Image
          alt="Không gian nội thất Japandi sáng và ấm"
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
            Trải nghiệm xu hướng thiết kế mới
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Hiện thực hóa ngôi nhà trong mơ của bạn.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
            Tạo tài khoản miễn phí để mở khóa phân tích không gian AI, lưu hồ
            sơ gu thẩm mỹ, quản lý sản phẩm yêu thích và chuẩn bị giỏ hàng nội
            thất cá nhân.
          </p>

          <div className="mt-8 grid max-w-xl gap-3 border-t border-white/20 pt-7">
            {[
              "Phân tích ảnh phòng bằng AI",
              "Lưu phong cách và vật liệu yêu thích",
              "Đồng bộ catalog sản phẩm và giỏ hàng",
            ].map((item) => (
              <p className="flex items-center gap-3 text-sm text-white/80" key={item}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d89b47] text-[#1f2421]">
                  <Icon name="check" />
                </span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:col-span-5">
        <div className="w-full max-w-md">
          <Link
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#646a61] hover:text-[#1f2421]"
            href="/"
          >
            <Icon name="home" />
            Về trang chủ
          </Link>

          <div className="mb-6">
            <BrandLogo className="h-16 w-56" variant="horizontal" />
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold">Đăng ký tài khoản</h2>
            <p className="mt-2 text-sm leading-6 text-[#646a61]">
              Cùng AI khởi tạo không gian sống tương lai chỉ trong vài bước.
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
              <span className="text-xs font-bold uppercase text-[#51564f]">Họ và tên</span>
              <span className="relative mt-2 block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                  <Icon name="user" />
                </span>
                <input
                  autoComplete="name"
                  className="h-11 w-full rounded-md border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/15"
                  id="register-name"
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={form.name}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase text-[#51564f]">Địa chỉ email</span>
              <span className="relative mt-2 block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                  <Icon name="mail" />
                </span>
                <input
                  autoComplete="email"
                  className="h-11 w-full rounded-md border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/15"
                  id="register-email"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  value={form.email}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase text-[#51564f]">
                Mật khẩu tối thiểu 6 ký tự
              </span>
              <span className="relative mt-2 block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                  <Icon name="lock" />
                </span>
                <input
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/15"
                  id="register-password"
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase text-[#51564f]">
                Nhập lại mật khẩu
              </span>
              <span className="relative mt-2 block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                  <Icon name="lock" />
                </span>
                <input
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/15"
                  id="register-confirm-password"
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={form.confirmPassword}
                />
              </span>
            </label>

            <label className="flex items-start gap-2 text-xs leading-5 text-[#646a61]">
              <input
                checked={form.agreeTerms}
                className="mt-1 h-4 w-4 rounded border-[#ded6c9] accent-[#2f6f5e]"
                id="agree-terms"
                onChange={(event) => updateField("agreeTerms", event.target.checked)}
                type="checkbox"
              />
              <span>
                Tôi đồng ý với{" "}
                <Link className="font-bold text-[#b46f2c]" href="/register#terms">
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link className="font-bold text-[#b46f2c]" href="/register#privacy">
                  Chính sách bảo mật
                </Link>{" "}
                của hệ thống.
              </span>
            </label>

            <button
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#1f2421] px-5 text-sm font-bold text-white transition hover:bg-[#2f352f] disabled:opacity-60"
              disabled={isLoading}
              id="register-submit-btn"
              type="submit"
            >
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Đăng ký tài khoản
                  <Icon name="arrow" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#646a61]">
            Đã có tài khoản?{" "}
            <Link className="font-bold text-[#b46f2c] hover:text-[#8a5d25]" href="/login">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
