"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Star, MessageSquarePlus, User, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import StarRating from "./StarRating";
import FeedbackMediaGallery from "./FeedbackMediaGallery";
import FeedbackModal from "./FeedbackModal";
import { getProductFeedback } from "../services/feedbackService";
import type { ProductFeedbackStats } from "../types";

interface ProductReviewSectionProps {
  productId: string;
  productName: string;
}

export default function ProductReviewSection({
  productId,
  productName,
}: ProductReviewSectionProps) {
  const [stats, setStats] = useState<ProductFeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      const data = await getProductFeedback(productId);
      setStats(data);
    } catch {
      // Fallback: default empty stats if none yet
      setStats({
        productId,
        totalCount: 0,
        averageRating: 5.0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        items: [],
      });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const totalReviews = stats?.totalCount || 0;
  const avgRating = stats?.averageRating || 5.0;

  return (
    <section className="mx-auto mt-14 max-w-6xl">
      <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#ded6c9] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf9f4] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2f6f5e]">
              <Sparkles size={14} />
              <span>Phản hồi từ khách hàng</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#17211b]">
              Đánh Giá & Trải Nghiệm Sản Phẩm
            </h2>
            <p className="mt-1 text-sm text-[#708164]">
              Chia sẻ cảm nhận thực tế của bạn về chất liệu, kiểu dáng và độ hài lòng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f6f5e] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#245b4c] active:scale-95 self-start sm:self-auto"
          >
            <MessageSquarePlus size={16} />
            <span>Viết đánh giá của bạn</span>
          </button>
        </div>

        {/* Rating summary & distribution */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-[#ded6c9] pb-8">
          {/* Average Score */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#fbf9f4] border border-[#ded6c9]">
            <span className="text-5xl font-black text-[#2f6f5e]">
              {totalReviews > 0 ? avgRating.toFixed(1) : "5.0"}
            </span>
            <div className="mt-2">
              <StarRating value={Math.round(avgRating)} size={22} />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#708164]">
              {totalReviews > 0
                ? `Dựa trên ${totalReviews} lượt đánh giá thực tế`
                : "Chưa có đánh giá nào. Hãy là người đầu tiên!"}
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats?.distribution?.[star as keyof typeof stats.distribution] || 0;
              const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-[#5c645a] font-bold">
                    <span>{star}</span>
                    <Star size={12} className="fill-[#f59e0b] text-[#f59e0b]" />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-[#f1ece1] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#f59e0b] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-[#708164] font-medium">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* List of reviews */}
        <div className="mt-8 space-y-6">
          <h3 className="text-base font-bold text-[#17211b]">
            Các nhận xét gần đây ({totalReviews})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#708164]">
              <Loader2 size={24} className="animate-spin text-[#2f6f5e]" />
            </div>
          ) : !stats?.items?.length ? (
            <div className="py-10 text-center rounded-2xl bg-[#fbf9f4] border border-dashed border-[#ded6c9] p-8">
              <CheckCircle2 size={32} className="mx-auto text-[#708164]/60 mb-2" />
              <p className="text-sm font-bold text-[#254f43]">
                Chưa có nhận xét nào cho món đồ này
              </p>
              <p className="text-xs text-[#708164] mt-1 max-w-sm mx-auto">
                Bạn đã trải nghiệm hoặc quan tâm sản phẩm này? Hãy để lại cảm nhận và số sao đánh giá nhé!
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#2f6f5e] bg-white px-4 py-2 text-xs font-bold text-[#2f6f5e] hover:bg-[#eef6f2] transition"
              >
                <MessageSquarePlus size={14} />
                <span>Để lại đánh giá đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#ded6c9]/60">
              {stats.items.map((rev) => (
                <article key={rev._id} className="py-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef6f2] text-[#2f6f5e]">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17211b]">
                          {rev.userName || rev.userId?.fullName || "Khách trải nghiệm"}
                        </p>
                        <p className="text-[10px] text-[#708164]">
                          {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <StarRating value={rev.rating} size={15} />
                  </div>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rev.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#f4f2ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#5c645a]"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm leading-relaxed text-[#5c645a]">
                    {rev.content}
                  </p>

                  <FeedbackMediaGallery media={rev.media} />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType="PRODUCT"
        productId={productId}
        productName={productName}
        onSuccess={fetchFeedback}
      />
    </section>
  );
}
