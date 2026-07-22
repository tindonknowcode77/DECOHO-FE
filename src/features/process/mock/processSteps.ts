import type { ProcessStep } from "../types";

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    icon: "scan",
    title: "Quét căn phòng",
    subTitle: "Chụp hoặc tải ảnh hiện trạng",
    description:
      "Người dùng chụp nhanh căn phòng bằng điện thoại hoặc tải ảnh có sẵn. DECOHO dùng ảnh này làm đầu vào để đọc mặt bằng, ánh sáng, tường, sàn và các vùng có thể đặt nội thất.",
    details: [
      "Hỗ trợ ảnh phòng khách, phòng ngủ, góc làm việc hoặc showroom nhỏ",
      "Gợi ý góc chụp rộng để thấy sàn, tường, cửa sổ và lối đi",
      "Lưu ảnh hiện trạng làm bản trước khi thay đổi nội thất",
    ],
    tip: "Chụp phòng đủ sáng và đứng ở góc phòng để AI nhận diện không gian chính xác hơn.",
  },
  {
    number: "02",
    icon: "recognize",
    title: "AI nhận diện nội thất",
    subTitle: "Đọc đồ dùng, bố cục và vật liệu",
    description:
      "AI phân tích ảnh để nhận diện các món đang có trong phòng như sofa, bàn, ghế, tủ, đèn, thảm và cây trang trí. Hệ thống cũng đọc khoảng trống, tỉ lệ màu và vật liệu để đề xuất phương án thay thế phù hợp.",
    details: [
      "Nhận diện nhóm nội thất chính và vị trí tương đối trong phòng",
      "Tách vùng sàn, tường, cửa sổ, ánh sáng và lối di chuyển",
      "Đánh dấu những món có thể giữ lại, thay mới hoặc bố trí lại",
    ],
    tip: "Ở bản demo hiện tại có thể dùng fake data, nhưng cấu trúc đã sẵn sàng để nối API AI thật ở backend.",
  },
  {
    number: "03",
    icon: "replace",
    title: "Thay nội thất",
    subTitle: "Đổi sản phẩm theo phong cách và ngân sách",
    description:
      "Sau khi AI hiểu căn phòng, người dùng chọn phong cách như Japandi, Indochine hoặc Modern. DECOHO đề xuất danh sách sản phẩm thay thế có giá, kích thước, chất liệu và trạng thái tồn kho rõ ràng.",
    details: [
      "Thay sofa, bàn trà, ghế, đèn, thảm, kệ và cây trang trí",
      "Lọc sản phẩm theo phong cách, kích thước phòng và ngân sách",
      "Click vào đồ trong phòng để xem thông tin sản phẩm tương ứng",
    ],
    tip: "Nên ưu tiên đúng kích thước trước, sau đó mới tinh chỉnh màu và chất liệu.",
  },
  {
    number: "04",
    icon: "drag",
    title: "Kéo thả đồ",
    subTitle: "Tự bố trí lại sản phẩm trong phòng",
    description:
      "Người dùng có thể kéo thả đồ nội thất trong không gian thiết kế, thử nhiều vị trí khác nhau và kiểm tra khoảng cách di chuyển. Đây là bước giúp biến gợi ý AI thành bố cục cá nhân hóa.",
    details: [
      "Kéo thả món đồ từ catalog vào phòng",
      "Di chuyển, xoay và đổi vị trí món đồ đang chọn",
      "Kiểm tra bố cục trước khi chốt danh sách mua sắm",
    ],
    tip: "Luồng kéo thả có thể mở rộng trực tiếp từ showroom 3D hiện tại bằng TransformControls của Three.js.",
  },
  {
    number: "05",
    icon: "cube",
    title: "Xem 3D",
    subTitle: "Quan sát phòng sau khi thay nội thất",
    description:
      "Người dùng xem lại căn phòng ở dạng 3D, xoay góc nhìn, zoom cận cảnh và bấm vào từng món đồ để xem thông tin sản phẩm. Bước này giúp kiểm tra cảm giác tổng thể trước khi mua hoặc lưu dự án.",
    details: [
      "Xem phòng 3D với ánh sáng, tường, sàn và nội thất đã chọn",
      "Bấm vào từng sản phẩm để xem SKU, giá, chất liệu, màu và tồn kho",
      "Đi tiếp sang catalog hoặc lưu dự án thiết kế",
    ],
    tip: "Trang showroom 3D hiện đã có phần click sản phẩm, fake catalog data và model nội thất dựng bằng Three.js.",
  },
];
