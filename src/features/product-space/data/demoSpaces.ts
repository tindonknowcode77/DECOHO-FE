import type { ProductPoint, ProductSpace, ProductSpaceProduct } from "../types";

/**
 * Demo data dùng cho moodboard có id không phải MongoId 24-hex
 * (vd: dev offline, mẫu UI). Không ảnh hưởng moodboard thật từ API.
 */

function product(
  id: string,
  name: string,
  price: number,
  image: string,
  brand = "DECOHO",
): ProductSpaceProduct {
  return {
    _id: id,
    id,
    name,
    price,
    images: [image],
    brand,
  };
}

function point(
  id: string,
  x: number,
  y: number,
  productId: string,
): ProductPoint {
  return { _id: id, id, x, y, productId };
}

const PRODUCTS: Record<string, ProductSpaceProduct> = {
  "demo-p-sofa-1": product(
    "demo-p-sofa-1",
    "Sofa bọc vải linen màu be",
    12900000,
    "/images/product-space/urban-warmth.png",
  ),
  "demo-p-sofa-2": product(
    "demo-p-sofa-2",
    "Sofa góc L vải xám khói",
    18500000,
    "/images/product-space/soft-evening.png",
  ),
  "demo-p-sofa-3": product(
    "demo-p-sofa-3",
    "Sofa da bò thật cognac",
    26900000,
    "/images/moodboards/contemporary-living-moodboard-v2.png",
  ),
  "demo-p-table-1": product(
    "demo-p-table-1",
    "Bàn trà gỗ sồi tròn",
    3200000,
    "/images/product-space/urban-warmth.png",
  ),
  "demo-p-table-2": product(
    "demo-p-table-2",
    "Bàn trà marble trắng",
    7800000,
    "/images/moodboards/contemporary-living-moodboard-v2.png",
  ),
  "demo-p-lamp-1": product(
    "demo-p-lamp-1",
    "Đèn sàn tripod gỗ",
    2400000,
    "/images/product-space/organic-calm.png",
  ),
  "demo-p-lamp-2": product(
    "demo-p-lamp-2",
    "Đèn bàn gốm sứ",
    980000,
    "/images/product-space/soft-evening.png",
  ),
  "demo-p-rug-1": product(
    "demo-p-rug-1",
    "Thảm len dệt tay 200×300",
    4900000,
    "/images/product-space/urban-warmth.png",
  ),
  "demo-p-rug-2": product(
    "demo-p-rug-2",
    "Thảm cotton họa tiết Berber",
    2200000,
    "/images/product-space/soft-evening.png",
  ),
  "demo-p-bed-1": product(
    "demo-p-bed-1",
    "Giường gỗ sồi 1m8",
    14500000,
    "/images/product-space/organic-calm.png",
  ),
  "demo-p-bed-2": product(
    "demo-p-bed-2",
    "Giường bọc nhung 1m6",
    12800000,
    "/images/product-space/soft-evening.png",
  ),
  "demo-p-nightstand-1": product(
    "demo-p-nightstand-1",
    "Tab đầu giường gỗ óc chó",
    3400000,
    "/images/product-space/urban-warmth.png",
  ),
  "demo-p-armchair-2": product(
    "demo-p-armchair-2",
    "Ghế bành gỗ tự nhiên",
    4200000,
    "/images/product-space/organic-calm.png",
  ),
  "demo-p-pendant-1": product(
    "demo-p-pendant-1",
    "Đèn thả treo bàn ăn",
    2950000,
    "/images/moodboards/contemporary-living-moodboard-v2.png",
  ),
  "demo-p-chair-1": product(
    "demo-p-chair-1",
    "Ghế ăn gỗ beech",
    1450000,
    "/images/product-space/urban-warmth.png",
  ),
  "demo-p-chair-2": product(
    "demo-p-chair-2",
    "Ghế ăn bọc da cognac",
    2100000,
    "/images/product-space/soft-evening.png",
  ),
  "demo-p-plant-1": product(
    "demo-p-plant-1",
    "Chậu cây monstera + chậu đất nung",
    890000,
    "/images/product-space/organic-calm.png",
  ),
  "demo-p-vase-1": product(
    "demo-p-vase-1",
    "Bình gốm Bát Tràng cao 40cm",
    750000,
    "/images/product-space/soft-evening.png",
  ),
  "demo-p-bath-1": product(
    "demo-p-bath-1",
    "Bộ khăn cotton Ai Cập 600gsm",
    1350000,
    "/images/product-space/organic-calm.png",
  ),
  "demo-p-shelf-1": product(
    "demo-p-shelf-1",
    "Kệ sách gỗ mở 5 tầng",
    4200000,
    "/images/product-space/urban-warmth.png",
  ),
};

