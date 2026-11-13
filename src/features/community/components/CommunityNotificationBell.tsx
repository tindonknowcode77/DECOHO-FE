"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Heart, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import { getAccessToken } from "@/src/features/auth/services/session";

type NotificationActor = {
  _id?: string;
  fullName?: string;
  avatar?: string;
};

export type CommunityNotificationItem = {
  _id: string;
  actorId?: NotificationActor | string;
  type:
    | "new_post"
    | "post_reaction"
    | "post_comment"
    | "comment_reply"
    | "comment_reaction"
    | "new_follower";
  postId?: string;
  commentId?: string;
  reactionType?: string;
  previewText?: string;
  isRead: boolean;
  createdAt: string;
};

const REACTION_EMOJI: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(isoDate).toLocaleDateString("vi-VN");
}

function getNotificationActionText(item: CommunityNotificationItem) {
  const emoji = item.reactionType ? ` ${REACTION_EMOJI[item.reactionType] ?? ""}` : "";
  switch (item.type) {
    case "new_post":
      return "vừa đăng một bài viết mới trên diễn đàn";
    case "post_reaction":
      return `đã thả cảm xúc${emoji} vào bài viết của bạn`;
    case "post_comment":
      return "đã bình luận về bài viết của bạn";
    case "comment_reply":
      return "đã trả lời bình luận của bạn";
    case "comment_reaction":
      return `đã thả cảm xúc${emoji} vào bình luận của bạn`;
    case "new_follower":
      return "đã bắt đầu theo dõi bạn";
    default:
      return "có hoạt động mới trên diễn đàn";
  }
}

function NotificationTypeBadge({ item }: { item: CommunityNotificationItem }) {
  if (item.type === "post_reaction" || item.type === "comment_reaction") {
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#fff1ee] text-[11px] shadow-xs">
        {item.reactionType ? (REACTION_EMOJI[item.reactionType] ?? "❤️") : <Heart className="h-3 w-3 text-[#d94848]" />}
      </span>
    );
  }
  if (item.type === "post_comment" || item.type === "comment_reply") {
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e8f1ec] text-[#2f6f5e] shadow-xs">
        <MessageCircle className="h-3 w-3" />
      </span>
    );
  }
  if (item.type === "new_follower") {
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#eef2ff] text-[#3b5bdb] shadow-xs">
        <UserPlus className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#fdf4e7] text-[#b46f2c] shadow-xs">
      <Sparkles className="h-3 w-3" />
    </span>
  );
}

export default function CommunityNotificationBell() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<CommunityNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await fetch(`${getApiBaseUrl()}/community/notifications/unread-count`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = (await response.json()) as { unreadCount?: number };
      setUnreadCount(Number(data.unreadCount ?? 0));
    } catch {
      // Ignore transient network polling errors
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/community/notifications?limit=15`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        items?: CommunityNotificationItem[];
        unreadCount?: number;
      };
      setItems(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(Number(data.unreadCount ?? 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchUnreadCount();
      }
    }, 25000);
    return () => window.clearInterval(timer);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!open) return;
    void fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const handleMarkAllRead = async () => {
    const token = getAccessToken();
    if (!token) return;
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    await fetch(`${getApiBaseUrl()}/community/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const handleNotificationClick = async (item: CommunityNotificationItem) => {
    setOpen(false);
    if (!item.isRead) {
      const token = getAccessToken();
      setItems((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (token) {
        void fetch(`${getApiBaseUrl()}/community/notifications/${encodeURIComponent(item._id)}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    }

    if (item.postId) {
      router.push(`/community/post/${item.postId}`);
    } else {
      router.push("/community");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Thông báo diễn đàn"
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e4e8db] bg-[#f5f6ee] text-[#2f6f5e] transition hover:bg-[#e9efdf]"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] h-[18px] place-items-center rounded-full bg-[#bc3d2b] px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-3 w-[340px] max-w-[90vw] overflow-hidden rounded-2xl border border-[#ded6c9] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#eee7dc] px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-[#2f6f5e]">Thông báo diễn đàn</h3>
              <p className="text-[11px] text-[#646a61]">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Bạn đã xem hết thông báo"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-[#2f6f5e] transition hover:bg-[#eef6f2]"
                onClick={() => void handleMarkAllRead()}
                type="button"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#f2ece1]">
            {loading && items.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#646a61]">
                Đang tải thông báo...
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-xs leading-relaxed text-[#646a61]">
                Chưa có thông báo nào. Khi người bạn theo dõi đăng bài hoặc có bình luận, cảm xúc mới, thông báo sẽ hiện tại đây.
              </div>
            ) : (
              items.map((item) => {
                const actorName =
                  typeof item.actorId === "object" && item.actorId?.fullName
                    ? item.actorId.fullName
                    : "Thành viên DECOHO";
                const initials = actorName.slice(0, 2).toUpperCase();

                return (
                  <button
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#fcfaf6] ${
                      item.isRead ? "bg-white" : "bg-[#f3f8f5]"
                    }`}
                    key={item._id}
                    onClick={() => void handleNotificationClick(item)}
                    type="button"
                  >
                    <div className="relative mt-0.5 shrink-0">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dfe8d3] text-xs font-bold text-[#2f6f5e]">
                        {initials}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <NotificationTypeBadge item={item} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-5 text-[#254f43]">
                        <span className="font-bold">{actorName}</span>{" "}
                        {getNotificationActionText(item)}
                      </p>
                      {item.previewText && (
                        <p className="mt-1 line-clamp-2 rounded-lg bg-[#f7f3ec] px-2.5 py-1 text-[11px] text-[#646a61]">
                          “{item.previewText}”
                        </p>
                      )}
                      <p className="mt-1 text-[10px] font-semibold text-[#7b7f78]">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>

                    {!item.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2f6f5e]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
