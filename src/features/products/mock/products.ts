import type { Product } from "../types";

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Sofa Sora gỗ sồi Japandi",
    category: "Sofa",
    priceVND: 8900000,
    dimensions: "190 x 85 x 78 cm",
    material: "Khung gỗ sồi tự nhiên, nệm bọc vải linen cao cấp",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=700",
    style: "japandi",
    styleName: "Japandi mộc mạc",
    description:
      "Thiết kế tối giản với tỉ lệ thấp, chất vải mềm và khung gỗ sáng màu, phù hợp phòng khách căn hộ hiện đại.",
    rating: 4.8,
    reviewsCount: 34,
    status: "hot",
    specifications: {
      "Xuất xứ": "Việt Nam",
      "Thời gian gia công": "7 - 10 ngày",
      "Bảo hành": "24 tháng cho khung sườn",
      "Độ chịu lực": "Tối đa 280 kg",
    },
  },
  {
    id: "prod-2",
    name: "Bàn trà tròn kép gỗ Ash Koto",
    category: "Bàn trà",
    priceVND: 3200000,
    dimensions: "Đường kính 70 cm, cao 38 cm",
    material: "Gỗ tần bì phủ dầu, chân tiện tròn",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=700",
    style: "japandi",
    styleName: "Japandi mộc mạc",
    description:
      "Mặt bàn tròn kép giúp tối ưu diện tích sử dụng, giữ cảm giác nhẹ và thông thoáng cho khu sofa.",
    rating: 4.7,
    reviewsCount: 22,
    status: "new",
    specifications: {
      "Xuất xứ": "Xưởng DECOHO Hà Nội",
      "Thời gian gia công": "3 - 5 ngày",
      "Bảo hành": "12 tháng",
      "Hoàn thiện": "Dầu PU 3 lớp chống thấm",
    },
  },
  {
    id: "prod-3",
    name: "Thảm sợi đay tự nhiên Kyoto",
    category: "Thảm",
    priceVND: 1850000,
    dimensions: "Đường kính 150 cm",
    material: "Sợi đay dệt tay, xử lý chống mốc",
    image:
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=700",
    style: "japandi",
    styleName: "Japandi mộc mạc",
    description:
      "Chất thô mộc Wabi-sabi tạo lớp nền ấm áp cho phòng khách, phòng ngủ hoặc góc đọc sách.",
    rating: 4.5,
    reviewsCount: 15,
    specifications: {
      "Phương pháp": "Dệt tay 100%",
      "Trọng lượng": "3.5 kg",
      "Vệ sinh": "Hút bụi định kỳ",
    },
  },
  {
    id: "prod-4",
    name: "Sofa gỗ gụ mây đan Hà Nội",
    category: "Sofa",
    priceVND: 14500000,
    dimensions: "210 x 88 x 80 cm",
    material: "Khung gỗ gụ, tựa lưng mây tự nhiên đan tay",
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=700",
    style: "indochine",
    styleName: "Indochine cổ điển",
    description:
      "Tỉ lệ Đông Dương thanh lịch với mây đan thoáng, phù hợp phòng khách có điểm nhấn bản địa.",
    rating: 4.9,
    reviewsCount: 41,
    status: "hot",
    specifications: {
      "Chất liệu mây": "Mây nếp tự nhiên",
      "Gia công": "Chế tác thủ công",
      "Bảo hành": "36 tháng cho khung gỗ",
    },
  },
  {
    id: "prod-5",
    name: "Ghế bành thư giãn Đông Dương",
    category: "Ghế",
    priceVND: 5800000,
    dimensions: "75 x 80 x 95 cm",
    material: "Khung gỗ gõ đỏ, đệm nhung xanh ngọc",
    image:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=700",
    style: "indochine",
    styleName: "Indochine cổ điển",
    description:
      "Dáng ghế cong mềm và lưng cao, hợp làm ghế đọc sách hoặc điểm nhấn cạnh cửa sổ.",
    rating: 4.8,
    reviewsCount: 28,
    specifications: {
      "Độ đàn hồi": "Nệm D40 chống xẹp",
      "Vải bọc": "Nhung nhập khẩu",
      "Bảo hành": "12 tháng cho nệm",
    },
  },
  {
    id: "prod-6",
    name: "Tủ ngăn kéo cổ điển An Nam",
    category: "Tủ",
    priceVND: 12500000,
    dimensions: "120 x 45 x 85 cm",
    material: "Gỗ óc chó, phụ kiện đồng giả cổ",
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=700",
    style: "indochine",
    styleName: "Indochine cổ điển",
    description:
      "Hệ tủ 6 ngăn kéo sâu với mặt trước tinh tế, dùng tốt ở phòng khách, hành lang hoặc phòng ngủ.",
    rating: 4.9,
    reviewsCount: 17,
    status: "sale",
    specifications: {
      "Loại gỗ": "Óc chó Bắc Mỹ",
      "Phụ kiện": "Ray âm giảm chấn",
      "Sản xuất": "12 - 15 ngày",
    },
  },
  {
    id: "prod-7",
    name: "Sofa góc L da microfiber Milano",
    category: "Sofa",
    priceVND: 18500000,
    dimensions: "260 x 160 x 85 cm",
    material: "Khung gỗ dầu đỏ, da microfiber chống xước",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=700",
    style: "modern",
    styleName: "Hiện đại tối giản",
    description:
      "Sofa góc rộng cho gia đình, đường may gọn và chất da dễ lau chùi trong sinh hoạt hằng ngày.",
    rating: 4.9,
    reviewsCount: 52,
    status: "hot",
    specifications: {
      "Loại da": "Microfiber cao cấp",
      "Khung sườn": "Gỗ dầu đỏ sấy chống cong",
      "Chân đế": "Thép sơn tĩnh điện",
    },
  },
  {
    id: "prod-8",
    name: "Bàn trà mặt đá Sintered Nero",
    category: "Bàn trà",
    priceVND: 4900000,
    dimensions: "120 x 60 x 42 cm",
    material: "Mặt đá nung kết, chân thép carbon",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=700",
    style: "modern",
    styleName: "Hiện đại tối giản",
    description:
      "Mặt đá nung kết chống thấm, chống xước tốt, hợp phòng khách hiện đại cần điểm nhấn sắc nét.",
    rating: 4.6,
    reviewsCount: 26,
    specifications: {
      "Độ dày mặt đá": "12 mm",
      "Chịu nhiệt": "Tối đa 1200 độ C",
      "Xuất xứ đá": "Nhập khẩu Tây Ban Nha",
    },
  },
  {
    id: "prod-9",
    name: "Bàn ăn gỗ sồi mặt đá cao cấp",
    category: "Bàn ăn",
    priceVND: 11200000,
    dimensions: "160 x 80 x 75 cm",
    material: "Khung gỗ sồi, mặt đá cẩm thạch trắng mây",
    image:
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=700",
    style: "modern",
    styleName: "Hiện đại tối giản",
    description:
      "Bàn ăn 4 - 6 người với khung gỗ ấm và mặt đá sáng, dễ phối cùng căn hộ hiện đại.",
    rating: 4.8,
    reviewsCount: 30,
    specifications: {
      "Sức chứa": "4 - 6 người",
      "Mặt đá": "Phủ bóng nano",
      "Cạnh bàn": "Bo tròn R20",
    },
  },
  {
    id: "prod-10",
    name: "Sofa tân cổ điển Chesterfield",
    category: "Sofa",
    priceVND: 24000000,
    dimensions: "220 x 95 x 85 cm",
    material: "Khung sồi Nga, da bò thật bọc mặt tiếp xúc",
    image:
      "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=700",
    style: "classic",
    styleName: "Tân cổ điển vương giả",
    description:
      "Kỹ thuật rút cúc sâu, tay vịn cuộn và lớp da sang trọng cho phòng khách có tinh thần cổ điển.",
    rating: 5,
    reviewsCount: 21,
    status: "hot",
    specifications: {
      "Khung gỗ": "Sồi Nga sấy tẩm",
      "Vật liệu bọc": "Da bò nhập Italy",
      "Đệm ngồi": "Lò xo túi độc lập",
    },
  },
  {
    id: "prod-11",
    name: "Ghế đơn nhung Chesterfield Royal",
    category: "Ghế",
    priceVND: 8200000,
    dimensions: "95 x 90 x 80 cm",
    material: "Khung gỗ sồi, vải nhung rút nút thủ công",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=700",
    style: "classic",
    styleName: "Tân cổ điển vương giả",
    description:
      "Ghế bành đơn đi cùng sofa Chesterfield, tạo góc đọc sách hoặc lounge sang trọng.",
    rating: 4.8,
    reviewsCount: 11,
    specifications: {
      "Rút nút": "Thủ công hoàn toàn",
      "Chân ghế": "Gỗ sồi tiện tròn",
      "Bảo hành": "24 tháng",
    },
  },
  {
    id: "prod-12",
    name: "Đèn chùm pha lê Pháp quý tộc",
    category: "Đèn",
    priceVND: 15500000,
    dimensions: "Đường kính 90 cm, cao 75 cm",
    material: "Khung đồng thau, hạt pha lê K9",
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=700",
    style: "classic",
    styleName: "Tân cổ điển vương giả",
    description:
      "Ánh sáng pha lê tạo điểm nhấn trang trọng cho phòng khách, sảnh đón hoặc phòng ăn lớn.",
    rating: 4.9,
    reviewsCount: 16,
    status: "new",
    specifications: {
      "Số tay đèn": "15 tay nến",
      "Chất liệu hạt": "Pha lê K9",
      "Chiều dài xích": "Điều chỉnh 20 - 100 cm",
    },
  },
];

export const styleOptions = [
  { id: "all", label: "Tất cả phong cách" },
  { id: "japandi", label: "Japandi" },
  { id: "indochine", label: "Indochine" },
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Neo Classic" },
] as const;
