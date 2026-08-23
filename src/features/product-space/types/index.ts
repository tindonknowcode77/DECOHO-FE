/**
 * Types đồng bộ với BE schema ở `src/rooms/room.schema.ts`.
 * Khi BE thay đổi enum/field, cập nhật tại đây là nguồn sự thật duy nhất.
 */

export const ROOM_TYPES = [
  "bedroom",
  "living_room",
  "kitchen",
  "bathroom",
  "office",
  "dining_room",
  "other",
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

/**
 * Map hiển thị tiếng Việt cho RoomType. Dùng cho label trên UI.
 */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: "Phòng ngủ",
  living_room: "Phòng khách",
  kitchen: "Nhà bếp",
  bathroom: "Phòng tắm",
  office: "Góc làm việc",
  dining_room: "Phòng ăn",
  other: "Không gian",
};

/**
 * Sản phẩm gắn lên moodboard (chỉ các trường tối thiểu mà FE cần hiển thị).
 * Khi cần chi tiết hơn, gọi `GET /api/products/:id`.
 */
export type ProductSpaceProduct = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  images?: string[];
  image?: string;
};

/**
 * Một điểm ghim sản phẩm trên ảnh moodboard.
 * `x` và `y` là phần trăm (0..100) tính theo chiều rộng/cao của ảnh.
 */
export type ProductPoint = {
  _id?: string;
  id?: string;
  x?: number;
  y?: number;
  productId?: string | ProductSpaceProduct;
  product?: ProductSpaceProduct;
};

/**
 * Moodboard / Product Space.
 * Trùng tên field với BE response để có thể cast thẳng từ `fetch().json()`.
 */
export type ProductSpace = {
  _id?: string;
  id?: string;
  roomId?: string;
  userId?: string;

  title?: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageFormat?: string;
  imageBytes?: number;

  roomType?: RoomType;
  width?: number;
  length?: number;

  isPublic?: boolean;
  isFeatured?: boolean;

  productPoints?: ProductPoint[];

  createdAt?: string;
  updatedAt?: string;
};

/**
 * Payload khi tạo Product Space. Tương ứng `POST /api/product-spaces`.
 */
export type CreateProductSpacePayload = {
  roomType: RoomType;
  width: number;
  length: number;
  title?: string;
  description?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
};

/**
 * Payload khi cập nhật Product Space. Tương ứng `PATCH /api/product-spaces/:id`.
 */
export type UpdateProductSpacePayload = Partial<
  Pick<
    ProductSpace,
    "title" | "description" | "isPublic" | "isFeatured"
  >
>;
