export type CommunityUser = {
  _id: string;
  fullName: string;
  avatar?: string | { secureUrl?: string };
  businessAddress?: string;
  following?: boolean;
};

export type CommunityComment = {
  _id: string;
  userId: CommunityUser;
  content: string;
  createdAt: string;
};

export type CommunityMedia = {
  url: string;
  publicId: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bytes?: number;
};

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const REACTION_LIST: ReactionType[] = [
  'like',
  'love',
  'haha',
  'wow',
  'sad',
  'angry',
];

export const REACTION_META: Record<
  ReactionType,
  { label: string; emoji: string; color: string }
> = {
  like: { label: 'Thích', emoji: '👍', color: '#3b82f6' },
  love: { label: 'Yêu thích', emoji: '❤️', color: '#ef4444' },
  haha: { label: 'Haha', emoji: '😂', color: '#f59e0b' },
  wow: { label: 'Wow', emoji: '😮', color: '#fbbf24' },
  sad: { label: 'Buồn', emoji: '😢', color: '#0ea5e9' },
  angry: { label: 'Phẫn nộ', emoji: '😡', color: '#dc2626' },
};

export type CommunityPost = {
  _id: string;
  userId: CommunityUser;
  description: string;
  roomType: string;
  hashtags: string[];
  media: CommunityMedia[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  comments: CommunityComment[];
  createdAt: string;
  myReaction?: ReactionType | null;
  reactionCounts?: Partial<Record<ReactionType, number>>;
  reactionTotal?: number;
};

export type CommunityCreator = {
  userId: string;
  fullName: string;
  avatar?: string | { secureUrl?: string };
  posts: number;
  likes: number;
  following?: boolean;
};

export type CommunityFeed = {
  items: CommunityPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
