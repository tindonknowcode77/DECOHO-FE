// FE type cho Moodboard — khớp với MoodboardResponse ở BE (moodboards.service.ts)

export type MoodboardAuthor = string | { _id?: string; id?: string; name?: string };

export type MoodboardProductSummary = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  discount?: number;
  stock?: number;
  images?: string[];
  image?: string;
  material?: string;
  category?: string;
  brand?: string;
  color?: string;
  dimensions?: string;
  rating?: number;
  status?: string;
  description?: string;
};

export type MoodboardPoint = {
  _id?: string;
  productId: string;
  x: number;
  y: number;
  product?: MoodboardProductSummary;
};

export type Moodboard = {
  _id?: string;
  id?: string;
  moodboardId?: string;
  authorId?: string;
  authorName?: string;
  author?: MoodboardAuthor;
  title?: string;
  description?: string;
  imageUrl: string;
  imagePublicId?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageFormat?: string;
  imageBytes?: number;
  roomType: string; // 'bedroom' | 'living_room' | 'kitchen' | 'bathroom' | 'office' | 'dining_room' | 'other'
  tags: string[];
  likes: number;
  views: number;
  isPublic: boolean;
  isFeatured: boolean;
  productPoints: MoodboardPoint[];
  productsCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MoodboardProductsResponse = {
  moodboardId: string;
  count: number;
  items: MoodboardProductSummary[];
};
