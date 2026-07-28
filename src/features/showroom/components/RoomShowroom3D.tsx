"use client";

import Link from "next/link";
import {
  Box,
  Check,
  ChevronRight,
  Info,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  ShoppingCart,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { initialCartItems } from "@/src/features/cart/mock/cartItems";
import { addCartItem } from "@/src/features/cart/services/cartStorage";
import type { ShowroomStyleId } from "../types";

type ShowroomItemId =
  | "accentChair"
  | "barIsland"
  | "coffeeTable"
  | "diningSet"
  | "lighting"
  | "mainSofa"
  | "pergolaSofa"
  | "planter";

type ShowroomItemInfo = {
  brand: string;
  category: string;
  description: string;
  dimensions: string;
  href: string;
  id: ShowroomItemId;
  image: string;
  material: string;
  name: string;
  priceVND: number;
  productId?: string;
  sku: string;
  stock: number;
  swatches: { color: string; name: string }[];
  zone: string;
};

type ShowroomPreset = {
  accent: number;
  accentLabel: string;
  cloth: number;
  clothAlt: number;
  description: string;
  floor: number;
  floorLine: number;
  label: string;
  metal: number;
  rug: number;
  stone: number;
  wood: number;
};

type SelectableRegistrar = (
  root: THREE.Object3D,
  itemId: ShowroomItemId,
) => void;

type SceneMaterials = {
  accent: THREE.MeshStandardMaterial;
  cloth: THREE.MeshStandardMaterial;
  clothAlt: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  floor: THREE.MeshStandardMaterial;
  floorLine: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  leaf: THREE.MeshStandardMaterial;
  leafLight: THREE.MeshStandardMaterial;
  led: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  pot: THREE.MeshStandardMaterial;
  rug: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  white: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
};

type AnimatedLeaf = {
  mesh: THREE.Mesh;
  phase: number;
  rotationZ: number;
};

const CAMERA_HOME = {
  position: new THREE.Vector3(15, 13, 17),
  target: new THREE.Vector3(0, 1.25, 0),
};

const showroomItems: Record<ShowroomItemId, ShowroomItemInfo> = {
  mainSofa: {
    brand: "Luxury Furniture",
    category: "Sofa",
    description:
      "Sofa thấp, đệm sâu và tỷ lệ rộng cho khu tiếp khách trung tâm của pavilion.",
    dimensions: "285 x 98 x 76 cm",
    href: "/products/1",
    id: "mainSofa",
    image: "/images/product-space/organic-calm.png",
    material: "Khung gỗ, nệm mousse nhiều lớp, vải linen chống bám bụi",
    name: "Sofa Nordic Lounge",
    priceVND: 25900000,
    productId: "1",
    sku: "DCH-SOF-001",
    stock: 15,
    swatches: [
      { color: "#d8d3c9", name: "Linen kem" },
      { color: "#898d89", name: "Xám khói" },
      { color: "#263b31", name: "Xanh rêu" },
    ],
    zone: "Central lounge",
  },
  accentChair: {
    brand: "Cozy Home",
    category: "Ghế",
    description:
      "Ghế thư giãn ôm lưng, bố trí vòng quanh bàn trà để tạo cụm trò chuyện.",
    dimensions: "82 x 86 x 78 cm",
    href: "/products/13",
    id: "accentChair",
    image: "/images/product-space/urban-warmth.png",
    material: "Khung thép sơn tĩnh điện, nệm bọc vải bouclé",
    name: "Ghế thư giãn Bouclé",
    priceVND: 4750000,
    productId: "13",
    sku: "DCH-CHR-013",
    stock: 30,
    swatches: [
      { color: "#c9c5bc", name: "Bouclé đá" },
      { color: "#777b78", name: "Xám graphite" },
    ],
    zone: "Central lounge",
  },
  coffeeTable: {
    brand: "Stone Living",
    category: "Bàn trà",
    description:
      "Cụm bàn đá bo tròn tạo tâm nhìn mềm giữa các khối ghế có đường nét mạnh.",
    dimensions: "120 x 72 x 40 cm",
    href: "/products/18",
    id: "coffeeTable",
    image: "/images/product-space/organic-calm.png",
    material: "Đá tự nhiên hoàn thiện mờ, chân thép sơn đen",
    name: "Bộ bàn trà đá Japandi",
    priceVND: 12500000,
    productId: "18",
    sku: "DCH-TBL-018",
    stock: 11,
    swatches: [
      { color: "#e5dfd5", name: "Travertine sáng" },
      { color: "#353936", name: "Đá graphite" },
    ],
    zone: "Central lounge",
  },
  diningSet: {
    brand: "DECOHO Contract",
    category: "Bàn ăn",
    description:
      "Bàn ăn sáu chỗ với mặt đá mỏng, phù hợp khu hospitality và sân vườn có mái.",
    dimensions: "220 x 96 x 75 cm",
    href: "/products",
    id: "diningSet",
    image: "/images/product-space/soft-evening.png",
    material: "Mặt đá ceramic, khung thép, ghế bọc vải ngoài trời",
    name: "Bộ bàn ăn Terrace 06",
    priceVND: 28900000,
    sku: "DCH-DIN-006",
    stock: 6,
    swatches: [
      { color: "#e8e1d6", name: "Đá ivory" },
      { color: "#343936", name: "Khung đen" },
    ],
    zone: "Dining terrace",
  },
  barIsland: {
    brand: "DECOHO Studio",
    category: "Quầy bar",
    description:
      "Đảo bar là điểm chuyển tiếp giữa khu bếp mở, bàn ăn và không gian tiếp khách.",
    dimensions: "320 x 92 x 105 cm",
    href: "/products",
    id: "barIsland",
    image: "/images/decoho-home-interior-v2.png",
    material: "Đá quartz, veneer sồi hun khói và khung kim loại",
    name: "Quầy bar Modular",
    priceVND: 42600000,
    sku: "DCH-BAR-320",
    stock: 3,
    swatches: [
      { color: "#252a27", name: "Graphite" },
      { color: "#c5b59d", name: "Sồi hun khói" },
    ],
    zone: "Open kitchen",
  },
  pergolaSofa: {
    brand: "DECOHO Outdoor",
    category: "Sofa ngoài trời",
    description:
      "Cụm sofa riêng dưới pergola, có mái lam và cây xanh bao quanh để tạo sự riêng tư.",
    dimensions: "245 x 92 x 74 cm",
    href: "/products/1",
    id: "pergolaSofa",
    image: "/images/product-space/organic-calm.png",
    material: "Khung nhôm, vải outdoor chống UV, đệm thoát nước",
    name: "Sofa Pergola Haven",
    priceVND: 31800000,
    productId: "1",
    sku: "DCH-OUT-245",
    stock: 8,
    swatches: [
      { color: "#d7d0c4", name: "Sand" },
      { color: "#777b75", name: "Smoke" },
    ],
    zone: "Garden pergola",
  },
  lighting: {
    brand: "Lumi Decor",
    category: "Đèn",
    description:
      "Cụm đèn phân tử ánh sáng ấm tạo điểm nhấn phía trên quầy bar và bàn ăn.",
    dimensions: "120 x 85 x 62 cm",
    href: "/products/16",
    id: "lighting",
    image: "/images/product-space/urban-warmth.png",
    material: "Thép sơn đen, chụp thủy tinh opal, LED 3000K",
    name: "Đèn chùm phân tử",
    priceVND: 7200000,
    productId: "16",
    sku: "DCH-LGT-016",
    stock: 14,
    swatches: [
      { color: "#202522", name: "Đen mờ" },
      { color: "#e4bd78", name: "Ánh sáng ấm" },
    ],
    zone: "Open kitchen",
  },
  planter: {
    brand: "Green Corner",
    category: "Cây trang trí",
    description:
      "Cụm cây nhiều tầng lá làm mềm cấu trúc thép và phân chia các khu chức năng.",
    dimensions: "Cao 140 - 220 cm",
    href: "/products",
    id: "planter",
    image: "/images/decoho-home-hero-v2.png",
    material: "Chậu composite, cây nhiệt đới và hệ tưới nhỏ giọt",
    name: "Cụm cây Tropical Layer",
    priceVND: 6800000,
    sku: "DCH-GRN-220",
    stock: 12,
    swatches: [
      { color: "#315641", name: "Xanh rừng" },
      { color: "#63805d", name: "Xanh non" },
    ],
    zone: "Landscape edge",
  },
};

const showroomPresets: Record<ShowroomStyleId, ShowroomPreset> = {
  japandi: {
    accent: 0xc59a58,
    accentLabel: "Garden pavilion",
    cloth: 0xb8b7b0,
    clothAlt: 0x777a75,
    description: "Đá sáng, kim loại đen, vải xám và cây nhiệt đới.",
    floor: 0xd7d1c6,
    floorLine: 0xb8b0a4,
    label: "Japandi",
    metal: 0x202522,
    rug: 0x8f8c82,
    stone: 0xe6e0d6,
    wood: 0x967759,
  },
  indochine: {
    accent: 0xc48a43,
    accentLabel: "Tropical lounge",
    cloth: 0xb28f73,
    clothAlt: 0x66584b,
    description: "Gỗ nâu, đồng ấm, xanh đậm và vật liệu thủ công.",
    floor: 0xc8b99f,
    floorLine: 0x9f8c73,
    label: "Indochine",
    metal: 0x282821,
    rug: 0x88755e,
    stone: 0xd8c7aa,
    wood: 0x75513b,
  },
  modern: {
    accent: 0xe0a65c,
    accentLabel: "Urban gallery",
    cloth: 0xa9afb0,
    clothAlt: 0x555e5e,
    description: "Bê tông sáng, graphite và ánh đèn tuyến tính.",
    floor: 0xc5c7c3,
    floorLine: 0x9da19d,
    label: "Modern",
    metal: 0x171c1d,
    rug: 0x777d7b,
    stone: 0xd9d9d4,
    wood: 0x6f6255,
  },
};

function material(color: number, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function createMaterials(preset: ShowroomPreset): SceneMaterials {
  return {
    accent: material(preset.accent, 0.56, 0.1),
    cloth: material(preset.cloth, 0.92),
    clothAlt: material(preset.clothAlt, 0.9),
    dark: material(0x343936, 0.82),
    floor: material(preset.floor, 0.72),
    floorLine: material(preset.floorLine, 0.86),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xaeb8b4,
      metalness: 0,
      opacity: 0.18,
      roughness: 0.14,
      side: THREE.DoubleSide,
      transparent: true,
      transmission: 0.45,
    }),
    leaf: material(0x315641, 0.9),
    leafLight: material(0x63805d, 0.88),
    led: new THREE.MeshStandardMaterial({
      color: 0xf2c57f,
      emissive: 0xe6a84d,
      emissiveIntensity: 2.2,
      roughness: 0.42,
    }),
    metal: material(preset.metal, 0.36, 0.62),
    pot: material(0x454b47, 0.74, 0.08),
    rug: material(preset.rug, 0.98),
    stone: material(preset.stone, 0.58, 0.04),
    white: material(0xf2eee7, 0.82),
    wood: material(preset.wood, 0.68),
  };
}

function addBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  meshMaterial: THREE.Material,
  options: {
    castShadow?: boolean;
    receiveShadow?: boolean;
    rotation?: [number, number, number];
  } = {},
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), meshMaterial);
  mesh.position.set(...position);
  mesh.rotation.set(...(options.rotation ?? [0, 0, 0]));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);
  return mesh;
}

function addRoundedBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  meshMaterial: THREE.Material,
  options: {
    castShadow?: boolean;
    radius?: number;
    receiveShadow?: boolean;
    rotation?: [number, number, number];
  } = {},
) {
  const radius = Math.min(options.radius ?? 0.1, Math.min(...size) * 0.45);
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(size[0], size[1], size[2], 4, radius),
    meshMaterial,
  );
  mesh.position.set(...position);
  mesh.rotation.set(...(options.rotation ?? [0, 0, 0]));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);
  return mesh;
}

function addCylinder(
  parent: THREE.Object3D,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  position: [number, number, number],
  meshMaterial: THREE.Material,
  options: {
    castShadow?: boolean;
    radialSegments?: number;
    receiveShadow?: boolean;
    rotation?: [number, number, number];
  } = {},
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      options.radialSegments ?? 28,
    ),
    meshMaterial,
  );
  mesh.position.set(...position);
  mesh.rotation.set(...(options.rotation ?? [0, 0, 0]));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);
  return mesh;
}

