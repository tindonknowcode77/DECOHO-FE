"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotion = () => false;

type PageTransitionProps = {
  children: ReactNode;
};

/**
 * Bọc quanh `children` ở root layout để khi Next.js đổi route, mọi trang đều
 * có hiệu ứng chuyển trang mượt mà.
 *
 * Hiệu ứng gồm 2 lớp:
 *  1) Lớp ngoài: fade + slide-up + scale + blur (đồng thời chạy thanh progress
 *     chạy ngang đỉnh trang để phản hồi thị giác rõ ràng).
 *  2) Lớp trong: fade + slide-up nhẹ xuất hiện SAU lớp ngoài tạo cảm giác
 *     "nội dung bung ra" từ trang.
 *
 * - `mode="wait"`: trang cũ thoát xong mới tới trang mới (không chồng nhau)
 * - Tôn trọng `prefers-reduced-motion`
 * - Auto scroll-to-top khi đổi route
 * - Animate mỗi lần đổi route (bao gồm điều hướng qua lại giữa các trang)
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  // Keep the first client render identical to SSR, including the progress bar.
  const prefersReducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  // Inner container: fade + slide nhẹ khi page đã mount xong lớp ngoài
  const innerInitial = useMemo(
    () => (prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }),
    [prefersReducedMotion],
  );
  const innerAnimate = useMemo(
    () => (prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }),
    [prefersReducedMotion],
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          prefersReducedMotion
            ? { opacity: 1 }
            : { opacity: 0, y: 24, scale: 0.985, filter: "blur(8px)" }
        }
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
        }
        exit={
          prefersReducedMotion
            ? { opacity: 1 }
            : {
                opacity: 0,
                y: -16,
                scale: 0.99,
                filter: "blur(6px)",
                transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
        }
        style={{
          willChange: "opacity, transform, filter",
          minHeight: "100dvh",
        }}
      >
        {/* Thanh progress bar mỏng chạy ngang đỉnh trang khi đang chuyển */}
        {!prefersReducedMotion && (
          <motion.div
            key={`progress-${pathname}`}
            aria-hidden
            initial={{ scaleX: 0, transformOrigin: "0% 50%", opacity: 0.85 }}
            animate={{ scaleX: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.7, ease: "easeOut", delay: 0.25 },
            }}
            className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[#d89b47] via-[#7e9a3f] to-[#2f6f5e]"
          />
        )}

        {/* Lớp trong: nội dung fade + slide-up ngay sau khi container "vào" ổn định */}
        <motion.div
          initial={innerInitial}
          animate={innerAnimate}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            delay: prefersReducedMotion ? 0 : 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
