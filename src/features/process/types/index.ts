export type ProcessStep = {
  number: string;
  icon: "scan" | "recognize" | "replace" | "drag" | "cube";
  title: string;
  subTitle: string;
  description: string;
  details: string[];
  tip: string;
};
