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
 * Discriminator cho document trong collection `rooms` (BE `room.schema.ts`).
 *  - 'room'      : ảnh phòng cá nhân (POST /rooms/upload)
 *  - 'moodboard' : Product Space (POST /product-spaces/...)
 *
 * Optional trên FE vì tài liệu cũ trước khi backfill có thể thiếu.
 */
export const ROOM_KINDS = ["room", "moodboard"] as const;
export type RoomKind = (typeof ROOM_KINDS)[number];

/**
 * Phạm vi phần trăm cho toạ độ `x`, `y` trên ảnh moodboard (khớp với BE `@Min(0) @Max(100)`).
 */
export const PRODUCT_POINT_PERCENT_MIN = 0;
export const PRODUCT_POINT_PERCENT_MAX = 100;

/**
 * Toạ độ điểm ghim sản phẩm. Dùng cho UI state trước khi build `ProductPointInput`.
 */
export type ProductPointCoord = {
  x: number;
  y: number;
};

/**
 * Validation limits — đồng bộ với BE CreateProductSpaceDto.
 * Đổi BE -> đổi hằng số này -> FE form tự validate theo.
 */
export const ROOM_DIMENSION_MIN = 0.1;   // BE @Min(0.1) cho width / length
export const ROOM_DIMENSION_STEP = 0.1;
export const MOODBOARD_TITLE_MAXLENGTH = 160;   // BE @MaxLength(160)
export const MOODBOARD_DESCRIPTION_MAXLENGTH = 1000;  // BE @MaxLength(1000)

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
  /** Discriminator: 'moodboard' cho Product Space, 'room' cho ảnh phòng thường. */
  kind?: RoomKind;

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

/**
 * Payload khi gắn hoặc cập nhật 1 điểm sản phẩm.
 * Tương ứng `POST /product-spaces/admin/:id/points` và `PATCH .../:pointId`.
 *
 * - `productId` phải là MongoId 24 hex.
 * - `x` và `y` là phần trăm (xem `PRODUCT_POINT_PERCENT_MIN/MAX`) so với
 *   chiều rộng / cao của ảnh.
 */
export type ProductPointInput = ProductPointCoord & {
  productId: string;
};

/**
 * Payload khi tạo Moodboard kèm ảnh (multipart FormData).
 * Ảnh được truyền riêng ở tham số thứ 2 trong service,
 * nhưng type dùng để khai báo form state.
 */
export type CreateProductSpaceFormState = Omit<
  CreateProductSpacePayload,
  "roomType" | "width" | "length"
> & {
  roomType: RoomType;
  width: number;
  length: number;
  /** Kích thước file người dùng chọn (chưa upload). */
  imageFile?: File | null;
  /** URL preview local (URL.createObjectURL) — không gửi lên BE. */
  imagePreviewUrl?: string;
};
