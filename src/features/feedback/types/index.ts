export type FeedbackType = 'WEBSITE' | 'PRODUCT' | 'FEATURE' | 'BUG';

export interface FeedbackSubmission {
  type: FeedbackType;
  rating: number; // 1 - 5
  content: string;
  tags?: string[];
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
