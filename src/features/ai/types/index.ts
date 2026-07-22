export type HotspotOption = {
  name: string;
  priceVND: number;
  dimensions: string;
  material: string;
  image: string;
};

export type HotspotItem = HotspotOption & {
  id: string;
  category: string;
  reason: string;
  x: number;
  y: number;
  options: HotspotOption[];
};

export type RoomPreset = {
  id: string;
  name: string;
  vietnameseName: string;
  sizeDesc: string;
  areaDesc: string;
  bgImage: string;
  items: HotspotItem[];
};

export type SavedDesign = {
  date: string;
  name: string;
  presetName: string;
  total: number;
};

export type ViewMode = "2d" | "3d" | "layout";
