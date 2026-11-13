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
  Copy,
  X,
  RotateCw,
  Move,
  Compass,
  Grid,
  Layers,
  Eye,
  CheckCircle2,
  Save,
  FolderOpen,
  Cloud,
  HardDrive,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { Showroom } from "../types";
import {
  deleteSavedShowroomDesign,
  listSavedShowroomDesigns,
  saveShowroomDesign,
  type SavedDesignItem,
  type SavedShowroomDesign,
} from "../services/showroomDesignService";

// Cao độ chuẩn của bề mặt sàn gỗ căn phòng mẫu
const FLOOR_Y = 0.055;

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
  suggestedScale: number;
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
    suggestedScale: 0.36, // Chiếm ~35% diện tích phòng chuẩn Coohom
  },
  {
    id: "desk-wooden-minimal",
    name: "Bàn làm việc gỗ Minimal",
    category: "Bàn ghế",
    price: 6800000,
    modelUrl: "https://res.cloudinary.com/djzzwjznn/raw/upload/v1793449853/decoho/furniture/wooden-desk-1793449848354.glb",
    thumbnailUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
    dimensions: "120 x 60 x 75 cm",
    material: "Gỗ sồi tự nhiên hoàn thiện mờ, ngăn kéo âm",
    suggestedScale: 0.28,
  },
  {
    id: "6ae35877c250c39b342117d4",
    name: "Bàn Học Hiện Đại Chân Trụ Tròn",
    category: "Bàn ghế",
    price: 366221,
    modelUrl: "https://res.cloudinary.com/djzzwjznn/raw/upload/v1794401937/decoho/furniture/ban-hoc-chan-tru-tron-1794401933401.glb",
    thumbnailUrl: "https://res.cloudinary.com/djzzwjznn/image/upload/v1793284208/decoho/products/prlemz516zsllko9xkkz.webp",
    dimensions: "120 x 60 x 75 cm",
    material: "Gỗ công nghiệp MDF phủ melamine trắng, chân trụ tròn",
    suggestedScale: 0.28,
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
    title: "Phòng mẫu nội thất 3D (Coohom Style)",
    description:
      "Không gian nội thất hiện đại với kích thước và tỉ lệ chuẩn. Trải nghiệm xoay 360°, đổi góc nhìn mặt bằng từ trên xuống, kéo thả và sắp đặt giường ngủ, bàn làm việc tự do.",
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
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"perspective" | "topdown">("perspective");

  // Danh sách đồ đã đặt trong phòng & món đồ đang chọn
  const [placedList, setPlacedList] = useState<PlacedFurniture[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [isAddingModel, setIsAddingModel] = useState<boolean>(false);
  const [userNotification, setUserNotification] = useState<string>("");
  const [savedDesigns, setSavedDesigns] = useState<SavedShowroomDesign[]>([]);
  const [activeDesign, setActiveDesign] = useState<SavedShowroomDesign | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDesignsDrawer, setShowDesignsDrawer] = useState(false);
  const [designNameInput, setDesignNameInput] = useState("");
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const pendingDesignRef = useRef<SavedShowroomDesign | null>(null);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const furnitureGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  // Tương tác kéo thả trên sàn (Drag)
  const isDraggingRef = useRef<boolean>(false);
  const draggedObjectRef = useRef<THREE.Object3D | null>(null);
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const floorPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y));
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

  const refreshSavedDesigns = useCallback(async () => {
    const designs = await listSavedShowroomDesigns();
    setSavedDesigns(designs);
  }, []);

  useEffect(() => {
    void fetchShowrooms();
    void refreshSavedDesigns();
  }, [fetchShowrooms, refreshSavedDesigns]);

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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 1000);
    camera.position.set(2.4, 2.0, 2.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb8beaf, 2.5);
    scene.add(hemiLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const sun1 = new THREE.DirectionalLight(0xffffff, 2.6);
    sun1.position.set(5, 10, 6);
    scene.add(sun1);

    const sun2 = new THREE.DirectionalLight(0xfff7ea, 1.6);
    sun2.position.set(-6, 8, -5);
    scene.add(sun2);

    // Lưới thiết kế kiến trúc CAD (Floor Design Grid like Coohom)
    const gridHelper = new THREE.GridHelper(3.2, 32, 0x2e6f5e, 0xded6c9);
    gridHelper.position.set(0, FLOOR_Y + 0.001, 0);
    gridHelper.visible = showGrid;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Khung định vị CAD ôm sát sản phẩm khi chọn (Selection BoxHelper)
    const selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0x2e6f5e);
    selectionBox.visible = false;
    scene.add(selectionBox);
    selectionBoxRef.current = selectionBox;

    // Group chứa đồ nội thất kéo thả
    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);
    furnitureGroupRef.current = furnitureGroup;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.minDistance = 0.6;
    controls.maxDistance = 30;
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

    let defaultCamPos = new THREE.Vector3(2.4, 2.0, 2.6);
    let defaultCamTarget = new THREE.Vector3(0, 0.2, 0);

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
          const distance = Math.max(maxDim * 1.6, 2.4);

          controls.target.copy(center);
          camera.position.set(center.x + distance * 0.75, center.y + distance * 0.65, center.z + distance * 0.85);
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
      setViewMode("perspective");
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
          // Tìm root container Object3D của item trong furnitureGroup
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
          const rawX = planeIntersect.x - dragOffsetRef.current.x;
          const rawZ = planeIntersect.z - dragOffsetRef.current.z;

          // Giới hạn đồ vật không trượt ra khỏi sàn phòng (-0.38m đến +0.38m)
          const newX = Math.max(-0.38, Math.min(0.38, rawX));
          const newZ = Math.max(-0.38, Math.min(0.38, rawZ));

          draggedObjectRef.current.position.x = newX;
          draggedObjectRef.current.position.y = FLOOR_Y; // Luôn neo chuẩn trên bề mặt sàn
          draggedObjectRef.current.position.z = newZ;
          if (selectionBoxRef.current && selectionBoxRef.current.visible) {
            selectionBoxRef.current.setFromObject(draggedObjectRef.current);
          }

          // Cập nhật state
          const instId = draggedObjectRef.current.userData.instanceId;
          setPlacedList((prev) =>
            prev.map((item) =>
              item.instanceId === instId
                ? { ...item, position: [newX, FLOOR_Y, newZ] }
                : item,
            ),
          );
        }
      } else {
        // Thay đổi con trỏ chuột thành grab khi rê vào đồ vật
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
  }, [activeShowroom?.environmentModelUrl, autoRotate, showGrid]);

  // CHUYỂN ĐỔI CHẾ ĐỘ XEM (VIEW MODES LIKE COOHOM)
  const handleChangeViewMode = (mode: "perspective" | "topdown") => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setViewMode(mode);

    if (mode === "topdown") {
      // Góc nhìn mặt bằng từ trên xuống thẳng góc (Top-down floor plan view như Coohom)
      camera.position.set(0.001, 3.2, 0.001);
      controls.target.set(0, FLOOR_Y, 0);
      controls.update();
      showToast("Chế độ Mặt bằng (Top-down) như Coohom");
    } else {
      // Góc nhìn 3D phối cảnh nghiêng (Perspective 3D)
      camera.position.set(2.4, 2.0, 2.6);
      controls.target.set(0, 0.2, 0);
      controls.update();
      showToast("Chế độ 3D Phối cảnh không gian");
    }
  };

  // Toggle lưới CAD thiết kế
  const handleToggleGrid = () => {
    setShowGrid((prev) => {
      const next = !prev;
      if (gridHelperRef.current) gridHelperRef.current.visible = next;
      showToast(next ? "Đã bật lưới mặt sàn CAD" : "Đã ẩn lưới sàn");
      return next;
    });
  };

  const clearPlacedFurnitureObjects = useCallback(() => {
    const furnitureGroup = furnitureGroupRef.current;
    if (furnitureGroup) {
      while (furnitureGroup.children.length > 0) {
        const child = furnitureGroup.children[0];
        furnitureGroup.remove(child);
        child.traverse((o: any) => {
          o.geometry?.dispose();
          if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m: any) => m?.dispose?.());
          }
        });
      }
    }
    setPlacedList([]);
    setSelectedInstanceId(null);
  }, []);

  const placeModelIntoRoom = useCallback((item: SavedDesignItem) => {
    const furnitureGroup = furnitureGroupRef.current;
    if (!furnitureGroup) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        item.modelUrl,
        (gltf) => {
          const rawModel = gltf.scene;
          rawModel.updateMatrixWorld(true);
          const rawBox = new THREE.Box3().setFromObject(rawModel);
          const rawCenter = rawBox.getCenter(new THREE.Vector3());
          const rawMin = rawBox.min;
          rawModel.position.set(-rawCenter.x, -rawMin.y, -rawCenter.z);

          const itemContainer = new THREE.Group();
          itemContainer.add(rawModel);
          itemContainer.scale.set(item.scale, item.scale, item.scale);
          itemContainer.position.set(item.position[0], item.position[1], item.position[2]);
          itemContainer.rotation.y = item.rotationY;
          itemContainer.userData = {
            instanceId: item.instanceId,
            productId: item.productId,
            name: item.name,
            scale: item.scale,
          };

          furnitureGroup.add(itemContainer);
          dracoLoader.dispose();
          resolve();
        },
        undefined,
        (err) => {
          dracoLoader.dispose();
          reject(err);
        },
      );
    });
  }, []);

  const applySavedDesignToScene = useCallback(async (design: SavedShowroomDesign) => {
    clearPlacedFurnitureObjects();
    setIsAddingModel(true);
    showToast(`Đang mở thiết kế "${design.name}"...`);
    try {
      await Promise.all(design.items.map((item) => placeModelIntoRoom(item)));
      setPlacedList(design.items.map((item) => ({ ...item })));
      setActiveDesign(design);
      setShowDesignsDrawer(false);
      showToast(`Đã tải thiết kế "${design.name}" (${design.items.length} món)!`);
    } catch {
      showToast("Một số mô hình trong thiết kế chưa thể tải lại.");
    } finally {
      setIsAddingModel(false);
    }
  }, [clearPlacedFurnitureObjects, placeModelIntoRoom]);

  useEffect(() => {
    if (!modelLoading && pendingDesignRef.current && furnitureGroupRef.current) {
      const pending = pendingDesignRef.current;
      pendingDesignRef.current = null;
      void applySavedDesignToScene(pending);
    }
  }, [modelLoading, applySavedDesignToScene]);

  const captureCurrentDesignItems = (): SavedDesignItem[] => {
    const furnitureGroup = furnitureGroupRef.current;
    return placedList.map((item) => {
      const obj = furnitureGroup?.children.find((c) => c.userData?.instanceId === item.instanceId);
      if (!obj) return item;
      return {
        ...item,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotationY: obj.rotation.y,
        scale: obj.scale.x,
      };
    });
  };

  const handleOpenSaveModal = () => {
    if (placedList.length === 0) {
      showToast("Hãy đặt ít nhất 1 món nội thất vào phòng trước khi lưu.");
      return;
    }
    setDesignNameInput(activeDesign?.name || `${activeShowroom?.title || "Phòng 3D"} (${placedList.length} món)`);
    setShowSaveModal(true);
  };

  const handleSaveDesign = async (saveAsNew: boolean) => {
    const trimmedName = designNameInput.trim();
    if (!trimmedName) {
      showToast("Vui lòng nhập tên cho bản thiết kế.");
      return;
    }
    setIsSavingDesign(true);
    try {
      const items = captureCurrentDesignItems();
      const saved = await saveShowroomDesign({
        designId: !saveAsNew ? activeDesign?._id : undefined,
        designSource: !saveAsNew ? activeDesign?.source : undefined,
        name: trimmedName,
        showroomId: activeShowroom?._id || "default-room",
        showroomName: activeShowroom?.title || "Phòng mẫu 3D",
        items,
      });
      setActiveDesign(saved);
      await refreshSavedDesigns();
      setShowSaveModal(false);
      showToast(
        saved.source === "cloud"
          ? `Đã lưu thiết kế "${saved.name}" lên tài khoản!`
          : `Đã lưu "${saved.name}" trên trình duyệt (đăng nhập để đồng bộ).`,
      );
    } catch {
      showToast("Không thể lưu thiết kế lúc này. Vui lòng thử lại.");
    } finally {
      setIsSavingDesign(false);
    }
  };

  const handleSelectSavedDesign = (design: SavedShowroomDesign) => {
    if (design.showroomId && design.showroomId !== selectedId && showrooms.some((r) => r._id === design.showroomId)) {
      pendingDesignRef.current = design;
      setSelectedId(design.showroomId);
      setShowDesignsDrawer(false);
      return;
    }
    void applySavedDesignToScene(design);
  };

  const handleDeleteSavedDesign = async (design: SavedShowroomDesign) => {
    try {
      await deleteSavedShowroomDesign(design._id, design.source);
      if (activeDesign?._id === design._id) setActiveDesign(null);
      await refreshSavedDesigns();
      showToast(`Đã xóa thiết kế "${design.name}".`);
    } catch {
      showToast("Không thể xóa thiết kế.");
    }
  };

  // HÀM: Thêm sản phẩm vào căn phòng 3D (Chuẩn hóa tâm & đáy chạm sàn chuẩn Coohom)
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
        const rawModel = gltf.scene;
        const instanceId = `placed-${Date.now()}`;

        // 1. Tính toán Bounding Box gốc của model để căn chỉnh đáy và tâm
        rawModel.updateMatrixWorld(true);
        const rawBox = new THREE.Box3().setFromObject(rawModel);
        const rawCenter = rawBox.getCenter(new THREE.Vector3());
        const rawMin = rawBox.min;

        // 2. Dịch chuyển rawModel bên trong sao cho:
        //    - Đáy (min.y) nằm đúng tại y = 0
        //    - Tâm X và Z nằm tại (0, 0) để khi xoay sẽ quay tròn quanh tâm chính xác
        rawModel.position.set(-rawCenter.x, -rawMin.y, -rawCenter.z);

        // 3. Đưa rawModel vào một wrapper Group riêng
        const itemContainer = new THREE.Group();
        itemContainer.add(rawModel);

        // 4. Đặt scale chuẩn tương quan theo Coohom:
        //    Phòng rộng ~1.0m, giường ~36% phòng, bàn làm việc ~28% phòng
        const initialScale = product.suggestedScale ?? 0.35;
        itemContainer.scale.set(initialScale, initialScale, initialScale);

        // 5. Đặt itemContainer lên đúng cao độ mặt sàn gỗ phòng (FLOOR_Y)
        //    Đặt lệch nhẹ nếu đã có món khác trong phòng để không chồng lên nhau
        const offsetMultiplier = placedList.length;
        const posX = offsetMultiplier % 2 === 0 ? -0.08 : 0.12;
        const posZ = offsetMultiplier === 0 ? -0.05 : 0.10;
        itemContainer.position.set(posX, FLOOR_Y, posZ);

        // Lưu metadata
        itemContainer.userData = {
          instanceId,
          productId: product.id,
          name: product.name,
          scale: initialScale,
        };

        furnitureGroup.add(itemContainer);

        const newPlaced: PlacedFurniture = {
          instanceId,
          productId: product.id,
          name: product.name,
          modelUrl: product.modelUrl,
          position: [posX, FLOOR_Y, posZ],
          rotationY: 0,
          scale: initialScale,
        };

        setPlacedList((prev) => [...prev, newPlaced]);
        setSelectedInstanceId(instanceId);
        setIsAddingModel(false);
        showToast(`Đã thêm ${product.name}! Kéo chuột để di chuyển trên sàn.`);
      },
      undefined,
      (err) => {
        console.error("Lỗi load model sản phẩm:", err);
        setIsAddingModel(false);
        showToast("Không thể tải mô hình 3D này. Vui lòng thử lại.");
      },
    );
  };

    // Cập nhật khung viền 3D định vị (BoxHelper) khi chọn sản phẩm
  useEffect(() => {
    const box = selectionBoxRef.current;
    const group = furnitureGroupRef.current;
    if (!box || !group) return;

    if (!selectedInstanceId) {
      box.visible = false;
      return;
    }

    const target = group.children.find(
      (c) => c.userData?.instanceId === selectedInstanceId,
    );
    if (target) {
      box.setFromObject(target);
      box.visible = true;
    } else {
      box.visible = false;
    }
  }, [selectedInstanceId, placedList]);

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
    if (selectionBoxRef.current) {
      selectionBoxRef.current.setFromObject(targetObj);
    }

    setPlacedList((prev) =>
      prev.map((item) =>
        item.instanceId === selectedInstanceId
          ? { ...item, rotationY: targetObj.rotation.y }
          : item,
      ),
    );
  };

  // HÀM: Chỉnh kích thước (Scale) - Đáy luôn neo chặt trên sàn FLOOR_Y
  const handleScaleSelected = (factor: number) => {
    if (!selectedInstanceId) return;
    const furnitureGroup = furnitureGroupRef.current;
    if (!furnitureGroup) return;

    const targetObj = furnitureGroup.children.find(
      (c) => c.userData?.instanceId === selectedInstanceId,
    );
    if (!targetObj) return;

    const currentScale = targetObj.scale.x;
    // Giới hạn scale từ 0.20 đến 0.65 để luôn giữ tỉ lệ thẩm mỹ chuẩn với căn phòng
    const newScale = Math.min(0.65, Math.max(0.20, currentScale * factor));
    targetObj.scale.set(newScale, newScale, newScale);
    targetObj.userData.scale = newScale;

    // Đáy của itemContainer luôn ở y = 0 trong local space, nên targetObj.position.y = FLOOR_Y giữ đáy trên mặt sàn gỗ
    targetObj.position.y = FLOOR_Y;
    if (selectionBoxRef.current) {
      selectionBoxRef.current.setFromObject(targetObj);
    }

    setPlacedList((prev) =>
      prev.map((item) =>
        item.instanceId === selectedInstanceId
          ? { ...item, scale: newScale, position: [targetObj.position.x, FLOOR_Y, targetObj.position.z] }
          : item,
      ),
    );
  };

    // HÀM: Nhân bản món đồ đang chọn
  const handleDuplicateSelected = () => {
    if (!selectedItemData) return;
    const prod = AVAILABLE_FURNITURE.find((p) => p.id === selectedItemData.productId);
    if (prod) {
      handleAddFurnitureToRoom(prod);
      showToast(`Đã nhân bản ${prod.name}`);
    }
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
                COOHOM-STYLE 3D ROOM PLANNER
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#254f43] sm:text-4xl lg:text-5xl">
                Bố trí nội thất 3D vào căn phòng
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#646a61] sm:text-base">
                Kéo thả giường ngủ, bàn ghế vào phòng · Tỉ lệ tương quan chuẩn xác · Hỗ trợ chuyển đổi góc nhìn 3D và Mặt bằng (Top-down) chuyên nghiệp.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowDesignsDrawer(true)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#ded6c9] bg-white px-4 text-xs font-bold text-[#254f43] shadow-sm transition hover:border-[#2e6f5e] hover:bg-[#f2efe6]"
              >
                <FolderOpen size={15} className="text-[#2e6f5e]" />
                <span>Thiết kế đã lưu ({savedDesigns.length})</span>
              </button>
              <button
                type="button"
                onClick={handleOpenSaveModal}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#2e6f5e] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#25594b] active:scale-[0.98]"
              >
                <Save size={15} />
                <span>{activeDesign ? "Lưu / Cập nhật 3D" : "Lưu thiết kế 3D"}</span>
              </button>
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
                className="relative h-[520px] w-full touch-none sm:h-[640px] lg:h-[720px]"
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
                <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ded6c9]/95 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 sm:left-6 sm:right-auto sm:max-w-2xl">
                  {/* Thông tin món đồ */}
                  <div className="flex items-center gap-3">
                    {(() => {
                      const prod = AVAILABLE_FURNITURE.find((p) => p.id === selectedItemData.productId);
                      return prod?.thumbnailUrl ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#ded6c9] bg-white shadow-xs">
                          <Image
                            src={prod.thumbnailUrl}
                            alt={selectedItemData.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : null;
                    })()}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#2e6f5e] animate-pulse" />
                        <h4 className="max-w-[140px] truncate text-xs font-bold text-[#254f43] sm:max-w-[180px]">
                          {selectedItemData.name}
                        </h4>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        {(() => {
                          const prod = AVAILABLE_FURNITURE.find((p) => p.id === selectedItemData.productId);
                          return (
                            <>
                              {prod && (
                                <span className="text-[11px] font-bold text-[#2e6f5e]">
                                  {prod.price.toLocaleString("vi-VN")} ₫
                                </span>
                              )}
                              <span className="rounded-md bg-[#f2efe6] px-1.5 py-0.2 text-[10px] font-semibold text-[#708164]">
                                Tỉ lệ {Math.round((selectedItemData.scale / (prod?.suggestedScale || 0.35)) * 100)}%
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Nhóm công cụ thao tác nhanh */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Nhóm xoay */}
                    <div className="flex items-center rounded-xl border border-[#ded6c9] bg-[#fbf9f4] p-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleRotateSelected(-45)}
                        title="Xoay trái -45°"
                        className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-[#254f43] transition hover:bg-white hover:shadow-xs active:scale-95"
                      >
                        <RotateCcw size={12} className="text-[#2e6f5e]" />
                        <span>-45°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotateSelected(45)}
                        title="Xoay phải +45°"
                        className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-[#254f43] transition hover:bg-white hover:shadow-xs active:scale-95"
                      >
                        <RotateCw size={12} className="text-[#2e6f5e]" />
                        <span>+45°</span>
                      </button>
                    </div>

                    {/* Nhóm kích thước */}
                    <div className="flex items-center rounded-xl border border-[#ded6c9] bg-[#fbf9f4] p-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleScaleSelected(0.9)}
                        title="Thu nhỏ món đồ (-10%)"
                        className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-[#254f43] transition hover:bg-white hover:shadow-xs active:scale-95"
                      >
                        <Minus size={12} className="text-[#2e6f5e]" />
                        <span className="hidden sm:inline">Thu nhỏ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScaleSelected(1.1)}
                        title="Phóng to món đồ (+10%)"
                        className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-[#254f43] transition hover:bg-white hover:shadow-xs active:scale-95"
                      >
                        <Plus size={12} className="text-[#2e6f5e]" />
                        <span className="hidden sm:inline">Phóng to</span>
                      </button>
                    </div>

                    {/* Nút nhân bản */}
                    <button
                      type="button"
                      onClick={handleDuplicateSelected}
                      title="Nhân bản thêm 1 chiếc tương tự"
                      className="flex h-8 items-center gap-1 rounded-xl border border-[#ded6c9] bg-[#fbf9f4] px-2.5 text-[11px] font-bold text-[#254f43] transition hover:bg-white hover:shadow-xs active:scale-95"
                    >
                      <Copy size={12} className="text-[#2e6f5e]" />
                      <span className="hidden sm:inline">Nhân bản</span>
                    </button>

                    {/* Nút xóa */}
                    <button
                      type="button"
                      onClick={handleRemoveSelected}
                      title="Xóa món đồ này khỏi phòng"
                      className="grid h-8 w-8 place-items-center rounded-xl border border-[#e8ceca] bg-[#fdf2f0] text-[#a34131] transition hover:bg-[#fae1dd] hover:border-[#a34131]/30 active:scale-95"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Nút bỏ chọn */}
                    <button
                      type="button"
                      onClick={() => setSelectedInstanceId(null)}
                      title="Bỏ chọn / Đóng thanh công cụ"
                      className="grid h-8 w-8 place-items-center rounded-xl border border-transparent text-[#708164] transition hover:border-[#ded6c9] hover:bg-[#f2efe6] active:scale-95"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Thanh Chế Độ Xem & Công Cụ Coohom Style ở góc dưới */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                {/* Chế độ xem Coohom: 3D / Mặt bằng (Top-down) */}
                <div className="flex items-center gap-1.5 rounded-2xl border border-[#ded6c9]/90 bg-white/95 p-1.5 shadow-md backdrop-blur-md pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => handleChangeViewMode("perspective")}
                    className={`flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${
                      viewMode === "perspective"
                        ? "bg-[#2e6f5e] text-white shadow-sm"
                        : "text-[#254f43] hover:bg-[#f0ede4]"
                    }`}
                  >
                    <Box size={14} />
                    <span>3D Phối cảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeViewMode("topdown")}
                    className={`flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${
                      viewMode === "topdown"
                        ? "bg-[#2e6f5e] text-white shadow-sm"
                        : "text-[#254f43] hover:bg-[#f0ede4]"
                    }`}
                  >
                    <Layers size={14} />
                    <span>Mặt bằng (Top-down)</span>
                  </button>

                  <div className="h-4 w-px bg-[#ded6c9]" />

                  <button
                    type="button"
                    onClick={handleToggleGrid}
                    title="Bật/Tắt Lưới sàn thiết kế CAD"
                    className={`flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition ${
                      showGrid
                        ? "bg-[#e8f1ec] text-[#2e6f5e]"
                        : "text-[#646a61] hover:bg-[#f0ede4]"
                    }`}
                  >
                    <Grid size={13} />
                    <span className="hidden sm:inline">Lưới sàn</span>
                  </button>
                </div>

                {/* Các nút công cụ bổ trợ */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleToggleAutoRotate}
                    title={autoRotate ? "Tạm dừng tự xoay" : "Bật tự xoay 360°"}
                    className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition shadow-sm backdrop-blur-md ${
                      autoRotate
                        ? "border-[#2e6f5e] bg-[#2e6f5e] text-white"
                        : "border-[#ded6c9] bg-white/95 text-[#254f43] hover:bg-white"
                    }`}
                  >
                    {autoRotate ? <Pause size={14} /> : <Play size={14} />}
                    <span className="hidden sm:inline">Tự xoay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => resetCameraRef.current?.()}
                    title="Đặt lại góc nhìn chuẩn"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[#ded6c9] bg-white/95 text-[#254f43] shadow-sm backdrop-blur-md transition hover:bg-white"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[#ded6c9] bg-white/95 text-[#254f43] shadow-sm backdrop-blur-md transition hover:bg-white"
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

            {/* Bảng Thông số Không gian chuẩn Coohom (Floor Info Card) */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#ded6c9] bg-white/90 px-5 py-3 shadow-sm">
              <div className="flex items-center gap-6 text-xs text-[#646a61]">
                <div>
                  <span className="font-semibold">Khu vực phòng:</span>{" "}
                  <strong className="text-[#254f43]">~25 m² (Tỉ lệ chuẩn 1:1)</strong>
                </div>
                <div className="hidden sm:block h-3 w-px bg-[#ded6c9]" />
                <div>
                  <span className="font-semibold">Chiều cao trần:</span>{" "}
                  <strong className="text-[#254f43]">2800 mm</strong>
                </div>
                <div className="hidden sm:block h-3 w-px bg-[#ded6c9]" />
                <div>
                  <span className="font-semibold">Đang bố trí:</span>{" "}
                  <strong className="text-[#2e6f5e]">{placedList.length} món đồ</strong>
                </div>
              </div>
              <div className="text-[11px] font-medium text-[#708164]">
                💡 Bấm giữ chuột để kéo di chuyển trên sàn · Nhấp góc ngoài để xoay phòng
              </div>
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
                          <p className="text-[11px] text-[#80897b]">
                            {prod.dimensions}
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
                    const prod = AVAILABLE_FURNITURE.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={item.instanceId}
                        onClick={() => setSelectedInstanceId(isSelected ? null : item.instanceId)}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-2xl border p-2.5 transition ${
                          isSelected
                            ? "border-[#2e6f5e] bg-[#f0f6f3] shadow-xs ring-2 ring-[#2e6f5e]/20"
                            : "border-[#ded6c9] bg-[#fbf9f4] hover:border-[#2e6f5e]/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {prod?.thumbnailUrl ? (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#ded6c9] bg-white">
                              <Image
                                src={prod.thumbnailUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#dfe8d3] text-xs font-bold text-[#2e6f5e]">
                              {idx + 1}
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {isSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#2e6f5e] animate-pulse" />
                              )}
                              <h4 className="truncate text-xs font-bold text-[#254f43]">
                                {item.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-[#708164]">
                              {prod ? `${prod.price.toLocaleString("vi-VN")} ₫` : `Món số ${idx + 1}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInstanceId(item.instanceId);
                              handleRotateSelected(45);
                            }}
                            title="Xoay +45°"
                            className="grid h-7 w-7 place-items-center rounded-lg border border-[#ded6c9] bg-white text-[#254f43] transition hover:bg-[#f0ece4] active:scale-95"
                          >
                            <RotateCw size={12} className="text-[#2e6f5e]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInstanceId(item.instanceId);
                              handleRemoveSelected();
                            }}
                            title="Xóa"
                            className="grid h-7 w-7 place-items-center rounded-lg border border-[#e8ceca] bg-[#fdf2f0] text-[#a34131] transition hover:bg-[#fae1dd] active:scale-95"
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

      {/* Modal Lưu thiết kế 3D */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#254f43]">Lưu thiết kế phòng mẫu 3D</h3>
              <button type="button" onClick={() => setShowSaveModal(false)} className="rounded-xl p-1.5 text-[#646a61] hover:bg-[#f2efe6]">
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-xs text-[#646a61]">
              Lưu lại vị trí, góc xoay và kích thước của {placedList.length} món nội thất trong phòng "{activeShowroom?.title}".
            </p>
            <label className="mt-4 block text-xs font-bold text-[#254f43]">Tên bản thiết kế</label>
            <input
              type="text"
              value={designNameInput}
              onChange={(e) => setDesignNameInput(e.target.value)}
              placeholder="Ví dụ: Phòng ngủ tối giản của tôi"
              className="mt-1.5 h-11 w-full rounded-xl border border-[#ded6c9] bg-[#fcfaf6] px-3.5 text-sm text-[#254f43] outline-none focus:border-[#2e6f5e]"
            />
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={isSavingDesign}
                onClick={() => setShowSaveModal(false)}
                className="h-10 rounded-xl border border-[#ded6c9] px-4 text-xs font-bold text-[#646a61] hover:bg-[#f2efe6]"
              >
                Hủy
              </button>
              {activeDesign && (
                <button
                  type="button"
                  disabled={isSavingDesign}
                  onClick={() => void handleSaveDesign(false)}
                  className="h-10 rounded-xl border border-[#2e6f5e] bg-[#eef6f2] px-4 text-xs font-bold text-[#2e6f5e] hover:bg-[#dfeee7]"
                >
                  Cập nhật bản hiện tại
                </button>
              )}
              <button
                type="button"
                disabled={isSavingDesign}
                onClick={() => void handleSaveDesign(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#2e6f5e] px-5 text-xs font-bold text-white hover:bg-[#25594b] disabled:opacity-60"
              >
                {isSavingDesign && <LoaderCircle size={14} className="animate-spin" />}
                <span>{activeDesign ? "Lưu thành bản mới" : "Lưu thiết kế"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Danh sách thiết kế đã lưu */}
      {showDesignsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee7dc] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#254f43]">Thiết kế 3D đã lưu</h3>
                <p className="text-xs text-[#646a61]">Chọn một bản thiết kế để mở lại bố cục nội thất trong phòng 3D.</p>
              </div>
              <button type="button" onClick={() => setShowDesignsDrawer(false)} className="rounded-xl p-1.5 text-[#646a61] hover:bg-[#f2efe6]">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
              {savedDesigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ded6c9] bg-[#fcfaf6] p-8 text-center text-sm text-[#646a61]">
                  Chưa có thiết kế nào được lưu. Hãy thêm đồ vào phòng và bấm <strong>Lưu thiết kế 3D</strong>.
                </div>
              ) : (
                savedDesigns.map((design) => (
                  <div key={design._id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#ded6c9] bg-[#fcfaf6] p-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-bold text-[#254f43]">{design.name}</h4>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#646a61] border border-[#ded6c9]">
                          {design.source === "cloud" ? <Cloud size={10} className="text-[#2e6f5e]" /> : <HardDrive size={10} />}
                          {design.source === "cloud" ? "Tài khoản" : "Trình duyệt"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#646a61]">
                        {design.showroomName} · {design.items.length} món đồ · {new Date(design.updatedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectSavedDesign(design)}
                        className="h-9 rounded-xl bg-[#2e6f5e] px-3.5 text-xs font-bold text-white hover:bg-[#25594b]"
                      >
                        Mở
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteSavedDesign(design)}
                        title="Xóa thiết kế"
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[#e8ceca] bg-[#fdf2f0] text-[#a34131] hover:bg-[#fae1dd]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

