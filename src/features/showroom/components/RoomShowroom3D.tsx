"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Box,
  ChevronRight,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Info,
  Plus,
  Minus,
  Trash2,
  RotateCw,
  Move,
  CheckCircle2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { Showroom } from "../types";

// Danh mục sản phẩm 3D có thể kéo thả vào phòng
export type AvailableProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  modelUrl: string;
  thumbnailUrl: string;
  dimensions: string;
  material: string;
};

const AVAILABLE_FURNITURE: AvailableProduct[] = [
  {
    id: "bed-wooden-platform",
    name: "Giường ngủ gỗ Platform",
    category: "Phòng ngủ",
    price: 18500000,
    modelUrl: "https://res.cloudinary.com/djzzwjznn/raw/upload/v1793328129/decoho/furniture/wooden-bed-1793328126661.glb",
    thumbnailUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    dimensions: "200 x 180 x 85 cm",
    material: "Gỗ sồi tự nhiên, đầu giường bọc nệm",
  },
];

export type PlacedFurniture = {
  instanceId: string;
  productId: string;
  name: string;
  modelUrl: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
};

const fallbackShowrooms: Showroom[] = [
  {
    _id: "6ae3671bda91875ce3b84a0d",
    title: "Phòng mẫu nội thất 3D (Tripo3D AI)",
    description:
      "Không gian nội thất hiện đại được tạo tự động bởi Tripo3D AI. Trải nghiệm xoay 360°, bấm chọn và kéo thả giường ngủ hoặc các món đồ vào phòng.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    environmentModelUrl:
      "https://res.cloudinary.com/djzzwjznn/raw/upload/v1793287961/decoho/showrooms/tripo-interior-room-1793287949669.glb",
    status: "PUBLISHED",
    items: [],
  },
];

