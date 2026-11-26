"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotion = () => false;

type PageTransitionProps = {
  children: ReactNode;
};

/**
 * Hiệu ứng chuyển trang gọn nhẹ, bỏ filter: blur() nặng GPU và giảm thời gian chờ
 * để khi chuyển qua lại giữa các tab nội dung hiển thị gần như tức thì.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={
          prefersReducedMotion
            ? { opacity: 1 }
            : {
                opacity: 0,
                transition: { duration: 0.08, ease: "easeOut" },
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }
        }
        style={{
          willChange: "opacity, transform",
          minHeight: "100dvh",
        }}
      >
        {!prefersReducedMotion && (
          <motion.div
            key={`progress-${pathname}`}
            aria-hidden
            initial={{ scaleX: 0, transformOrigin: "0% 50%", opacity: 0.85 }}
            animate={{ scaleX: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3, ease: "easeOut", delay: 0.1 },
            }}
            className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[#d89b47] via-[#7e9a3f] to-[#2f6f5e]"
          />
        )}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
