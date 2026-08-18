"use client";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, MailCheck, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";

type State = "loading" | "success" | "error";

export default function VerifyEmailView() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("Đang xác minh địa chỉ email của bạn...");

  useEffect(() => {
    const controller = new AbortController();
    async function verify() {
      if (!token) {
        setState("error");
        setMessage("Liên kết xác minh không có token hợp lệ.");
        return;
      }
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(/\/$/, "");
        const response = await fetch(`${base}/auth/verify-email?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          const detail = Array.isArray(body?.message) ? body.message.join(". ") : body?.message;
          throw new Error(detail || "Liên kết đã hết hạn hoặc đã được sử dụng.");
        }
        setState("success");
        setMessage("Email đã được xác minh. Bây giờ bạn có thể đăng nhập vào DECOHO.");
      } catch (error) {
        if (controller.signal.aborted) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "Không thể xác minh email.");
      }
    }
    void verify();
    return () => controller.abort();
  }, [token]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#fff8ef] px-5 py-10 text-[#20352a]">
      <section className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-[#e6e2dc] bg-white p-7 text-center shadow-[0_24px_70px_rgba(72,55,35,.12)] sm:p-12">
        <span className="pointer-events-none absolute -right-5 -top-7 text-8xl text-[#d9e9a5]">✦</span>
        <BrandLogo className="mx-auto h-14 w-52" variant="horizontal" />
        <div className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-full bg-[#f3f7e7]">
          {state === "loading" && <LoaderCircle className="animate-spin text-[#8baf3f]" size={42} />}
          {state === "success" && <CheckCircle2 className="text-[#709331]" size={44} />}
          {state === "error" && <XCircle className="text-[#ef6f64]" size={44} />}
        </div>
        <p className="font-accent mt-6 text-lg text-[#78963d]">Một bước nhỏ nữa thôi ♡</p>
        <h1 className="mt-2 text-4xl">
          {state === "loading" ? "Đang xác minh email" : state === "success" ? "Xác minh thành công!" : "Không thể xác minh"}
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-[#6b7068]">{message}</p>
        {state === "success" && (
          <Link className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#8baf3f] px-7 py-3 font-bold text-white transition hover:bg-[#78963d]" href="/login">
            <MailCheck size={19} /> Đi đến đăng nhập
          </Link>
        )}
        {state === "error" && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link className="rounded-xl bg-[#20352a] px-6 py-3 font-bold text-white" href="/login">Về đăng nhập</Link>
            <Link className="rounded-xl border border-[#ddd4c7] px-6 py-3 font-bold" href="/register">Đăng ký lại</Link>
          </div>
        )}
      </section>
    </main>
  );
}
