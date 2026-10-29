export type ShowroomStyleId = "japandi" | "indochine" | "modern";

export type ShowroomItem = {
  _id: string;
  productId: string | { _id: string; name: string; price: number; image?: string; status?: string };
  modelUrl: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
};

export type Showroom = {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  environmentModelUrl?: string;
  environmentModelPublicId?: string;
  status: string;
  items: ShowroomItem[];
  createdAt?: string;
  updatedAt?: string;
};
