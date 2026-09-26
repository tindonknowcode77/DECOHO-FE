import { ApiError } from "@/src/services/axios";
import {
  REACTION_LIST,
  type CommunityComment,
  type CommunityPost,
  type CommunityUser,
  type ReactionType,
} from "../types";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
  value && typeof value === "object" ? (value as RecordValue) : {};
const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
const count = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export function normalizeUser(value: unknown): CommunityUser {
  const user = record(value);
  const avatar =
    typeof user.avatar === "string"
      ? user.avatar
      : text(record(user.avatar).secureUrl);
  return {
    _id: text(user._id, text(value)),
    fullName: text(user.fullName).trim() || "Thành viên DECOHO",
    avatar,
    following: user.following === true,
  };
}

function reactions(value: RecordValue) {
  const counts = record(value.reactionCounts);
  const reactionCounts = Object.fromEntries(
    REACTION_LIST.map((type) => [type, count(counts[type])]),
  );
  return {
    reactionCounts,
    reactionTotal: Object.values(reactionCounts).reduce((a, b) => a + b, 0),
    myReaction: REACTION_LIST.includes(value.myReaction as ReactionType)
      ? (value.myReaction as ReactionType)
      : null,
  };
}

export function normalizeComment(value: unknown): CommunityComment {
  const item = record(value);
  return {
    _id: text(item._id),
    userId: normalizeUser(item.userId),
    content: text(item.content),
    createdAt: text(item.createdAt),
    parentId: text(item.parentId) || null,
    replyCount: count(item.replyCount),
    ...reactions(item),
  };
}

export function normalizePost(value: unknown): CommunityPost {
  const item = record(value);
  const comments = array(item.comments)
    .map(normalizeComment)
    .filter((c) => c._id);
  const rx = reactions(item);
  return {
    _id: text(item._id),
    userId: normalizeUser(item.userId),
    description: text(item.description),
    roomType: text(item.roomType, "Không gian sống"),
    hashtags: [
      ...new Set(
        array(item.hashtags).filter((v): v is string => typeof v === "string"),
      ),
    ],
    media: array(item.media)
      .map((v) => {
        const media = record(v);
        return {
          url: text(media.url),
          publicId: text(media.publicId),
          type:
            media.type === "video" ? ("video" as const) : ("image" as const),
          thumbnailUrl: text(media.thumbnailUrl) || undefined,
        };
      })
      .filter((m) => /^(https?:\/\/|\/)/.test(m.url)),
    comments,
    commentCount: Math.max(count(item.commentCount), comments.length),
    createdAt: text(item.createdAt),
    saved: item.saved === true,
    liked: rx.myReaction === "like",
    likeCount: rx.reactionCounts.like,
    ...rx,
  };
}

export function communityError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    if (error.status === 403)
      return "Bạn chưa có quyền thực hiện thao tác này.";
    if (error.status === 413) return "Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn.";
    if (error.status === 429)
      return "Bạn thao tác hơi nhanh. Hãy thử lại sau một chút.";
    if (error.status >= 500)
      return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau một chút.";
    if (error.status === 404)
      return "Nội dung này không còn tồn tại. Hãy làm mới trang.";
  }
  return fallback;
}

export function formatCommunityDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}