export default function RoomShowroom3D() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // 3D Canvas states
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string>("");
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Danh sách đồ đã đặt trong phòng & món đồ đang chọn
  const [placedList, setPlacedList] = useState<PlacedFurniture[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [isAddingModel, setIsAddingModel] = useState<boolean>(false);
  const [userNotification, setUserNotification] = useState<string>("");

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const furnitureGroupRef = useRef<THREE.Group | null>(null);
  const selectionRingRef = useRef<THREE.Mesh | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  // Tương tác kéo thả trên sàn (Drag)
  const isDraggingRef = useRef<boolean>(false);
  const draggedObjectRef = useRef<THREE.Object3D | null>(null);
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const floorPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseCoordsRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Thông báo tạm thời
  const showToast = (msg: string) => {
    setUserNotification(msg);
    setTimeout(() => setUserNotification(""), 3500);
  };

  // Fetch showrooms from API
  const fetchShowrooms = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/showrooms`, { credentials: "omit" });
      if (!res.ok) throw new Error(`Lỗi tải dữ liệu (${res.status})`);
      const data = await res.json();
      const list: Showroom[] = Array.isArray(data) ? data : data ? [data] : [];
      if (list.length > 0) {
        setShowrooms(list);
        setSelectedId((current) => (current && list.some((s) => s._id === current) ? current : list[0]._id));
      } else {
        setShowrooms(fallbackShowrooms);
        setSelectedId(fallbackShowrooms[0]._id);
      }
    } catch {
      setShowrooms(fallbackShowrooms);
      setSelectedId(fallbackShowrooms[0]._id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchShowrooms();
  }, [fetchShowrooms]);

  const activeShowroom = showrooms.find((s) => s._id === selectedId) || showrooms[0];

  // Khởi tạo Three.js Scene và Room
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container || !activeShowroom?.environmentModelUrl) return;

    let isDisposed = false;
    setModelLoading(true);
    setModelError("");
    setLoadProgress(0);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f7f3ec");
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 1000);
    camera.position.set(6, 4.5, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb0b8a6, 2.6);
    scene.add(hemiLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const sun1 = new THREE.DirectionalLight(0xffffff, 2.4);
    sun1.position.set(6, 12, 7);
    scene.add(sun1);

    const sun2 = new THREE.DirectionalLight(0xfff7ea, 1.6);
    sun2.position.set(-7, 8, -6);
    scene.add(sun2);

    // Group chứa đồ nội thất kéo thả
    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);
    furnitureGroupRef.current = furnitureGroup;

    // Vòng tròn báo hiệu món đồ đang chọn (Selection Ring)
    const ringGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2e6f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.position.set(0, 0.02, 0);
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.minDistance = 0.5;
    controls.maxDistance = 60;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // DRACO Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Tải mô hình căn phòng trống (Room Environment)
    const roomModelGroup = new THREE.Group();
    scene.add(roomModelGroup);

    let defaultCamPos = new THREE.Vector3(6, 4.5, 8);
    let defaultCamTarget = new THREE.Vector3(0, 0, 0);

    loader.load(
      activeShowroom.environmentModelUrl,
      (gltf) => {
        if (isDisposed) return;
        const roomModel = gltf.scene;
        roomModelGroup.add(roomModel);

        const bbox = new THREE.Box3().setFromObject(roomModelGroup);
        if (!bbox.isEmpty()) {
          const center = bbox.getCenter(new THREE.Vector3());
          const size = bbox.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const distance = Math.max(maxDim * 1.5, 3.5);

          controls.target.copy(center);
          camera.position.set(center.x + distance * 0.8, center.y + distance * 0.55, center.z + distance * 0.8);
          controls.update();

          defaultCamPos.copy(camera.position);
          defaultCamTarget.copy(center);
        }

        setModelLoading(false);
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(percent);
        }
      },
      (err) => {
        if (isDisposed) return;
        console.error("Lỗi tải room 3D:", err);
        setModelError("Không thể tải mô hình căn phòng. Vui lòng thử lại.");
        setModelLoading(false);
      },
    );

    resetCameraRef.current = () => {
      camera.position.copy(defaultCamPos);
      controls.target.copy(defaultCamTarget);
      controls.update();
    };

    // --- SỰ KIỆN KÉO THẢ MÔ HÌNH NỘI THẤT TRÊN SÀN (POINTER EVENTS) ---
    const domElem = renderer.domElement;

    function getPointerPos(e: PointerEvent) {
      const rect = domElem.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      return { x, y };
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return; // Chỉ xử lý chuột trái
      const { x, y } = getPointerPos(e);
      mouseCoordsRef.current.set(x, y);
      raycasterRef.current.setFromCamera(mouseCoordsRef.current, camera);

      // Kiểm tra có bấm trúng món đồ nội thất nào không
      if (furnitureGroup.children.length > 0) {
        const intersects = raycasterRef.current.intersectObjects(furnitureGroup.children, true);
        if (intersects.length > 0) {
          // Tìm root Object3D của item trong furnitureGroup
          let rootObj: THREE.Object3D | null = intersects[0].object;
          while (rootObj && rootObj.parent !== furnitureGroup) {
            rootObj = rootObj.parent;
          }

          if (rootObj && rootObj.userData?.instanceId) {
            isDraggingRef.current = true;
            draggedObjectRef.current = rootObj;
            setSelectedInstanceId(rootObj.userData.instanceId);

            // Tắt OrbitControls để không xoay phòng khi kéo đồ
            controls.enabled = false;

            // Tính điểm offset trên sàn
            const planeIntersect = new THREE.Vector3();
            raycasterRef.current.ray.intersectPlane(floorPlaneRef.current, planeIntersect);
            if (planeIntersect) {
              dragOffsetRef.current.set(
                planeIntersect.x - rootObj.position.x,
                0,
                planeIntersect.z - rootObj.position.z,
              );
            }
            return;
          }
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      const { x, y } = getPointerPos(e);
      mouseCoordsRef.current.set(x, y);

      if (isDraggingRef.current && draggedObjectRef.current) {
        raycasterRef.current.setFromCamera(mouseCoordsRef.current, camera);
        const planeIntersect = new THREE.Vector3();
        if (raycasterRef.current.ray.intersectPlane(floorPlaneRef.current, planeIntersect)) {
          const newX = planeIntersect.x - dragOffsetRef.current.x;
          const newZ = planeIntersect.z - dragOffsetRef.current.z;

          draggedObjectRef.current.position.x = newX;
          draggedObjectRef.current.position.z = newZ;

          // Cập nhật vòng tròn chọn
          if (selectionRing) {
            selectionRing.position.x = newX;
            selectionRing.position.z = newZ;
          }

          // Cập nhật state
          const instId = draggedObjectRef.current.userData.instanceId;
          setPlacedList((prev) =>
            prev.map((item) =>
              item.instanceId === instId
                ? { ...item, position: [newX, item.position[1], newZ] }
                : item,
            ),
          );
        }
      } else {
        // Thay đổi con trỏ chuột thành pointer khi rê vào đồ vật
        raycasterRef.current.setFromCamera(mouseCoordsRef.current, camera);
        if (furnitureGroup.children.length > 0) {
          const hits = raycasterRef.current.intersectObjects(furnitureGroup.children, true);
          domElem.style.cursor = hits.length > 0 ? "grab" : "default";
        } else {
          domElem.style.cursor = "default";
        }
      }
    }

    function onPointerUp() {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        draggedObjectRef.current = null;
        controls.enabled = true; // Bật lại xoay phòng
        domElem.style.cursor = "default";
      }
    }

    domElem.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    function animate() {
      if (isDisposed) return;
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    // Resize Handler
    function handleResize() {
      if (!container || isDisposed) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [activeShowroom?.environmentModelUrl, autoRotate]);

  // Cập nhật vòng tròn chỉ điểm khi thay đổi selectedInstanceId
  useEffect(() => {
    const ring = selectionRingRef.current;
    const furnitureGroup = furnitureGroupRef.current;
    if (!ring || !furnitureGroup) return;

    if (!selectedInstanceId) {
      ring.visible = false;
      return;
    }

    const targetObj = furnitureGroup.children.find(
      (c) => c.userData?.instanceId === selectedInstanceId,
    );

    if (targetObj) {
      ring.visible = true;
      ring.position.x = targetObj.position.x;
      ring.position.z = targetObj.position.z;

      // Đo kích thước để chỉnh bán kính vòng tròn
      const bbox = new THREE.Box3().setFromObject(targetObj);
      if (!bbox.isEmpty()) {
        const size = bbox.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.z) * 0.55;
        ring.scale.set(radius, radius, 1);
      }
    } else {
      ring.visible = false;
    }
  }, [selectedInstanceId]);

  // HÀM: Thêm sản phẩm vào căn phòng 3D
  const handleAddFurnitureToRoom = async (product: AvailableProduct) => {
    const scene = sceneRef.current;
    const furnitureGroup = furnitureGroupRef.current;
    if (!scene || !furnitureGroup) return;

    setIsAddingModel(true);
    showToast(`Đang nạp 3D ${product.name} vào phòng...`);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      product.modelUrl,
      (gltf) => {
        const model = gltf.scene;
        const instanceId = `placed-${Date.now()}`;

        // Đặt tỉ lệ mặc định vừa vặn (0.45 để nằm gọn trong phòng)
        const initialScale = 0.45;
        model.scale.set(initialScale, initialScale, initialScale);

        // Căn chỉnh đáy chạm sàn y = 0
        const bbox = new THREE.Box3().setFromObject(model);
        const minY = bbox.min.y;
        model.position.set(0, -minY, 0);

        // Lưu metadata
        model.userData = {
          instanceId,
          productId: product.id,
          name: product.name,
          scale: initialScale,
        };

        furnitureGroup.add(model);

        const newPlaced: PlacedFurniture = {
          instanceId,
          productId: product.id,
          name: product.name,
          modelUrl: product.modelUrl,
          position: [0, -minY, 0],
          rotationY: 0,
          scale: initialScale,
        };

        setPlacedList((prev) => [...prev, newPlaced]);
        setSelectedInstanceId(instanceId);
        setIsAddingModel(false);
        showToast(`Đã thêm ${product.name}! Nhấp giữ chuột để kéo di chuyển.`);
      },
      undefined,
      (err) => {
        console.error("Lỗi load model sản phẩm:", err);
        setIsAddingModel(false);
        showToast("Không thể tải mô hình 3D này. Vui lòng thử lại.");
      },
    );
  };

  // HÀM: Xoay món đồ đang chọn
  const handleRotateSelected = (angleDeg: number) => {
    if (!selectedInstanceId) return;
    const furnitureGroup = furnitureGroupRef.current;
    if (!furnitureGroup) return;

    const targetObj = furnitureGroup.children.find(
      (c) => c.userData?.instanceId === selectedInstanceId,
    );
    if (!targetObj) return;

    const rad = (angleDeg * Math.PI) / 180;
    targetObj.rotation.y += rad;

    setPlacedList((prev) =>
      prev.map((item) =>
        item.instanceId === selectedInstanceId
          ? { ...item, rotationY: targetObj.rotation.y }
          : item,
      ),
    );
  };

  // HÀM: Chỉnh kích thước (Scale) riêng từng sản phẩm
  const handleScaleSelected = (factor: number) => {
    if (!selectedInstanceId) return;
    const furnitureGroup = furnitureGroupRef.current;
    if (!furnitureGroup) return;

    const targetObj = furnitureGroup.children.find(
      (c) => c.userData?.instanceId === selectedInstanceId,
    );
    if (!targetObj) return;

    const currentScale = targetObj.scale.x;
    // Giới hạn scale từ 0.15 đến 1.5
    const newScale = Math.min(1.5, Math.max(0.15, currentScale * factor));
    targetObj.scale.set(newScale, newScale, newScale);
    targetObj.userData.scale = newScale;

    // Giữ đáy chân đồ vật luôn chạm đúng mặt sàn y = 0
    const bbox = new THREE.Box3().setFromObject(targetObj);
    const deltaY = bbox.min.y;
    targetObj.position.y -= deltaY;

    // Cập nhật vòng tròn chọn
    const ring = selectionRingRef.current;
    if (ring) {
      const size = bbox.getSize(new THREE.Vector3());
      const radius = Math.max(size.x, size.z) * 0.55;
      ring.scale.set(radius, radius, 1);
    }

    setPlacedList((prev) =>
      prev.map((item) =>
        item.instanceId === selectedInstanceId
          ? { ...item, scale: newScale, position: [targetObj.position.x, targetObj.position.y, targetObj.position.z] }
          : item,
      ),
    );
  };

  // HÀM: Xóa món đồ khỏi phòng
  const handleRemoveSelected = () => {
    if (!selectedInstanceId) return;
    const furnitureGroup = furnitureGroupRef.current;
    if (!furnitureGroup) return;

    const targetObj = furnitureGroup.children.find(
      (c) => c.userData?.instanceId === selectedInstanceId,
    );
    if (targetObj) {
      furnitureGroup.remove(targetObj);
      targetObj.traverse((o: any) => {
        o.geometry?.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: any) => m.dispose());
        }
      });
    }

    setPlacedList((prev) => prev.filter((item) => item.instanceId !== selectedInstanceId));
    setSelectedInstanceId(null);
    showToast("Đã bỏ món đồ khỏi phòng.");
  };

  // Toggle auto rotate
  const handleToggleAutoRotate = () => {
    setAutoRotate((prev) => {
      const next = !prev;
      if (controlsRef.current) controlsRef.current.autoRotate = next;
      return next;
    });
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!canvasContainerRef.current) return;
    if (!document.fullscreenElement) {
      canvasContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const selectedItemData = placedList.find((i) => i.instanceId === selectedInstanceId);

  return (
    <main className="min-h-screen bg-[#f7f3ec] pb-16">
      {/* Top Banner & Header */}
      <section className="border-b border-[#ded6c9] bg-[#fffefb]/80 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <nav className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#646a61]">
            <Link href="/" className="hover:text-[#2e6f5e] transition">
              Trang chủ
            </Link>
            <ChevronRight size={14} className="text-[#a4ab9f]" />
            <span className="text-[#2e6f5e]">Showroom 3D Tương Tác</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ded6c9] bg-[#f2efe6] px-3 py-1 text-xs font-bold text-[#2e6f5e]">
                <Sparkles size={14} className="text-[#2e6f5e]" />
                TRIPO3D INTERACTIVE ROOM PLANNER
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#254f43] sm:text-4xl lg:text-5xl">
                Bố trí nội thất 3D vào căn phòng
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#646a61] sm:text-base">
                Nhấp vào món đồ nội thất bất kỳ để đưa vào phòng ➔ Bấm giữ chuột để kéo di chuyển và xoay hướng tùy thích trên sàn nhà.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Experience */}
      <section className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
          {/* Left: 3D Canvas Box */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-[#ded6c9] bg-[#f7f3ec] shadow-[0_12px_40px_rgba(37,60,46,0.06)]">
              {/* 3D Canvas */}
              <div
                ref={canvasContainerRef}
                className="relative h-[500px] w-full touch-none sm:h-[620px] lg:h-[700px]"
              />

              {/* Toast Thông báo */}
              {userNotification && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-2xl bg-[#254f43] px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-3">
                  <CheckCircle2 size={16} className="text-[#dfe8d3]" />
                  <span>{userNotification}</span>
                </div>
              )}

              {/* Bảng điều khiển món đồ đang được chọn (Floating Active Object HUD) */}
              {selectedItemData && (
                <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-[#ded6c9] bg-white/95 p-2 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2 px-2 text-xs font-bold text-[#254f43]">
                    <Move size={15} className="text-[#2e6f5e]" />
                    <span className="max-w-[140px] truncate">{selectedItemData.name}</span>
                  </div>

                  <div className="h-4 w-px bg-[#ded6c9]" />

                  {/* Nút xoay 45° */}
                  <button
                    type="button"
                    onClick={() => handleRotateSelected(45)}
                    title="Xoay 45 độ"
                    className="flex h-8 items-center gap-1 rounded-xl border border-[#ded6c9] bg-[#f7f3ec] px-2.5 text-xs font-bold text-[#254f43] transition hover:bg-[#e8e4d8]"
                  >
                    <RotateCw size={13} />
                    <span>Xoay 45°</span>
                  </button>

                  <div className="h-4 w-px bg-[#ded6c9]" />

                  {/* Nút Thu nhỏ món đồ (-15%) */}
                  <button
                    type="button"
                    onClick={() => handleScaleSelected(0.85)}
                    title="Thu nhỏ món đồ này (-15%)"
                    className="flex h-8 items-center gap-1 rounded-xl border border-[#ded6c9] bg-[#f7f3ec] px-2.5 text-xs font-bold text-[#254f43] transition hover:bg-[#e8e4d8]"
                  >
                    <Minus size={13} />
                    <span>Thu nhỏ</span>
                  </button>

                  {/* Nút Phóng to món đồ (+15%) */}
                  <button
                    type="button"
                    onClick={() => handleScaleSelected(1.15)}
                    title="Phóng to món đồ này (+15%)"
                    className="flex h-8 items-center gap-1 rounded-xl border border-[#ded6c9] bg-[#f7f3ec] px-2.5 text-xs font-bold text-[#254f43] transition hover:bg-[#e8e4d8]"
                  >
                    <Plus size={13} />
                    <span>Phóng to</span>
                  </button>

                  <div className="h-4 w-px bg-[#ded6c9]" />

                  {/* Nút Xóa */}
                  <button
                    type="button"
                    onClick={handleRemoveSelected}
                    title="Xóa món đồ này khỏi phòng"
                    className="grid h-8 w-8 place-items-center rounded-xl bg-[#fdf2f0] text-[#a34131] transition hover:bg-[#fae1dd]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Floating Controls Bar ở góc dưới */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                <div className="rounded-xl border border-[#ded6c9]/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#254f43] shadow-sm backdrop-blur-md">
                  💡 Nhấp giữ chuột vào món đồ để kéo trượt trên sàn · Kéo khoảng trống để xoay phòng
                </div>

                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleToggleAutoRotate}
                    title={autoRotate ? "Tạm dừng tự xoay" : "Bật tự xoay 360°"}
                    className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition shadow-sm backdrop-blur-md ${
                      autoRotate
                        ? "border-[#2e6f5e] bg-[#2e6f5e] text-white"
                        : "border-[#ded6c9] bg-white/90 text-[#254f43] hover:bg-white"
                    }`}
                  >
                    {autoRotate ? <Pause size={14} /> : <Play size={14} />}
                    <span className="hidden sm:inline">Tự xoay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => resetCameraRef.current?.()}
                    title="Đặt lại góc nhìn trung tâm"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[#ded6c9] bg-white/90 text-[#254f43] shadow-sm backdrop-blur-md transition hover:bg-white"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[#ded6c9] bg-white/90 text-[#254f43] shadow-sm backdrop-blur-md transition hover:bg-white"
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Loading Overlay */}
              {modelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f7f3ec]/90 backdrop-blur-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dfe8d3] text-[#2e6f5e]">
                    <LoaderCircle size={28} className="animate-spin" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#254f43]">
                    Đang tải căn phòng 3D…
                  </h3>
                  <p className="mt-1 text-xs text-[#646a61]">
                    {loadProgress > 0 ? `Tiến trình: ${loadProgress}%` : "Giải nén mô hình không gian"}
                  </p>
                </div>
              )}

              {/* Error Overlay */}
              {modelError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fdf2f0]/95 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fddfdc] text-[#a34131]">
                    <Info size={24} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#a34131]">{modelError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2e6f5e] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#245747]"
                  >
                    <RefreshCw size={14} />
                    Tải lại phòng
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Furniture Catalog (Chọn sản phẩm để đưa vào phòng) */}
          <aside className="flex flex-col gap-6">
            {/* Catalog Box */}
            <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#708164]">
                  DANH SÁCH NỘI THẤT 3D
                </span>
                <span className="rounded-full bg-[#f0ede4] px-2 py-0.5 text-[10px] font-bold text-[#2e6f5e]">
                  {AVAILABLE_FURNITURE.length} mẫu có sẵn
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold text-[#254f43]">
                Thêm đồ vào phòng
              </h2>
              <p className="mt-1 text-xs text-[#646a61]">
                Bấm nút bên dưới để đặt món đồ vào căn phòng 3D của bạn:
              </p>

              {/* Danh sách các sản phẩm nội thất */}
              <div className="mt-5 flex flex-col gap-3">
                {AVAILABLE_FURNITURE.map((prod) => {
                  const isPlaced = placedList.some((p) => p.productId === prod.id);
                  return (
                    <div
                      key={prod.id}
                      className="flex flex-col gap-3 rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-3.5 transition hover:border-[#2e6f5e]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ded6c9] bg-white">
                          <Image
                            src={prod.thumbnailUrl}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold uppercase text-[#708164]">
                            {prod.category}
                          </span>
                          <h3 className="truncate text-sm font-bold text-[#254f43]">
                            {prod.name}
                          </h3>
                          <p className="text-xs font-bold text-[#2e6f5e]">
                            {prod.price.toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAddingModel}
                        onClick={() => handleAddFurnitureToRoom(prod)}
                        className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition shadow-sm ${
                          isPlaced
                            ? "bg-[#e8f1ec] text-[#2e6f5e] border border-[#2e6f5e]/30 hover:bg-[#d8e7e0]"
                            : "bg-[#2e6f5e] text-white hover:bg-[#245747]"
                        }`}
                      >
                        {isAddingModel ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Plus size={14} />
                        )}
                        <span>{isPlaced ? "Thêm thêm 1 chiếc nữa" : "Thêm vào phòng 3D"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danh sách các món đang có trong phòng */}
            {placedList.length > 0 && (
              <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-sm animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#708164]">
                    ĐANG TRONG PHÒNG ({placedList.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      furnitureGroupRef.current?.clear();
                      setPlacedList([]);
                      setSelectedInstanceId(null);
                      showToast("Đã dọn sạch phòng!");
                    }}
                    className="text-[11px] font-bold text-[#a34131] hover:underline"
                  >
                    Dọn tất cả
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {placedList.map((item, idx) => {
                    const isSelected = item.instanceId === selectedInstanceId;
                    return (
                      <div
                        key={item.instanceId}
                        onClick={() => setSelectedInstanceId(item.instanceId)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${
                          isSelected
                            ? "border-[#2e6f5e] bg-[#f0f6f3]"
                            : "border-[#ded6c9] bg-[#fbf9f4] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#dfe8d3] text-[10px] font-bold text-[#2e6f5e]">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#254f43]">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInstanceId(item.instanceId);
                              handleRotateSelected(45);
                            }}
                            title="Xoay 45°"
                            className="grid h-7 w-7 place-items-center rounded-lg border border-[#ded6c9] bg-white text-[#254f43] hover:bg-[#f0ece4]"
                          >
                            <RotateCw size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInstanceId(item.instanceId);
                              handleRemoveSelected();
                            }}
                            title="Xóa"
                            className="grid h-7 w-7 place-items-center rounded-lg bg-[#fdf2f0] text-[#a34131] hover:bg-[#f8d7d4]"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
