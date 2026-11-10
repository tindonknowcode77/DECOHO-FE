"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  MessageSquareHeart,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
  Users,
  PenSquare,
  User,
  Star,
  Clock,
  Filter,
} from "lucide-react";
import StarRating from "./StarRating";
import { submitFeedback, getPublicFeedbacks } from "../services/feedbackService";
import type { FeedbackType, FeedbackItem } from "../types";
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

const TYPE_BADGES: Record<FeedbackType, { label: string; bg: string; text: string }> = {
  WEBSITE: { label: "Trải nghiệm Web", bg: "bg-[#eef6f2]", text: "text-[#2f6f5e]" },
  PRODUCT: { label: "Sản phẩm", bg: "bg-[#fff1ec]", text: "text-[#ee4d2d]" },
  FEATURE: { label: "Góp ý tính năng", bg: "bg-[#fef9ee]", text: "text-[#b47a16]" },
  BUG: { label: "Báo lỗi", bg: "bg-[#fdf2f2]", text: "text-[#dc2626]" },
};

export default function FeedbackModal({
  isOpen,
  onClose,
  initialType = "WEBSITE",
  productId,
  productName,
  onSuccess,
}: FeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<"write" | "community">("write");
  const [type, setType] = useState<FeedbackType>(initialType);
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Community Feed State
  const [communityItems, setCommunityItems] = useState<FeedbackItem[]>([]);
  const [communityTotal, setCommunityTotal] = useState<number>(0);
  const [communityAvg, setCommunityAvg] = useState<number>(5.0);
  const [communityLoading, setCommunityLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  const loadCommunityFeed = useCallback(async (selectedFilter = "ALL") => {
    setCommunityLoading(true);
    try {
      const data = await getPublicFeedbacks({
        type: selectedFilter === "ALL" ? undefined : selectedFilter,
        limit: 30,
      });
      setCommunityItems(data.items || []);
      setCommunityTotal(data.total || 0);
      setCommunityAvg(data.averageRating || 5.0);
    } catch {
      // silent
    } finally {
      setCommunityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const user = getSessionUser();
      if (user) {
        setUserName(user.name || user.email || "");
        setUserEmail(user.email || "");
      }
      if (initialType) setType(initialType);
      setError("");
      setJustSubmitted(false);
      setActiveTab("write");
      loadCommunityFeed("ALL");
    }
  }, [isOpen, initialType, loadCommunityFeed]);

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
      const submittedName = userName.trim() || "Khách trải nghiệm";
      const res = await submitFeedback({
        type,
        rating,
        content: content.trim(),
        tags: selectedTags,
        productId,
        productName,
        userName: submittedName,
        userEmail: userEmail.trim() || undefined,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });

      setJustSubmitted(true);
      if (onSuccess) onSuccess();

      // Thêm ngay feedback mới vào đầu danh sách cộng đồng để hiển thị tức thì
      const newFeedback: FeedbackItem = res.data || {
        _id: String(Date.now()),
        type,
        rating,
        content: content.trim(),
        tags: selectedTags,
        productName,
        userName: submittedName,
        createdAt: new Date().toISOString(),
        status: "NEW",
      };

      setCommunityItems((prev) => [newFeedback, ...prev]);
      setCommunityTotal((prev) => prev + 1);

      // Chuyển sang tab cộng đồng sau 1 giây hoặc ngay lập tức
      setTimeout(() => {
        setActiveTab("community");
      }, 700);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (f: string) => {
    setFilterType(f);
    loadCommunityFeed(f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#ded6c9] bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] flex flex-col">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ded6c9]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                activeTab === "write"
                  ? "bg-[#2f6f5e] text-white shadow-xs"
                  : "bg-[#f4f2ea] text-[#646a61] hover:bg-[#eae6db]"
              }`}
            >
              <PenSquare size={14} />
              <span>Gửi đánh giá</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("community");
                loadCommunityFeed(filterType);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                activeTab === "community"
                  ? "bg-[#2f6f5e] text-white shadow-xs"
                  : "bg-[#f4f2ea] text-[#646a61] hover:bg-[#eae6db]"
              }`}
            >
              <Users size={14} />
              <span>
                Cộng đồng đánh giá {communityTotal > 0 ? `(${communityTotal})` : ""}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#708164] hover:bg-[#f4f1ea] hover:text-[#17211b] transition"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab 1: Form Gửi Đánh Giá */}
        {activeTab === "write" && (
          <div className="overflow-y-auto pt-4 space-y-5 pr-1">
            {justSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6f2] text-[#2f6f5e]">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-[#17211b]">
                  Đã ghi nhận đánh giá của bạn!
                </h3>
                <p className="text-sm leading-relaxed text-[#5c645a] max-w-md mx-auto">
                  Cảm ơn bạn đã để lại đánh giá {rating} sao. Phản hồi của bạn đã được công khai để mọi người cùng xem.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("community")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2f6f5e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#245b4c]"
                  >
                    <Users size={16} />
                    <span>Xem đánh giá của bạn trong Cộng Đồng</span>
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
                    Đánh giá của bạn sẽ được hiển thị công khai để cộng đồng cùng tham khảo.
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
                      Tên của bạn hiển thị công khai
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ví dụ: Hoàng Long, Minh Thư..."
                      className="w-full rounded-xl border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#17211b] outline-none focus:border-[#2f6f5e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c645a] mb-1">
                      Email (được ẩn, dùng để liên hệ)
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
                      <span>Gửi đánh giá & Công khai</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Danh Sách Đánh Giá Cộng Đồng (Mọi người đều thấy) */}
        {activeTab === "community" && (
          <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
            {/* Rating Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-[#fbf9f4] border border-[#ded6c9] p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-[#2f6f5e]">
                  {communityAvg.toFixed(1)}
                </span>
                <div>
                  <StarRating value={Math.round(communityAvg)} size={16} />
                  <p className="text-[11px] font-semibold text-[#708164] mt-0.5">
                    Đánh giá trung bình từ {communityTotal} người dùng
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setJustSubmitted(false);
                  setActiveTab("write");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2f6f5e] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#245b4c] self-start sm:self-auto"
              >
                <PenSquare size={13} />
                <span>Viết đánh giá của bạn</span>
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <Filter size={13} className="text-[#708164] shrink-0 mr-1" />
              {[
                { id: "ALL", label: "Tất cả" },
                { id: "WEBSITE", label: "🌐 Web" },
                { id: "PRODUCT", label: "🛋️ Sản phẩm" },
                { id: "FEATURE", label: "💡 Tính năng" },
                { id: "BUG", label: "🐞 Báo lỗi" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFilterChange(f.id)}
                  className={`rounded-full px-3 py-1 font-semibold whitespace-nowrap transition ${
                    filterType === f.id
                      ? "bg-[#2f6f5e] text-white"
                      : "bg-[#f4f2ea] text-[#646a61] hover:bg-[#e7e3d6]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List of items */}
            {communityLoading ? (
              <div className="py-12 text-center text-[#708164]">
                <Loader2 size={24} className="animate-spin mx-auto text-[#2f6f5e] mb-2" />
                <span className="text-xs">Đang tải đánh giá cộng đồng...</span>
              </div>
            ) : !communityItems.length ? (
              <div className="py-12 text-center rounded-2xl bg-[#fbf9f4] border border-dashed border-[#ded6c9] p-6 space-y-3">
                <Sparkles size={28} className="mx-auto text-[#708164]/60" />
                <p className="text-sm font-bold text-[#254f43]">
                  Chưa có đánh giá nào trong mục này
                </p>
                <p className="text-xs text-[#708164]">
                  Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setJustSubmitted(false);
                    setActiveTab("write");
                  }}
                  className="rounded-xl bg-[#2f6f5e] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#245b4c]"
                >
                  Gửi đánh giá ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {communityItems.map((item) => {
                  const badge = TYPE_BADGES[item.type] || TYPE_BADGES.WEBSITE;
                  return (
                    <article
                      key={item._id}
                      className="rounded-2xl border border-[#ded6c9] bg-white p-4 shadow-xs transition hover:border-[#2f6f5e]/40 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f6f3] text-[#2f6f5e]">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#17211b]">
                              {item.userName || "Khách trải nghiệm"}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#80897b]">
                              <Clock size={10} />
                              <span>
                                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <StarRating value={item.rating} size={13} />
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {item.productName && (
                        <p className="text-[11px] font-semibold text-[#2f6f5e]">
                          Món đồ: {item.productName}
                        </p>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#f4f2ea] px-2 py-0.5 text-[10px] font-semibold text-[#5c645a]"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs leading-relaxed text-[#5c645a]">
                        {item.content}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
