"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ShowroomStyleId } from "../types";

type ShowroomPreset = {
  label: string;
  description: string;
  accentName: string;
  wall: number;
  wallAlt: number;
  floor: number;
  floorLine: number;
  sofa: number;
  sofaDark: number;
  accent: number;
  rug: number;
  metal: number;
  window: number;
  plant: number;
};

type ShowroomItemId =
  | "coffeeTable"
  | "floorLamp"
  | "loungeChair"
  | "pendant"
  | "plant"
  | "rug"
  | "shelf"
  | "sofa"
  | "wallArt";

type ShowroomItemInfo = {
  sku: string;
  brand: string;
  name: string;
  category: string;
  priceVND: number;
  dimensions: string;
  material: string;
  stock: string;
  leadTime: string;
  colors: { hex: string; name: string }[];
  description: string;
  href: string;
};

type SelectableRegistrar = (root: THREE.Object3D, itemId: ShowroomItemId) => void;

const CAMERA_HOME = {
  position: new THREE.Vector3(5.1, 3.8, 6.6),
  target: new THREE.Vector3(0, 1.05, -0.55),
};

const showroomItems: Record<ShowroomItemId, ShowroomItemInfo> = {
  coffeeTable: {
    sku: "DCH-TBL-ASH-042",
    brand: "DECOHO Studio",
    name: "Ban tra Ash Koto",
    category: "Ban tra",
    priceVND: 3200000,
    dimensions: "120 x 60 x 42 cm",
    material: "Mat go/da mo, chan thep son tinh dien",
    stock: "Con 12",
    leadTime: "3 - 5 ngay",
    colors: [
      { hex: "#f1e3c8", name: "Ash tu nhien" },
      { hex: "#1f2421", name: "Den mo" },
    ],
    description: "Mat ban rong cho sofa trung tam, hop voi phong khach can diem nhan gon.",
    href: "/products/prod-2",
  },
  floorLamp: {
    sku: "DCH-LMP-MORI-170",
    brand: "Mori Light",
    name: "Den cay Mori",
    category: "Den trang tri",
    priceVND: 2400000,
    dimensions: "Cao 170 cm",
    material: "Than kim loai den mo, chup vai linen am",
    stock: "Con 7",
    leadTime: "2 - 4 ngay",
    colors: [
      { hex: "#1f2421", name: "Den graphite" },
      { hex: "#f4d7a1", name: "Linen am" },
    ],
    description: "Anh sang phu diu, dat canh sofa de tao goc doc sach va thu gian.",
    href: "/products",
  },
  loungeChair: {
    sku: "DCH-CHR-LIN-088",
    brand: "DECOHO Living",
    name: "Ghe thu gian Linen",
    category: "Ghe don",
    priceVND: 5800000,
    dimensions: "75 x 80 x 88 cm",
    material: "Khung go, nem boc vai linen, chan thep",
    stock: "Dat truoc",
    leadTime: "7 - 10 ngay",
    colors: [
      { hex: "#d8cfc2", name: "Linen cat" },
      { hex: "#9d8f7f", name: "Taupe" },
    ],
    description: "Ghe don nho gon cho goc tiep khach, co the doi vai theo concept phong.",
    href: "/products/prod-5",
  },
  pendant: {
    sku: "DCH-PEN-KASA-048",
    brand: "Kasa Light",
    name: "Den tha Kasa",
    category: "Den tha",
    priceVND: 2900000,
    dimensions: "Duong kinh 48 cm",
    material: "Khung kim loai, chup vai day",
    stock: "Con 9",
    leadTime: "3 - 5 ngay",
    colors: [
      { hex: "#f4d7a1", name: "Kem lua" },
      { hex: "#4a4f46", name: "Khung den" },
    ],
    description: "Nguon sang trung tam tren ban tra, lam phong am hon khi render ban dem.",
    href: "/products",
  },
  plant: {
    sku: "DCH-DEC-MON-110",
    brand: "Green Corner",
    name: "Chau cay Monstera",
    category: "Cay trang tri",
    priceVND: 850000,
    dimensions: "Cao 110 cm",
    material: "Chau dat nung, cay noi that tan rong",
    stock: "Con 18",
    leadTime: "1 - 2 ngay",
    colors: [
      { hex: "#326f55", name: "Xanh la" },
      { hex: "#b56d4d", name: "Dat nung" },
    ],
    description: "Mang mau xanh vao goc phong va can bang cac vat lieu go, da, kim loai.",
    href: "/products",
  },
  rug: {
    sku: "DCH-RUG-KYO-220",
    brand: "Kyoto Weave",
    name: "Tham Kyoto",
    category: "Tham",
    priceVND: 1850000,
    dimensions: "220 x 150 cm",
    material: "Soi day va cotton det phang",
    stock: "Con 5",
    leadTime: "2 - 3 ngay",
    colors: [
      { hex: "#e8dac5", name: "Cat tu nhien" },
      { hex: "#cfb57a", name: "Vien det" },
    ],
    description: "Gom cum sofa va ban tra thanh mot vung sinh hoat ro rang, am chan hon.",
    href: "/products/prod-3",
  },
  shelf: {
    sku: "DCH-SHF-ANN-170",
    brand: "An Nam Home",
    name: "Ke trung bay An Nam",
    category: "Ke trang tri",
    priceVND: 4200000,
    dimensions: "95 x 32 x 170 cm",
    material: "Khung go son den, dot ke go veneer",
    stock: "Con 6",
    leadTime: "5 - 7 ngay",
    colors: [
      { hex: "#1f2421", name: "Den son mo" },
      { hex: "#b89068", name: "Veneer soi" },
    ],
    description: "Dung de trung bay sach, gom va mau vat lieu trong khu tiep khach.",
    href: "/products/prod-6",
  },
  sofa: {
    sku: "DCH-SOF-SORA-190",
    brand: "Sora Atelier",
    name: "Sofa Sora Japandi",
    category: "Sofa",
    priceVND: 8900000,
    dimensions: "190 x 85 x 78 cm",
    material: "Khung go soi, nem boc vai linen",
    stock: "Con 4",
    leadTime: "7 - 10 ngay",
    colors: [
      { hex: "#d8cfc2", name: "Linen cat" },
      { hex: "#2f6f5e", name: "Goi xanh" },
      { hex: "#9d8f7f", name: "Tua taupe" },
    ],
    description: "Kieu dang thap, ti le rong vua can cho can ho hien dai va phong khach am.",
    href: "/products/prod-1",
  },
  wallArt: {
    sku: "DCH-ART-LAY-090",
    brand: "Layer Canvas",
    name: "Tranh canvas Layer",
    category: "Tranh trang tri",
    priceVND: 1250000,
    dimensions: "90 x 70 cm",
    material: "Canvas day, khung composite den mo",
    stock: "Con 11",
    leadTime: "2 - 4 ngay",
    colors: [
      { hex: "#2f6f5e", name: "Xanh tram" },
      { hex: "#f4d7a1", name: "Be diem" },
    ],
    description: "Diem nhan mau tren nen tuong, giup can bang bo sofa va he den.",
    href: "/products",
  },
};

