"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Box,
  ChevronRight,
  Expand,
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
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { Showroom } from "../types";

const fallbackShowrooms: Showroom[] = [
  {
    _id: "6ae3671bda91875ce3b84a0d",
    title: "Phòng mẫu nội thất 3D (Tripo3D AI)",
    description:
      "Không gian nội thất hiện đại được tạo tự động bởi Tripo3D AI. Trải nghiệm xoay 360°, chạm để khám phá từng góc phòng.",
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
  const [error, setError] = useState<string>("");

  // 3D Canvas states
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string>("");
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // References for Three.js cleanup and controls
  const controlsRef = useRef<OrbitControls | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  // Fetch showrooms from API
  const fetchShowrooms = useCallback(async () => {
    setLoading(true);
    setError("");
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
      // Fallback
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

  // Initialize and Render Three.js Scene
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

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 1000);
    camera.position.set(6, 4.5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Clear previous canvas
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb0b8a6, 2.6);
    scene.add(hemiLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const sunLight1 = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight1.position.set(6, 12, 7);
    scene.add(sunLight1);

    const sunLight2 = new THREE.DirectionalLight(0xfff7ea, 1.6);
    sunLight2.position.set(-7, 8, -6);
    scene.add(sunLight2);

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

    // Load Model with DRACOLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let defaultCamPos = new THREE.Vector3(6, 4.5, 8);
    let defaultCamTarget = new THREE.Vector3(0, 0, 0);

    const modelUrl = activeShowroom.environmentModelUrl;

    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;
        const model = gltf.scene;
        modelGroup.add(model);

        // Center and fit camera
        const bbox = new THREE.Box3().setFromObject(modelGroup);
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
        console.error("Three.js Load error:", err);
        setModelError("Không thể tải mô hình 3D. Vui lòng kiểm tra kết nối mạng.");
        setModelLoading(false);
      },
    );

    resetCameraRef.current = () => {
      camera.position.copy(defaultCamPos);
      controls.target.copy(defaultCamTarget);
      controls.update();
    };

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
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [activeShowroom?.environmentModelUrl, autoRotate]);

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
            <span className="text-[#2e6f5e]">Phòng mẫu 3D</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ded6c9] bg-[#f2efe6] px-3 py-1 text-xs font-bold text-[#2e6f5e]">
                <Sparkles size={14} className="text-[#2e6f5e]" />
                TRIPO3D AI SHOWROOM
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#254f43] sm:text-4xl lg:text-5xl">
                Không gian nội thất 3D
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#646a61] sm:text-base">
                Trải nghiệm xoay 360 độ, thu phóng chi tiết từng món đồ nội thất sống động được kết nối trực tiếp từ hệ thống API DECOHO.
              </p>
            </div>

            {/* Room Selector if multiple */}
            {showrooms.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {showrooms.map((room) => {
                  const active = room._id === selectedId;
                  return (
                    <button
                      key={room._id}
                      type="button"
                      onClick={() => setSelectedId(room._id)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition sm:text-sm ${
                        active
                          ? "bg-[#2e6f5e] text-white shadow-sm"
                          : "border border-[#ded6c9] bg-white text-[#646a61] hover:border-[#2e6f5e] hover:text-[#2e6f5e]"
                      }`}
                    >
                      {room.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main 3D Experience Section */}
      <section className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          {/* Left: 3D Canvas Box */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-[#ded6c9] bg-[#f7f3ec] shadow-[0_12px_40px_rgba(37,60,46,0.06)]">
              {/* 3D Canvas Container */}
              <div
                ref={canvasContainerRef}
                className="relative h-[480px] w-full touch-none sm:h-[600px] lg:h-[680px]"
              />

              {/* Floating Controls Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                <div className="rounded-xl border border-[#ded6c9]/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#254f43] shadow-sm backdrop-blur-md">
                  Kéo để xoay 360° · Cuộn chuột hoặc chụm 2 ngón để thu phóng
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
                    Đang tải mô hình không gian 3D…
                  </h3>
                  <p className="mt-1 text-xs text-[#646a61]">
                    {loadProgress > 0 ? `Tiến trình: ${loadProgress}%` : "Giải nén mô hình Tripo3D Draco"}
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
                    Tải lại không gian
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Showroom Details & Linked Products */}
          <aside className="flex flex-col gap-6">
            {/* Info Card */}
            <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#708164]">
                THÔNG TIN PHÒNG MẪU
              </span>
              <h2 className="mt-2 text-xl font-bold text-[#254f43]">
                {activeShowroom?.title ?? "Phòng mẫu 3D"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#646a61]">
                {activeShowroom?.description ?? "Không gian nội thất trải nghiệm đa chiều."}
              </p>

              <div className="mt-5 border-t border-[#f0ece4] pt-4 flex flex-col gap-2.5 text-xs text-[#646a61]">
                <div className="flex justify-between">
                  <span>Trạng thái kết nối</span>
                  <span className="font-bold text-[#2e6f5e]">Trực tiếp qua API Render</span>
                </div>
                <div className="flex justify-between">
                  <span>Công nghệ dựng hình</span>
                  <span className="font-medium text-[#254f43]">Three.js WebGL & Tripo3D</span>
                </div>
                <div className="flex justify-between">
                  <span>Định dạng mô hình</span>
                  <span className="font-medium text-[#254f43]">GLB (Draco Compressed)</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/products"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2e6f5e] text-sm font-bold text-white shadow-sm transition hover:bg-[#245747]"
                >
                  <ShoppingBag size={16} />
                  Khám phá toàn bộ sản phẩm
                </Link>
                <Link
                  href="/product-space"
                  className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[#ded6c9] bg-[#fbf9f4] text-xs font-bold text-[#2e6f5e] transition hover:bg-[#f2efe6]"
                >
                  Xem bộ sưu tập Moodboard
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Linked items inside showroom if any */}
            {activeShowroom?.items && activeShowroom.items.length > 0 && (
              <div className="rounded-3xl border border-[#ded6c9] bg-white p-6 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#708164]">
                  SẢN PHẨM TRONG KHÔNG GIAN ({activeShowroom.items.length})
                </span>
                <div className="mt-4 flex flex-col gap-3">
                  {activeShowroom.items.map((item) => {
                    const prod = typeof item.productId === "object" ? item.productId : null;
                    const prodId = typeof item.productId === "string" ? item.productId : item.productId._id;
                    return (
                      <Link
                        key={item._id}
                        href={`/products/${prodId}`}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-[#ded6c9] p-3 transition hover:border-[#2e6f5e] hover:bg-[#fbf9f4]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prod?.image && (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#ded6c9] bg-[#f7f3ec]">
                              <Image
                                src={prod.image}
                                alt={prod.name ?? "Sản phẩm"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="truncate text-xs font-bold text-[#254f43] group-hover:text-[#2e6f5e]">
                              {prod?.name ?? "Sản phẩm nội thất"}
                            </h4>
                            {prod?.price && (
                              <p className="mt-0.5 text-xs font-semibold text-[#2e6f5e]">
                                {prod.price.toLocaleString("vi-VN")} ₫
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#a4ab9f] group-hover:text-[#2e6f5e] shrink-0" />
                      </Link>
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
