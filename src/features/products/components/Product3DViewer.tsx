"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Image as ImageIcon,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import ProductImage from "./ProductImage";

type Product3DViewerProps = {
  modelUrl: string;
  productName: string;
  previewImage?: string;
};

/**
 * Hiển thị mô hình 3D (.glb) tương tác 360° cho trang chi tiết sản phẩm,
 * kèm chuyển đổi nhanh giữa chế độ 3D và ảnh chụp sản phẩm (nếu có).
 */
export default function Product3DViewer({
  modelUrl,
  productName,
  previewImage,
}: Product3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const initialCameraPosRef = useRef(new THREE.Vector3(2.2, 1.4, 2.2));
  const autoRotateRef = useRef(true);

  const [viewMode, setViewMode] = useState<"3d" | "image">("3d");
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    if (viewMode !== "3d") {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    setIsLoading(true);
    setLoadProgress(0);
    setErrorMessage(null);

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f3ec);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 100);
    camera.position.copy(initialCameraPosRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Ánh sáng studio ấm dịu giúp tôn màu trắng/gỗ của nội thất
    const hemiLight = new THREE.HemisphereLight(0xfffdf8, 0xd8cfc2, 1.15);
    hemiLight.position.set(0, 6, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ed, 1.55);
    keyLight.position.set(3.5, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeef6f2, 0.65);
    fillLight.position.set(-4, 2.5, -3);
    scene.add(fillLight);

    // Đĩa nền đổ bóng nhẹ dưới chân mô hình
    const groundGeo = new THREE.CircleGeometry(2.6, 48);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(4.8, 16, 0xd8cfc2, 0xe8e0d2);
    gridHelper.position.y = -0.002;
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.1;
    controls.maxDistance = 6.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.4;
    controls.target.set(0, 0.45, 0);
    controls.update();
    controlsRef.current = controls;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let disposed = false;
    let loadedGroup: THREE.Group | null = null;

    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;

        const root = gltf.scene;
        const rawBox = new THREE.Box3().setFromObject(root);
        const size = rawBox.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;

        // Chuẩn hóa kích thước mô hình về ~1.8 đơn vị và đặt đáy chạm sàn y = 0
        const targetSize = 1.85;
        const scale = targetSize / maxAxis;
        root.scale.setScalar(scale);

        root.updateMatrixWorld(true);
        const scaledBox = new THREE.Box3().setFromObject(root);
        const center = scaledBox.getCenter(new THREE.Vector3());

        root.position.x -= center.x;
        root.position.z -= center.z;
        root.position.y -= scaledBox.min.y;

        root.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        loadedGroup = root;
        scene.add(root);

        const finalBox = new THREE.Box3().setFromObject(root);
        const finalCenter = finalBox.getCenter(new THREE.Vector3());
        const finalSize = finalBox.getSize(new THREE.Vector3());
        const fitDistance = Math.max(finalSize.x, finalSize.y, finalSize.z) * 1.45;

        const nextCamPos = new THREE.Vector3(
          fitDistance * 0.95,
          finalCenter.y + fitDistance * 0.52,
          fitDistance * 0.95,
        );
        initialCameraPosRef.current.copy(nextCamPos);
        camera.position.copy(nextCamPos);
        controls.target.copy(finalCenter);
        controls.update();

        setIsLoading(false);
      },
      (xhr) => {
        if (disposed || !xhr.total) return;
        setLoadProgress(Math.min(99, Math.round((xhr.loaded / xhr.total) * 100)));
      },
      () => {
        if (disposed) return;
        setErrorMessage("Không thể tải mô hình 3D của sản phẩm.");
        setIsLoading(false);
      },
    );

    const handleResize = () => {
      if (!container) return;
      const nextWidth = container.clientWidth || 640;
      const nextHeight = container.clientHeight || 480;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    window.addEventListener("resize", handleResize);

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (loadedGroup) {
        loadedGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((mat) => mat?.dispose?.());
          }
        });
      }
      groundGeo.dispose();
      groundMat.dispose();
      controls.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [modelUrl, viewMode]);

  const handleResetView = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.copy(initialCameraPosRef.current);
    controlsRef.current.update();
  };

  return (
    <div className="relative overflow-hidden rounded-md bg-[#f7f3ec]">
      <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2f6f5e] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
          <Box className="h-3.5 w-3.5" />
          3D Interactive
        </span>
        {previewImage && (
          <div className="inline-flex rounded-full border border-[#ded6c9] bg-white/95 p-0.5 shadow-sm backdrop-blur-sm">
            <button
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                viewMode === "3d"
                  ? "bg-[#2f6f5e] text-white"
                  : "text-[#51564f] hover:bg-[#f2ece1]"
              }`}
              onClick={() => setViewMode("3d")}
              type="button"
            >
              <Box className="h-3 w-3" />
              3D 360°
            </button>
            <button
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                viewMode === "image"
                  ? "bg-[#2f6f5e] text-white"
                  : "text-[#51564f] hover:bg-[#f2ece1]"
              }`}
              onClick={() => setViewMode("image")}
              type="button"
            >
              <ImageIcon className="h-3 w-3" />
              Hình ảnh
            </button>
          </div>
        )}
      </div>

      {viewMode === "3d" ? (
        <div className="relative aspect-[4/3] w-full">
          <div
            aria-label={`Mô hình 3D tương tác của ${productName}`}
            className="h-full w-full cursor-grab active:cursor-grabbing"
            ref={containerRef}
          />

          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#f7f3ec]/90 text-[#2f6f5e]">
              <LoaderCircle className="h-7 w-7 animate-spin" />
              <p className="text-xs font-bold">
                Đang tải mô hình 3D{loadProgress > 0 ? ` (${loadProgress}%)` : "..."}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#f7f3ec] px-4 text-center">
              <p className="text-sm font-semibold text-[#bc3d2b]">
                {errorMessage}
              </p>
              {previewImage && (
                <button
                  className="rounded-md bg-[#2f6f5e] px-3 py-1.5 text-xs font-bold text-white"
                  onClick={() => setViewMode("image")}
                  type="button"
                >
                  Xem ảnh sản phẩm
                </button>
              )}
            </div>
          )}

          {!isLoading && !errorMessage && (
            <>
              <div className="absolute bottom-3 left-3 z-20 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#51564f] shadow-sm backdrop-blur-sm">
                Kéo để xoay 360° · Cuộn để thu phóng
              </div>
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
                <button
                  aria-label={autoRotate ? "Tạm dừng xoay" : "Tự động xoay"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ded6c9] bg-white/95 text-[#2f6f5e] shadow-sm transition hover:bg-[#eef6f2]"
                  onClick={() => setAutoRotate((prev) => !prev)}
                  title={autoRotate ? "Tạm dừng xoay" : "Tự động xoay"}
                  type="button"
                >
                  {autoRotate ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  aria-label="Đặt lại góc nhìn 3D"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ded6c9] bg-white/95 text-[#2f6f5e] shadow-sm transition hover:bg-[#eef6f2]"
                  onClick={handleResetView}
                  title="Đặt lại góc nhìn"
                  type="button"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <ProductImage
          alt={productName}
          className="aspect-[4/3] w-full rounded-md object-cover"
          height={760}
          priority
          sizes="(min-width: 1024px) 54vw, 100vw"
          src={previewImage ?? ""}
          width={920}
        />
      )}
    </div>
  );
}
