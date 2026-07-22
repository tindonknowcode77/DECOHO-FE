import type { RoomPreset } from "../types";

export const roomPresets: RoomPreset[] = [
  {
    id: "korean-cozy",
    name: "Korean Cozy",
    vietnameseName: "Căn hộ Hàn Quốc ấm cúng",
    sizeDesc: "4.5m x 3.6m x 2.7m",
    areaDesc: "16.2 m2",
    bgImage:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1400",
    items: [
      {
        id: "sofa",
        name: "Sofa Sora nỉ Hàn Quốc",
        category: "Sofa",
        priceVND: 9500000,
        dimensions: "2000 x 850 x 750 mm",
        material: "Khung sồi mộc, vải nỉ sợi tự nhiên",
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=500",
        reason:
          "Dáng thấp và màu cát ấm giúp phòng khách nhỏ trông rộng, mềm và dễ phối cùng rèm sáng.",
        x: 52,
        y: 53,
        options: [
          {
            name: "Sofa Sora nỉ Hàn Quốc",
            priceVND: 9500000,
            dimensions: "2000 x 850 x 750 mm",
            material: "Khung sồi mộc, vải nỉ sợi tự nhiên",
            image:
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Sofa da Premium Milano",
            priceVND: 18500000,
            dimensions: "2100 x 900 x 780 mm",
            material: "Khung sồi đỏ, da bò thuộc Italy",
            image:
              "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Sofa gỗ sồi Chunky Bắc Âu",
            priceVND: 12800000,
            dimensions: "1980 x 820 x 720 mm",
            material: "Gỗ sồi tần bì, đệm bông ép",
            image:
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "table",
        name: "Bàn trà kép gỗ sồi Koto",
        category: "Bàn trà",
        priceVND: 3400000,
        dimensions: "Đường kính 800 mm, cao 400 mm",
        material: "Gỗ sồi Nga phủ sơn bóng mờ",
        image:
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=500",
        reason:
          "Mặt bo tròn chống va đập, chân thon làm cụm sofa nhẹ và dễ di chuyển xung quanh.",
        x: 44,
        y: 55,
        options: [
          {
            name: "Bàn trà kép gỗ sồi Koto",
            priceVND: 3400000,
            dimensions: "Đường kính 800 mm, cao 400 mm",
            material: "Gỗ sồi Nga phủ sơn bóng mờ",
            image:
              "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Bàn trà đá Terrazzo",
            priceVND: 4500000,
            dimensions: "Đường kính 750 mm, cao 420 mm",
            material: "Khung thép sơn tĩnh điện, mặt đá vân mây",
            image:
              "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Bàn trà óc chó Nhật Bản",
            priceVND: 3900000,
            dimensions: "900 x 600 x 380 mm",
            material: "Gỗ óc chó Bắc Mỹ hoàn thiện dầu",
            image:
              "https://images.unsplash.com/photo-1544207240-8b1025eb7a6c?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "lamp",
        name: "Đèn cây vòm Gold Arch",
        category: "Đèn đứng",
        priceVND: 1600000,
        dimensions: "Cao 1800 mm, chao 300 mm",
        material: "Thép carbon mạ vàng đồng thau",
        image:
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500",
        reason:
          "Dáng vòm đưa nguồn sáng vào trung tâm sofa mà không cần khoan trần hay kéo dây phức tạp.",
        x: 80,
        y: 42,
        options: [
          {
            name: "Đèn cây vòm Gold Arch",
            priceVND: 1600000,
            dimensions: "Cao 1800 mm, chao 300 mm",
            material: "Thép carbon mạ vàng đồng thau",
            image:
              "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Đèn cây chao vải Vintage",
            priceVND: 1250000,
            dimensions: "Cao 1650 mm",
            material: "Thân gỗ tần bì, chao vải lanh",
            image:
              "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "plant",
        name: "Chậu bàng Singapore",
        category: "Cây xanh",
        priceVND: 450000,
        dimensions: "Cao 1400 mm gồm chậu",
        material: "Cây thật trồng đất vi sinh",
        image:
          "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=500",
        reason: "Mảng xanh lớn làm mềm ánh sáng cửa sổ và cân bằng vật liệu gỗ trong phòng.",
        x: 38,
        y: 38,
        options: [
          {
            name: "Chậu bàng Singapore",
            priceVND: 450000,
            dimensions: "Cao 1400 mm gồm chậu",
            material: "Cây thật trồng đất vi sinh",
            image:
              "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Chậu trầu bà lá xẻ",
            priceVND: 550000,
            dimensions: "Cao 1200 mm",
            material: "Monstera rễ ẩm, chậu sứ trắng",
            image:
              "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "rug",
        name: "Thảm sợi đay Kyoto",
        category: "Thảm sàn",
        priceVND: 1850000,
        dimensions: "Đường kính 1600 mm",
        material: "Sợi đay tự nhiên dệt tay",
        image:
          "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=500",
        reason: "Thảm tròn gom vùng tiếp khách thành một cụm rõ ràng, ấm chân và đỡ trống sàn.",
        x: 66,
        y: 64,
        options: [
          {
            name: "Thảm sợi đay Kyoto",
            priceVND: 1850000,
            dimensions: "Đường kính 1600 mm",
            material: "Sợi đay tự nhiên dệt tay",
            image:
              "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Thảm lông ngắn Silky",
            priceVND: 2200000,
            dimensions: "1600 x 2300 mm",
            material: "Sợi polyester chống bám bẩn",
            image:
              "https://images.unsplash.com/photo-1575631926831-92383e5661a5?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "curtains",
        name: "Rèm linen voan mỏng",
        category: "Rèm cửa",
        priceVND: 1549000,
        dimensions: "Rộng 2800 x cao 2600 mm",
        material: "Vải voan linen lọc nắng",
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=500",
        reason: "Lớp voan biến nắng gắt thành ánh sáng dịu, hợp phòng khách nhiều cửa sổ.",
        x: 22,
        y: 45,
        options: [
          {
            name: "Rèm linen voan mỏng",
            priceVND: 1549000,
            dimensions: "Rộng 2800 x cao 2600 mm",
            material: "Vải voan linen lọc nắng",
            image:
              "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Rèm cản sáng Bắc Âu",
            priceVND: 2600000,
            dimensions: "Rộng 3000 x cao 2650 mm",
            material: "Vải dệt 3 lớp chống tia UV",
            image:
              "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
    ],
  },
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    vietnameseName: "Hiện đại tối giản sắc sảo",
    sizeDesc: "5.0m x 4.0m x 2.8m",
    areaDesc: "20.0 m2",
    bgImage:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1400",
    items: [
      {
        id: "sofa",
        name: "Sofa Minimalist Milano",
        category: "Sofa",
        priceVND: 16800000,
        dimensions: "2400 x 950 x 700 mm",
        material: "Khung gỗ dầu đỏ, nệm nỉ tuyết",
        image:
          "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=500",
        reason: "Đường khối rõ, màu trung tính giúp không gian hiện đại hơn mà vẫn dễ sống.",
        x: 52,
        y: 53,
        options: [
          {
            name: "Sofa Minimalist Milano",
            priceVND: 16800000,
            dimensions: "2400 x 950 x 700 mm",
            material: "Khung gỗ dầu đỏ, nệm nỉ tuyết",
            image:
              "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=500",
          },
          {
            name: "Sofa da Napoli cao cấp",
            priceVND: 24500000,
            dimensions: "2400 x 950 x 700 mm",
            material: "Khung gỗ tự nhiên, da thuộc Italy",
            image:
              "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "table",
        name: "Bàn trà kính Nero",
        category: "Bàn trà",
        priceVND: 4200000,
        dimensions: "1000 x 1000 x 350 mm",
        material: "Mặt kính cường lực đen mờ",
        image:
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=500",
        reason: "Bề mặt phản sáng nhẹ giúp cụm sofa bớt nặng và tạo điểm nhấn sắc nét.",
        x: 44,
        y: 55,
        options: [
          {
            name: "Bàn trà kính Nero",
            priceVND: 4200000,
            dimensions: "1000 x 1000 x 350 mm",
            material: "Mặt kính cường lực đen mờ",
            image:
              "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "shelf",
        name: "Kệ module Linear",
        category: "Kệ",
        priceVND: 5200000,
        dimensions: "1600 x 360 x 720 mm",
        material: "Thép sơn tĩnh điện, veneer óc chó",
        image:
          "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=500",
        reason: "Kệ thấp kéo dài làm nền cho TV, giữ đồ gọn mà không che mảng tường.",
        x: 76,
        y: 46,
        options: [
          {
            name: "Kệ module Linear",
            priceVND: 5200000,
            dimensions: "1600 x 360 x 720 mm",
            material: "Thép sơn tĩnh điện, veneer óc chó",
            image:
              "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
    ],
  },
  {
    id: "indochine-retro",
    name: "Indochine Classic",
    vietnameseName: "Đông Dương hoài cổ bản địa",
    sizeDesc: "4.2m x 3.8m x 3.0m",
    areaDesc: "15.9 m2",
    bgImage:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1400",
    items: [
      {
        id: "chair",
        name: "Ghế bành mây Đông Dương",
        category: "Ghế",
        priceVND: 6400000,
        dimensions: "800 x 780 x 900 mm",
        material: "Khung gỗ lim, lưng tựa mây mắt cáo",
        image:
          "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=500",
        reason: "Mây đan thủ công tạo cảm giác thoáng, hợp nền gỗ và rèm sáng.",
        x: 52,
        y: 53,
        options: [
          {
            name: "Ghế bành mây Đông Dương",
            priceVND: 6400000,
            dimensions: "800 x 780 x 900 mm",
            material: "Khung gỗ lim, lưng tựa mây mắt cáo",
            image:
              "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "cabinet",
        name: "Tủ An Nam 6 ngăn",
        category: "Tủ",
        priceVND: 12500000,
        dimensions: "1200 x 450 x 850 mm",
        material: "Gỗ óc chó, tay nắm đồng giả cổ",
        image:
          "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=500",
        reason: "Khối tủ thấp thêm chiều sâu lưu trữ và làm điểm nhấn Đông Dương rõ hơn.",
        x: 76,
        y: 52,
        options: [
          {
            name: "Tủ An Nam 6 ngăn",
            priceVND: 12500000,
            dimensions: "1200 x 450 x 850 mm",
            material: "Gỗ óc chó, tay nắm đồng giả cổ",
            image:
              "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
      {
        id: "lamp",
        name: "Đèn bàn gốm Saigon",
        category: "Đèn",
        priceVND: 2100000,
        dimensions: "Cao 560 mm",
        material: "Gốm men ngà, chao vải linen",
        image:
          "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=500",
        reason: "Ánh đèn ấm tạo lớp sáng thấp, hợp chất gỗ sẫm và mây đan.",
        x: 35,
        y: 42,
        options: [
          {
            name: "Đèn bàn gốm Saigon",
            priceVND: 2100000,
            dimensions: "Cao 560 mm",
            material: "Gốm men ngà, chao vải linen",
            image:
              "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=500",
          },
        ],
      },
    ],
  },
];