const showroomPresets: Record<ShowroomStyleId, ShowroomPreset> = {
  japandi: {
    label: "Japandi",
    description: "Go sang, vai tho, cay xanh va anh sang diu.",
    accentName: "am toi gian",
    wall: 0xf2eadf,
    wallAlt: 0xe7dccb,
    floor: 0xb89068,
    floorLine: 0x8b6746,
    sofa: 0xd8cfc2,
    sofaDark: 0x9d8f7f,
    accent: 0x2f6f5e,
    rug: 0xe8dac5,
    metal: 0x4a4f46,
    window: 0x9eb8c4,
    plant: 0x2f6f5e,
  },
  indochine: {
    label: "Indochine",
    description: "Gam tram, may dan, xanh sau va diem nhan dong.",
    accentName: "sang trong Dong Duong",
    wall: 0xf1e5cf,
    wallAlt: 0xd7c39a,
    floor: 0x83583f,
    floorLine: 0x5d3c2e,
    sofa: 0xb98562,
    sofaDark: 0x6c4a35,
    accent: 0x0f4c4c,
    rug: 0xcfb57a,
    metal: 0xc28a3f,
    window: 0x466d73,
    plant: 0x1f5a41,
  },
  modern: {
    label: "Modern",
    description: "Net gon, sofa mau lanh, den kim loai va tham am.",
    accentName: "thanh lich hien dai",
    wall: 0xf4f1ea,
    wallAlt: 0xd9dee2,
    floor: 0x8f9692,
    floorLine: 0x676f6b,
    sofa: 0xaeb8bd,
    sofaDark: 0x59656a,
    accent: 0xbc5b42,
    rug: 0xd6c6a8,
    metal: 0x28313a,
    window: 0x8fb3c6,
    plant: 0x326f55,
  },
};

