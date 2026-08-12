"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import GoogleSignInButton from "./GoogleSignInButton";
import { saveAuthTokens, saveSessionUser } from "../services/session";
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
      const baseUrl=(process.env.NEXT_PUBLIC_API_URL??"http://localhost:3000/api").replace(/\/$/,"");
      const response=await fetch(`${baseUrl}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.email.trim().toLowerCase(),password:form.password})});
      const data=await response.json().catch(()=>null);
      if(!response.ok){const message=Array.isArray(data?.message)?data.message.join(". "):data?.message;throw new Error(message??`Đăng nhập thất bại (${response.status}).`);}
      const apiRole=String(data.user?.role??"USER").toLowerCase();
      const role = apiRole === "customer" ? "user" : apiRole === "store" ? "supplier" : (["user", "supplier", "staff", "admin", "super_admin"].includes(apiRole) ? apiRole : "user") as "user" | "supplier" | "staff" | "admin" | "super_admin";
      saveAuthTokens(data.accessToken,data.refreshToken);
      saveSessionUser({email:data.user?.email??form.email.trim(),name:data.user?.fullName??data.user?.name??form.email.split("@")[0],remember:form.remember,role});
      router.push(["admin","super_admin","staff"].includes(role)?"/admin":role==="supplier"?"/store":"/");
    } catch(error) {
      setError(error instanceof Error?error.message:"Không thể kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf1e7] p-0 text-[#1f2421] lg:grid lg:place-items-center lg:p-8">
      <div className="grid min-h-screen w-full overflow-hidden bg-white shadow-[0_24px_70px_rgba(72,55,35,0.16)] lg:min-h-0 lg:max-w-6xl lg:grid-cols-[1.08fr_.92fr] lg:rounded-[28px] lg:border lg:border-[#e5d9c9]">
      <section className="relative hidden min-h-[780px] overflow-hidden bg-[#fff8ef] px-10 pb-8 pt-10 lg:flex lg:flex-col">
        <BrandLogo className="h-14 w-52" variant="horizontal" />
        <div className="relative z-10 mt-12 max-w-lg">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#77963b]">Không gian của bạn · Câu chuyện của bạn</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.04em]">
            Nhà của bạn.<br />Phong cách của bạn.<br /><span className="text-[#ee6c5f]">Cảm hứng của bạn.</span>
          </h1>
          <div className="mt-6 inline-flex max-w-sm rotate-[-2deg] items-center gap-3 rounded-sm bg-[#b8dc64] px-5 py-4 text-sm font-bold leading-6 shadow-sm">
            <Icon name="spark" />
            Khám phá nội thất phù hợp với căn phòng, gu thẩm mỹ và ngân sách của bạn.
          </div>
        </div>
        <div className="relative mt-7 min-h-0 flex-1 overflow-hidden rounded-[36px] border-[6px] border-white shadow-xl">
          <Image alt="Phòng khách ấm cúng của DECOHO" className="object-cover" fill priority sizes="55vw" src={heroImage} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4a3c2b]/20 to-transparent" />
          <div className="absolute right-5 top-5 rotate-3 rounded-lg border border-[#eadfce] bg-white p-3 shadow-lg">
            <p className="text-xs font-black">Good vibes, every day ✦</p>
          </div>
        </div>
        <div className="relative z-10 -mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-[#eadfce] bg-white/95 p-4 shadow-lg backdrop-blur">
          {[["☺", "Dành riêng cho bạn"], ["♢", "An toàn & tin cậy"], ["⌂", "Đúng gu, đúng nhà"]].map(([icon,label]) => <div className="text-center" key={label}><p className="text-xl font-black text-[#74933a]">{icon}</p><p className="mt-1 text-[10px] font-black">{label}</p></div>)}
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-10 lg:min-h-[780px] lg:px-14">
        <div className="w-full max-w-[400px]">
          <Link
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#646a61] hover:text-[#1f2421]"
            href="/"
          >
            <Icon name="home" />
            Về trang chủ
          </Link>

          <div className="mb-7 lg:hidden">
            <BrandLogo className="h-16 w-56" variant="horizontal" />
          </div>

          <div className="mb-6">
            <p className="mb-2 text-sm font-black text-[#78963d]">DECOHO xin chào!</p>
            <h2 className="text-4xl font-black tracking-[-0.03em]">Chào mừng trở lại ♡</h2>
            <p className="mt-2 text-sm leading-6 text-[#646a61]">
              Đăng nhập để tiếp tục hành trình trang trí không gian của bạn.
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
                  className="h-13 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#78963d] focus:ring-4 focus:ring-[#a8c85f]/15"
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
                  className="h-13 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#78963d] focus:ring-4 focus:ring-[#a8c85f]/15"
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
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#789b35] px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(120,155,53,.2)] transition hover:bg-[#66872c] disabled:opacity-60"
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
            <GoogleSignInButton
              onError={setError}
              remember={form.remember}
            />
          </div>

          <p className="mt-8 text-center text-sm text-[#646a61]">
            Chưa có tài khoản?{" "}
            <Link className="font-bold text-[#b46f2c] hover:text-[#8a5d25]" href="/register">
              Đăng ký ngay
            </Link>
          </p>
          <div className="mt-8 rounded-2xl border border-[#eadfce] bg-[#fff8ef] p-4 text-center text-sm font-semibold leading-6 text-[#5f594f]">🪴 Từ góc nhỏ ấm cúng đến căn phòng trong mơ — tìm nội thất đúng chất của bạn.</div>
        </div>
      </section>
      </div>
    </main>
  );
}
