"use client";

import React, { useState } from "react";
import { CheckCircle2, Gift, LoaderCircle, ShoppingBag, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";

interface ClaimOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ClaimResult {
  orderId: string;
  itemsCount: number;
  totalCommission: number;
  totalPurchaseValue: number;
  message: string;
}

export default function ClaimOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: ClaimOrderModalProps) {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClaimResult | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setOrderId("");
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderId.trim();

    if (!cleanId) {
      setError("Vui lòng nhập mã đơn hàng Shopee của bạn.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
      const res = await authenticatedFetch(`${baseUrl}/affiliate/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cleanId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không thể nhận đơn hàng này. Vui lòng thử lại.");
      }

      setResult({
        orderId: data.orderId,
        itemsCount: data.itemsCount,
        totalCommission: data.totalCommission,
        totalPurchaseValue: data.totalPurchaseValue,
        message: data.message,
      });

      toast.success("Nhận đơn hàng thành công!", {
        description: `Đã tích lũy ${data.totalCommission?.toLocaleString("vi-VN")} ₫ hoa hồng vào tài khoản.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.message || "Đã xảy ra lỗi kết nối khi nhận đơn.";
      setError(msg);
      toast.error("Không thể nhận đơn hàng", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#ded6c9] bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng modal */}
        <button
          type="button"
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-[#646a61] transition hover:bg-[#f7f3ec] hover:text-[#254f43]"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Nội dung khi đã Claim thành công */}
        {result ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dfe8d3] text-[#2e6f5e] shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="mt-4 font-serif text-2xl font-bold text-[#254f43]">
              Nhận Đơn Thành Công!
            </h3>
            <p className="mt-1 text-xs text-[#646a61]">
              Đơn hàng Shopee <strong className="text-[#254f43] font-mono">{result.orderId}</strong> đã được ghi nhận.
            </p>

            {/* Thẻ tiền hoa hồng */}
            <div className="mt-5 rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-4 text-left">
              <div className="flex items-center justify-between border-b border-[#ded6c9]/60 pb-3">
                <span className="text-xs text-[#708164]">Số lượng sản phẩm:</span>
                <span className="text-xs font-bold text-[#254f43]">{result.itemsCount} món</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#ded6c9]/60 py-3">
                <span className="text-xs text-[#708164]">Tổng giá trị đơn (GMV):</span>
                <span className="text-xs font-bold text-[#254f43]">
                  {result.totalPurchaseValue.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-bold text-[#2e6f5e]">Hoa hồng tích lũy:</span>
                <span className="text-base font-extrabold text-[#2e6f5e]">
                  +{result.totalCommission.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-xl border border-[#ded6c9] bg-[#f7f3ec] py-2.5 text-xs font-bold text-[#254f43] transition hover:bg-[#e8e4d8]"
              >
                Nhập đơn khác
              </button>
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="flex-1 rounded-xl bg-[#2e6f5e] py-2.5 text-xs font-bold text-white transition hover:bg-[#245747]"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        ) : (
          /* Form nhập Order ID */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef6f2] text-[#2e6f5e]">
                <Gift size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#254f43]">
                  Nhận Hoa Hồng Đơn Hàng
                </h3>
                <p className="text-xs text-[#708164]">
                  Nhập mã đơn hàng Shopee để tích lũy hoa hồng
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#708164]">
                  Mã Đơn Hàng Shopee (Order ID)
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Ví dụ: 241105ABCD1234"
                    disabled={loading}
                    className="w-full rounded-xl border border-[#ded6c9] bg-[#fbf9f4] px-4 py-3 text-sm font-semibold text-[#254f43] placeholder-[#a6ada2] outline-none transition focus:border-[#2e6f5e] focus:bg-white focus:ring-2 focus:ring-[#2e6f5e]/15"
                  />
                  <ShoppingBag
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a6ada2]"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#80897b]">
                  Mã đơn hàng có trong mục: <em>Shopee &gt; Tôi &gt; Đơn mua &gt; Chi tiết đơn hàng</em>.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-[#fdf2f0] p-3 text-xs font-medium text-[#a34131]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                disabled={loading}
                className="flex-1 rounded-xl border border-[#ded6c9] py-2.5 text-xs font-bold text-[#646a61] transition hover:bg-[#f7f3ec]"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2e6f5e] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#245747] disabled:opacity-50"
              >
                {loading && <LoaderCircle size={14} className="animate-spin" />}
                <span>{loading ? "Đang xác thực..." : "Nhận đơn ngay"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

