export type DesignerObjectType =
  | "sofa"
  | "chair"
  | "table"
  | "bed"
  | "wardrobe"
  | "lamp"
  | "room";

export type DesignerObject = {
  id: string;
  name: string;
  type: DesignerObjectType;
  modelUrl?: string;
};
