"use client";

import AuthShell from "./AuthShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import GoogleSignInButton from "./GoogleSignInButton";
import PasswordVisibilityButton from "./PasswordVisibilityButton";
import { saveAuthTokens, saveSessionUser } from "../services/session";
import type { LoginFormState } from "../types";

type IconName = "arrow" | "home" | "lock" | "mail" | "shield" | "spark";

function Icon({ name }: { name: IconName }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    home: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v11H6V10Zm6 5v2",
    mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
    shield:
      "M12 3 19 6v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Zm0 5v4m0 4h.01",
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
  const [showPassword, setShowPassword] = useState(false);

  function updateField<TField extends keyof LoginFormState>(
    field: TField,
    value: LoginFormState[TField],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    setIsLoading(true);
    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_API_URL ?? "/backend-api"
      ).replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(". ")
          : data?.message;
        throw new Error(message ?? `Đăng nhập thất bại (${response.status}).`);
      }
      const apiRole = String(data.user?.role ?? "USER").toLowerCase();
      const role =
        apiRole === "customer"
          ? "user"
          : apiRole === "store"
            ? "supplier"
            : ((["user", "supplier", "staff", "admin", "super_admin"].includes(
                apiRole,
              )
                ? apiRole
                : "user") as
                | "user"
                | "supplier"
                | "staff"
                | "admin"
                | "super_admin");
      saveAuthTokens(data.accessToken, data.refreshToken);
      const onboardingCompleted = Boolean(data.user?.onboardingCompleted);
      saveSessionUser({
        _id: data.user?._id,
        email: data.user?.email ?? form.email.trim(),
        name:
          data.user?.fullName ?? data.user?.name ?? form.email.split("@")[0],
        remember: form.remember,
        role,
        onboardingCompleted,
      });
      router.push(
        ["admin", "super_admin", "staff"].includes(role)
          ? "/admin"
          : role === "supplier"
            ? "/store"
            : onboardingCompleted
              ? "/"
              : "/onboarding",
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Không thể kết nối máy chủ.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell mode="login">
      <Link
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#646a61] hover:text-[#2f6f5e]"
        href="/"
      >
        <Icon name="home" />
        Về trang chủ
      </Link>

      <div className="mb-8">
        <BrandLogo className="h-12 w-44" variant="horizontal" />
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-black text-[#2e6f5e]">
          DECOHO xin chào!
        </p>
        <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          Chào mừng trở lại
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#646a61]">
          Đăng nhập để tiếp tục hành trình trang trí không gian của bạn.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-md border border-[#efc2bc] bg-[#fff1ee] p-3 text-sm text-[#9b5148]"
        >
          <span className="mt-0.5">
            <Icon name="shield" />
          </span>
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-xs font-bold uppercase text-[#51564f]">
            Email của bạn
          </span>
          <span className="relative mt-2 block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
              <Icon name="mail" />
            </span>
            <input
              autoComplete="email"
              className="h-13 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[#2e6f5e] focus:ring-4 focus:ring-[#2e6f5e]/10"
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
            <span className="text-xs font-bold uppercase text-[#51564f]">
              Mật khẩu
            </span>
            <Link
              className="text-xs font-bold text-[#2e6f5e] hover:text-[#194b3e]"
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
              className="h-13 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[#2e6f5e] focus:ring-4 focus:ring-[#2e6f5e]/10"
              id="login-password"
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={form.password}
            />
            <PasswordVisibilityButton
              inputId="login-password"
              onToggle={() => setShowPassword((current) => !current)}
              visible={showPassword}
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
          className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#2e6f5e] px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(46,111,94,.16)] transition hover:bg-[#245747] disabled:opacity-60"
          aria-busy={isLoading}
          aria-label={isLoading ? "Đang đăng nhập" : undefined}
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
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-semibold text-[#646a61]">
          Hoặc tiếp tục với
        </span>
      </div>

      <div className="grid gap-3">
        <GoogleSignInButton onError={setError} remember={form.remember} />
      </div>

      <p className="mt-8 text-center text-sm text-[#646a61]">
        Chưa có tài khoản?{" "}
        <Link
          className="font-bold text-[#2e6f5e] hover:text-[#194b3e]"
          href="/register"
        >
          Đăng ký ngay
        </Link>
      </p>
    </AuthShell>
  );
}
