"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type MagneticTextProps = Omit<HTMLMotionProps<"span">, "ref" | "style"> & {
  /** Khoảng dịch chuyển tối đa (px) khi chuột rất gần. Mặc định 18. */
  strength?: number;
  /**
   * Bán kính ảnh hưởng (px). Nếu không truyền, dùng `Math.max(radius, width * 1.5)`
   * để phù hợp với chiều rộng text. Mặc định 180.
   */
  radius?: number;
  /** Stiffness của spring. Mặc định 220. */
  stiffness?: number;
  /** Damping của spring. Mặc định 24. */
  damping?: number;
  /** Style inline sẽ được gộp cùng style của component. */
  style?: CSSProperties;
  children: ReactNode;
};

function computeOffset(
  clientX: number,
  clientY: number,
  cx: number,
  cy: number,
  strength: number,
  radius: number,
) {
  const rawDx = clientX - cx;
  const rawDy = clientY - cy;
  const distance = Math.hypot(rawDx, rawDy);
  if (distance > radius) {
    return { dx: 0, dy: 0 };
  }
  // Falloff: chuột càng gần text -> đẩy càng mạnh (tỉ lệ tuyến tính)
  const falloff = 1 - distance / radius;
  // magnitude = strength * falloff  (không chia distance nữa để ở rất gần vẫn clamped)
  const magnitude = strength * falloff * falloff;
  // Hướng vector đơn vị từ text tới chuột, nhân magnitude -> vector đẩy ra xa
  const nx = rawDx / Math.max(distance, 1);
  const ny = rawDy / Math.max(distance, 1);
  return {
    dx: -(nx * magnitude),
    dy: -(ny * magnitude),
  };
}

/**
 * `MagneticText` — text sẽ nhẹ nhàng "né" con trỏ chuột khi chuột lại gần.
 *
 * - Mỗi component tự lắng nghe `pointermove` trên `window` (passive).
 * - Vector phản lực có độ lớn `strength * falloff²` (falloff = 1 - distance/radius),
 *   hướng ngược lại với vector từ text tới chuột, nên text "tránh" theo chiều tự nhiên.
 * - Dùng `useSpring` nên chuyển động luôn có quán tính mượt mà.
 * - Reset về 0 khi chuột rời khỏi trang / blur tab / touch.
 *
 * Ví dụ:
 * ```tsx
 * <h1>
 *   Trang trí đúng gu.
 *   <MagneticText strength={22}>bạn yêu.</MagneticText>
 * </h1>
 * ```
 */
export default function MagneticText({
  strength = 18,
  radius = 180,
  stiffness = 220,
  damping = 24,
  children,
  className,
  style,
  ...rest
}: MagneticTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  const xMV = useMotionValue(0);
  const yMV = useMotionValue(0);
  const x = useSpring(xMV, { stiffness, damping, mass: 0.5 });
  const y = useSpring(yMV, { stiffness, damping, mass: 0.5 });
  // Xoay nhẹ tạo cảm giác sinh động
  const rotate = useTransform(x, [-strength, strength], [-1.4, 1.4]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleMove(event: PointerEvent) {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Bán kính hiệu dụng: lấy max giữa prop radius và 1.5x rộng text
      const effRadius = Math.max(radius, rect.width * 1.5);
      const { dx, dy } = computeOffset(
        event.clientX,
        event.clientY,
        cx,
        cy,
        strength,
        effRadius,
      );
      xMV.set(dx);
      yMV.set(dy);
    }

    function reset() {
      xMV.set(0);
      yMV.set(0);
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("mouseleave", reset);
    // Touch devices: tắt hiệu ứng khi touch
    const onTouchStart = () => reset();
    document.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("blur", reset);
      document.removeEventListener("mouseleave", reset);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, [strength, radius, xMV, yMV]);

  return (
    <motion.span
      className={className}
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        x,
        y,
        rotate,
        display: "inline-block",
        willChange: "transform",
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.span>
  );
}