function createSofa(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
  rotationY: number,
  width = 3,
) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);

  addRoundedBox(group, [width, 0.38, 1.02], [0, 0.38, 0], materials.dark, {
    radius: 0.14,
  });
  addRoundedBox(
    group,
    [width - 0.22, 0.24, 0.82],
    [0, 0.68, 0.04],
    materials.cloth,
    { radius: 0.12 },
  );
  addRoundedBox(
    group,
    [width - 0.14, 0.82, 0.24],
    [0, 0.92, -0.45],
    materials.clothAlt,
    { radius: 0.1, rotation: [-0.09, 0, 0] },
  );
  addRoundedBox(
    group,
    [0.25, 0.66, 1.03],
    [-width / 2 - 0.02, 0.66, 0],
    materials.clothAlt,
    { radius: 0.1 },
  );
  addRoundedBox(
    group,
    [0.25, 0.66, 1.03],
    [width / 2 + 0.02, 0.66, 0],
    materials.clothAlt,
    { radius: 0.1 },
  );

  const cushionCount = Math.max(2, Math.round(width / 1.05));
  for (let index = 0; index < cushionCount; index += 1) {
    const x = (index - (cushionCount - 1) / 2) * (width / cushionCount);
    addRoundedBox(
      group,
      [width / cushionCount - 0.1, 0.52, 0.16],
      [x, 1.02, -0.29],
      index === 1 ? materials.white : materials.cloth,
      { radius: 0.07, rotation: [-0.12, 0, 0] },
    );
  }

  addRoundedBox(group, [0.48, 0.42, 0.13], [-0.58, 1.04, -0.11], materials.accent, {
    radius: 0.08,
    rotation: [-0.08, 0.08, -0.05],
  });

  for (const x of [-width / 2 + 0.28, width / 2 - 0.28]) {
    for (const z of [-0.34, 0.34]) {
      addCylinder(group, 0.035, 0.045, 0.3, [x, 0.15, z], materials.metal, {
        radialSegments: 12,
      });
    }
  }

  return group;
}

function createArmchair(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
  rotationY: number,
) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);

  addRoundedBox(group, [1.12, 0.3, 0.94], [0, 0.45, 0], materials.dark, {
    radius: 0.14,
  });
  addRoundedBox(group, [0.94, 0.2, 0.78], [0, 0.66, 0.04], materials.cloth, {
    radius: 0.12,
  });
  addRoundedBox(group, [1.02, 0.74, 0.22], [0, 0.9, -0.4], materials.clothAlt, {
    radius: 0.1,
    rotation: [-0.12, 0, 0],
  });
  addRoundedBox(group, [0.19, 0.57, 0.92], [-0.62, 0.62, 0], materials.clothAlt, {
    radius: 0.09,
  });
  addRoundedBox(group, [0.19, 0.57, 0.92], [0.62, 0.62, 0], materials.clothAlt, {
    radius: 0.09,
  });

  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.3, 0.3]) {
      addCylinder(group, 0.03, 0.045, 0.38, [x, 0.19, z], materials.metal, {
        radialSegments: 10,
      });
    }
  }

  return group;
}

function createCoffeeTable(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);

  const base = addCylinder(group, 0.55, 0.72, 0.3, [0, 0.2, 0], materials.metal, {
    radialSegments: 40,
  });
  base.scale.x = 1.35;
  const top = addCylinder(group, 0.76, 0.76, 0.1, [0, 0.48, 0], materials.stone, {
    radialSegments: 48,
  });
  top.scale.x = 1.38;

  const sideTop = addCylinder(
    group,
    0.42,
    0.42,
    0.08,
    [0.92, 0.61, -0.22],
    materials.wood,
    { radialSegments: 40 },
  );
  sideTop.scale.x = 1.15;
  addCylinder(group, 0.16, 0.29, 0.52, [0.92, 0.3, -0.22], materials.metal, {
    radialSegments: 32,
  });

  addCylinder(group, 0.13, 0.17, 0.16, [-0.28, 0.62, 0], materials.pot);
  addRoundedBox(group, [0.42, 0.04, 0.28], [0.32, 0.56, 0.16], materials.accent, {
    radius: 0.02,
  });
  addRoundedBox(group, [0.38, 0.035, 0.26], [0.32, 0.61, 0.16], materials.white, {
    radius: 0.02,
  });
  return group;
}

function createDiningSet(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
  rotationY: number,
) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);

  addRoundedBox(group, [3.5, 0.14, 1.22], [0, 0.84, 0], materials.stone, {
    radius: 0.08,
  });
  for (const x of [-1.35, 1.35]) {
    addBox(group, [0.12, 0.76, 0.92], [x, 0.43, 0], materials.metal);
  }

  const chairPositions: [number, number, number, number][] = [
    [-1.15, 0, -1.02, 0],
    [0, 0, -1.02, 0],
    [1.15, 0, -1.02, 0],
    [-1.15, 0, 1.02, Math.PI],
    [0, 0, 1.02, Math.PI],
    [1.15, 0, 1.02, Math.PI],
  ];

  for (const [x, y, z, rotation] of chairPositions) {
    const chair = new THREE.Group();
    chair.position.set(x, y, z);
    chair.rotation.y = rotation;
    group.add(chair);
    addRoundedBox(chair, [0.62, 0.14, 0.58], [0, 0.52, 0], materials.cloth, {
      radius: 0.08,
    });
    addRoundedBox(chair, [0.66, 0.68, 0.12], [0, 0.82, -0.27], materials.clothAlt, {
      radius: 0.07,
      rotation: [-0.08, 0, 0],
    });
    for (const legX of [-0.23, 0.23]) {
      for (const legZ of [-0.19, 0.19]) {
        addCylinder(chair, 0.022, 0.03, 0.49, [legX, 0.25, legZ], materials.metal, {
          radialSegments: 8,
        });
      }
    }
  }

  for (const x of [-0.9, 0, 0.9]) {
    addCylinder(group, 0.13, 0.18, 0.035, [x, 0.94, 0], materials.white, {
      radialSegments: 28,
    });
    addCylinder(group, 0.035, 0.05, 0.12, [x + 0.22, 0.98, 0.12], materials.glass, {
      radialSegments: 16,
    });
  }

  return group;
}

