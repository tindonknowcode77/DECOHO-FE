"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle2, Mail, Sparkles, X } from "lucide-react";
import BrandLogo from "@/src/components/common/BrandLogo";
import PasswordVisibilityButton from "./PasswordVisibilityButton";
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
  const [form, setForm] = useState<RegisterFormState>({
    agreeTerms: false,
    confirmPassword: "",
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function updateField<TField extends keyof RegisterFormState>(
    field: TField,
    value: RegisterFormState[TField],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

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
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          fullName: form.name.trim(),
          password: form.password,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(". ") : data?.message;
        throw new Error(message ?? `Đăng ký thất bại (${response.status}).`);
      }
      setRegisteredEmail(form.email.trim().toLowerCase());
      setSuccess(data?.message ?? "Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập.");
      setForm({ agreeTerms: false, confirmPassword: "", email: "", name: "", password: "" });
      window.sessionStorage.setItem(
        "decoho_registration_notice",
        "Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập.",
      );
    } catch (value) {
      setError(value instanceof Error ? value.message : "Không thể kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf1e7] p-0 text-[#1f2421] lg:grid lg:place-items-center lg:p-8">
      <div className="grid min-h-screen w-full overflow-hidden bg-white shadow-[0_24px_70px_rgba(72,55,35,0.16)] lg:min-h-0 lg:max-w-6xl lg:grid-cols-[1.08fr_.92fr] lg:rounded-[28px] lg:border lg:border-[#e5d9c9]">
      <section className="relative hidden min-h-[820px] overflow-hidden bg-[#fff8ef] px-10 pb-8 pt-10 lg:flex lg:flex-col">
        <BrandLogo className="h-14 w-52" variant="horizontal" />
        <div className="relative z-10 mt-10 max-w-lg">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#77963b]">Bắt đầu hành trình DECOHO</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.04em]">Tạo tổ ấm.<br />Lưu cảm hứng.<br /><span className="text-[#ee6c5f]">Sống đúng gu ♡</span></h1>
          <div className="mt-6 inline-flex rotate-[-2deg] items-center gap-3 rounded-sm bg-[#b8dc64] px-5 py-4 text-sm font-bold shadow-sm"><Icon name="spark" />Một tài khoản nhỏ, thật nhiều ý tưởng xinh cho ngôi nhà của bạn.</div>
        </div>
        <div className="relative mt-7 min-h-0 flex-1 overflow-hidden rounded-[36px] border-[6px] border-white shadow-xl">
          <Image alt="Không gian nội thất ấm cúng của DECOHO" className="object-cover" fill priority sizes="55vw" src={heroImage} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4a3c2b]/20 to-transparent" />
          <div className="absolute right-5 top-5 rotate-3 rounded-lg border border-[#eadfce] bg-white p-3 shadow-lg"><p className="text-xs font-black">Your home, your happy place ✦</p></div>
        </div>
        <div className="relative z-10 -mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-[#eadfce] bg-white/95 p-4 shadow-lg backdrop-blur">
          {[["✦", "Quét phòng bằng AI"], ["♡", "Lưu gu yêu thích"], ["⌂", "Mua sắm dễ dàng"]].map(([icon,label]) => <div className="text-center" key={label}><p className="text-xl font-black text-[#74933a]">{icon}</p><p className="mt-1 text-[10px] font-black">{label}</p></div>)}
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-10 lg:min-h-[820px] lg:px-14">
        <div className="w-full max-w-md">
          <Link
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#646a61] hover:text-[#1f2421]"
            href="/"
          >
            <Icon name="home" />
            Về trang chủ
          </Link>

          <div className="mb-6 lg:hidden">
            <BrandLogo className="h-16 w-56" variant="horizontal" />
          </div>

          <div className="mb-6">
            <p className="mb-2 text-sm font-black text-[#78963d]">Cùng trang trí nào!</p>
            <h2 className="text-4xl font-black tracking-[-0.03em]">Tạo tài khoản mới ♡</h2>
            <p className="mt-2 text-sm leading-6 text-[#646a61]">
              Tham gia DECOHO để lưu mọi cảm hứng cho căn nhà trong mơ.
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
                  className="h-12 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[#78963d] focus:ring-4 focus:ring-[#a8c85f]/15"
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
                  className="h-12 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#78963d] focus:ring-4 focus:ring-[#a8c85f]/15"
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
                  className="h-12 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#78963d] focus:ring-4 focus:ring-[#a8c85f]/15"
                  id="register-password"
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                />
                <PasswordVisibilityButton
                  inputId="register-password"
                  onToggle={() => setShowPassword((current) => !current)}
                  visible={showPassword}
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
                  className="h-12 w-full rounded-xl border border-[#ded6c9] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[#78963d] focus:ring-4 focus:ring-[#a8c85f]/15"
                  id="register-confirm-password"
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                />
                <PasswordVisibilityButton
                  inputId="register-confirm-password"
                  onToggle={() => setShowConfirmPassword((current) => !current)}
                  visible={showConfirmPassword}
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
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#789b35] px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(120,155,53,.2)] transition hover:bg-[#66872c] disabled:opacity-60"
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
          <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#fff8ef] p-4 text-center text-sm font-semibold leading-6 text-[#5f594f]">🌼 Mỗi ngôi nhà đẹp đều bắt đầu từ một ý tưởng nhỏ xinh.</div>
        </div>
      </section>
      </div>
      {success && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#20352a]/45 p-4 backdrop-blur-sm">
          <section aria-labelledby="register-success-title" aria-modal="true" className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-white/70 bg-[#fffdf8] p-7 text-center shadow-[0_30px_90px_rgba(32,53,42,.28)] sm:p-10" role="dialog">
            <button aria-label="Đóng thông báo" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[#777b74] transition hover:bg-[#f3eee6]" onClick={() => setSuccess("")} type="button"><X size={19} /></button>
            <span className="pointer-events-none absolute -left-3 top-8 rotate-[-14deg] text-4xl text-[#f06f64]">♡</span>
            <span className="pointer-events-none absolute right-9 top-14 text-3xl text-[#e8b846]">✦</span>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#eaf3ca] text-[#729232] shadow-inner"><CheckCircle2 size={44} /></div>
            <p className="font-accent mt-5 text-lg text-[#78963d]">Chào mừng bạn đến DECOHO ✦</p>
            <h2 className="mt-1 text-4xl" id="register-success-title">Đăng ký thành công!</h2>
            <p className="mx-auto mt-4 max-w-sm leading-7 text-[#666d64]">Chúng mình vừa gửi một liên kết xác minh tới</p>
            <p className="mx-auto mt-2 w-fit rounded-full bg-[#fff0e4] px-4 py-2 text-sm font-extrabold text-[#8f554d]">{registeredEmail}</p>
            <div className="mt-6 rounded-2xl border border-[#dfe8c2] bg-[#f7faec] p-4 text-left text-sm leading-6 text-[#566149]">
              <p className="flex gap-3"><Mail className="mt-0.5 shrink-0 text-[#78963d]" size={20} /><span><strong>Mở hộp thư</strong> và bấm nút xác minh email. Sau đó quay lại DECOHO để đăng nhập nhé!</span></p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8baf3f] px-5 py-3 font-bold text-white transition hover:bg-[#78963d]" href="https://mail.google.com" rel="noreferrer" target="_blank"><Mail size={18} /> Mở Gmail</a>
              <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8cebf] bg-white px-5 py-3 font-bold text-[#20352a] transition hover:bg-[#f8f3eb]" href="/login"><Sparkles size={18} /> Đến đăng nhập</Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-[#858980]">Chưa thấy email? Hãy kiểm tra mục Spam hoặc đợi thêm một chút.</p>
          </section>
        </div>
      )}
    </main>
  );
}
