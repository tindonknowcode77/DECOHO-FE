"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { processSteps } from "../mock/processSteps";
import type { ProcessStep } from "../types";

type IconName = ProcessStep["icon"] | "arrow" | "check" | "spark";

const processImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=85&w=1200";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "m5 12 4 4L19 6",
    cube: "m21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8m9 5v8",
    drag: "M5 9h14M5 15h14M9 5l3-3 3 3M9 19l3 3 3-3",
    recognize:
      "M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m8 0h3a1 1 0 0 0 1-1v-3M8 12h8m-4-4v8",
    replace: "M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3",
    scan: "M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m8 0h3a1 1 0 0 0 1-1v-3M7 12h10",
    spark:
      "m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z",
  };

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function ProcessView() {
  const [activeStep, setActiveStep] = useState(0);
  const step = processSteps[activeStep];

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#b46f2c] shadow-sm">
              <Icon name="spark" />
              Quy trình AI nội thất
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Quét phòng, thay nội thất và xem lại bằng 3D.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#646a61]">
              DECOHO mô phỏng toàn bộ hành trình thiết kế: quét căn phòng, AI nhận diện
              nội thất, thay sản phẩm phù hợp, kéo thả bố cục và xem không gian mới trong
              showroom 3D.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d89b47] px-5 py-3 text-sm font-bold text-[#1f2421]"
                href="/product-space"
              >
                Mở Product Space
                <Icon name="arrow" />
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cfc6b8] bg-white px-5 py-3 text-sm font-bold text-[#1f2421]"
                href="/showroom"
              >
                Xem phòng 3D
                <Icon name="arrow" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-80 overflow-hidden rounded-md border border-[#ded6c9] bg-white shadow-sm">
            <Image
              alt="Không gian nội thất được phân tích và thay đổi bằng AI"
              className="h-full w-full object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              src={processImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f2421]/75 via-[#1f2421]/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-sm font-semibold text-[#f7ead7]">DECOHO workflow</p>
              <p className="mt-2 max-w-lg text-2xl font-bold">
                Từ ảnh căn phòng đến phối cảnh 3D có sản phẩm thật.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="space-y-3">
            {processSteps.map((item, index) => {
              const isActive = activeStep === index;
              const isDone = activeStep > index;

              return (
                <button
                  className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md border p-4 text-left transition ${
                    isActive
                      ? "border-[#1f2421] bg-[#1f2421] text-white shadow-md"
                      : "border-[#ded6c9] bg-white text-[#1f2421] hover:border-[#b8ad9e]"
                  }`}
                  key={item.number}
                  onClick={() => setActiveStep(index)}
                  type="button"
                >
                  <span
                    className={`rounded-md px-2 py-1 text-sm font-bold ${
                      isActive ? "bg-white/10 text-[#d89b47]" : "bg-[#f7f3ec] text-[#646a61]"
                    }`}
                  >
                    {item.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{item.title}</span>
                    <span
                      className={`mt-1 block truncate text-xs ${
                        isActive ? "text-white/65" : "text-[#646a61]"
                      }`}
                    >
                      {item.subTitle}
                    </span>
                  </span>
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full border ${
                      isActive
                        ? "border-[#d89b47] bg-[#d89b47] text-[#1f2421]"
                        : "border-[#ded6c9] text-[#646a61]"
                    }`}
                  >
                    <Icon name={isDone ? "check" : "arrow"} />
                  </span>
                </button>
              );
            })}
          </section>

          <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm md:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-[#eee7dc] pb-6">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-md bg-[#f7f3ec] text-[#2f6f5e]">
                  <Icon name={step.icon} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#b46f2c]">
                    Bước {step.number}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{step.title}</h2>
                </div>
              </div>
              <span className="hidden text-5xl font-bold text-[#eee7dc] sm:block">
                {step.number}
              </span>
            </div>

            <p className="mt-6 text-sm leading-7 text-[#646a61]">{step.description}</p>

            <div className="mt-6 rounded-md bg-[#fbf7ef] p-5">
              <h3 className="text-sm font-bold uppercase text-[#51564f]">
                Các tiêu điểm thực hiện
              </h3>
              <div className="mt-4 space-y-3">
                {step.details.map((detail) => (
                  <div className="flex items-start gap-3" key={detail}>
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#dff1e6] text-[#2f6f5e]">
                      <Icon name="check" />
                    </span>
                    <p className="text-sm leading-6 text-[#51564f]">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-md border border-[#ecd5ab] bg-[#fff7e8] p-4">
              <span className="text-[#b46f2c]">
                <Icon name="spark" />
              </span>
              <p className="text-sm italic leading-6 text-[#8a5d25]">{step.tip}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
