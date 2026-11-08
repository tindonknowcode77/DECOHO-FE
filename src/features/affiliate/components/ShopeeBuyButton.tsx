"use client";

import React from "react";
import { trackShopeeClick } from "../services/trackShopeeClick";

interface ShopeeBuyButtonProps {
  href: string;
  label?: string;
  productId?: string;
  productName?: string;
  className?: string;
  source?: string;
}

export default function ShopeeBuyButton({
  href,
  label = "Mua ngay trên Shopee ↗",
  productId,
  productName,
  className,
  source = "web_product_detail",
}: ShopeeBuyButtonProps) {
  const handleClick = () => {
    trackShopeeClick({
      productId,
      productName,
      productLink: href,
      source,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={
        className ||
        "rounded-md bg-[#2f6f5e] px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#285f51]"
      }
    >
      {label}
    </a>
  );
}