function standardMaterial(color: number, roughness = 0.75, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function addBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  options: { castShadow?: boolean; receiveShadow?: boolean } = {},
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);

  return mesh;
}

function addRoundedBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  options: {
    castShadow?: boolean;
    radius?: number;
    receiveShadow?: boolean;
    segments?: number;
  } = {},
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(
      size[0],
      size[1],
      size[2],
      options.segments ?? 4,
      options.radius ?? 0.08,
    ),
    material,
  );
  mesh.position.set(...position);
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
  material: THREE.Material,
  options: { castShadow?: boolean; receiveShadow?: boolean; segments?: number } = {},
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, options.segments ?? 32),
    material,
  );
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);

  return mesh;
}

function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);

      if (Array.isArray(object.material)) {
        object.material.forEach((material) => materials.add(material));
      } else {
        materials.add(object.material);
      }
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
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

function buildRoom(
  scene: THREE.Scene,
  preset: ShowroomPreset,
  registerSelectable: SelectableRegistrar,
) {
  const wall = standardMaterial(preset.wall, 0.9);
  const wallAlt = standardMaterial(preset.wallAlt, 0.92);
  const floor = standardMaterial(preset.floor, 0.7);
  const floorLine = standardMaterial(preset.floorLine, 0.82);
  const sofa = standardMaterial(preset.sofa, 0.86);
  const sofaDark = standardMaterial(preset.sofaDark, 0.84);
  const accent = standardMaterial(preset.accent, 0.74);
  const rug = standardMaterial(preset.rug, 0.95);
  const metal = standardMaterial(preset.metal, 0.42, 0.18);
  const glass = new THREE.MeshStandardMaterial({
    color: preset.window,
    emissive: preset.window,
    emissiveIntensity: 0.18,
    metalness: 0.05,
    roughness: 0.22,
  });
  const plant = standardMaterial(preset.plant, 0.78);
  const clay = standardMaterial(0xb56d4d, 0.85);
  const shade = standardMaterial(0xf4d7a1, 0.72);
  const bookWhite = standardMaterial(0xf8f3ea, 0.8);
  const woodTop = standardMaterial(0xf1e3c8, 0.62);
  const seam = standardMaterial(0x7a6f64, 0.88);
  const darkWood = standardMaterial(0x2c2e29, 0.68);

  addBox(scene, [9.4, 0.14, 7.2], [0, -0.07, 0], floor, {
    castShadow: false,
    receiveShadow: true,
  });

  for (let index = -4; index <= 4; index += 1) {
    addBox(scene, [0.025, 0.012, 7.15], [index, 0.014, 0], floorLine, {
      castShadow: false,
      receiveShadow: true,
    });
  }

  for (let index = -3; index <= 3; index += 1) {
    addBox(scene, [9.35, 0.012, 0.025], [0, 0.018, index], floorLine, {
      castShadow: false,
      receiveShadow: true,
    });
  }

  addBox(scene, [9.4, 3.6, 0.16], [0, 1.78, -3.56], wall, {
    castShadow: false,
    receiveShadow: true,
  });
  addBox(scene, [0.16, 3.6, 7.2], [-4.62, 1.78, 0], wallAlt, {
    castShadow: false,
    receiveShadow: true,
  });
  addBox(scene, [0.16, 3.6, 7.2], [4.62, 1.78, 0], wall, {
    castShadow: false,
    receiveShadow: true,
  });
  addBox(scene, [9.4, 0.16, 0.2], [0, 0.22, -3.42], floorLine, {
    castShadow: false,
    receiveShadow: true,
  });
  addBox(scene, [0.18, 0.16, 7.05], [-4.48, 0.22, 0], floorLine, {
    castShadow: false,
    receiveShadow: true,
  });
  addBox(scene, [0.18, 0.16, 7.05], [4.48, 0.22, 0], floorLine, {
    castShadow: false,
    receiveShadow: true,
  });

  addBox(scene, [2.4, 1.25, 0.08], [-2.45, 2.3, -3.45], glass, {
    castShadow: false,
    receiveShadow: false,
  });
  addBox(scene, [2.52, 0.08, 0.12], [-2.45, 2.96, -3.38], metal);
  addBox(scene, [2.52, 0.08, 0.12], [-2.45, 1.64, -3.38], metal);
  addBox(scene, [0.08, 1.38, 0.12], [-3.75, 2.3, -3.38], metal);
  addBox(scene, [0.08, 1.38, 0.12], [-1.15, 2.3, -3.38], metal);
  addBox(scene, [0.08, 1.25, 0.12], [-2.45, 2.3, -3.35], metal);
  addBox(scene, [2.4, 0.06, 0.12], [-2.45, 2.3, -3.34], metal);

  const wallArtGroup = new THREE.Group();
  wallArtGroup.position.set(2.65, 2.22, -3.44);
  scene.add(wallArtGroup);
  addBox(wallArtGroup, [1.35, 0.9, 0.08], [0, 0, 0], accent);
  addBox(wallArtGroup, [1.55, 1.1, 0.08], [0, 0, 0.04], metal);
  addBox(wallArtGroup, [0.9, 0.07, 0.1], [0, 0, 0.1], shade);
  registerSelectable(wallArtGroup, "wallArt");

  const rugMesh = addRoundedBox(scene, [4.4, 0.055, 2.75], [0.05, 0.04, 0.78], rug, {
    castShadow: false,
    radius: 0.12,
    receiveShadow: true,
  });
  addBox(scene, [4.5, 0.024, 0.055], [0.05, 0.09, -0.6], standardMaterial(0xd9c49e, 0.9), {
    castShadow: false,
    receiveShadow: true,
  });
  addBox(scene, [4.5, 0.024, 0.055], [0.05, 0.09, 2.16], standardMaterial(0xd9c49e, 0.9), {
    castShadow: false,
    receiveShadow: true,
  });
  registerSelectable(rugMesh, "rug");

  const sofaGroup = new THREE.Group();
  scene.add(sofaGroup);
  addRoundedBox(sofaGroup, [3.5, 0.42, 1.12], [0, 0.46, -1.82], sofa, { radius: 0.16 });
  addRoundedBox(sofaGroup, [3.66, 1.04, 0.3], [0, 0.9, -2.34], sofaDark, {
    radius: 0.14,
  });
  addRoundedBox(sofaGroup, [0.34, 0.78, 1.2], [-1.96, 0.64, -1.82], sofaDark, {
    radius: 0.12,
  });
  addRoundedBox(sofaGroup, [0.34, 0.78, 1.2], [1.96, 0.64, -1.82], sofaDark, {
    radius: 0.12,
  });
  addRoundedBox(sofaGroup, [0.98, 0.18, 0.86], [-1.08, 0.78, -1.62], sofa, {
    radius: 0.12,
  });
  addRoundedBox(sofaGroup, [0.98, 0.18, 0.86], [0, 0.78, -1.62], sofa, { radius: 0.12 });
  addRoundedBox(sofaGroup, [0.98, 0.18, 0.86], [1.08, 0.78, -1.62], sofa, {
    radius: 0.12,
  });
  addBox(sofaGroup, [0.025, 0.035, 0.92], [-0.54, 0.9, -1.62], seam);
  addBox(sofaGroup, [0.025, 0.035, 0.92], [0.54, 0.9, -1.62], seam);
  addRoundedBox(sofaGroup, [0.58, 0.44, 0.13], [-0.92, 1.14, -2.16], accent, {
    radius: 0.08,
  });
  addRoundedBox(sofaGroup, [0.52, 0.38, 0.13], [0.15, 1.1, -2.16], rug, { radius: 0.08 });
  addRoundedBox(sofaGroup, [0.46, 0.34, 0.13], [1.05, 1.08, -2.16], sofa, {
    radius: 0.08,
  });
  addCylinder(sofaGroup, 0.045, 0.06, 0.34, [-1.38, 0.18, -1.35], darkWood, { segments: 12 });
  addCylinder(sofaGroup, 0.045, 0.06, 0.34, [1.38, 0.18, -1.35], darkWood, { segments: 12 });
  addCylinder(sofaGroup, 0.045, 0.06, 0.34, [-1.38, 0.18, -2.2], darkWood, { segments: 12 });
  addCylinder(sofaGroup, 0.045, 0.06, 0.34, [1.38, 0.18, -2.2], darkWood, { segments: 12 });
  registerSelectable(sofaGroup, "sofa");

  const tableGroup = new THREE.Group();
  scene.add(tableGroup);
  const tableFrame = addCylinder(tableGroup, 0.74, 0.74, 0.1, [0.12, 0.5, 0.48], metal, {
    segments: 48,
  });
  tableFrame.scale.x = 1.48;
  const tableTop = addCylinder(tableGroup, 0.66, 0.66, 0.09, [0.12, 0.6, 0.48], woodTop, {
    segments: 48,
  });
  tableTop.scale.x = 1.42;
  addCylinder(tableGroup, 0.045, 0.045, 0.48, [-0.72, 0.23, 0.1], metal, { segments: 16 });
  addCylinder(tableGroup, 0.045, 0.045, 0.48, [0.96, 0.23, 0.1], metal, { segments: 16 });
  addCylinder(tableGroup, 0.045, 0.045, 0.48, [-0.72, 0.23, 0.86], metal, { segments: 16 });
  addCylinder(tableGroup, 0.045, 0.045, 0.48, [0.96, 0.23, 0.86], metal, { segments: 16 });
  addRoundedBox(tableGroup, [0.5, 0.07, 0.33], [-0.28, 0.68, 0.35], accent, { radius: 0.03 });
  addRoundedBox(tableGroup, [0.45, 0.055, 0.28], [-0.24, 0.75, 0.34], bookWhite, {
    radius: 0.03,
  });
  addCylinder(tableGroup, 0.16, 0.2, 0.18, [0.65, 0.73, 0.58], clay);
  registerSelectable(tableGroup, "coffeeTable");

  const loungeChair = new THREE.Group();
  loungeChair.rotation.y = -0.5;
  loungeChair.position.set(2.9, 0, 0.52);
  scene.add(loungeChair);
  addRoundedBox(loungeChair, [1.05, 0.38, 0.92], [0, 0.38, 0], sofa, { radius: 0.14 });
  addRoundedBox(loungeChair, [1.12, 0.78, 0.22], [0, 0.74, -0.48], sofaDark, {
    radius: 0.11,
  });
  addRoundedBox(loungeChair, [0.22, 0.6, 0.92], [-0.65, 0.52, 0], sofaDark, {
    radius: 0.1,
  });
  addRoundedBox(loungeChair, [0.22, 0.6, 0.92], [0.65, 0.52, 0], sofaDark, {
    radius: 0.1,
  });
  addCylinder(loungeChair, 0.04, 0.04, 0.46, [-0.42, 0.18, 0.28], metal, { segments: 12 });
  addCylinder(loungeChair, 0.04, 0.04, 0.46, [0.42, 0.18, 0.28], metal, { segments: 12 });
  registerSelectable(loungeChair, "loungeChair");

  const shelf = new THREE.Group();
  shelf.position.set(-3.72, 0, 1.35);
  shelf.rotation.y = Math.PI / 2;
  scene.add(shelf);
  addBox(shelf, [1.65, 0.1, 0.32], [0, 0.72, 0], metal);
  addBox(shelf, [1.65, 0.1, 0.32], [0, 1.32, 0], metal);
  addBox(shelf, [1.65, 0.1, 0.32], [0, 1.92, 0], metal);
  addBox(shelf, [0.1, 1.48, 0.32], [-0.86, 1.32, 0], metal);
  addBox(shelf, [0.1, 1.48, 0.32], [0.86, 1.32, 0], metal);
  addRoundedBox(shelf, [0.36, 0.48, 0.26], [-0.42, 1.0, 0], accent, { radius: 0.04 });
  addRoundedBox(shelf, [0.3, 0.42, 0.26], [0.24, 1.58, 0], rug, { radius: 0.04 });
  addBox(shelf, [0.08, 0.5, 0.24], [-0.02, 0.98, 0], bookWhite);
  addBox(shelf, [0.08, 0.42, 0.24], [0.1, 0.94, 0], clay);
  addBox(shelf, [0.08, 0.46, 0.24], [0.22, 0.96, 0], standardMaterial(0x2f6f5e, 0.78));
  addCylinder(shelf, 0.13, 0.16, 0.22, [0.56, 2.18, 0], clay);
  registerSelectable(shelf, "shelf");

  const lamp = new THREE.Group();
  lamp.position.set(-3.32, 0, -0.88);
  scene.add(lamp);
  addCylinder(lamp, 0.22, 0.32, 0.1, [0, 0.05, 0], metal);
  addCylinder(lamp, 0.035, 0.035, 1.72, [0, 0.9, 0], metal, { segments: 16 });
  addCylinder(lamp, 0.36, 0.5, 0.48, [0, 1.92, 0], shade, { segments: 32 });
  const lampGlow = new THREE.PointLight(0xffd9a3, 1.2, 4.2, 1.5);
  lampGlow.position.set(-3.32, 1.72, -0.88);
  lampGlow.castShadow = true;
  scene.add(lampGlow);
  registerSelectable(lamp, "floorLamp");

  const plantGroup = new THREE.Group();
  plantGroup.position.set(3.54, 0, -2.4);
  scene.add(plantGroup);
  addCylinder(plantGroup, 0.32, 0.42, 0.54, [0, 0.27, 0], clay);
  addCylinder(plantGroup, 0.055, 0.07, 0.9, [0, 0.95, 0], standardMaterial(0x7b5a3f, 0.8), {
    segments: 12,
  });

  for (let index = 0; index < 9; index += 1) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 12), plant);
    const angle = (index / 9) * Math.PI * 2;
    leaf.scale.set(0.55, 0.18, 1.0);
    leaf.position.set(Math.cos(angle) * 0.38, 1.18 + (index % 3) * 0.12, Math.sin(angle) * 0.38);
    leaf.rotation.set(0.2, angle, -0.35);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    plantGroup.add(leaf);
  }
  registerSelectable(plantGroup, "plant");

  const ceilingRail = addBox(scene, [5.8, 0.08, 0.12], [0.5, 3.38, -1.16], metal, {
    castShadow: false,
    receiveShadow: false,
  });
  ceilingRail.rotation.y = 0.02;

  const pendant = new THREE.Group();
  pendant.position.set(1.2, 0, 0.12);
  scene.add(pendant);
  addCylinder(pendant, 0.018, 0.018, 1.05, [0, 2.82, 0], metal, { segments: 12 });
  addCylinder(pendant, 0.34, 0.48, 0.36, [0, 2.22, 0], shade, { segments: 36 });
  const pendantLight = new THREE.PointLight(0xffedcc, 0.95, 4.6, 1.65);
  pendantLight.position.set(1.2, 2.05, 0.12);
  scene.add(pendantLight);
  registerSelectable(pendant, "pendant");

  return { pendant };
}

