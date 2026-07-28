"use client";

import { useEffect, useRef, useState } from "react";
import { initialCartItems } from "../mock/cartItems";
import { addCartItem } from "../services/cartStorage";
import type { CartItem } from "../types";

type AddToCartButtonProps = {
  item: Omit<CartItem, "quantity">;
};

export default function AddToCartButton({ item }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOutOfStock = item.stock === 0;

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  function handleAddToCart() {
    addCartItem({ ...item, quantity: 1 }, initialCartItems);
    setIsAdded(true);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => setIsAdded(false), 2200);
  }

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-3 text-center text-sm font-bold shadow-sm transition ${
        isAdded
          ? "bg-[#2f6f5e] text-white"
          : "bg-[#d89b47] text-[#1f2421] hover:bg-[#e4aa55]"
      } disabled:cursor-not-allowed disabled:bg-[#d7d3cb] disabled:text-[#7b7f78]`}
      disabled={isOutOfStock}
      onClick={handleAddToCart}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d={
            isAdded
              ? "m5 12 4 4L19 6"
              : "M6 6h15l-1.5 8.5H8L6 3H3m5 16.5h.01M18 19.5h.01"
          }
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      {isOutOfStock
        ? "Tạm hết hàng"
        : isAdded
          ? "Đã thêm vào giỏ"
          : "Thêm vào giỏ hàng"}
    </button>
  );
}
