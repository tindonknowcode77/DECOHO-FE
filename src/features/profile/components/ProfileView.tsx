"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Armchair,
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Box,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Cloud,
  Compass,
  Edit3,
  Eye,
  EyeOff,
  Frame,
  HardDrive,
  Heart,
  Home,
  ImageIcon,
  LampFloor,
  Leaf,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Palette,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  clearSessionUser,
  getAccessToken,
  getSessionUser,
  saveSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import { authenticatedFetch } from "@/src/features/auth/services/authenticatedFetch";
import type { AuthSessionUser } from "@/src/features/auth/types";
import {
  getStoredCartItems,
  subscribeCartItems,
} from "@/src/features/cart/services/cartStorage";
import {
  getSavedMoodboards,
  getWishlistProducts,
  subscribeSavedMoodboards,
  subscribeWishlistProducts,
  toggleSavedMoodboard,
  toggleWishlistProduct,
  type SavedMoodboard,
  type WishlistProduct,
} from "@/src/features/profile/services/wishlistStorage";
import { loadFavoritesFromBackend } from "@/src/features/profile/services/favoritesBackend";
import {
  deleteSavedShowroomDesign,
  listSavedShowroomDesigns,
  type SavedShowroomDesign,
} from "@/src/features/showroom/services/showroomDesignService";
import {
  avatarOptions,
  favoriteMaterials,
  preferredStyles,
  profileUser,
} from "../mock/profile";
import type { UserProfile } from "../types";

type ProfileTab =
  | "overview"
  | "wishlist"
  | "saved-moodboards"
  | "saved-3d"
  | "account"
  | "preferences";

const coverImage = "/images/decoho-home-interior-v2.png";

const avatarIcons: Record<string, LucideIcon> = {
  art: Frame,
  lamp: LampFloor,
  plant: Leaf,
  sofa: Armchair,
  vase: Sparkles,
  wood: Home,
};

const roleDetails = {
  super_admin: {
    actionHref: "/admin",
    actionLabel: "Mở Admin Center",
    label: "Quản trị viên cao cấp",
  },
  admin: {
    actionHref: "/admin",
    actionLabel: "Mở Admin Center",
    label: "Quản trị viên",
  },
  staff: {
    actionHref: "/admin",
    actionLabel: "Mở khu vực nhân viên",
    label: "Nhân viên DECOHO",
  },
  user: {
    actionHref: "/community",
    actionLabel: "Góc cộng đồng",
    label: "Thành viên DECOHO",
  },
  supplier: {
    actionHref: "/store",
    actionLabel: "Mở kênh cửa hàng",
    label: "Nhà cung cấp",
  },
} as const;

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function isImageAvatar(value: string) {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("data:image/") ||
    value.startsWith("/")
  );
}

function AvatarPreview({
  avatar,
  name,
  className,
}: {
  avatar: string;
  name?: string;
  className: string;
}) {
  const AvatarIcon = avatarIcons[avatar];

  if (isImageAvatar(avatar)) {
    const safeAvatar = avatar.replace(/["\\\n\r]/g, "");
    return (
      <span
        aria-label="Ảnh đại diện"
        className={`${className} block bg-cover bg-center`}
        role="img"
        style={{ backgroundImage: `url("${safeAvatar}")` }}
      />
    );
  }

  if (AvatarIcon) {
    return (
      <span className={`${className} grid place-items-center`}>
        <AvatarIcon aria-hidden="true" className="h-[44%] w-[44%]" />
      </span>
    );
  }

  const initials = (name || "DE")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <span className={`${className} grid place-items-center font-serif font-bold`}>
      {initials || <CircleUserRound aria-hidden="true" className="h-[44%] w-[44%]" />}
    </span>
  );
}

function formatVND(value: number | undefined) {
  if (!value || value <= 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function formatDate(value: number | string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Gần đây";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function createProfileFromSession(sessionUser: AuthSessionUser): UserProfile {
  const registeredDate = sessionUser.registeredAt
    ? new Date(sessionUser.registeredAt)
    : null;
  const joinedDate =
    registeredDate && !Number.isNaN(registeredDate.getTime())
      ? new Intl.DateTimeFormat("vi-VN", {
          month: "2-digit",
          year: "numeric",
        }).format(registeredDate)
      : "";

  return {
    address: sessionUser.address ?? "",
    avatar: sessionUser.avatar ?? profileUser.avatar,
    email: sessionUser.email,
    favoriteMaterials:
      sessionUser.favoriteMaterials ?? profileUser.favoriteMaterials,
    joinedDate,
    name: sessionUser.name,
    phone: sessionUser.phone ?? "",
    preferredStyle:
      sessionUser.preferredStyle || preferredStyles[0]?.id || "japandi",
  };
}

async function createAvatarDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Vui lòng chọn tệp ảnh JPG, PNG hoặc WEBP.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Ảnh đại diện không được vượt quá 8 MB.");
  }
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh này."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new window.Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Tệp ảnh không hợp lệ."));
    nextImage.src = source;
  });
  const canvas = document.createElement("canvas");
  const size = 420;
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không thể xử lý ảnh này.");
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    size,
    size,
  );
  return canvas.toDataURL("image/jpeg", 0.84);
}

