"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, Sparkles } from "lucide-react";
import BrandLogo from "@/src/components/common/BrandLogo";
import { apiClient } from "@/src/services/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Vui lòng nhập địa chỉ email hợp lệ.");
    setBusy(true); setError("");
    try { await apiClient.post("/auth/forgot-password", { email: email.trim().toLowerCase() }); setSent(true); }
    catch (value) { setError(value instanceof Error ? value.message : "Chưa thể gửi yêu cầu. Vui lòng thử lại."); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-[#fbf1e7] p-5 text-[#1f2421]"><section className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-[#e5d9c9] bg-white p-7 shadow-[0_24px_70px_rgba(72,55,35,.14)] sm:p-10"><Sparkles className="absolute right-5 top-5 text-[#b8dc64]" fill="currentColor" size={36}/><BrandLogo className="h-12 w-44" variant="horizontal" />{sent ? <div className="mt-10 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf6d8] text-[#719332]"><CheckCircle2 size={34}/></div><p className="mt-6 font-accent text-lg text-[#78953b]">Kiểm tra hộp thư nhé ✦</p><h1 className="mt-2 text-3xl font-black">Đã gửi yêu cầu</h1><p className="mt-3 leading-7 text-[#666d64]">Nếu email này có tài khoản DECOHO, bạn sẽ nhận được liên kết đặt lại mật khẩu trong ít phút. Liên kết có hiệu lực trong 15 phút.</p><Link className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#78953b] px-5 py-3 font-bold text-white" href="/login"><ArrowLeft size={18}/> Về đăng nhập</Link></div> : <><Link className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#6e746b] hover:text-[#263020]" href="/login"><ArrowLeft size={17}/> Quay lại đăng nhập</Link><div className="mt-8"><p className="font-accent text-lg text-[#78953b]">Đừng lo, mình giúp bạn ✦</p><h1 className="mt-2 text-3xl font-black">Quên mật khẩu?</h1><p className="mt-3 leading-7 text-[#666d64]">Nhập email đã đăng ký. DECOHO sẽ gửi liên kết để bạn tạo mật khẩu mới.</p></div><form className="mt-7 space-y-4" onSubmit={submit}><label className="block text-xs font-bold uppercase text-[#51564f]">Địa chỉ email<span className="relative mt-2 block"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e746b]" size={18}/><input autoComplete="email" className="h-13 w-full rounded-xl border border-[#ded6c9] pl-10 pr-4 outline-none focus:border-[#78963d] focus:ring-4 focus:ring-[#a8c85f]/15" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" type="email" value={email}/></span></label>{error && <p className="rounded-xl bg-[#fff1ee] p-3 text-sm text-[#a34a40]">{error}</p>}<button className="h-13 w-full rounded-xl bg-[#78953b] font-bold text-white disabled:opacity-60" disabled={busy} type="submit">{busy ? "Đang gửi..." : "Gửi liên kết đặt lại"}</button></form></>}</section></main>;
}