function formatPrice(priceVND: number) {
  return `${new Intl.NumberFormat("vi-VN").format(priceVND)} VND`;
}

export default function RoomShowroom3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const autoRotateRef = useRef(true);
  const selectedItemRef = useRef<ShowroomItemId>("sofa");
  const [activeStyle, setActiveStyle] = useState<ShowroomStyleId>("japandi");
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<ShowroomItemId>("sofa");

  const activePreset = showroomPresets[activeStyle];
  const selectedItem = showroomItems[selectedItemId];

  const selectShowroomItem = useCallback((itemId: ShowroomItemId) => {
    selectedItemRef.current = itemId;
    setSelectedItemId(itemId);
  }, []);

  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!camera || !controls) {
      return;
    }

    camera.position.copy(CAMERA_HOME.position);
    controls.target.copy(CAMERA_HOME.target);
    controls.update();
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((current) => {
      const next = !current;
      autoRotateRef.current = next;

      if (controlsRef.current) {
        controlsRef.current.autoRotate = next;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    autoRotateRef.current = isAutoRotating;

    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const mountNode = container;
    const scene = new THREE.Scene();
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const pointerStart = new THREE.Vector2();
    const selectableMeshes: THREE.Object3D[] = [];
    const selectableRoots = new Map<ShowroomItemId, THREE.Object3D>();
    scene.background = new THREE.Color(0xece3d6);
    scene.fog = new THREE.Fog(0xece3d6, 10, 18);

    const width = Math.max(mountNode.clientWidth, 320);
    const height = Math.max(mountNode.clientHeight, 480);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.copy(CAMERA_HOME.position);
    camera.lookAt(CAMERA_HOME.target);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "Phong mau 3D DECOHO");
    renderer.domElement.setAttribute("data-testid", "showroom-canvas");
    renderer.domElement.className = "block h-full w-full";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";
    mountNode.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.45;
    controls.minDistance = 3.2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.copy(CAMERA_HOME.target);
    controls.update();
    controlsRef.current = controls;

    const hemisphere = new THREE.HemisphereLight(0xfff5e5, 0x586158, 1.15);
    scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(-3.2, 5.8, 4.8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 18;
    sun.shadow.camera.left = -7;
    sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7;
    sun.shadow.camera.bottom = -7;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xffdfb6, 1.15);
    fillLight.position.set(4.6, 3.4, 4);
    scene.add(fillLight);

    function registerSelectable(root: THREE.Object3D, itemId: ShowroomItemId) {
      selectableRoots.set(itemId, root);
      root.userData.showroomItemId = itemId;

      root.traverse((object) => {
        object.userData.showroomItemId = itemId;

        if (object instanceof THREE.Mesh) {
          selectableMeshes.push(object);
        }
      });
    }

    const selectionMarker = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.025, 16, 72),
      new THREE.MeshBasicMaterial({
        color: 0xf3c87b,
        depthTest: false,
        transparent: true,
        opacity: 0.95,
      }),
    );
    selectionMarker.renderOrder = 20;
    selectionMarker.rotation.x = Math.PI / 2;
    selectionMarker.visible = false;
    scene.add(selectionMarker);

    function focusSelection(itemId: ShowroomItemId) {
      const root = selectableRoots.get(itemId);

      if (!root) {
        selectionMarker.visible = false;
        return;
      }

      const bounds = new THREE.Box3().setFromObject(root);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const scale = Math.max(size.x, size.z, 0.9);
      selectionMarker.position.set(center.x, bounds.max.y + 0.16, center.z);
      selectionMarker.scale.set(scale, scale, scale);
      selectionMarker.visible = true;
    }

    function getIntersectedItem(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersections = raycaster.intersectObjects(selectableMeshes, true);
      const firstHit = intersections[0];

      if (!firstHit) {
        return null;
      }

      return findShowroomItemId(firstHit.object);
    }

    function handlePointerDown(event: PointerEvent) {
      pointerStart.set(event.clientX, event.clientY);
      renderer.domElement.style.cursor = "grabbing";
    }

    function handlePointerMove(event: PointerEvent) {
      const itemId = getIntersectedItem(event);
      renderer.domElement.style.cursor = itemId ? "pointer" : "grab";
    }

    function handlePointerUp(event: PointerEvent) {
      const movement = pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
      renderer.domElement.style.cursor = "grab";

      if (movement > 7) {
        return;
      }

      const itemId = getIntersectedItem(event);

      if (!itemId) {
        return;
      }

      autoRotateRef.current = false;
      controls.autoRotate = false;
      setIsAutoRotating(false);
      selectShowroomItem(itemId);
      focusSelection(itemId);
    }

    const { pendant } = buildRoom(scene, activePreset, registerSelectable);
    focusSelection(selectedItemRef.current);
    const clock = new THREE.Clock();

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    function resize() {
      const nextWidth = Math.max(mountNode.clientWidth, 320);
      const nextHeight = Math.max(mountNode.clientHeight, 480);

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mountNode);

    let frameId = 0;

    function animate() {
      const elapsed = clock.getElapsedTime();
      pendant.rotation.y = Math.sin(elapsed * 0.45) * 0.12;
      controls.autoRotate = autoRotateRef.current;
      controls.update();
      renderer.render(scene, camera);
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
    <main className="min-h-[calc(100vh-4rem)] bg-[#ece3d6] text-[#1f2421]">
      <section className="relative h-[calc(100vh-4rem)] min-h-[680px] overflow-hidden lg:min-h-[760px]">
        <div
          aria-label="Khong gian phong mau 3D"
          className="absolute inset-0"
          ref={containerRef}
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(31,36,33,0.34),rgba(31,36,33,0.08)_45%,rgba(236,227,214,0.08))]" />

        <div className="pointer-events-none absolute left-4 top-5 z-10 max-w-[min(520px,calc(100%-2rem))] text-white sm:left-8 sm:top-8">
          <BrandLogo className="h-12 w-40" theme="light" variant="horizontal" />
          <h1 className="mt-3 max-w-[12ch] text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl">
            Phong mau 3D
          </h1>
          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-white/85 sm:text-base">
            Tuong tac truc tiep voi phong khach mau, doi concept noi that va xem bo cuc
            truoc khi chon san pham.
          </p>
        </div>

        <div className="absolute right-4 top-5 z-20 w-[min(360px,calc(100%-2rem))] rounded-md border border-white/35 bg-white/88 p-3 shadow-2xl shadow-black/15 backdrop-blur sm:right-8 sm:top-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b46f2c]">
                Phong cach
              </p>
              <h2 className="mt-1 text-lg font-black text-[#1f2421]">{activePreset.label}</h2>
            </div>
            <span className="rounded-md bg-[#1f2421] px-2.5 py-1 text-xs font-bold text-[#f3c87b]">
              {activePreset.accentName}
            </span>
          </div>

          <p className="mt-2 text-sm leading-5 text-[#5b615a]">{activePreset.description}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {Object.entries(showroomPresets).map(([styleId, preset]) => (
              <button
                className={`rounded-md border px-3 py-2 text-xs font-bold transition ${
                  activeStyle === styleId
                    ? "border-[#1f2421] bg-[#1f2421] text-white"
                    : "border-[#ded6c9] bg-white text-[#51564f] hover:border-[#d89b47]"
                }`}
                key={styleId}
                onClick={() => setActiveStyle(styleId as ShowroomStyleId)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="rounded-md bg-[#2f6f5e] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#285f51]"
              onClick={toggleAutoRotate}
              type="button"
            >
              {isAutoRotating ? "Dung xoay" : "Tu xoay"}
            </button>
            <button
              className="rounded-md border border-[#ded6c9] bg-white px-3 py-2 text-sm font-bold text-[#1f2421] transition hover:bg-[#f7f3ec]"
              onClick={resetView}
              type="button"
            >
              Reset goc nhin
            </button>
          </div>
        </div>

        <aside className="absolute left-4 top-[304px] z-20 w-[min(360px,calc(100%-2rem))] rounded-md border border-white/35 bg-white/90 p-3 shadow-2xl shadow-black/15 backdrop-blur sm:left-8 sm:top-[294px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b46f2c]">
                Dang chon
              </p>
              <h2 className="mt-1 text-lg font-black leading-tight text-[#1f2421]">
                {selectedItem.name}
              </h2>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#8a7662]">
                {selectedItem.brand} | {selectedItem.sku}
              </p>
            </div>
            <span className="rounded-md bg-[#f7f3ec] px-2.5 py-1 text-xs font-bold text-[#2f6f5e]">
              {selectedItem.category}
            </span>
          </div>

          <p className="mt-2 text-sm leading-5 text-[#5b615a]">{selectedItem.description}</p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-[#eee7dc] bg-white px-2.5 py-2">
              <dt className="font-bold uppercase tracking-wide text-[#8a7662]">Gia</dt>
              <dd className="mt-1 font-black text-[#1f2421]">
                {formatPrice(selectedItem.priceVND)}
              </dd>
            </div>
            <div className="rounded-md border border-[#eee7dc] bg-white px-2.5 py-2">
              <dt className="font-bold uppercase tracking-wide text-[#8a7662]">Kich thuoc</dt>
              <dd className="mt-1 font-black text-[#1f2421]">{selectedItem.dimensions}</dd>
            </div>
          </dl>

          <dl className="mt-2 hidden grid-cols-2 gap-2 text-xs sm:grid">
            <div className="rounded-md border border-[#eee7dc] bg-white px-2.5 py-2">
              <dt className="font-bold uppercase tracking-wide text-[#8a7662]">Ton kho</dt>
              <dd className="mt-1 font-black text-[#1f2421]">{selectedItem.stock}</dd>
            </div>
            <div className="rounded-md border border-[#eee7dc] bg-white px-2.5 py-2">
              <dt className="font-bold uppercase tracking-wide text-[#8a7662]">Giao hang</dt>
              <dd className="mt-1 font-black text-[#1f2421]">{selectedItem.leadTime}</dd>
            </div>
          </dl>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-[#eee7dc] bg-white px-2.5 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[#8a7662]">Mau</span>
            <div className="flex min-w-0 flex-wrap justify-end gap-1.5">
              {selectedItem.colors.map((color) => (
                <span
                  aria-label={color.name}
                  className="h-5 w-5 rounded-full border border-[#ded6c9] shadow-sm"
                  key={color.name}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <p className="mt-3 rounded-md border border-[#eee7dc] bg-white px-2.5 py-2 text-xs font-semibold leading-5 text-[#51564f]">
            {selectedItem.material}
          </p>

          <Link
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#1f2421] px-4 py-2 text-sm font-black text-white transition hover:bg-[#2f6f5e]"
            href={selectedItem.href}
          >
            Xem san pham
          </Link>
        </aside>

        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-3 rounded-md border border-white/35 bg-[#1f2421]/88 p-3 text-white shadow-2xl shadow-black/20 backdrop-blur sm:bottom-8 sm:left-8 sm:right-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[420px]">
            <div>
              <p className="text-lg font-black text-[#f3c87b]">3</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                concept
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-[#f3c87b]">8+</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                vat dung
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-[#f3c87b]">360</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                goc xem
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              className="rounded-md bg-[#d89b47] px-4 py-2 text-sm font-black text-[#1f2421] transition hover:bg-[#e3ab5c]"
              href="/products"
            >
              Chon san pham
            </Link>
            <Link
              className="rounded-md border border-white/35 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
              href="/process"
            >
              Xem quy trinh
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
