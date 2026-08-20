"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { CheckCircle2, KeyRound, LockKeyhole } from "lucide-react";
import BrandLogo from "@/src/components/common/BrandLogo";
import PasswordVisibilityButton from "../components/PasswordVisibilityButton";
import { apiClient } from "@/src/services/axios";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [showPassword, setShowPassword] = useState(false); const [showConfirm, setShowConfirm] = useState(false); const [busy, setBusy] = useState(false); const [success, setSuccess] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError("Liên kết đặt lại mật khẩu không hợp lệ.");
    if (password.length < 6) return setError("Mật khẩu cần có ít nhất 6 ký tự.");
    if (password !== confirm) return setError("Mật khẩu xác nhận chưa khớp.");
    setBusy(true); setError("");
    try { await apiClient.post("/auth/reset-password", { token, password }); setSuccess(true); }
    catch (value) { setError(value instanceof Error ? value.message : "Không thể đặt lại mật khẩu."); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-[#fbf1e7] p-5 text-[#1f2421]"><section className="w-full max-w-md rounded-[30px] border border-[#e5d9c9] bg-white p-7 shadow-[0_24px_70px_rgba(72,55,35,.14)] sm:p-10"><BrandLogo className="h-12 w-44" variant="horizontal" />{success ? <div className="mt-10 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf6d8] text-[#719332]"><CheckCircle2 size={34}/></div><h1 className="mt-6 text-3xl font-black">Mật khẩu đã được đổi</h1><p className="mt-3 leading-7 text-[#666d64]">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p><Link className="mt-7 inline-flex rounded-xl bg-[#78953b] px-5 py-3 font-bold text-white" href="/login">Đến trang đăng nhập</Link></div> : <><div className="mt-8"><p className="font-accent text-lg text-[#78953b]">Một bước nhỏ nữa thôi ✦</p><h1 className="mt-2 text-3xl font-black">Tạo mật khẩu mới</h1><p className="mt-3 leading-7 text-[#666d64]">Chọn một mật khẩu an toàn, tối thiểu 6 ký tự.</p></div><form className="mt-7 space-y-4" onSubmit={submit}><label className="block text-xs font-bold uppercase text-[#51564f]">Mật khẩu mới<span className="relative mt-2 block"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e746b]" size={18}/><input autoComplete="new-password" className="h-13 w-full rounded-xl border border-[#ded6c9] pl-10 pr-11 outline-none focus:border-[#78963d]" id="new-password" onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} value={password}/><PasswordVisibilityButton inputId="new-password" onToggle={() => setShowPassword((current) => !current)} visible={showPassword}/></span></label><label className="block text-xs font-bold uppercase text-[#51564f]">Xác nhận mật khẩu<span className="relative mt-2 block"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e746b]" size={18}/><input autoComplete="new-password" className="h-13 w-full rounded-xl border border-[#ded6c9] pl-10 pr-11 outline-none focus:border-[#78963d]" id="confirm-password" onChange={(e) => setConfirm(e.target.value)} type={showConfirm ? "text" : "password"} value={confirm}/><PasswordVisibilityButton inputId="confirm-password" onToggle={() => setShowConfirm((current) => !current)} visible={showConfirm}/></span></label>{error && <p className="rounded-xl bg-[#fff1ee] p-3 text-sm text-[#a34a40]">{error}</p>}<button className="h-13 w-full rounded-xl bg-[#78953b] font-bold text-white disabled:opacity-60" disabled={busy} type="submit">{busy ? "Đang cập nhật..." : "Đặt lại mật khẩu"}</button></form><p className="mt-6 text-center text-sm text-[#6e746b]"><Link className="font-bold text-[#718d34]" href="/forgot-password">Gửi lại liên kết</Link></p></>}</section></main>;
}
