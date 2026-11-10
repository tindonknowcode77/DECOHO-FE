"use client";

import React, { useState, useEffect } from "react";
import { X, MessageSquareHeart, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import StarRating from "./StarRating";
import { submitFeedback } from "../services/feedbackService";
import type { FeedbackType } from "../types";
import { getSessionUser } from "@/src/features/auth/services/session";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: FeedbackType;
  productId?: string;
  productName?: string;
  onSuccess?: () => void;
}

const CATEGORIES: Array<{
  id: FeedbackType;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: "WEBSITE",
    label: "Trải nghiệm Web",
    icon: "🌐",
    description: "Đánh giá giao diện, tốc độ và trải nghiệm chung khi lướt web",
  },
  {
    id: "PRODUCT",
    label: "Đánh giá Sản phẩm",
    icon: "🛋️",
    description: "Nhận xét chất lượng, mẫu mã hoặc độ hài lòng về sản phẩm",
  },
  {
    id: "FEATURE",
    label: "Góp ý tính năng",
    icon: "💡",
    description: "Đề xuất thêm tính năng bạn muốn có trên DECOHO",
  },
  {
    id: "BUG",
    label: "Báo lỗi",
    icon: "🐞",
    description: "Phản ánh lỗi giao diện, nút bấm hoặc sự cố kỹ thuật",
  },
];

const SUGGESTED_TAGS: Record<FeedbackType, string[]> = {
  WEBSITE: [
    "Giao diện đẹp",
    "Dễ tìm kiếm",
    "Tải trang mượt mà",
    "Tone màu ấm cúng",
    "Cần thêm bộ lọc phòng",
    "Trải nghiệm trực quan",
  ],
  PRODUCT: [
    "Chất lượng tốt",
    "Đúng mô tả",
    "Màu sắc thực tế đẹp",
    "Giá cả hợp lý",
    "Chi tiết sắc nét",
    "Rất ưng ý",
  ],
  FEATURE: [
    "Thêm xem AR/3D",
    "Thêm gợi ý phối đồ AI",
    "Lưu nhiều moodboard",
    "So sánh sản phẩm",
  ],
  BUG: [
    "Lỗi hiển thị",
    "Tải trang chậm",
    "Nút bấm không phản hồi",
    "Lỗi hình ảnh",
  ],
};

export default function FeedbackModal({
  isOpen,
  onClose,
  initialType = "WEBSITE",
  productId,
  productName,
  onSuccess,
}: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>(initialType);
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const user = getSessionUser();
      if (user) {
        setUserName(user.name || user.email || "");
        setUserEmail(user.email || "");
      }
      if (initialType) setType(initialType);
      setError("");
      setSubmitted(false);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung cảm nhận hoặc đóng góp của bạn.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitFeedback({
        type,
        rating,
        content: content.trim(),
        tags: selectedTags,
        productId,
        productName,
        userName: userName.trim() || undefined,
        userEmail: userEmail.trim() || undefined,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#ded6c9] bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#708164] hover:bg-[#f4f1ea] hover:text-[#17211b] transition"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6f2] text-[#2f6f5e]">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-[#17211b]">
              Cảm ơn đóng góp của bạn!
            </h3>
            <p className="text-sm leading-relaxed text-[#5c645a] max-w-md mx-auto">
              Đánh giá {rating} sao và những lời góp ý quý báu của bạn là động lực rất lớn giúp đội ngũ DECOHO hoàn thiện trải nghiệm không gian sống ngày càng tốt hơn.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2f6f5e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#245b4c]"
              >
                <Sparkles size={16} />
                <span>Hoàn tất & Tiếp tục khám phá</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef6f2] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2f6f5e]">
                <MessageSquareHeart size={14} />
                <span>Góp Ý & Đánh Giá</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-[#17211b]">
                {productName
                  ? `Đánh giá: ${productName}`
                  : "Chia sẻ trải nghiệm của bạn với DECOHO"}
              </h2>
              <p className="mt-1 text-xs text-[#708164]">
                Ý kiến của bạn giúp chúng tôi nâng cấp chất lượng sản phẩm và dịch vụ mỗi ngày.
              </p>
            </div>

            {/* Category tabs */}
            {!productId && (
              <div>
                <label className="block text-xs font-bold text-[#254f43] mb-2">
                  Bạn muốn phản hồi về điều gì?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setType(cat.id);
                        setSelectedTags([]);
                      }}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition ${
                        type === cat.id
                          ? "border-[#2f6f5e] bg-[#f0f6f3] text-[#2f6f5e] font-bold shadow-xs"
                          : "border-[#e5ded0] bg-[#fbf9f4] text-[#646a61] hover:bg-white"
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="mt-1 text-[11px] leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Star rating selector */}
            <div className="rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-4 text-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#708164] mb-2">
                Mức độ hài lòng của bạn
              </label>
              <div className="flex justify-center">
                <StarRating
                  value={rating}
                  onChange={(val) => setRating(val)}
                  interactive
                  size={32}
                  showLabel
                />
              </div>
            </div>

            {/* Quick tags */}
            {SUGGESTED_TAGS[type] && (
              <div>
                <label className="block text-xs font-bold text-[#254f43] mb-2">
                  Gợi ý đánh giá nhanh:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS[type].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          isSelected
                            ? "bg-[#2f6f5e] text-white shadow-xs"
                            : "border border-[#ded6c9] bg-white text-[#5c645a] hover:border-[#2f6f5e]/40 hover:bg-[#f6fbf8]"
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comment text */}
            <div>
              <label className="block text-xs font-bold text-[#254f43] mb-1">
                Lời nhận xét / Góp ý chi tiết *
              </label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === "PRODUCT"
                    ? "Hãy chia sẻ cảm nhận về chất liệu, màu sắc, kích thước sản phẩm..."
                    : type === "BUG"
                    ? "Vui lòng mô tả lỗi bạn gặp phải và các bước thực hiện..."
                    : "Chia sẻ những điểm bạn thích hoặc những điểm DECOHO cần cải thiện..."
                }
                className="w-full rounded-2xl border border-[#ded6c9] bg-white p-3 text-xs sm:text-sm text-[#17211b] outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
              />
            </div>

            {/* User name & email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5c645a] mb-1">
                  Họ tên (tùy chọn)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-xl border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#17211b] outline-none focus:border-[#2f6f5e]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5c645a] mb-1">
                  Email (tùy chọn để nhận phản hồi)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="email-cua-ban@gmail.com"
                  className="w-full rounded-xl border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#17211b] outline-none focus:border-[#2f6f5e]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#ded6c9] px-4 py-2.5 text-xs font-bold text-[#646a61] hover:bg-[#f4f1ea] transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2f6f5e] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#245b4c] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi đánh giá</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
