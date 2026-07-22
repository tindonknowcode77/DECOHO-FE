import type { ProfileOption, UserProfile } from "../types";

export const profileUser: UserProfile = {
  address: "Số 10, phố Duy Tân, Cầu Giấy, Hà Nội",
  avatar: "sofa",
  email: "demo@decoho.vn",
  favoriteMaterials: ["wood", "linen"],
  joinedDate: "24/06/2026",
  name: "Gia chủ DECOHO",
  phone: "0987 654 321",
  preferredStyle: "japandi",
};

export const preferredStyles: ProfileOption[] = [
  {
    id: "japandi",
    label: "Japandi",
    description: "Nhật Bản kết hợp Bắc Âu, gọn và ấm.",
  },
  {
    id: "wabi-sabi",
    label: "Wabi-Sabi",
    description: "Mộc mạc, tự nhiên, trân trọng dấu vết thời gian.",
  },
  {
    id: "indochine",
    label: "Indochine",
    description: "Đông Dương truyền thống, sang và nhiều chất bản địa.",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Tối giản đương đại, ưu tiên khoảng thở.",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Hiện đại, tiện nghi, dễ ứng dụng.",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Sang trọng với vật liệu hoàn thiện cao cấp.",
  },
];

export const favoriteMaterials: ProfileOption[] = [
  { id: "wood", label: "Gỗ sồi và óc chó tự nhiên" },
  { id: "stone", label: "Đá cẩm thạch và Travertine" },
  { id: "terrazzo", label: "Đá mài Terrazzo" },
  { id: "rattan", label: "Mây tre đan thủ công" },
  { id: "linen", label: "Vải lanh và đũi dệt thô" },
  { id: "metal", label: "Kim loại PVD champagne" },
  { id: "glass", label: "Kính gợn sóng fluted" },
];

export const avatarOptions: ProfileOption[] = [
  { id: "sofa", label: "Sofa Cozy" },
  { id: "plant", label: "Mảng xanh" },
  { id: "lamp", label: "Ánh sáng" },
  { id: "vase", label: "Gốm thủ công" },
  { id: "art", label: "Tranh tối giản" },
  { id: "wood", label: "Gỗ mộc" },
];
