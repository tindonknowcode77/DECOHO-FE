"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Trash2, Lock, Camera, UserCheck, Mail, CheckCircle2 } from "lucide-react";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";
import { clearSessionUser, getSessionUser } from "@/src/features/auth/services/session";

export default function PrivacyPolicyPage() {
  const [emailInput, setEmailInput] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const sessionUser = typeof window !== "undefined" ? getSessionUser() : null;

  const handleDirectDeleteAccount = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản DECOHO của mình? Hành động này không thể hoàn tác.",
      )
    ) {
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
      const res = await authenticatedFetch(`${base}/users/me`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Không thể xóa tài khoản (${res.status}).`);
      }
      clearSessionUser();
      setSubmitted(true);
    } catch (err: any) {
      setDeleteError(err?.message || "Đã xảy ra lỗi khi xóa tài khoản.");
    } finally {
      setDeleting(false);
    }
  };

  const handleWebDeletionRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#f8f6f0] py-12 px-4 sm:px-6 lg:px-8 text-[#293d32]">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <header className="rounded-3xl border border-[#ded6c9] bg-white p-8 shadow-xs sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2e7] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2f6f5e]">
            <ShieldCheck size={15} />
            <span>DECOHO · Privacy & Data Safety</span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#17211b] sm:text-4xl">
            Chính Sách Bảo Mật & Quyền Riêng Tư
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#646a61]">
            Áp dụng cho nền tảng Website và Ứng dụng di động <strong>DECOHO</strong> (Package ID:{" "}
            <code className="rounded bg-[#f2efe6] px-1.5 py-0.5 font-mono text-xs text-[#254f43]">
              com.decoho.mobile
            </code>
            ) trên Google Play & App Store. Cập nhật lần cuối: 07/11/2026.
          </p>
        </header>

        {/* Sections */}
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2e7] text-[#2f6f5e]">
                <UserCheck size={20} />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#17211b]">
                1. Dữ liệu chúng tôi thu thập
              </h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#5c645a]">
              <li>
                • <strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ Email, số điện thoại và ảnh đại diện khi bạn đăng ký hoặc đăng nhập qua Google.
              </li>
              <li>
                • <strong>Nội dung người dùng tạo:</strong> Hình ảnh không gian phòng, bài viết chia sẻ trên diễn đàn cộng đồng và danh sách sản phẩm yêu thích.
              </li>
              <li>
                • <strong>Thông tin đơn hàng:</strong> Địa chỉ giao hàng và lịch sử đơn hàng nội thất hoặc mã đơn tiếp thị liên kết Shopee do bạn cung cấp.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2e7] text-[#2f6f5e]">
                <Camera size={20} />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#17211b]">
                2. Quyền truy cập trên thiết bị
              </h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#5c645a]">
              <li>
                • <strong>Máy ảnh (Camera) & Thư viện ảnh:</strong> Chỉ được kích hoạt khi bạn chủ động chụp ảnh phòng để dùng tính năng AI gợi ý nội thất, cập nhật ảnh đại diện hoặc đăng bài trong cộng đồng.
              </li>
              <li>
                • <strong>Không thu thập ngầm:</strong> DECOHO không yêu cầu quyền ghi âm (Microphone), không theo dõi vị trí nền (Background Location) và không truy cập danh bạ của bạn.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-xs sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2e7] text-[#2f6f5e]">
                <Lock size={20} />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#17211b]">
                3. Mục đích sử dụng & Bảo mật dữ liệu
              </h2>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#5c645a]">
              Mọi dữ liệu truyền tải giữa ứng dụng di động DECOHO và máy chủ đều được mã hóa qua giao thức <strong>HTTPS/TLS</strong>. Token đăng nhập trên thiết bị di động được lưu trữ an toàn trong vùng nhớ mã hóa phần cứng (<code>Expo SecureStore</code> / Android Keystore). Chúng tôi cam kết không bán hoặc chia sẻ dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo.
            </p>
          </div>
        </section>

        {/* Account Deletion Section - Required by Google Play */}
        <section
          id="delete-account"
          className="scroll-mt-24 rounded-3xl border-2 border-[#2f6f5e]/30 bg-white p-8 shadow-sm sm:p-10"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-700">
              <Trash2 size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                Google Play Data Safety Compliance
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#17211b]">
                4. Hướng Dẫn & Yêu Cầu Xóa Tài Khoản (Account Deletion)
              </h2>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#5c645a]">
            Người dùng DECOHO có toàn quyền yêu cầu xóa vĩnh viễn tài khoản và dữ liệu cá nhân bất cứ lúc nào thông qua 2 cách dưới đây:
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Method 1: In-app */}
            <div className="rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-5">
              <h3 className="text-sm font-bold text-[#17211b]">
                Cách 1: Xóa trực tiếp trong Ứng dụng DECOHO
              </h3>
              <ol className="mt-3 space-y-2 text-xs text-[#5c645a]">
                <li>1. Mở ứng dụng <strong>DECOHO</strong> trên điện thoại.</li>
                <li>2. Chuyển sang tab <strong>Tài khoản (My DECOHO)</strong> ở góc dưới bên phải.</li>
                <li>3. Chọn mục <strong>Thông tin cá nhân</strong>.</li>
                <li>4. Cuộn xuống cuối trang và bấm nút <strong>&ldquo;Xóa tài khoản&rdquo;</strong>, sau đó xác nhận.</li>
              </ol>
              <p className="mt-3 text-[11px] text-[#708164]">
                * Tài khoản và phiên đăng nhập sẽ bị vô hiệu hóa ngay lập tức.
              </p>
            </div>

            {/* Method 2: Web request */}
            <div className="rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-5">
              <h3 className="text-sm font-bold text-[#17211b]">
                Cách 2: Yêu cầu xóa tài khoản trên Web (khi đã gỡ App)
              </h3>

              {submitted ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-xs text-green-800">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={16} />
                    <span>Đã tiếp nhận yêu cầu xóa tài khoản</span>
                  </div>
                  <p className="mt-1">
                    Yêu cầu xóa dữ liệu tài khoản của bạn đã được hệ thống ghi nhận và xử lý hoàn tất trong vòng tối đa 7 ngày làm việc.
                  </p>
                </div>
              ) : sessionUser ? (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-[#5c645a]">
                    Bạn đang đăng nhập với tài khoản: <strong>{sessionUser.email}</strong>
                  </p>
                  {deleteError && (
                    <p className="text-xs text-red-600">{deleteError}</p>
                  )}
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDirectDeleteAccount}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-800 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    <span>{deleting ? "Đang xử lý..." : "Xóa tài khoản của tôi ngay"}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWebDeletionRequest} className="mt-3 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#254f43]">
                      Email tài khoản cần xóa
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="nhap-email-cua-ban@gmail.com"
                      className="mt-1 w-full rounded-xl border border-[#ded6c9] bg-white px-3 py-2 text-xs outline-none focus:border-[#2f6f5e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#254f43]">
                      Lý do (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Không còn nhu cầu sử dụng..."
                      className="mt-1 w-full rounded-xl border border-[#ded6c9] bg-white px-3 py-2 text-xs outline-none focus:border-[#2f6f5e]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f6f5e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#245b4c]"
                  >
                    <Mail size={14} />
                    <span>Gửi yêu cầu xóa tài khoản & dữ liệu</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#f2efe6] p-4 text-xs text-[#5c645a]">
            <strong>Dữ liệu được xóa & lưu giữ:</strong> Khi tài khoản bị xóa, thông tin định danh cá nhân (Họ tên, Email, Số điện thoại, Ảnh đại diện, Token đăng nhập, Danh sách yêu thích) sẽ bị xóa hoặc ẩn danh hóa. Các hóa đơn giao dịch thương mại (nếu có) được lưu trữ tối đa theo quy định kế toán hiện hành trước khi hủy hoàn toàn.
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2f6f5e] hover:underline"
          >
            ← Quay về trang chủ DECOHO
          </Link>
        </div>
      </div>
    </main>
  );
}
