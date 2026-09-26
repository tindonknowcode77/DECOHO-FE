"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react";
import MagneticText from "@/src/components/common/MagneticText";

/**
 * Hero section với:
 * - 3D tilt theo chuột (perspective + rotateX/rotateY theo vị trí con trỏ)
 * - Entrance animation: fade-up + scale
 * - Floating animation liên tục cho các phụ kiện (heart, star, sticker)
 * - Parallax nhẹ các lớp khi tilt
 */
export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Chuột theo normalized -1..1 trên khung 3D
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Spring mượt
  const springConfig = { stiffness: 140, damping: 18, mass: 0.6 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), springConfig);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), springConfig);

  // Glare theo vị trí chuột
  const glareX = useTransform(mx, [-0.5, 0.5], [25, 75]);
  const glareY = useTransform(my, [-0.5, 0.5], [25, 75]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%)`;

  // Parallax cho các lớp phụ kiện: depth âm/dương
  const badgeX = useTransform(mx, [-0.5, 0.5], [-22, 22]);
  const badgeY = useTransform(my, [-0.5, 0.5], [-18, 18]);
  const stickerX = useTransform(mx, [-0.5, 0.5], [16, -16]);
  const stickerY = useTransform(my, [-0.5, 0.5], [12, -12]);
  const tagX = useTransform(mx, [-0.5, 0.5], [-14, 14]);
  const tagY = useTransform(my, [-0.5, 0.5], [-10, 10]);
  const cornerX = useTransform(mx, [-0.5, 0.5], [10, -10]);
  const cornerY = useTransform(my, [-0.5, 0.5], [-8, 8]);

  // Hover state cho tilt intensity (mobile sẽ không tilt mạnh)
  const [hovered, setHovered] = useState(false);
  const tiltScale = useMotionValue(1);
  const scaleSpring = useSpring(tiltScale, { stiffness: 200, damping: 20 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height;
    mx.set(x - 0.5);
    my.set(y - 0.5);
  }
  function onMouseEnter() {
    setHovered(true);
    tiltScale.set(1.04);
  }
  function onMouseLeave() {
    setHovered(false);
    mx.set(0);
    my.set(0);
    tiltScale.set(1);
  }

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
      {/* Background gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#f3c779]/40 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#9bc08f]/35 blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#ef6e61]/20 blur-3xl"
          animate={{ x: [0, 20, -20, 0], y: [0, -15, 15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-center lg:gap-16">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex items-center gap-2 text-[#78933c]"
          >
            <motion.span
              animate={{ rotate: [0, 12, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </motion.span>
            <span className="font-accent text-lg font-bold italic">
              Ngôi nhà thật · Cảm hứng thật
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-serif text-5xl font-black leading-[.95] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <MagneticText strength={26}>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Trang trí đúng gu.
              </motion.span>
            </MagneticText>
            <MagneticText strength={26}>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Sống trong không gian
              </motion.span>
            </MagneticText>
            <span className="block">
              <motion.span
                className="inline-block text-[#d89b47]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <MagneticText strength={32}>bạn yêu.</MagneticText>
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-6 max-w-lg text-base leading-7 text-[#646a61]"
          >
            Khám phá moodboards, sản phẩm decor được tuyển chọn và trợ lý AI cùng
            diễn đàn để chung tay hoàn thiện không gian sống của bạn.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/product-space"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#2f6f5e] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#2f6f5e]/25 transition hover:bg-[#2f3431]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Xem Moodboards
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-[#2f6f5e] via-[#3d8a76] to-[#2f6f5e] bg-[length:200%_100%]"
                animate={{ backgroundPosition: hovered ? ["0% 50%", "200% 50%"] : "0% 50%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </Link>
            <Link
              href="/ai"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#2f6f5e] bg-white px-6 py-3 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
            >
              Tìm phong cách của tôi
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -left-3 top-12 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 8, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart
                className="h-6 w-6 text-[#ef6e61]"
                strokeWidth={2}
                fill="currentColor"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT — 3D stage */}
        <motion.div
          ref={stageRef}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            perspective: 1200,
            transformStyle: "preserve-3d",
          }}
          className="relative min-h-[480px] sm:min-h-[520px] lg:min-h-[580px]"
        >
          {/* Main tilted card */}
          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              scale: scaleSpring,
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0"
          >
            {/* Frame chính */}
            <motion.div
              style={{ transform: "translateZ(0px)" }}
              className="absolute inset-0 overflow-hidden rounded-[40%_18%_36%_22%] border-[8px] border-white bg-[#e9ddca] shadow-[0_30px_70px_rgba(75,57,34,.22)]"
            >
              <motion.div style={{ scale: useTransform(mx, [-0.5, 0.5], [1.08, 1.08]) }}>
                <Image
                  alt="Phòng khách DECOHO"
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width:1024px) 55vw,100vw"
                  src="/images/decoho-home-interior-v2.png"
                />
              </motion.div>
              {/* Glare overlay */}
              <motion.div
                aria-hidden
                style={{ backgroundImage: glareBg }}
                className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              />
              {/* Hover ring */}
              <motion.div
                aria-hidden
                animate={{ opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/40"
              />
            </motion.div>

            {/* Floating mini-card góc trên phải */}
            <motion.div
              style={{
                x: badgeX,
                y: badgeY,
                rotateZ: useTransform(rotY, [-12, 12], [2, 10]),
                transform: "translateZ(40px)",
                transformStyle: "preserve-3d",
              }}
              className="absolute right-2 top-6 w-44 will-change-transform"
            >
              <motion.div
                animate={{ rotate: [6, 9, 4, 6], y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-lg border-[6px] border-white bg-white p-2 shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded">
                  <Image
                    alt="Góc nội thất"
                    className="object-cover"
                    fill
                    sizes="180px"
                    src="/images/product-space/urban-warmth.png"
                  />
                </div>
                <p className="mt-2 text-xs font-bold">Good vibes, every day ✦</p>
              </motion.div>
            </motion.div>

            {/* Sticker dưới trái */}
            <motion.div
              style={{
                x: stickerX,
                y: stickerY,
                transform: "translateZ(60px)",
              }}
              className="absolute -bottom-2 left-6 hidden will-change-transform sm:block"
            >
              <motion.div
                animate={{ rotate: [-5, -2, -7, -5], y: [0, -3, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-xl bg-[#c8e976] px-5 py-4 font-accent text-base font-black text-[#2f6f5e] shadow-md"
              >
                YOUR SPACE.
                <br />
                SO YOUR VIBE. ♡
              </motion.div>
            </motion.div>

            {/* Star góc trên */}
            <motion.div
              style={{
                x: cornerX,
                y: cornerY,
                transform: "translateZ(80px)",
              }}
              className="absolute right-12 -top-2 hidden text-5xl text-[#f2c749] will-change-transform lg:block"
            >
              <motion.div
                animate={{ rotate: [0, 20, -10, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Star className="h-12 w-12" fill="currentColor" strokeWidth={0} />
              </motion.div>
            </motion.div>

            {/* Tag "Phòng khách" bên phải */}
            <motion.div
              style={{
                x: tagX,
                y: tagY,
                transform: "translateZ(50px)",
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 will-change-transform"
            >
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-full bg-[#7e9a3f] px-4 py-2 text-xs font-bold text-white shadow-lg"
              >
                Phòng khách
              </motion.div>
            </motion.div>

            {/* Tag gỗ tự nhiên dưới trái */}
            <motion.div
              style={{ transform: "translateZ(30px)" }}
              className="absolute bottom-16 left-2 hidden rounded-full bg-white px-3 py-2 shadow-lg sm:block"
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d89b47] text-[10px] font-bold text-white">
                  AL
                </span>
                <span className="text-xs font-bold text-[#2f6f5e]">
                  Sàn gỗ tự nhiên
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floor shadow */}
          <motion.div
            aria-hidden
            animate={{ opacity: [0.5, 0.7, 0.5], scaleX: [1, 0.92, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-6 left-1/2 h-3 w-2/3 -translate-x-1/2 rounded-[50%] bg-[#4b3922]/30 blur-xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
