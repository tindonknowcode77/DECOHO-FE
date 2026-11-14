export type FeedbackType = 'WEBSITE' | 'PRODUCT' | 'FEATURE' | 'BUG';

export interface FeedbackMedia {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
  thumbnailUrl?: string;
}

export interface FeedbackSubmission {
  type: FeedbackType;
  rating: number; // 1 - 5
  content: string;
  tags?: string[];
  media?: FeedbackMedia[];
  productId?: string;
  productName?: string;
  userName?: string;
  userEmail?: string;
  pageUrl?: string;
}

export interface FeedbackItem {
  _id: string;
  type: FeedbackType;
  rating: number;
  content: string;
  tags?: string[];
  media?: FeedbackMedia[];
  productId?: string;
  productName?: string;
  userId?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  userName?: string;
  userEmail?: string;
  pageUrl?: string;
  status: 'NEW' | 'REVIEWED' | 'ARCHIVED';
  createdAt: string;
}

export interface ProductFeedbackStats {
  productId: string;
  totalCount: number;
  averageRating: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  items: FeedbackItem[];
}

export interface PublicFeedbackResponse {
  items: FeedbackItem[];
  total: number;
  averageRating: number;
  page: number;
  limit: number;
  totalPages: number;
}