export const DEMO_MOODBOARDS: ProductSpace[] = [
  {
    _id: "demo-1",
    title: "Minimalism Living",
    author: "Hữu Thịnh",
    imageUrl: "/images/product-space/urban-warmth.png",
    roomType: "living_room",
    description:
      "Phòng khách tối giản phong cách Scandinavian — tông be, gỗ sáng, điểm nhấn xanh oliu.",
    width: 4.2,
    length: 5.5,
    isPublic: true,
    isFeatured: true,
    likes: 342,
    tags: ["Minimal", "Scandinavian"],
    productPoints: [
      point("demo-1-p1", 50, 65, "demo-p-sofa-1"),
      point("demo-1-p2", 25, 78, "demo-p-table-1"),
      point("demo-1-p3", 78, 35, "demo-p-lamp-1"),
      point("demo-1-p4", 65, 88, "demo-p-rug-1"),
    ],
    createdAt: new Date("2026-08-01").toISOString(),
  },
  {
    _id: "demo-2",
    title: "Soft Serenity Room",
    author: "Lan Anh",
    imageUrl: "/images/product-space/soft-evening.png",
    roomType: "bedroom",
    description: "Phòng ngủ dịu dàng với tông nude, vải linen và ánh sáng vàng ấm.",
    width: 4.0,
    length: 4.8,
    isPublic: true,
    isFeatured: false,
    likes: 189,
    tags: ["Soft Neutral", "Cozy"],
    productPoints: [
      point("demo-2-p1", 50, 55, "demo-p-bed-2"),
      point("demo-2-p2", 22, 50, "demo-p-nightstand-1"),
      point("demo-2-p3", 78, 50, "demo-p-lamp-2"),
      point("demo-2-p4", 50, 88, "demo-p-rug-2"),
    ],
    createdAt: new Date("2026-08-10").toISOString(),
  },
  {
    _id: "demo-3",
    title: "Japandi Bedroom",
    author: "Minh Tuấn",
    imageUrl: "/images/product-space/organic-calm.png",
    roomType: "bedroom",
    description: "Japandi — giao thoa Nhật Bản và Bắc Âu: gỗ tối, đường nét gọn.",
    width: 3.8,
    length: 4.6,
    isPublic: true,
    isFeatured: true,
    likes: 421,
    tags: ["Japandi", "Minimal"],
    productPoints: [
      point("demo-3-p1", 50, 60, "demo-p-bed-1"),
      point("demo-3-p2", 25, 58, "demo-p-nightstand-1"),
      point("demo-3-p3", 80, 70, "demo-p-armchair-2"),
      point("demo-3-p4", 60, 30, "demo-p-vase-1"),
    ],
    createdAt: new Date("2026-07-22").toISOString(),
  },
  {
    _id: "demo-4",
    title: "Boho Dream",
    author: "Thu Hà",
    imageUrl: "/images/moodboards/contemporary-living-moodboard-v2.png",
    roomType: "living_room",
    description: "Boho đầy màu sắc với thảm Berber, cây xanh và đồ thủ công.",
    width: 5.0,
    length: 6.0,
    isPublic: true,
    isFeatured: true,
    likes: 567,
    tags: ["Boho", "Eclectic"],
    productPoints: [
      point("demo-4-p1", 48, 60, "demo-p-sofa-3"),
      point("demo-4-p2", 22, 75, "demo-p-table-2"),
      point("demo-4-p3", 75, 30, "demo-p-plant-1"),
      point("demo-4-p4", 65, 85, "demo-p-rug-2"),
    ],
    createdAt: new Date("2026-08-15").toISOString(),
  },
  {
    _id: "demo-5",
    title: "Urban Jungle",
    author: "Gia Huy",
    imageUrl: "/images/product-space/organic-calm.png",
    roomType: "living_room",
    description: "Phòng khách đô thị với nhiều cây xanh, ánh sáng tự nhiên.",
    width: 4.5,
    length: 5.2,
    isPublic: true,
    isFeatured: false,
    likes: 234,
    tags: ["Plants", "Green"],
    productPoints: [
      point("demo-5-p1", 50, 60, "demo-p-sofa-2"),
      point("demo-5-p2", 28, 75, "demo-p-table-1"),
      point("demo-5-p3", 80, 35, "demo-p-plant-1"),
      point("demo-5-p4", 70, 70, "demo-p-armchair-2"),
    ],
    createdAt: new Date("2026-08-05").toISOString(),
  },
  {
    _id: "demo-6",
    title: "Cozy Reading Corner",
    author: "Phương Thảo",
    imageUrl: "/images/product-space/urban-warmth.png",
    roomType: "office",
    description: "Góc đọc sách ấm cúng với ghế bành, đèn tripod và kệ sách gỗ.",
    width: 2.8,
    length: 3.2,
    isPublic: true,
    isFeatured: false,
    likes: 298,
    tags: ["Study", "Cozy"],
    productPoints: [
      point("demo-6-p1", 45, 55, "demo-p-armchair-2"),
      point("demo-6-p2", 20, 25, "demo-p-shelf-1"),
      point("demo-6-p3", 75, 30, "demo-p-lamp-1"),
      point("demo-6-p4", 55, 80, "demo-p-rug-2"),
    ],
    createdAt: new Date("2026-08-12").toISOString(),
  },
  {
    _id: "demo-7",
    title: "Nordic Kitchen",
    author: "Khánh Ngọc",
    imageUrl: "/images/product-space/soft-evening.png",
    roomType: "kitchen",
    description: "Bếp Bắc Âu — gỗ sáng, phụ kiện tối giản, đèn thả treo bàn ăn.",
    width: 3.5,
    length: 5.0,
    isPublic: true,
    isFeatured: false,
    likes: 156,
    tags: ["Kitchen", "Nordic"],
    productPoints: [
      point("demo-7-p1", 35, 60, "demo-p-pendant-1"),
      point("demo-7-p2", 22, 70, "demo-p-chair-1"),
      point("demo-7-p3", 78, 70, "demo-p-chair-2"),
    ],
    createdAt: new Date("2026-07-30").toISOString(),
  },
  {
    _id: "demo-8",
    title: "Pastel Paradise",
    author: "Mỹ Linh",
    imageUrl: "/images/product-space/soft-evening.png",
    roomType: "bedroom",
    description: "Phòng ngủ pastel nữ tính, điểm nhấn hồng phấn và xanh mint.",
    width: 3.6,
    length: 4.5,
    isPublic: true,
    isFeatured: false,
    likes: 412,
    tags: ["Pastel", "Feminine"],
    productPoints: [
      point("demo-8-p1", 50, 55, "demo-p-bed-2"),
      point("demo-8-p2", 25, 50, "demo-p-nightstand-1"),
      point("demo-8-p3", 78, 50, "demo-p-lamp-2"),
      point("demo-8-p4", 60, 85, "demo-p-rug-2"),
    ],
    createdAt: new Date("2026-08-18").toISOString(),
  },
  {
    _id: "demo-9",
    title: "Modern Classic",
    author: "Hoàng Đức",
    imageUrl: "/images/moodboards/contemporary-living-moodboard-v2.png",
    roomType: "living_room",
    description: "Hiện đại pha cổ điển — sofa da cognac, bàn marble, đèn vàng.",
    width: 5.2,
    length: 6.4,
    isPublic: true,
    isFeatured: true,
    likes: 187,
    tags: ["Modern", "Classic"],
    productPoints: [
      point("demo-9-p1", 48, 60, "demo-p-sofa-3"),
      point("demo-9-p2", 25, 80, "demo-p-table-2"),
      point("demo-9-p3", 78, 35, "demo-p-lamp-1"),
      point("demo-9-p4", 60, 90, "demo-p-rug-1"),
    ],
    createdAt: new Date("2026-08-20").toISOString(),
  },
  {
    _id: "demo-10",
    title: "Rustic Charm",
    author: "Thanh Sơn",
    imageUrl: "/images/product-space/urban-warmth.png",
    roomType: "dining_room",
    description: "Phòng ăn mộc mạc, gỗ tự nhiên và ghế da cognac.",
    width: 4.0,
    length: 5.0,
    isPublic: true,
    isFeatured: false,
    likes: 265,
    tags: ["Rustic", "Natural"],
    productPoints: [
      point("demo-10-p1", 50, 50, "demo-p-pendant-1"),
      point("demo-10-p2", 30, 70, "demo-p-chair-2"),
      point("demo-10-p3", 70, 70, "demo-p-chair-2"),
      point("demo-10-p4", 50, 88, "demo-p-rug-1"),
    ],
    createdAt: new Date("2026-08-08").toISOString(),
  },
  {
    _id: "demo-11",
    title: "Zen Bathroom",
    author: "Trúc Linh",
    imageUrl: "/images/product-space/organic-calm.png",
    roomType: "bathroom",
    description: "Phòng tắm Zen — tre, đá tự nhiên, ánh sáng dịu.",
    width: 2.4,
    length: 3.6,
    isPublic: true,
    isFeatured: false,
    likes: 198,
    tags: ["Zen", "Minimal"],
    productPoints: [
      point("demo-11-p1", 50, 60, "demo-p-bath-1"),
      point("demo-11-p2", 30, 75, "demo-p-plant-1"),
    ],
    createdAt: new Date("2026-07-25").toISOString(),
  },
  {
    _id: "demo-12",
    title: "Garden Patio",
    author: "Nam Phong",
    imageUrl: "/images/product-space/soft-evening.png",
    roomType: "other",
    description: "Góc sân vườn ngoài trời với bàn ghế gỗ và cây xanh.",
    width: 4.0,
    length: 5.0,
    isPublic: true,
    isFeatured: false,
    likes: 143,
    tags: ["Outdoor", "Garden"],
    productPoints: [
      point("demo-12-p1", 50, 55, "demo-p-armchair-2"),
      point("demo-12-p2", 75, 60, "demo-p-armchair-2"),
      point("demo-12-p3", 50, 80, "demo-p-plant-1"),
    ],
    createdAt: new Date("2026-08-22").toISOString(),
  },
];

/** Trả map product để ProductQuickView hiển thị chi tiết sản phẩm demo. */
export const DEMO_PRODUCT_MAP = PRODUCTS;

/** Mongo ObjectId 24 hex. */
const MONGO_ID_RE = /^[a-f0-9]{24}$/i;

export function isLikelyMongoId(value: string): boolean {
  return MONGO_ID_RE.test(value);
}

/** Trả về demo moodboard + product points đã populate, hoặc undefined nếu không phải demo. */
export function findDemoMoodboard(id: string): ProductSpace | undefined {
  if (isLikelyMongoId(id)) return undefined;
  const found = DEMO_MOODBOARDS.find(
    (m) => String(m._id ?? m.id) === String(id),
  );
  if (!found) return undefined;
  // Populate productId thành object để render pin + click mở QuickView
  return {
    ...found,
    productPoints: (found.productPoints ?? []).map((p) => {
      const productId = String(p.productId ?? "");
      return {
        ...p,
        product: PRODUCTS[productId],
        productId: PRODUCTS[productId] ?? productId,
      };
    }),
  };
}
