"use client";

import React, { useEffect, useState } from "react";
import { MessageSquareHeart, Star, User, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import StarRating from "@/src/features/feedback/components/StarRating";
import FeedbackMediaGallery from "@/src/features/feedback/components/FeedbackMediaGallery";
import FeedbackModal from "@/src/features/feedback/components/FeedbackModal";
import { getPublicFeedbacks } from "@/src/features/feedback/services/feedbackService";
import type { FeedbackItem } from "@/src/features/feedback/types";

export default function CommunityFeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [inView, setInView] = useState<boolean>(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  const fetchCommunityReviews = async () => {
    try {
      const data = await getPublicFeedbacks({ limit: 6 });
      setFeedbacks(data.items || []);
      setTotalCount(data.total || 0);
      setAvgRating(data.averageRating || 5.0);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      fetchCommunityReviews();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          fetchCommunityReviews();
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Đánh giá từ cộng đồng"
      className={`w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="rounded-[28px] border border-[#ded6c9] bg-white p-6 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#ded6c9] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef6f2] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2f6f5e]">
              <Sparkles size={14} />
              <span>Cộng đồng & Trải nghiệm thực tế</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#17211b]">
              Người Dùng Đánh Giá Gì Về DECOHO?
            </h2>
            <p className="mt-1 text-sm text-[#708164]">
              Mọi ý kiến đóng góp và cảm nhận của khách hàng đều được hiển thị minh bạch tại đây.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl bg-[#fbf9f4] border border-[#ded6c9] px-4 py-2.5">
              <span className="text-2xl font-black text-[#2f6f5e]">
                {avgRating.toFixed(1)}
              </span>
              <div>
                <StarRating value={Math.round(avgRating)} size={14} />
                <p className="text-[10px] font-semibold text-[#708164]">
                  {totalCount} đánh giá
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2f6f5e] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#245b4c] active:scale-95 whitespace-nowrap"
            >
              <MessageSquareHeart size={16} />
              <span>Gửi đánh giá</span>
            </button>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="py-12 text-center text-xs text-[#708164]">
            Đang tải đánh giá từ người dùng...
          </div>
        ) : !feedbacks.length ? (
          <div className="py-12 text-center rounded-2xl bg-[#fbf9f4] border border-dashed border-[#ded6c9] mt-6 p-8">
            <CheckCircle2 size={32} className="mx-auto text-[#708164]/60 mb-2" />
            <p className="text-sm font-bold text-[#254f43]">
              Chưa có đánh giá nào từ cộng đồng
            </p>
            <p className="text-xs text-[#708164] mt-1">
              Hãy bấm &quot;Gửi đánh giá&quot; để là người đầu tiên chia sẻ trải nghiệm của bạn!
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((item) => (
              <article
                key={item._id}
                className="flex flex-col justify-between rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-5 shadow-xs transition hover:border-[#2f6f5e]/50 hover:bg-white"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef6f2] text-[#2f6f5e]">
                        <User size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17211b]">
                          {item.userName || "Khách trải nghiệm"}
                        </p>
                        <p className="text-[10px] text-[#708164]">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <StarRating value={item.rating} size={13} />
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white border border-[#e2ddd1] px-2 py-0.5 text-[10px] font-semibold text-[#5c645a]"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs leading-relaxed text-[#5c645a] line-clamp-4">
                    &ldquo;{item.content}&rdquo;
                  </p>

                  <FeedbackMediaGallery media={item.media} />
                </div>

                {item.productName && (
                  <p className="mt-3 pt-3 border-t border-[#ded6c9]/60 text-[11px] font-medium text-[#2f6f5e] truncate">
                    Về sản phẩm: {item.productName}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCommunityReviews}
      />
    </section>
  );
}
