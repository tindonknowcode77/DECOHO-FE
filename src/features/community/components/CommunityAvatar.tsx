"use client";

import Image from "next/image";
import { useState } from "react";
import type { CommunityUser } from "../types";

export default function CommunityAvatar({
  user,
  size = 40,
}: {
  user: Pick<CommunityUser, "fullName" | "avatar">;
  size?: number;
}) {
  const [failed, setFailed] = useState("");
  const src =
    typeof user.avatar === "string" ? user.avatar : user.avatar?.secureUrl;
  const name = user.fullName?.trim() || "Thành viên DECOHO";
  if (src && src !== failed && /^(https?:\/\/|\/)/.test(src))
    return (
      <Image
        alt={name}
        src={src}
        width={size}
        height={size}
        unoptimized
        onError={() => setFailed(src)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      aria-label={name}
      className="grid shrink-0 place-items-center rounded-full bg-[#e6ece1] text-sm font-semibold text-[#345b48]"
      style={{ width: size, height: size }}
    >
      {name
        .split(/\s+/)
        .slice(-2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