function createBar(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);

  addRoundedBox(group, [3.85, 0.92, 0.92], [0, 0.72, 0], materials.metal, {
    radius: 0.08,
  });
  addRoundedBox(group, [4.12, 0.15, 1.08], [0, 1.24, 0], materials.stone, {
    radius: 0.06,
  });
  addBox(group, [3.15, 0.04, 0.035], [0, 0.61, 0.48], materials.led, {
    castShadow: false,
  });

  for (let index = 0; index < 4; index += 1) {
    const x = -1.42 + index * 0.95;
    addCylinder(group, 0.25, 0.25, 0.12, [x, 0.8, 1.02], materials.cloth, {
      radialSegments: 28,
    });
    addCylinder(group, 0.035, 0.045, 0.76, [x, 0.39, 1.02], materials.metal, {
      radialSegments: 10,
    });
    addCylinder(group, 0.22, 0.28, 0.06, [x, 0.04, 1.02], materials.metal, {
      radialSegments: 24,
    });
  }

  addCylinder(group, 0.18, 0.22, 0.24, [-1.1, 1.44, -0.08], materials.pot);
  addRoundedBox(group, [0.7, 0.035, 0.42], [0.65, 1.35, 0], materials.wood, {
    radius: 0.02,
  });
  return group;
}

function createMolecularLight(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);

  addCylinder(group, 0.025, 0.025, 1.5, [0, 0.74, 0], materials.metal, {
    radialSegments: 10,
  });

  const arms: [number, number, number][] = [
    [-0.85, -0.12, 0.1],
    [0.82, 0.02, -0.2],
    [-0.45, -0.42, -0.68],
    [0.48, -0.32, 0.68],
  ];

  for (const [x, y, z] of arms) {
    const length = Math.sqrt(x * x + z * z);
    const arm = addCylinder(
      group,
      0.022,
      0.022,
      length,
      [x / 2, y, z / 2],
      materials.metal,
      { radialSegments: 8 },
    );
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = Math.atan2(z, x);
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 20, 14),
      materials.led,
    );
    globe.position.set(x, y, z);
    globe.castShadow = false;
    group.add(globe);
    const light = new THREE.PointLight(0xffd99a, 0.65, 4, 1.8);
    light.position.set(x, y, z);
    group.add(light);
  }

  return group;
}

function createTree(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
  scale: number,
  animatedLeaves: AnimatedLeaf[],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.scale.setScalar(scale);
  parent.add(group);

  addCylinder(group, 0.12, 0.2, 1.9, [0, 1.05, 0], materials.wood, {
    radialSegments: 12,
  });
  addCylinder(group, 0.48, 0.58, 0.48, [0, 0.28, 0], materials.pot, {
    radialSegments: 32,
  });

  const leafPositions: [number, number, number, number][] = [
    [0, 2.2, 0, 0],
    [-0.48, 2.02, 0.08, 0.8],
    [0.45, 2.08, -0.12, 1.6],
    [-0.24, 2.47, -0.2, 2.4],
    [0.28, 2.54, 0.16, 3.2],
    [0.05, 2.84, 0, 4],
  ];

  for (const [x, y, z, phase] of leafPositions) {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.58, 1),
      phase % 1.6 === 0 ? materials.leafLight : materials.leaf,
    );
    mesh.position.set(x, y, z);
    mesh.scale.set(1.05, 0.78, 0.92);
    mesh.rotation.z = phase * 0.08;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    animatedLeaves.push({
      mesh,
      phase,
      rotationZ: mesh.rotation.z,
    });
  }

  return group;
}

function createPlanterStrip(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
  rotationY: number,
  length: number,
  animatedLeaves: AnimatedLeaf[],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);

  addRoundedBox(group, [length, 0.54, 0.62], [0, 0.28, 0], materials.pot, {
    radius: 0.1,
  });
  addRoundedBox(group, [length - 0.18, 0.08, 0.5], [0, 0.56, 0], materials.dark, {
    radius: 0.05,
  });

  const count = Math.max(3, Math.round(length / 0.72));
  for (let index = 0; index < count; index += 1) {
    const x = -length / 2 + 0.36 + index * ((length - 0.72) / Math.max(count - 1, 1));
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 8),
      index % 2 === 0 ? materials.leaf : materials.leafLight,
    );
    leaf.scale.set(0.52, 1.2 + (index % 3) * 0.18, 0.34);
    leaf.position.set(x, 0.95 + (index % 2) * 0.12, 0);
    leaf.rotation.z = index % 2 === 0 ? -0.26 : 0.26;
    leaf.castShadow = true;
    group.add(leaf);
    animatedLeaves.push({
      mesh: leaf,
      phase: index * 0.7,
      rotationZ: leaf.rotation.z,
    });
  }
  return group;
}

function createRailing(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  axis: "x" | "z",
  length: number,
  position: [number, number, number],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);

  const postCount = Math.floor(length / 1.45) + 1;
  for (let index = 0; index < postCount; index += 1) {
    const offset = -length / 2 + (index / (postCount - 1)) * length;
    addBox(
      group,
      [0.055, 1.0, 0.055],
      axis === "x" ? [offset, 0.5, 0] : [0, 0.5, offset],
      materials.metal,
    );
  }

  for (const height of [0.42, 0.98]) {
    addBox(
      group,
      axis === "x" ? [length, 0.055, 0.055] : [0.055, 0.055, length],
      [0, height, 0],
      materials.metal,
    );
  }
}

function createPergola(
  parent: THREE.Object3D,
  materials: SceneMaterials,
  position: [number, number, number],
  width: number,
  depth: number,
  height: number,
) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);

  for (const x of [-width / 2, width / 2]) {
    for (const z of [-depth / 2, depth / 2]) {
      addBox(group, [0.1, height, 0.1], [x, height / 2, z], materials.metal);
    }
  }

  addBox(group, [width + 0.16, 0.13, 0.13], [0, height, -depth / 2], materials.metal);
  addBox(group, [width + 0.16, 0.13, 0.13], [0, height, depth / 2], materials.metal);
  addBox(group, [0.13, 0.13, depth + 0.16], [-width / 2, height, 0], materials.metal);
  addBox(group, [0.13, 0.13, depth + 0.16], [width / 2, height, 0], materials.metal);

  for (let index = 0; index < 12; index += 1) {
    const x = -width / 2 + 0.2 + index * ((width - 0.4) / 11);
    addBox(group, [0.055, 0.07, depth], [x, height - 0.03, 0], materials.metal, {
      castShadow: false,
    });
  }
  return group;
}