export default function ProfileView() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [sessionUser, setSessionUser] = useState<AuthSessionUser | null>(null);
  const [user, setUser] = useState<UserProfile>(profileUser);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [name, setName] = useState(profileUser.name);
  const [phone, setPhone] = useState(profileUser.phone);
  const [address, setAddress] = useState(profileUser.address);
  const [selectedStyle, setSelectedStyle] = useState(
    preferredStyles[0]?.id ?? "japandi",
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    profileUser.favoriteMaterials,
  );
  const [avatar, setAvatar] = useState(profileUser.avatar);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [savedMoods, setSavedMoods] = useState<SavedMoodboard[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<SavedShowroomDesign[]>([]);
  const [showPhone, setShowPhone] = useState(false);

  const applySessionUser = useCallback(
    (nextSessionUser: AuthSessionUser | null) => {
      setSessionUser(nextSessionUser);
      setHasCheckedSession(true);
      if (!nextSessionUser) return;
      const nextProfile = createProfileFromSession(nextSessionUser);
      setUser(nextProfile);
      setName(nextProfile.name);
      setPhone(nextProfile.phone);
      setAddress(nextProfile.address);
      setSelectedStyle(
        nextProfile.preferredStyle || preferredStyles[0]?.id || "japandi",
      );
      setSelectedMaterials(nextProfile.favoriteMaterials);
      setAvatar(nextProfile.avatar);
    },
    [],
  );

  // Đồng bộ dữ liệu thật từ GET /users/me
  const syncProfileFromBackend = useCallback(async () => {
    const token = getAccessToken();
    const currentSession = getSessionUser();
    if (!token || !currentSession) return;

    try {
      const res = await authenticatedFetch(`${getApiBaseUrl()}/users/me`, {
        method: "GET",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || typeof data !== "object") return;

      const remoteAvatar =
        typeof data.avatar === "string"
          ? data.avatar
          : data.avatar?.secureUrl || currentSession.avatar;
      const remoteStyles = Array.isArray(data.preferences?.styles)
        ? data.preferences.styles
        : [];
      const matchedStyle =
        remoteStyles.find((s: string) =>
          preferredStyles.some((opt) => opt.id === s.toLowerCase()),
        )?.toLowerCase() ||
        currentSession.preferredStyle ||
        preferredStyles[0]?.id ||
        "japandi";

      const updatedSession: AuthSessionUser = {
        ...currentSession,
        _id: typeof data._id === "string" ? data._id : currentSession._id,
        name:
          typeof data.fullName === "string" && data.fullName.trim()
            ? data.fullName.trim()
            : currentSession.name,
        phone:
          typeof data.phone === "string"
            ? data.phone
            : (currentSession.phone ?? ""),
        avatar: remoteAvatar ?? currentSession.avatar,
        preferredStyle: matchedStyle,
        registeredAt:
          typeof data.createdAt === "string"
            ? data.createdAt
            : currentSession.registeredAt,
      };

      saveSessionUser(updatedSession);
    } catch {
      // Giữ nguyên dữ liệu local nếu offline
    }
  }, []);

  useEffect(() => {
    applySessionUser(getSessionUser());
    setCartCount(
      getStoredCartItems([]).reduce((total, item) => total + item.quantity, 0),
    );

    const unsubscribeSession = subscribeSessionUser(applySessionUser);
    const unsubscribeCart = subscribeCartItems(
      (items) =>
        setCartCount(items.reduce((total, item) => total + item.quantity, 0)),
      [],
    );
    const unsubscribeWishlist = subscribeWishlistProducts(() =>
      setWishlist(getWishlistProducts()),
    );
    const unsubscribeMoods = subscribeSavedMoodboards(() =>
      setSavedMoods(getSavedMoodboards()),
    );

    setWishlist(getWishlistProducts());
    setSavedMoods(getSavedMoodboards());
    void loadFavoritesFromBackend(setWishlist);
    void syncProfileFromBackend();
    void listSavedShowroomDesigns().then(setSavedDesigns);

    return () => {
      unsubscribeSession();
      unsubscribeCart();
      unsubscribeWishlist();
      unsubscribeMoods();
    };
  }, [applySessionUser, syncProfileFromBackend]);

  const selectedStyleOption = useMemo(
    () =>
      preferredStyles.find((style) => style.id === selectedStyle) ??
      preferredStyles[0],
    [selectedStyle],
  );
  const selectedMaterialNames = useMemo(
    () =>
      favoriteMaterials
        .filter((material) => selectedMaterials.includes(material.id))
        .map((material) => material.label),
    [selectedMaterials],
  );
  const completionItems = useMemo(
    () => [
      {
        done: Boolean(name.trim()),
        label: "Họ và tên",
        tab: "account" as ProfileTab,
      },
      {
        done: Boolean(user.email),
        label: "Email",
        tab: "account" as ProfileTab,
      },
      {
        done: Boolean(phone.trim()),
        label: "Số điện thoại",
        tab: "account" as ProfileTab,
      },
      {
        done: Boolean(address.trim()),
        label: "Địa chỉ",
        tab: "account" as ProfileTab,
      },
      {
        done: Boolean(selectedStyle),
        label: "Phong cách",
        tab: "preferences" as ProfileTab,
      },
      {
        done: selectedMaterials.length > 0,
        label: "Vật liệu",
        tab: "preferences" as ProfileTab,
      },
    ],
    [
      address,
      name,
      phone,
      selectedMaterials.length,
      selectedStyle,
      user.email,
    ],
  );
  const completion = Math.round(
    (completionItems.filter((item) => item.done).length /
      completionItems.length) *
      100,
  );
  const nextMissingItem = completionItems.find((item) => !item.done);
  const normalizedMaterials = [...selectedMaterials].sort().join("|");
  const savedMaterials = [...user.favoriteMaterials].sort().join("|");
  const hasChanges =
    name.trim() !== user.name ||
    phone.trim() !== user.phone ||
    address.trim() !== user.address ||
    selectedStyle !== user.preferredStyle ||
    normalizedMaterials !== savedMaterials ||
    avatar !== user.avatar;
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneInvalid =
    phone.trim().length > 0 &&
    (phoneDigits.length < 9 || phoneDigits.length > 11);
  const role = sessionUser?.role ?? "user";
  const currentRole = roleDetails[role];

  function toggleMaterial(materialId: string) {
    setSaveSuccess(false);
    setSelectedMaterials((materials) =>
      materials.includes(materialId)
        ? materials.filter((item) => item !== materialId)
        : [...materials, materialId],
    );
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFormError("");
    setSaveSuccess(false);
    try {
      const dataUrl = await createAvatarDataUrl(file);
      setAvatar(dataUrl);
      setPendingAvatarFile(file);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật ảnh đại diện.",
      );
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaveSuccess(false);
    if (!name.trim() || name.trim().length < 2) {
      setActiveTab("account");
      setFormError("Vui lòng nhập họ và tên (tối thiểu 2 ký tự).");
      return;
    }
    if (phoneInvalid) {
      setActiveTab("account");
      setFormError("Số điện thoại cần có từ 9 đến 11 chữ số.");
      return;
    }
    if (!sessionUser) {
      setFormError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    setIsSaving(true);
    let finalAvatar = avatar;

    try {
      const token = getAccessToken();
      if (token) {
        // 1. Nếu người dùng vừa tải file ảnh mới lên, đẩy lên PATCH /users/me/avatar
        if (pendingAvatarFile) {
          const formData = new FormData();
          formData.append("avatar", pendingAvatarFile);
          const avatarRes = await authenticatedFetch(
            `${getApiBaseUrl()}/users/me/avatar`,
            {
              method: "PATCH",
              body: formData,
            },
          );
          if (avatarRes.ok) {
            const avatarData = await avatarRes.json().catch(() => null);
            const remoteUrl =
              typeof avatarData?.avatar === "string"
                ? avatarData.avatar
                : avatarData?.avatar?.secureUrl;
            if (remoteUrl) {
              finalAvatar = remoteUrl;
            }
          }
          setPendingAvatarFile(null);
        }

        // 2. Đồng bộ họ tên, số điện thoại và gu phong cách lên PATCH /users/me
        const updatePayload: {
          fullName: string;
          phone?: string;
          preferences?: { styles: string[] };
        } = {
          fullName: name.trim(),
          preferences: {
            styles: selectedStyle ? [selectedStyle] : [],
          },
        };
        if (phone.trim()) {
          updatePayload.phone = phone.trim();
        }

        await authenticatedFetch(`${getApiBaseUrl()}/users/me`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
      }

      saveSessionUser({
        ...sessionUser,
        address: address.trim(),
        avatar: finalAvatar,
        favoriteMaterials: selectedMaterials,
        name: name.trim(),
        phone: phone.trim(),
        preferredStyle: selectedStyle,
      });
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 3200);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể lưu hồ sơ lúc này. Vui lòng thử lại.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    clearSessionUser();
    router.push("/login");
  }

  function removeWishlist(id: string) {
    toggleWishlistProduct(id);
  }

  function removeSavedMood(id: string) {
    toggleSavedMoodboard(id);
  }

  async function removeSavedDesign(design: SavedShowroomDesign) {
    await deleteSavedShowroomDesign(design._id, design.source);
    setSavedDesigns((prev) => prev.filter((item) => item._id !== design._id));
  }

  if (!hasCheckedSession) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f6f5f0] px-5 py-12 text-[#17211b] sm:px-8">
        <div className="mx-auto flex max-w-sm items-center justify-center gap-3 rounded-2xl border border-[#ded6c9] bg-white p-6 text-sm font-semibold text-[#62685f] shadow-xs">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#2f6f5e]" />
          Đang tải hồ sơ của bạn...
        </div>
      </main>
    );
  }

  if (!sessionUser) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f6f5f0] px-5 py-12 text-[#17211b] sm:px-8">
        <section className="mx-auto max-w-lg rounded-[28px] border border-[#ded6c9] bg-white p-8 text-center shadow-xs">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf4f0] text-[#2f6f5e]">
            <CircleUserRound className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-serif text-3xl font-bold">
            Hồ sơ đang chờ bạn
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#62685f]">
            Đăng nhập để cập nhật thông tin, lưu gu nội thất, quản lý bản thiết
            kế phòng 3D và đồng bộ giỏ hàng trong hành trình DECOHO.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2f6f5e] px-5 text-sm font-bold text-white transition hover:bg-[#26574a]"
              href="/login"
            >
              Đăng nhập
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#d7cfc2] bg-white px-5 text-sm font-bold transition hover:bg-[#f8f5ef]"
              href="/register"
            >
              Tạo tài khoản
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const stats = [
    {
      icon: Heart,
      label: "Sản phẩm yêu thích",
      sub: "Đã lưu vào bộ sưu tập",
      tint: "bg-white hover:border-[#2f6f5e]/40",
      iconBg: "bg-[#fff1ee] text-[#d94848]",
      value: wishlist.length,
      onClick: () => setActiveTab("wishlist"),
    },
    {
      icon: Bookmark,
      label: "Moodboard đã lưu",
      sub: "Ý tưởng không gian",
      tint: "bg-white hover:border-[#2f6f5e]/40",
      iconBg: "bg-[#eef6f2] text-[#2f6f5e]",
      value: savedMoods.length,
      onClick: () => setActiveTab("saved-moodboards"),
    },
    {
      icon: Box,
      label: "Thiết kế 3D đã lưu",
      sub: "Phòng mẫu tự bố trí",
      tint: "bg-white hover:border-[#2f6f5e]/40",
      iconBg: "bg-[#fdf4e7] text-[#b46f2c]",
      value: savedDesigns.length,
      onClick: () => setActiveTab("saved-3d"),
    },
    {
      icon: ShoppingBag,
      label: "Trong giỏ hàng",
      sub: "Sẵn sàng thanh toán",
      tint: "bg-white hover:border-[#2f6f5e]/40",
      iconBg: "bg-[#f2f4eb] text-[#5c6e46]",
      value: cartCount,
      onClick: () => router.push("/cart"),
    },
  ];

  const tabItems: {
    id: ProfileTab;
    icon: LucideIcon;
    label: string;
    badge?: number;
  }[] = [
    { id: "overview", icon: Compass, label: "Tổng quan" },
    {
      id: "wishlist",
      icon: Heart,
      label: "Yêu thích",
      badge: wishlist.length || undefined,
    },
    {
      id: "saved-moodboards",
      icon: Bookmark,
      label: "Moodboard đã lưu",
      badge: savedMoods.length || undefined,
    },
    {
      id: "saved-3d",
      icon: Box,
      label: "Thiết kế 3D",
      badge: savedDesigns.length || undefined,
    },
    { id: "account", icon: UserRound, label: "Thông tin cá nhân" },
    { id: "preferences", icon: Palette, label: "Gu nội thất" },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f6f5f0] px-4 py-7 text-[#17211b] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1320px]">
        {/* Top Breadcrumb + Quick Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-[#708164]">
              <Link className="transition hover:text-[#2f6f5e]" href="/">
                Trang chủ
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#283e32]">Hồ sơ cá nhân</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-bold text-[#2f6f5e]">
                {tabItems.find((t) => t.id === activeTab)?.label}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {sessionUser._id && (
              <Link
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d7cfc2] bg-white px-4 text-xs font-bold text-[#283e32] transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
                href={`/community/user/${sessionUser._id}`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Tường diễn đàn của tôi
              </Link>
            )}
            {role !== "user" && (
              <Link
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2f6f5e] px-4 text-xs font-bold text-white transition hover:bg-[#24594b]"
                href={currentRole.actionHref}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {currentRole.actionLabel}
              </Link>
            )}
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e5cfc9] bg-white px-4 text-xs font-bold text-[#9b3c31] transition hover:bg-[#fff3f0]"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Hero Identity Card */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-[#dce2d5] bg-[#254d3d] text-white shadow-sm">
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-[45%] sm:block">
            <Image
              alt="Không gian nội thất DECOHO"
              className="object-cover object-center opacity-55"
              fill
              priority
              sizes="600px"
              src={coverImage}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#254d3d] via-[#254d3d]/70 to-transparent" />
          </div>

          <div className="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-9">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative w-fit">
                <AvatarPreview
                  avatar={avatar}
                  name={name || user.name}
                  className="h-20 w-20 shrink-0 rounded-2xl border-2 border-white/80 bg-[#e4edca] text-2xl text-[#254d3d] shadow-md sm:h-24 sm:w-24"
                />
                <button
                  type="button"
                  onClick={() => setActiveTab("account")}
                  title="Đổi ảnh đại diện"
                  className="absolute -bottom-1.5 -right-1.5 grid h-8 w-8 place-items-center rounded-full border-2 border-[#254d3d] bg-[#e4edca] text-[#254d3d] shadow transition hover:scale-105"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e4edca] backdrop-blur-xs">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#f0bd68]" />
                    {currentRole.label}
                  </span>
                  {selectedStyleOption && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e4edca]/20 px-3 py-1 text-[11px] font-semibold text-[#e4edca]">
                      <Palette className="h-3 w-3" />
                      Gu {selectedStyleOption.label}
                    </span>
                  )}
                </div>

                <h1 className="mt-2.5 truncate font-serif text-2xl font-bold sm:text-4xl">
                  {name || user.name || "Thành viên DECOHO"}
                </h1>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-white/85">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-[#d4dfbf]" />
                    {user.email}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-[#d4dfbf]" />
                    <span className="font-mono tracking-wide">
                      {user.phone
                        ? showPhone
                          ? user.phone
                          : user.phone.replace(/\d(?=\d{2})/g, "•")
                        : "Chưa cập nhật SĐT"}
                    </span>
                    {user.phone && (
                      <button
                        aria-label={
                          showPhone ? "Ẩn số điện thoại" : "Hiện số điện thoại"
                        }
                        className="ml-0.5 grid h-6 w-6 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
                        onClick={() => setShowPhone((v) => !v)}
                        type="button"
                      >
                        {showPhone ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </span>

                  {user.joinedDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#d4dfbf]" />
                      Tham gia từ {user.joinedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "account" ? "overview" : "account")
                }
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#e4edca] px-5 text-xs sm:text-sm font-bold text-[#254d3d] shadow-xs transition hover:bg-[#d6e4b5]"
              >
                <Edit3 className="h-4 w-4" />
                {activeTab === "account" ? "Xem tổng quan" : "Chỉnh sửa hồ sơ"}
              </button>
            </div>
          </div>
        </section>

        {/* 4 Stats Cards */}
        <section className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <button
              className={`group flex items-center gap-3.5 rounded-2xl border border-[#ded6c9] ${stat.tint} p-4 sm:p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md`}
              key={stat.label}
              onClick={stat.onClick}
              type="button"
            >
              <span
                className={`grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl ${stat.iconBg}`}
              >
                <stat.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold leading-tight text-[#17211b]">
                  {stat.value}
                </p>
                <p className="truncate text-xs font-bold text-[#283e32]">
                  {stat.label}
                </p>
                <p className="hidden sm:block truncate text-[11px] text-[#7a8278]">
                  {stat.sub}
                </p>
              </div>
              <ArrowRight className="ml-auto hidden sm:block h-4 w-4 shrink-0 text-[#9ca99f] transition group-hover:translate-x-0.5 group-hover:text-[#2f6f5e]" />
            </button>
          ))}
        </section>

        {/* Main Content Box with Tabs */}
        <div className="mt-6 overflow-hidden rounded-[24px] border border-[#ded6c9] bg-white shadow-xs">
          {/* Navigation Tabs */}
          <div className="overflow-x-auto border-b border-[#e8e1d7] bg-[#fbf9f4]/60 px-2 sm:px-4">
            <div className="flex min-w-max">
              {tabItems.map((tab) => (
                <button
                  className={`relative inline-flex h-13 shrink-0 items-center gap-2 px-4 sm:px-5 text-xs sm:text-sm font-bold transition ${
                    activeTab === tab.id
                      ? "text-[#2f6f5e]"
                      : "text-[#6e756c] hover:text-[#2f6f5e]"
                  }`}
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setFormError("");
                  }}
                  type="button"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e8f2ec] px-1.5 text-[11px] font-bold text-[#2f6f5e]">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#2f6f5e]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 p-5 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Completion Card */}
                <section className="rounded-2xl border border-[#e2dcd0] bg-[#fbf9f4] p-6 lg:col-span-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#708164]">
                        Mức độ hoàn thiện hồ sơ
                      </p>
                      <div className="mt-1.5 flex items-baseline gap-3">
                        <p className="text-3xl sm:text-4xl font-bold text-[#2f6f5e]">
                          {completion}%
                        </p>
                        <p className="text-xs sm:text-sm text-[#62685f]">
                          {nextMissingItem
                            ? `Bổ sung thêm "${nextMissingItem.label}" để cá nhân hóa gợi ý tốt hơn.`
                            : "Hồ sơ của bạn đã hoàn thiện 100%!"}
                        </p>
                      </div>
                    </div>
                    {nextMissingItem && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(nextMissingItem.tab)}
                        className="shrink-0 rounded-full bg-[#2f6f5e] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#24594b]"
                      >
                        Bổ sung ngay
                      </button>
                    )}
                  </div>

                  <div
                    aria-label={`Mức hoàn thiện hồ sơ ${completion}%`}
                    className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e6e1d6]"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2f6f5e] to-[#79943b] transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {completionItems.map((item) => (
                      <button
                        type="button"
                        onClick={() => setActiveTab(item.tab)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                          item.done
                            ? "border-[#cce3d6] bg-white text-[#23633e] hover:border-[#2f6f5e]"
                            : "border-dashed border-[#d7cfc2] bg-white/60 text-[#6e756c] hover:border-[#2f6f5e] hover:bg-white"
                        }`}
                        key={item.label}
                      >
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                            item.done
                              ? "bg-[#2f6f5e] text-white"
                              : "border border-[#cbc4b9] text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Personal Info & Style Summary */}
                <section className="flex flex-col justify-between rounded-2xl border border-[#e2dcd0] bg-[#fbf9f4] p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#708164]">
                        Tóm tắt hồ sơ & Gu
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("preferences")}
                        className="text-xs font-bold text-[#2f6f5e] hover:underline"
                      >
                        Đổi gu
                      </button>
                    </div>

                    <div className="mt-4 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-2 border-b border-[#ebe5da] pb-2.5">
                        <span className="text-[#6e756c]">Phong cách:</span>
                        <span className="font-bold text-[#17211b]">
                          {selectedStyleOption?.label || "Chưa chọn"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-2 border-b border-[#ebe5da] pb-2.5">
                        <span className="text-[#6e756c]">Vật liệu:</span>
                        <span className="text-right font-semibold text-[#17211b]">
                          {selectedMaterialNames.length > 0
                            ? selectedMaterialNames.slice(0, 2).join(", ") +
                              (selectedMaterialNames.length > 2
                                ? ` +${selectedMaterialNames.length - 2}`
                                : "")
                            : "Chưa chọn"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="shrink-0 text-[#6e756c]">Địa chỉ:</span>
                        <span className="line-clamp-2 text-right font-medium text-[#17211b]">
                          {user.address || "Chưa cập nhật địa chỉ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-[#e2dcd0]">
                    <Link
                      href="/showroom"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#254d3d] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#1d3f31]"
                    >
                      <Box className="h-3.5 w-3.5" />
                      Phòng mẫu 3D
                    </Link>
                    <Link
                      href="/product-space"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d7cfc2] bg-white px-3 py-2.5 text-xs font-bold text-[#254d3d] transition hover:bg-[#f2efe8]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Moodboards
                    </Link>
                  </div>
                </section>
              </div>

              {/* Recent Saved 3D Designs Preview in Overview */}
              {savedDesigns.length > 0 && (
                <section className="rounded-2xl border border-[#e2dcd0] bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#17211b]">
                        Thiết kế phòng 3D đã lưu gần đây
                      </h3>
                      <p className="text-xs text-[#6e756c]">
                        Các không gian 3D bạn đã tự bố trí nội thất
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("saved-3d")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#2f6f5e] hover:underline"
                    >
                      Xem tất cả ({savedDesigns.length})
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {savedDesigns.slice(0, 3).map((design) => (
                      <div
                        key={design._id}
                        className="flex flex-col justify-between rounded-xl border border-[#e2dcd0] bg-[#fbf9f4] p-4 transition hover:border-[#2f6f5e]/50"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f2ec] px-2.5 py-0.5 text-[10px] font-bold text-[#2f6f5e]">
                              {design.source === "cloud" ? (
                                <Cloud className="h-3 w-3" />
                              ) : (
                                <HardDrive className="h-3 w-3" />
                              )}
                              {design.showroomName || "Phòng 3D"}
                            </span>
                            <span className="text-[11px] text-[#7a8278]">
                              {formatDate(design.updatedAt)}
                            </span>
                          </div>
                          <h4 className="mt-2.5 font-bold text-sm text-[#17211b]">
                            {design.name}
                          </h4>
                          <p className="mt-1 text-xs text-[#62685f]">
                            {design.items?.length ?? 0} món nội thất đã bố trí
                          </p>
                        </div>
                        <Link
                          href="/showroom"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#2f6f5e] hover:underline"
                        >
                          Mở trong Phòng mẫu 3D
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === "wishlist" && (
            <WishlistSection
              items={wishlist}
              onRemove={(id) => removeWishlist(id)}
            />
          )}

          {/* TAB 3: SAVED MOODBOARDS */}
          {activeTab === "saved-moodboards" && (
            <SavedMoodboardsSection
              items={savedMoods}
              onRemove={(id) => removeSavedMood(id)}
            />
          )}

          {/* TAB 4: SAVED 3D ROOM DESIGNS */}
          {activeTab === "saved-3d" && (
            <SavedDesignsSection
              items={savedDesigns}
              onRemove={(design) => void removeSavedDesign(design)}
            />
          )}

          {/* TAB 5 & 6: ACCOUNT & PREFERENCES */}
          {(activeTab === "account" || activeTab === "preferences") && (
            <form onSubmit={saveProfile}>
              <div className="p-5 sm:p-8">
                {formError && (
                  <div
                    className="mb-6 flex items-start gap-3 rounded-xl border border-[#efc2bc] bg-[#fff3f0] p-4 text-sm font-semibold text-[#9b3c31]"
                    role="alert"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {saveSuccess && (
                  <div
                    className="mb-6 flex items-center gap-3 rounded-xl border border-[#b9ddc9] bg-[#effaf3] p-4 text-sm font-bold text-[#23633e]"
                    role="status"
                  >
                    <Check className="h-4 w-4" />
                    Hồ sơ của bạn đã được lưu và đồng bộ thành công!
                  </div>
                )}

                {activeTab === "account" ? (
                  <section>
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#2f6f5e]">
                        Tài khoản DECOHO
                      </p>
                      <h2 className="mt-1.5 text-2xl font-bold">
                        Thông tin cá nhân & Liên hệ
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-[#62685f]">
                        Cập nhật họ tên, số điện thoại, địa chỉ và ảnh đại diện
                        hiển thị trên toàn hệ thống DECOHO.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-bold uppercase text-[#515850]">
                          Họ và tên
                        </span>
                        <span className="relative mt-2 block">
                          <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747a72]" />
                          <input
                            autoComplete="name"
                            className="h-12 w-full rounded-xl border border-[#d7cfc2] bg-[#faf8f4] pl-10 pr-3 text-sm outline-none transition focus:border-[#2f6f5e] focus:bg-white focus:ring-2 focus:ring-[#2f6f5e]/10"
                            onChange={(event) => {
                              setName(event.target.value);
                              setSaveSuccess(false);
                            }}
                            required
                            type="text"
                            value={name}
                          />
                        </span>
                      </label>

                      <label className="block">
                        <span className="flex items-center justify-between gap-2 text-xs font-bold uppercase text-[#515850]">
                          Email đăng nhập
                          <span className="inline-flex items-center gap-1 text-[10px] normal-case text-[#2f6f5e]">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Đã xác thực
                          </span>
                        </span>
                        <span className="relative mt-2 block">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747a72]" />
                          <input
                            className="h-12 w-full cursor-not-allowed rounded-xl border border-[#ddd7cc] bg-[#efede8] pl-10 pr-3 text-sm text-[#687068] outline-none"
                            disabled
                            type="email"
                            value={user.email}
                          />
                        </span>
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold uppercase text-[#515850]">
                          Số điện thoại
                        </span>
                        <span className="relative mt-2 block">
                          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747a72]" />
                          <input
                            aria-invalid={phoneInvalid}
                            autoComplete="tel"
                            className={`h-12 w-full rounded-xl border bg-[#faf8f4] pl-10 pr-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                              phoneInvalid
                                ? "border-[#c85f50] focus:ring-[#c85f50]/10"
                                : "border-[#d7cfc2] focus:border-[#2f6f5e] focus:ring-[#2f6f5e]/10"
                            }`}
                            onChange={(event) => {
                              setPhone(event.target.value);
                              setSaveSuccess(false);
                            }}
                            placeholder="0901 234 567"
                            type="tel"
                            value={phone}
                          />
                        </span>
                        {phoneInvalid && (
                          <span className="mt-1.5 block text-xs text-[#a8473b]">
                            Số điện thoại cần có từ 9 đến 11 chữ số.
                          </span>
                        )}
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold uppercase text-[#515850]">
                          Vai trò tài khoản
                        </span>
                        <span className="relative mt-2 block">
                          <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747a72]" />
                          <input
                            className="h-12 w-full cursor-not-allowed rounded-xl border border-[#ddd7cc] bg-[#efede8] pl-10 pr-3 text-sm text-[#687068] outline-none"
                            disabled
                            value={currentRole.label}
                          />
                        </span>
                      </label>
                    </div>

                    <label className="mt-5 block">
                      <span className="text-xs font-bold uppercase text-[#515850]">
                        Địa chỉ nhận hàng hoặc khảo sát
                      </span>
                      <span className="relative mt-2 block">
                        <MapPin className="absolute left-3.5 top-4 h-4 w-4 text-[#747a72]" />
                        <textarea
                          autoComplete="street-address"
                          className="min-h-24 w-full resize-y rounded-xl border border-[#d7cfc2] bg-[#faf8f4] py-3 pl-10 pr-3 text-sm leading-6 outline-none transition focus:border-[#2f6f5e] focus:bg-white focus:ring-2 focus:ring-[#2f6f5e]/10"
                          onChange={(event) => {
                            setAddress(event.target.value);
                            setSaveSuccess(false);
                          }}
                          placeholder="Nhập địa chỉ nhận hàng hoặc căn hộ của bạn"
                          value={address}
                        />
                      </span>
                    </label>

                    <AvatarEditor
                      avatar={avatar}
                      name={name || user.name}
                      avatarInputRef={avatarInputRef}
                      onSelectIcon={(iconId) => {
                        setAvatar(iconId);
                        setPendingAvatarFile(null);
                        setSaveSuccess(false);
                      }}
                      onReset={() => {
                        setAvatar("");
                        setPendingAvatarFile(null);
                        setSaveSuccess(false);
                      }}
                      onUpload={handleAvatarUpload}
                    />
                  </section>
                ) : (
                  <section>
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#b06d2d]">
                        Cá nhân hóa đề xuất
                      </p>
                      <h2 className="mt-1.5 text-2xl font-bold">
                        Gu nội thất của bạn
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-[#62685f]">
                        DECOHO dùng lựa chọn này để ưu tiên gợi ý không gian
                        Moodboard và sản phẩm phù hợp nhất với phong cách sống
                        của bạn.
                      </p>
                    </div>

                    <fieldset>
                      <legend className="text-sm font-bold">
                        Phong cách chủ đạo
                      </legend>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {preferredStyles.map((style) => {
                          const isSelected = selectedStyle === style.id;
                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`relative min-h-28 rounded-2xl border p-4 text-left transition ${
                                isSelected
                                  ? "border-[#2f6f5e] bg-[#edf4f0] shadow-xs"
                                  : "border-[#dcd5ca] bg-[#faf8f4] hover:border-[#9ca99f] hover:bg-white"
                              }`}
                              id={`profile-style-${style.id}`}
                              key={style.id}
                              onClick={() => {
                                setSelectedStyle(style.id);
                                setSaveSuccess(false);
                              }}
                              type="button"
                            >
                              <span className="flex items-center justify-between gap-3">
                                <strong className="text-sm">
                                  {style.label}
                                </strong>
                                <span
                                  className={`grid h-6 w-6 place-items-center rounded-full border ${
                                    isSelected
                                      ? "border-[#2f6f5e] bg-[#2f6f5e] text-white"
                                      : "border-[#cbc4b9] text-transparent"
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              </span>
                              <span className="mt-2 block text-xs leading-5 text-[#687068]">
                                {style.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <fieldset className="mt-7">
                      <legend className="text-sm font-bold">
                        Vật liệu yêu thích
                      </legend>
                      <p className="mt-1 text-xs leading-5 text-[#687068]">
                        Bạn có thể chọn nhiều chất liệu yêu thích.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {favoriteMaterials.map((material) => {
                          const isSelected = selectedMaterials.includes(
                            material.id,
                          );
                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                                isSelected
                                  ? "border-[#2f6f5e] bg-[#2f6f5e] text-white shadow-xs"
                                  : "border-[#dcd5ca] bg-[#faf8f4] text-[#5f655e] hover:border-[#2f6f5e]/50 hover:bg-white"
                              }`}
                              key={material.id}
                              onClick={() => toggleMaterial(material.id)}
                              type="button"
                            >
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                              {material.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="mt-7 rounded-2xl bg-[#254d3d] p-5 text-white">
                      <div className="flex items-start gap-3.5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e4edca] text-[#254d3d]">
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#d4dfbf]">
                            Chân dung không gian của bạn
                          </p>
                          <h3 className="mt-1 text-lg font-bold">
                            {selectedStyleOption?.label}
                          </h3>
                          <p className="mt-1.5 text-sm leading-6 text-white/80">
                            {selectedStyleOption?.description}
                            {selectedMaterialNames.length > 0
                              ? ` Ưu tiên kết hợp chất liệu ${selectedMaterialNames
                                  .slice(0, 3)
                                  .join(", ")
                                  .toLowerCase()}.`
                              : " Chọn thêm vật liệu để hoàn thiện đề xuất."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#e8e1d7] bg-[#faf8f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p className="text-xs font-medium text-[#687068]">
                  {hasChanges
                    ? "Bạn có thay đổi chưa được lưu."
                    : "Mọi thông tin hồ sơ đã được đồng bộ."}
                </p>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2f6f5e] px-6 text-sm font-bold text-white transition hover:bg-[#26574a] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!hasChanges || isSaving || phoneInvalid}
                  id="profile-save"
                  type="submit"
                >
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- Avatar editor (sub-component) ---------- */
function AvatarEditor({
  avatar,
  name,
  onUpload,
  onSelectIcon,
  onReset,
  avatarInputRef,
}: {
  avatar: string;
  name?: string;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectIcon: (iconId: string) => void;
  onReset: () => void;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <section className="mt-7 rounded-2xl border border-[#d7cfc2] bg-[#faf8f4] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#17211b]">Ảnh đại diện</h3>
          <p className="mt-1 text-xs text-[#687068]">
            Hỗ trợ JPG, PNG hoặc WEBP — tối đa 8 MB
          </p>
        </div>
        <AvatarPreview
          avatar={avatar}
          name={name}
          className="h-14 w-14 shrink-0 rounded-full border border-[#d7cfc2] bg-[#edf4f0] text-lg text-[#2f6f5e]"
        />
      </div>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onUpload}
        ref={avatarInputRef}
        type="file"
      />
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2f6f5e] px-4 text-xs font-bold text-white transition hover:bg-[#26574a]"
          onClick={() => avatarInputRef.current?.click()}
          type="button"
        >
          <Upload className="h-4 w-4" />
          Tải ảnh từ máy
        </button>
        {avatar && (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d7cfc2] bg-white px-4 text-xs font-bold text-[#5c645a] transition hover:bg-[#f2efe8]"
            onClick={onReset}
            type="button"
          >
            <X className="h-4 w-4" />
            Dùng chữ viết tắt
          </button>
        )}
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#687068]">
        Hoặc chọn biểu tượng nội thất
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {avatarOptions.map((option) => {
          const OptionIcon = avatarIcons[option.id] ?? CircleUserRound;
          const isSelected = avatar === option.id;
          return (
            <button
              aria-label={`Chọn ${option.label}`}
              aria-pressed={isSelected}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition ${
                isSelected
                  ? "border-[#2f6f5e] bg-[#edf4f0] text-[#2f6f5e] shadow-xs"
                  : "border-[#ddd6ca] bg-white text-[#62685f] hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
              }`}
              key={option.id}
              onClick={() => onSelectIcon(option.id)}
              type="button"
            >
              <OptionIcon className="h-5 w-5" />
              <span className="truncate text-[11px]">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Wishlist Section ---------- */
function WishlistSection({
  items,
  onRemove,
}: {
  items: WishlistProduct[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Chưa có sản phẩm yêu thích"
        description="Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại. Danh sách sẽ hiển thị tại đây."
        ctaHref="/products"
        ctaLabel="Khám phá sản phẩm"
      />
    );
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sản phẩm yêu thích</h2>
          <p className="mt-1 text-sm text-[#62685f]">
            {items.length} sản phẩm đã được lưu
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d7cfc2] bg-white px-4 text-xs font-bold transition hover:bg-[#f5f1ea]"
          href="/products"
        >
          <Sparkles className="h-4 w-4 text-[#2f6f5e]" />
          Thêm sản phẩm
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            className="group relative overflow-hidden rounded-2xl border border-[#ded6c9] bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            key={item.id}
          >
            <Link className="block" href={`/products/${item.id}`}>
              <div className="relative h-48 overflow-hidden bg-[#eee7dc]">
                {item.image ? (
                  <Image
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={item.image}
                    unoptimized={
                      item.image.startsWith("data:") ||
                      item.image.startsWith("blob:")
                    }
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[#9ca99f]">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <button
                  aria-label="Bỏ khỏi yêu thích"
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#d83a52] shadow-sm backdrop-blur transition hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove(item.id);
                  }}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  {item.category && (
                    <span className="rounded-full bg-[#f7f3ec] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#6f746d]">
                      {item.category}
                    </span>
                  )}
                  {item.style && (
                    <span className="rounded-full bg-[#eef6f2] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#2f6f5e]">
                      {item.style}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug group-hover:text-[#2f6f5e]">
                  {item.name}
                </h3>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-base font-bold text-[#2f6f5e]">
                    {formatVND(item.priceVND)}
                  </p>
                  <span className="text-[10px] text-[#9ca99f]">
                    {formatDate(item.savedAt)}
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------- Saved Moodboards Section ---------- */
function SavedMoodboardsSection({
  items,
  onRemove,
}: {
  items: SavedMoodboard[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Chưa lưu moodboard nào"
        description="Nhấn biểu tượng bookmark trên các moodboard để lưu lại. Bạn có thể xem và mở lại chúng tại đây."
        ctaHref="/product-space"
        ctaLabel="Khám phá Moodboard"
      />
    );
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Moodboard đã lưu</h2>
          <p className="mt-1 text-sm text-[#62685f]">
            {items.length} moodboard đã lưu vào bộ sưu tập của bạn
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d7cfc2] bg-white px-4 text-xs font-bold transition hover:bg-[#f5f1ea]"
          href="/product-space"
        >
          <Compass className="h-4 w-4 text-[#2f6f5e]" />
          Khám phá thêm
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            className="group relative overflow-hidden rounded-2xl border border-[#ded6c9] bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            key={item.id}
          >
            <Link className="block" href={`/product-space/${item.id}`}>
              <div className="relative h-48 overflow-hidden bg-[#eee7dc]">
                {item.image ? (
                  <Image
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={item.image}
                    unoptimized={
                      item.image.startsWith("data:") ||
                      item.image.startsWith("blob:")
                    }
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#254d3d] to-[#2f6f5e] text-white/80">
                    <Bookmark className="h-10 w-10" />
                  </div>
                )}
                <button
                  aria-label="Bỏ lưu moodboard"
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#d83a52] shadow-sm backdrop-blur transition hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove(item.id);
                  }}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {item.roomType && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#254d3d]/90 px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur">
                    {item.roomType.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-[#2f6f5e]">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#687068]">
                  <span className="truncate">
                    Bởi {item.author ?? "DECOHO"}
                  </span>
                  <span className="font-bold">{item.productCount ?? 0} SP</span>
                </div>
                <p className="mt-2 text-[10px] text-[#9ca99f]">
                  Lưu {formatDate(item.savedAt)}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------- Saved 3D Room Designs Section ---------- */
function SavedDesignsSection({
  items,
  onRemove,
}: {
  items: SavedShowroomDesign[];
  onRemove: (design: SavedShowroomDesign) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Box}
        title="Chưa có bản thiết kế phòng 3D nào"
        description="Vào Phòng mẫu 3D, kéo thả bố trí đồ nội thất theo ý thích và bấm 'Lưu thiết kế' để lưu lại không gian của bạn."
        ctaHref="/showroom"
        ctaLabel="Mở Phòng mẫu 3D"
      />
    );
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Thiết kế phòng 3D đã lưu</h2>
          <p className="mt-1 text-sm text-[#62685f]">
            {items.length} phương án bố trí không gian 3D của bạn
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2f6f5e] px-4 text-xs font-bold text-white transition hover:bg-[#24594b]"
          href="/showroom"
        >
          <Box className="h-4 w-4" />
          Thiết kế phòng mới
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((design) => (
          <article
            key={design._id}
            className="flex flex-col justify-between rounded-2xl border border-[#ded6c9] bg-[#fbf9f4] p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#2f6f5e]/50 hover:bg-white"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f2ec] px-3 py-1 text-[11px] font-bold text-[#2f6f5e]">
                  {design.source === "cloud" ? (
                    <Cloud className="h-3.5 w-3.5" />
                  ) : (
                    <HardDrive className="h-3.5 w-3.5" />
                  )}
                  {design.showroomName || "Phòng mẫu 3D"}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(design)}
                  aria-label="Xóa bản thiết kế"
                  className="grid h-8 w-8 place-items-center rounded-full text-[#9b3c31] transition hover:bg-[#fff3f0]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-3 text-base font-bold text-[#17211b]">
                {design.name}
              </h3>
              <p className="mt-1 text-xs text-[#62685f]">
                Đã bố trí{" "}
                <strong className="text-[#2f6f5e]">
                  {design.items?.length ?? 0}
                </strong>{" "}
                sản phẩm nội thất 3D
              </p>

              {design.items && design.items.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {design.items.slice(0, 3).map((item) => (
                    <span
                      key={item.instanceId}
                      className="truncate max-w-[160px] rounded-full border border-[#e2dcd0] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#5c645a]"
                    >
                      {item.name}
                    </span>
                  ))}
                  {design.items.length > 3 && (
                    <span className="rounded-full bg-[#eef2eb] px-2 py-0.5 text-[11px] font-semibold text-[#2f6f5e]">
                      +{design.items.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#e8e1d7] pt-3.5">
              <span className="text-[11px] text-[#7a8278]">
                Cập nhật {formatDate(design.updatedAt)}
              </span>
              <Link
                href="/showroom"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#254d3d] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#1c3b2f]"
              >
                Mở phòng 3D
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({
  icon: Icon,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="p-8 sm:p-14">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-[#edf4f0] text-[#2f6f5e]">
          <Icon className="h-9 w-9" />
        </span>
        <h3 className="mt-5 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#62685f]">{description}</p>
        <Link
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#2f6f5e] px-6 text-sm font-bold text-white transition hover:bg-[#26574a]"
          href={ctaHref}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
