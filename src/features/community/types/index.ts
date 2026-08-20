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

export type CommunityPost = {
  _id: string;
  userId: CommunityUser;
  description: string;
  roomType: string;
  hashtags: string[];
  beforeImageUrl: string;
  afterImageUrl: string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  comments: CommunityComment[];
  createdAt: string;
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