function createBackKitchen(
  parent: THREE.Object3D,
  materials: SceneMaterials,
) {
  const group = new THREE.Group();
  group.position.set(4.65, 0.35, -4.55);
  parent.add(group);

  addRoundedBox(group, [3.2, 3.45, 0.62], [0, 1.72, 0], materials.metal, {
    radius: 0.07,
  });
  addRoundedBox(group, [2.7, 1.22, 0.16], [0, 2.12, 0.36], materials.wood, {
    radius: 0.03,
  });
  addRoundedBox(group, [2.55, 0.08, 0.36], [0, 1.48, 0.43], materials.stone, {
    radius: 0.03,
  });

  for (const x of [-0.92, -0.3, 0.32, 0.94]) {
    addCylinder(group, 0.07, 0.09, 0.36, [x, 1.72, 0.52], materials.glass, {
      radialSegments: 12,
    });
  }
  for (let index = 0; index < 8; index += 1) {
    addBox(
      group,
      [0.1, 0.42 + (index % 3) * 0.1, 0.12],
      [-1.05 + index * 0.3, 2.15, 0.47],
      index % 2 === 0 ? materials.accent : materials.white,
    );
  }

  addBox(group, [2.6, 0.035, 0.035], [0, 1.55, 0.58], materials.led, {
    castShadow: false,
  });
  return group;
}

