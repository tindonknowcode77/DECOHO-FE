"use client";

import React, { useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

export default function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside aria-label="Đóng góp ý kiến cho DECOHO">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[#2f6f5e]/20 bg-[#2f6f5e] px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#245b4c] hover:shadow-2xl active:scale-95 group"
          title="Đóng góp ý kiến & Đánh giá trải nghiệm"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
          </span>
          <MessageSquareHeart size={18} className="transition group-hover:rotate-6" />
          <span className="text-xs font-bold tracking-wide">
            Góp ý & Đánh giá
          </span>
        </button>
      </aside>

      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