function buildIsometricShowroom(
  scene: THREE.Scene,
  preset: ShowroomPreset,
  registerSelectable: SelectableRegistrar,
) {
  const materials = createMaterials(preset);
  const animatedLeaves: AnimatedLeaf[] = [];
  const animatedPendants: THREE.Group[] = [];
  const pavilion = new THREE.Group();
  scene.add(pavilion);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(52, 52),
    new THREE.MeshStandardMaterial({
      color: 0xb9bcba,
      roughness: 1,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.62;
  ground.receiveShadow = true;
  scene.add(ground);

  addRoundedBox(pavilion, [15.2, 0.62, 11.8], [0, -0.2, 0], materials.dark, {
    radius: 0.42,
  });
  addRoundedBox(pavilion, [14.72, 0.2, 11.32], [0, 0.22, 0], materials.floor, {
    radius: 0.3,
    receiveShadow: true,
  });

  for (let index = -6; index <= 6; index += 1) {
    addBox(
      pavilion,
      [0.018, 0.018, 11.05],
      [index * 1.05, 0.33, 0],
      materials.floorLine,
      { castShadow: false },
    );
  }
  for (let index = -5; index <= 5; index += 1) {
    addBox(
      pavilion,
      [14.45, 0.018, 0.018],
      [0, 0.34, index * 1.0],
      materials.floorLine,
      { castShadow: false },
    );
  }

  const edgeLights: {
    position: [number, number, number];
    size: [number, number, number];
  }[] = [
    { position: [0, 0.05, 5.65], size: [13.5, 0.055, 0.055] },
    { position: [0, 0.05, -5.65], size: [13.5, 0.055, 0.055] },
    { position: [-7.32, 0.05, 0], size: [0.055, 0.055, 10.4] },
    { position: [7.32, 0.05, 0], size: [0.055, 0.055, 10.4] },
  ];

  for (const { position, size } of edgeLights) {
    addBox(pavilion, size, position, materials.led, { castShadow: false });
  }

  createRailing(pavilion, materials, "x", 4.8, [-4.6, 0.35, 5.38]);
  createRailing(pavilion, materials, "x", 4.2, [4.95, 0.35, 5.38]);
  createRailing(pavilion, materials, "z", 4.7, [7.15, 0.35, 2.85]);
  createRailing(pavilion, materials, "z", 3.9, [-7.15, 0.35, 3.2]);

  createPergola(pavilion, materials, [-4.8, 0.34, -1.1], 4.2, 5.0, 3.55);
  createPergola(pavilion, materials, [1.1, 0.34, -3.45], 7.0, 3.7, 4.55);

  addBox(pavilion, [6.8, 0.07, 3.5], [1.1, 4.87, -3.45], materials.glass, {
    castShadow: false,
  });
  for (let index = 0; index < 17; index += 1) {
    const x = -2.15 + index * 0.4;
    addBox(
      pavilion,
      [0.085, 0.08, 3.45],
      [x, 4.92, -3.45],
      materials.metal,
      { castShadow: false },
    );
  }

  for (let index = 0; index < 20; index += 1) {
    const x = -2.2 + index * 0.24;
    addBox(
      pavilion,
      [0.055, 3.55, 0.055],
      [x, 2.12, -5.18],
      materials.metal,
    );
  }

  const centralRug = addRoundedBox(
    pavilion,
    [6.3, 0.06, 4.4],
    [0, 0.39, 2.5],
    materials.rug,
    { castShadow: false, radius: 0.18, receiveShadow: true },
  );
  centralRug.rotation.y = -0.03;
  const mainSofa = createSofa(pavilion, materials, [0, 0.34, 1.05], 0, 3.25);
  registerSelectable(mainSofa, "mainSofa");

  const coffeeTable = createCoffeeTable(pavilion, materials, [0, 0.34, 3.18]);
  registerSelectable(coffeeTable, "coffeeTable");

  const leftChair = createArmchair(pavilion, materials, [-2.45, 0.34, 3.1], Math.PI / 2);
  registerSelectable(leftChair, "accentChair");
  createArmchair(pavilion, materials, [2.45, 0.34, 3.1], -Math.PI / 2);
  createArmchair(pavilion, materials, [-1.55, 0.34, 4.45], Math.PI);
  createArmchair(pavilion, materials, [1.55, 0.34, 4.45], Math.PI);

  const pergolaRug = addRoundedBox(
    pavilion,
    [3.5, 0.05, 3.6],
    [-4.72, 0.38, -0.7],
    materials.rug,
    { castShadow: false, radius: 0.16 },
  );
  pergolaRug.rotation.y = 0.03;
  const pergolaSofa = createSofa(
    pavilion,
    materials,
    [-5.68, 0.34, -1.05],
    Math.PI / 2,
    2.45,
  );
  registerSelectable(pergolaSofa, "pergolaSofa");
  createArmchair(pavilion, materials, [-4.02, 0.34, -2.0], -0.2);
  addCylinder(pavilion, 0.52, 0.52, 0.08, [-4.35, 0.78, 0.2], materials.stone, {
    radialSegments: 40,
  });
  addCylinder(pavilion, 0.18, 0.32, 0.44, [-4.35, 0.56, 0.2], materials.metal, {
    radialSegments: 32,
  });

  const diningSet = createDiningSet(
    pavilion,
    materials,
    [4.65, 0.34, 0.65],
    Math.PI / 2,
  );
  registerSelectable(diningSet, "diningSet");

  const barIsland = createBar(pavilion, materials, [0.6, 0.34, -2.7]);
  registerSelectable(barIsland, "barIsland");
  createBackKitchen(pavilion, materials);

  const molecularLight = createMolecularLight(
    pavilion,
    materials,
    [0.55, 3.86, -2.65],
  );
  registerSelectable(molecularLight, "lighting");
  animatedPendants.push(molecularLight);

  const floorLamp = new THREE.Group();
  floorLamp.position.set(2.7, 0.34, 4.35);
  pavilion.add(floorLamp);
  addCylinder(floorLamp, 0.22, 0.3, 0.08, [0, 0.04, 0], materials.metal);
  addCylinder(floorLamp, 0.025, 0.025, 1.75, [0, 0.9, 0], materials.metal, {
    radialSegments: 10,
  });
  addCylinder(floorLamp, 0.28, 0.42, 0.62, [0, 1.84, 0], materials.led, {
    radialSegments: 32,
  });
  const floorGlow = new THREE.PointLight(0xffd49a, 1.4, 4.4, 1.8);
  floorGlow.position.set(0, 1.58, 0);
  floorLamp.add(floorGlow);

  const planter = createTree(
    pavilion,
    materials,
    [6.15, 0.34, -4.35],
    1.1,
    animatedLeaves,
  );
  registerSelectable(planter, "planter");
  createTree(pavilion, materials, [-6.2, 0.34, -4.4], 0.92, animatedLeaves);
  createTree(pavilion, materials, [-6.3, 0.34, 4.25], 0.72, animatedLeaves);
  createTree(pavilion, materials, [6.15, 0.34, 4.25], 0.7, animatedLeaves);

  createPlanterStrip(
    pavilion,
    materials,
    [-4.3, 0.34, 5.0],
    0,
    3.2,
    animatedLeaves,
  );
  createPlanterStrip(
    pavilion,
    materials,
    [4.55, 0.34, 5.0],
    0,
    2.8,
    animatedLeaves,
  );
  createPlanterStrip(
    pavilion,
    materials,
    [-6.72, 0.34, 1.3],
    Math.PI / 2,
    2.6,
    animatedLeaves,
  );
  createPlanterStrip(
    pavilion,
    materials,
    [6.7, 0.34, -1.8],
    Math.PI / 2,
    2.6,
    animatedLeaves,
  );

  const warmLights: [number, number, number][] = [
    [-4.8, 3.1, -1.2],
    [-2.0, 3.9, -3.4],
    [3.5, 3.9, -3.4],
    [5.3, 2.7, 0.4],
  ];
  for (const [x, y, z] of warmLights) {
    const light = new THREE.PointLight(0xffd39a, 0.72, 5.2, 1.9);
    light.position.set(x, y, z);
    pavilion.add(light);
  }

  return {
    animatedLeaves,
    animatedPendants,
    ledMaterial: materials.led,
  };
}

function findShowroomItemId(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object;
  while (current) {
    const itemId = current.userData.showroomItemId;
    if (typeof itemId === "string" && itemId in showroomItems) {
      return itemId as ShowroomItemId;
    }
    current = current.parent;
  }
  return null;
}

function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      if (Array.isArray(object.material)) {
        object.material.forEach((entry) => materials.add(entry));
      } else {
        materials.add(object.material);
      }
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((entry) => entry.dispose());
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export default function RoomShowroom3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const autoRotateRef = useRef(true);
  const selectedItemRef = useRef<ShowroomItemId | null>(null);
  const addedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeStyle, setActiveStyle] = useState<ShowroomStyleId>("japandi");
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [selectedItemId, setSelectedItemId] =
    useState<ShowroomItemId | null>(null);
  const [addedItemId, setAddedItemId] = useState<ShowroomItemId | null>(null);

  const activePreset = showroomPresets[activeStyle];
  const selectedItem = selectedItemId
    ? showroomItems[selectedItemId]
    : null;

  const selectShowroomItem = useCallback(
    (itemId: ShowroomItemId | null) => {
      selectedItemRef.current = itemId;
      setSelectedItemId(itemId);
    },
    [],
  );

  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    camera.position.copy(CAMERA_HOME.position);
    camera.zoom =
      typeof camera.userData.homeZoom === "number"
        ? camera.userData.homeZoom
        : 1;
    camera.updateProjectionMatrix();
    controls.target.copy(CAMERA_HOME.target);
    controls.update();
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((current) => {
      const next = !current;
      autoRotateRef.current = next;
      if (controlsRef.current) controlsRef.current.autoRotate = next;
      return next;
    });
  }, []);

  function changeStyle(style: ShowroomStyleId) {
    setIsSceneReady(false);
    setActiveStyle(style);
  }

  function addSelectedItemToCart() {
    if (!selectedItem) return;

    addCartItem(
      {
        category: selectedItem.category,
        dimensions: selectedItem.dimensions,
        id: selectedItem.productId
          ? `catalog-${selectedItem.productId}`
          : `showroom-${selectedItem.id}`,
        image: selectedItem.image,
        material: selectedItem.material,
        name: selectedItem.name,
        priceVND: selectedItem.priceVND,
        productHref: selectedItem.href,
        quantity: 1,
        source: "catalog",
        stock: selectedItem.stock,
        style: activePreset.label,
      },
      initialCartItems,
    );
    setAddedItemId(selectedItem.id);

    if (addedResetTimer.current) clearTimeout(addedResetTimer.current);
    addedResetTimer.current = setTimeout(() => setAddedItemId(null), 2200);
  }

  useEffect(
    () => () => {
      if (addedResetTimer.current) clearTimeout(addedResetTimer.current);
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mountNode = container;
    const scene = new THREE.Scene();
    const pointer = new THREE.Vector2();
    const pointerStart = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const selectableMeshes: THREE.Object3D[] = [];
    const selectableRoots = new Map<ShowroomItemId, THREE.Object3D>();
    scene.background = new THREE.Color(0xb9bcba);
    scene.fog = new THREE.Fog(0xb9bcba, 27, 44);

    const width = Math.max(mountNode.clientWidth, 320);
    const height = Math.max(mountNode.clientHeight, 560);
    const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
    camera.position.copy(CAMERA_HOME.position);
    camera.lookAt(CAMERA_HOME.target);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "block h-full w-full";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute(
      "aria-label",
      "Showroom nội thất isometric 3D DECOHO",
    );
    renderer.domElement.setAttribute("data-testid", "showroom-canvas");
    mountNode.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.24;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = 1.28;
    controls.minAzimuthAngle = -1.2;
    controls.maxAzimuthAngle = 1.2;
    controls.minZoom = 0.72;
    controls.maxZoom = 2.2;
    controls.target.copy(CAMERA_HOME.target);
    controls.update();
    controlsRef.current = controls;

    const hemisphere = new THREE.HemisphereLight(0xf8f2e9, 0x4d5650, 1.6);
    scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xfff7e9, 3.4);
    sun.position.set(-9, 16, 11);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 45;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    sun.shadow.bias = -0.00035;
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0xcfe1d7, 1.1);
    rim.position.set(10, 8, -10);
    scene.add(rim);

    function registerSelectable(
      root: THREE.Object3D,
      itemId: ShowroomItemId,
    ) {
      selectableRoots.set(itemId, root);
      root.userData.showroomItemId = itemId;
      root.traverse((object) => {
        object.userData.showroomItemId = itemId;
        if (object instanceof THREE.Mesh) selectableMeshes.push(object);
      });
    }

    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xf2bd69,
      depthTest: false,
      opacity: 0.96,
      transparent: true,
    });
    const selectionMarker = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.035, 12, 72),
      markerMaterial,
    );
    selectionMarker.rotation.x = Math.PI / 2;
    selectionMarker.renderOrder = 50;
    selectionMarker.visible = false;
    scene.add(selectionMarker);

    function focusSelection(itemId: ShowroomItemId | null) {
      if (!itemId) {
        selectionMarker.visible = false;
        return;
      }

      const root = selectableRoots.get(itemId);
      if (!root) {
        selectionMarker.visible = false;
        return;
      }

      const bounds = new THREE.Box3().setFromObject(root);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const markerScale = Math.max(size.x, size.z, 0.9) * 0.58;
      selectionMarker.position.set(center.x, 0.45, center.z);
      selectionMarker.scale.set(markerScale, markerScale, markerScale);
      selectionMarker.visible = true;
    }

    function intersectedItem(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObjects(selectableMeshes, true)[0];
      return intersection ? findShowroomItemId(intersection.object) : null;
    }

    function handlePointerDown(event: PointerEvent) {
      pointerStart.set(event.clientX, event.clientY);
      renderer.domElement.style.cursor = "grabbing";
    }

    function handlePointerMove(event: PointerEvent) {
      renderer.domElement.style.cursor = intersectedItem(event)
        ? "pointer"
        : "grab";
    }

    function handlePointerUp(event: PointerEvent) {
      const movement = pointerStart.distanceTo(
        new THREE.Vector2(event.clientX, event.clientY),
      );
      renderer.domElement.style.cursor = "grab";
      if (movement > 7) return;

      const itemId = intersectedItem(event);
      autoRotateRef.current = false;
      controls.autoRotate = false;
      setIsAutoRotating(false);
      selectShowroomItem(itemId);
      focusSelection(itemId);
    }

    const { animatedLeaves, animatedPendants, ledMaterial } =
      buildIsometricShowroom(scene, activePreset, registerSelectable);
    focusSelection(selectedItemRef.current);

    function resize() {
      const nextWidth = Math.max(mountNode.clientWidth, 320);
      const nextHeight = Math.max(mountNode.clientHeight, 560);
      const aspect = nextWidth / nextHeight;
      const viewWidth = aspect < 0.8 ? 16.8 : 19.5;
      const viewHeight = viewWidth / aspect;
      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.zoom = aspect < 0.8 ? 1.08 : 1;
      camera.userData.homeZoom = camera.zoom;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mountNode);

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const clock = new THREE.Clock();
    let frameId = 0;
    let didReportReady = false;

    function animate() {
      const elapsed = clock.getElapsedTime();
      for (const leaf of animatedLeaves) {
        leaf.mesh.rotation.z =
          leaf.rotationZ + Math.sin(elapsed * 0.62 + leaf.phase) * 0.025;
      }
      for (let index = 0; index < animatedPendants.length; index += 1) {
        animatedPendants[index].rotation.y =
          Math.sin(elapsed * 0.32 + index) * 0.025;
      }
      ledMaterial.emissiveIntensity = 2.05 + Math.sin(elapsed * 0.55) * 0.12;
      markerMaterial.opacity = 0.76 + Math.sin(elapsed * 2.2) * 0.2;
      controls.autoRotate = autoRotateRef.current;
      controls.update();
      renderer.render(scene, camera);

      if (!didReportReady) {
        didReportReady = true;
        window.requestAnimationFrame(() => setIsSceneReady(true));
      }

      frameId = window.requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [activePreset, selectShowroomItem]);

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-[#b9bcba] text-[#1f2421]">
      <section className="relative h-[calc(100svh-4rem)] min-h-[680px] overflow-hidden">
        <div
          aria-label="Không gian showroom isometric 3D"
          className="absolute inset-0"
          ref={containerRef}
        />

        {!isSceneReady && (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-[#b9bcba]">
            <div className="flex items-center gap-3 rounded-md border border-white/55 bg-white/80 px-4 py-3 text-sm font-bold shadow-lg backdrop-blur">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2f6f5e] border-t-transparent" />
              Đang dựng showroom 3D...
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#aeb1af]/75 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#aeb1af]/75 to-transparent" />

        <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
          <Link
            className="inline-flex items-center gap-3 rounded-md border border-white/55 bg-white/82 px-3 py-2 shadow-lg backdrop-blur transition hover:bg-white"
            href="/"
          >
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1f2421] text-[#f0bd65]">
              <Box className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.08em]">DECOHO 3D</span>
              <span className="block text-[10px] font-bold uppercase text-[#6a706b]">
                Isometric pavilion
              </span>
            </span>
          </Link>
        </div>

        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
          <button
            aria-label={isAutoRotating ? "Dừng tự xoay" : "Bật tự xoay"}
            className="grid h-11 w-11 place-items-center rounded-md border border-white/55 bg-white/82 text-[#1f2421] shadow-lg backdrop-blur transition hover:bg-white"
            onClick={toggleAutoRotate}
            title={isAutoRotating ? "Dừng tự xoay" : "Bật tự xoay"}
            type="button"
          >
            {isAutoRotating ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            aria-label="Đặt lại góc nhìn"
            className="grid h-11 w-11 place-items-center rounded-md border border-white/55 bg-white/82 text-[#1f2421] shadow-lg backdrop-blur transition hover:bg-white"
            onClick={resetView}
            title="Đặt lại góc nhìn"
            type="button"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <Link
            aria-label="Mở toàn bộ sản phẩm"
            className="hidden h-11 items-center gap-2 rounded-md bg-[#1f2421] px-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#2f6f5e] sm:inline-flex"
            href="/products"
          >
            Sản phẩm
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {!selectedItem && (
          <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 hidden -translate-x-1/2 rounded-md border border-white/45 bg-[#1f2421]/78 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur md:flex md:items-center md:gap-2">
            <Maximize2 className="h-4 w-4 text-[#f0bd65]" />
            Kéo để xoay · cuộn để zoom · bấm vào nội thất
          </div>
        )}

        {!selectedItem && (
          <div className="absolute bottom-5 left-4 z-20 flex max-w-[calc(100%-2rem)] items-center gap-1 rounded-md border border-white/55 bg-white/84 p-1 shadow-xl backdrop-blur sm:bottom-6 sm:left-6">
            {(Object.entries(showroomPresets) as [
              ShowroomStyleId,
              ShowroomPreset,
            ][]).map(([styleId, preset]) => (
              <button
                className={`h-9 rounded-md px-3 text-xs font-bold transition ${
                  activeStyle === styleId
                    ? "bg-[#1f2421] text-white"
                    : "text-[#555c57] hover:bg-white"
                }`}
                key={styleId}
                onClick={() => changeStyle(styleId)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {!selectedItem && (
          <div className="pointer-events-none absolute bottom-5 right-4 z-20 hidden rounded-md border border-white/55 bg-white/84 px-3 py-2 text-right shadow-xl backdrop-blur sm:bottom-6 sm:right-6 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a76227]">
              {activePreset.accentLabel}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#5b615d]">
              8 nhóm nội thất có thể chọn
            </p>
          </div>
        )}

        {selectedItem && (
          <aside className="absolute inset-x-3 bottom-3 z-40 max-h-[calc(100%-5.5rem)] overflow-y-auto rounded-lg border border-white/60 bg-white/94 p-4 shadow-[0_24px_70px_rgba(31,36,33,.28)] backdrop-blur sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-20 sm:w-[350px] sm:p-5">
            <button
              aria-label="Đóng thông tin sản phẩm"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-[#646a61] transition hover:bg-[#f2eee7] hover:text-[#1f2421]"
              onClick={() => selectShowroomItem(null)}
              title="Đóng"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a76227]">
                {selectedItem.zone}
              </p>
              <h1 className="mt-2 text-xl font-black leading-tight">
                {selectedItem.name}
              </h1>
              <p className="mt-1 text-[11px] font-bold uppercase text-[#767c77]">
                {selectedItem.brand} · {selectedItem.sku}
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#5d645f]">
              {selectedItem.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#e5ded2] bg-[#e5ded2]">
              <div className="bg-[#faf8f4] p-3">
                <p className="text-[10px] font-bold uppercase text-[#7b817c]">
                  Giá tham khảo
                </p>
                <p className="mt-1 text-base font-black">
                  {formatPrice(selectedItem.priceVND)}
                </p>
              </div>
              <div className="bg-[#faf8f4] p-3">
                <p className="text-[10px] font-bold uppercase text-[#7b817c]">
                  Tồn kho
                </p>
                <p className="mt-1 text-base font-black">
                  {selectedItem.stock} sản phẩm
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between gap-4 border-b border-[#eee8de] pb-3">
                <dt className="text-[#737974]">Kích thước</dt>
                <dd className="text-right font-bold">{selectedItem.dimensions}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#eee8de] pb-3">
                <dt className="shrink-0 text-[#737974]">Vật liệu</dt>
                <dd className="text-right font-bold leading-5">
                  {selectedItem.material}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#737974]">Màu hoàn thiện</span>
              <div className="flex gap-2">
                {selectedItem.swatches.map((swatch) => (
                  <span
                    aria-label={swatch.name}
                    className="h-6 w-6 rounded-full border-2 border-white shadow-[0_0_0_1px_#d7cfc2]"
                    key={swatch.name}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_44px] gap-2">
              <button
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-black transition ${
                  addedItemId === selectedItem.id
                    ? "bg-[#2f6f5e] text-white"
                    : "bg-[#d89b47] text-[#1f2421] hover:bg-[#e4aa55]"
                }`}
                onClick={addSelectedItemToCart}
                type="button"
              >
                {addedItemId === selectedItem.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                {addedItemId === selectedItem.id
                  ? "Đã thêm vào giỏ"
                  : "Thêm vào giỏ"}
              </button>
              <Link
                aria-label={`Xem chi tiết ${selectedItem.name}`}
                className="grid h-11 w-11 place-items-center rounded-md border border-[#d9d1c5] text-[#2f6f5e] transition hover:border-[#2f6f5e] hover:bg-[#eef6f2]"
                href={selectedItem.href}
                title="Xem chi tiết"
              >
                <Info className="h-5 w-5" />
              </Link>
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}
