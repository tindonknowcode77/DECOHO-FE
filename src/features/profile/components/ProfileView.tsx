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
  Check,
  ChevronRight,
  CircleUserRound,
  Compass,
  Eye,
  EyeOff,
  Frame,
  Heart,
  Home,
  ImageIcon,
  LampFloor,
  Leaf,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Package,
  Palette,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  clearSessionUser,
  getSessionUser,
  saveSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";
import { initialCartItems } from "@/src/features/cart/mock/cartItems";
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
import {
  loadFavoritesFromBackend,
} from "@/src/features/profile/services/favoritesBackend";
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
    actionHref: "/product-space",
    actionLabel: "Mở Moodboard",
    label: "Thành viên DECOHO",
  },
  supplier: {
    actionHref: "/store",
    actionLabel: "Mở kênh cửa hàng",
    label: "Nhà cung cấp",
  },
} as const;

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
  className,
}: {
  avatar: string;
  className: string;
}) {
  const AvatarIcon = avatarIcons[avatar] ?? CircleUserRound;

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

  return (
    <span className={`${className} grid place-items-center`}>
      <AvatarIcon aria-hidden="true" className="h-[42%] w-[42%]" />
    </span>
  );
}

function formatVND(value: number | undefined) {
  if (!value || value <= 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function createProfileFromSession(sessionUser: AuthSessionUser): UserProfile {
  const registeredDate = sessionUser.registeredAt
    ? new Date(sessionUser.registeredAt)
    : null;
  const joinedDate =
    registeredDate && !Number.isNaN(registeredDate.getTime())
      ? new Intl.DateTimeFormat("vi-VN").format(registeredDate)
      : profileUser.joinedDate;

  return {
    address: sessionUser.address ?? "",
    avatar: sessionUser.avatar ?? profileUser.avatar,
    email: sessionUser.email,
    favoriteMaterials:
      sessionUser.favoriteMaterials ?? profileUser.favoriteMaterials,
    joinedDate,
    name: sessionUser.name,
    phone: sessionUser.phone ?? "",
    preferredStyle: sessionUser.preferredStyle ?? profileUser.preferredStyle,
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
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
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
  const [selectedStyle, setSelectedStyle] = useState(profileUser.preferredStyle);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    profileUser.favoriteMaterials,
  );
  const [avatar, setAvatar] = useState(profileUser.avatar);
  const [cartCount, setCartCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [savedMoods, setSavedMoods] = useState<SavedMoodboard[]>([]);
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
      setSelectedStyle(nextProfile.preferredStyle);
      setSelectedMaterials(nextProfile.favoriteMaterials);
      setAvatar(nextProfile.avatar);
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      applySessionUser(getSessionUser());
      setCartCount(
        getStoredCartItems(initialCartItems).reduce(
          (total, item) => total + item.quantity,
          0,
        ),
      );
    }, 0);
    const unsubscribeSession = subscribeSessionUser(applySessionUser);
    const unsubscribeCart = subscribeCartItems(
      (items) =>
        setCartCount(items.reduce((total, item) => total + item.quantity, 0)),
      initialCartItems,
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

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribeSession();
      unsubscribeCart();
      unsubscribeWishlist();
      unsubscribeMoods();
    };
  }, [applySessionUser]);

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
      { done: Boolean(name.trim()), label: "Họ và tên" },
      { done: Boolean(user.email), label: "Email" },
      { done: Boolean(phone.trim()), label: "Số điện thoại" },
      { done: Boolean(address.trim()), label: "Địa chỉ" },
      { done: Boolean(selectedStyle), label: "Phong cách" },
      { done: selectedMaterials.length > 0, label: "Vật liệu" },
    ],
    [address, name, phone, selectedMaterials.length, selectedStyle, user.email],
  );
  const completion = Math.round(
    (completionItems.filter((item) => item.done).length /
      completionItems.length) *
      100,
  );
  const nextMissingItem = completionItems.find((item) => !item.done)?.label;
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
      setAvatar(await createAvatarDataUrl(file));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật ảnh đại diện.",
      );
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaveSuccess(false);
    if (!name.trim()) {
      setActiveTab("account");
      setFormError("Vui lòng nhập họ và tên.");
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
    window.setTimeout(() => {
      saveSessionUser({
        ...sessionUser,
        address: address.trim(),
        avatar,
        favoriteMaterials: selectedMaterials,
        name: name.trim(),
        phone: phone.trim(),
        preferredStyle: selectedStyle,
      });
      setIsSaving(false);
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 2800);
    }, 450);
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

  if (!hasCheckedSession) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f1ea] px-5 py-12 text-[#17211b] sm:px-8">
        <div className="mx-auto flex max-w-sm items-center justify-center gap-3 rounded-lg border border-[#ded6c9] bg-white p-6 text-sm font-semibold text-[#62685f] shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#2f6f5e]" />
          Đang tải hồ sơ của bạn...
        </div>
      </main>
    );
  }

  if (!sessionUser) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f1ea] px-5 py-12 text-[#17211b] sm:px-8">
        <section className="mx-auto max-w-lg rounded-lg border border-[#ded6c9] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf4f0] text-[#2f6f5e]">
            <CircleUserRound className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">Hồ sơ đang chờ bạn</h1>
          <p className="mt-3 text-sm leading-6 text-[#62685f]">
            Đăng nhập để cập nhật thông tin, lưu gu nội thất và đồng bộ giỏ
            hàng trong hành trình thiết kế DECOHO.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2f6f5e] px-5 text-sm font-bold text-white transition hover:bg-[#26574a]"
              href="/login"
            >
              Đăng nhập
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#d7cfc2] bg-white px-5 text-sm font-bold transition hover:bg-[#f8f5ef]"
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
      icon: ShoppingBag,
      label: "Sản phẩm yêu thích",
      tint: "from-[#f8f5ef] to-[#faf6ee]",
      value: wishlist.length,
    },
    {
      icon: Bookmark,
      label: "Moodboard đã lưu",
      tint: "from-[#eef6f2] to-[#f3faf6]",
      value: savedMoods.length,
    },
    {
      icon: Package,
      label: "Trong giỏ hàng",
      tint: "from-[#fff5e4] to-[#fffaf0]",
      value: cartCount,
    },
  ];

  const tabItems: { id: ProfileTab; icon: LucideIcon; label: string; badge?: number }[] = [
    { id: "overview", icon: Compass, label: "Tổng quan" },
    { id: "wishlist", icon: Heart, label: "Yêu thích", badge: wishlist.length || undefined },
    { id: "saved-moodboards", icon: Bookmark, label: "Moodboard đã lưu", badge: savedMoods.length || undefined },
    { id: "account", icon: UserRound, label: "Tài khoản" },
    { id: "preferences", icon: Palette, label: "Gu thiết kế" },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f5f1ea] to-[#ebe4d6] px-4 py-6 text-[#17211b] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb + Logout */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#687068]">
              <Link className="transition hover:text-[#2f6f5e]" href="/">
                Trang chủ
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link className="transition hover:text-[#2f6f5e]" href="/profile">
                Tài khoản
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#2f6f5e]">{tabItems.find((t) => t.id === activeTab)?.label}</span>
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Hồ sơ của tôi</h1>
            <p className="mt-2 text-sm text-[#62685f]">
              Quản lý thông tin cá nhân, sản phẩm yêu thích và moodboard đã lưu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              className="inline-flex h-11 w-fit items-center gap-2 rounded-lg border border-[#d7cfc2] bg-white px-4 text-sm font-bold text-[#2f6f5e] transition hover:bg-[#f5f1ea]"
              href="/products"
            >
              <Sparkles className="h-4 w-4" />
              Khám phá
            </Link>
            <button
              className="inline-flex h-11 w-fit items-center gap-2 rounded-lg border border-[#d7cfc2] bg-white px-4 text-sm font-bold text-[#9b3c31] transition hover:border-[#e5bdb5] hover:bg-[#fff3f0]"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Cover + Identity */}
        <section className="relative min-h-[260px] overflow-hidden rounded-2xl border border-[#d7cfc2] bg-[#1c2821] shadow-md">
          <Image
            alt="Không gian nội thất DECOHO"
            className="object-cover object-center"
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            src={coverImage}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#152019]/95 via-[#152019]/70 to-[#152019]/20" />
          <div className="relative flex min-h-[260px] flex-col justify-end gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <AvatarPreview
                avatar={avatar}
                className="h-20 w-20 shrink-0 rounded-2xl border-2 border-white/70 bg-[#edf4f0] text-[#2f6f5e] shadow-lg sm:h-24 sm:w-24"
              />
              <div className="min-w-0 text-white">
                <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase backdrop-blur">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#f0bd68]" />
                  {currentRole.label}
                </p>
                <h2 className="mt-3 truncate text-2xl font-bold sm:text-3xl">
                  {name || user.name}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    <span className="font-mono tracking-wide">
                      {showPhone
                        ? user.phone || "—"
                        : user.phone
                          ? user.phone.replace(/\d(?=\d{2})/g, "•")
                          : "—"}
                    </span>
                    {user.phone && (
                      <button
                        aria-label={showPhone ? "Ẩn số điện thoại" : "Hiện số điện thoại"}
                        className="ml-1 grid h-6 w-6 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
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
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-[#f0bd68]" />
                    Thành viên từ {user.joinedDate}
                  </span>
                </div>
              </div>
            </div>

            <Link
              className="inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-[#2f6f5e] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#26574a]"
              href={currentRole.actionHref}
            >
              {currentRole.actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <button
              className={`group flex items-center gap-4 rounded-xl border border-[#d7cfc2] bg-gradient-to-br ${stat.tint} p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
              key={stat.label}
              onClick={() => {
                if (stat.label === "Sản phẩm yêu thích") setActiveTab("wishlist");
                if (stat.label === "Moodboard đã lưu") setActiveTab("saved-moodboards");
              }}
              type="button"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-[#2f6f5e] shadow-sm">
                <stat.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-[#62685f]">{stat.label}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-[#9ca99f] transition group-hover:translate-x-0.5 group-hover:text-[#2f6f5e]" />
            </button>
          ))}
        </section>

        {/* Tabs */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#d7cfc2] bg-white shadow-sm">
          <div className="flex min-w-max border-b border-[#e8e1d7]">
            {tabItems.map((tab) => (
              <button
                className={`relative inline-flex h-12 shrink-0 items-center gap-2 px-5 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "text-[#2f6f5e]"
                    : "text-[#7a7f78] hover:text-[#2f6f5e]"
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
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#edf4f0] px-1.5 text-[11px] font-bold text-[#2f6f5e]">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#2f6f5e]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-3">
              {/* Completion card */}
              <section className="rounded-xl border border-[#d7cfc2] bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-[#687068]">
                      Mức hoàn thiện hồ sơ
                    </p>
                    <p className="mt-2 text-4xl font-bold text-[#2f6f5e]">{completion}%</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#edf4f0] text-[#2f6f5e]">
                    <ShieldCheck className="h-6 w-6" />
                  </span>
                </div>
                <div
                  aria-label={`Mức hoàn thiện hồ sơ ${completion}%`}
                  className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8e4dc]"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2f6f5e] to-[#75953a] transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-[#62685f]">
                  {nextMissingItem
                    ? `Bổ sung ${nextMissingItem.toLowerCase()} để AI hiểu bạn chính xác hơn.`
                    : "Hồ sơ đã sẵn sàng cho các gợi ý cá nhân hóa."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {completionItems.map((item) => (
                    <div
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold ${
                        item.done
                          ? "border-[#b9ddc9] bg-[#effaf3] text-[#23633e]"
                          : "border-[#e8e1d4] bg-[#faf8f4] text-[#62685f]"
                      }`}
                      key={item.label}
                    >
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full ${
                          item.done
                            ? "bg-[#2f6f5e] text-white"
                            : "border border-[#cbc4b9] text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick actions */}
              <section className="rounded-xl border border-[#d7cfc2] bg-gradient-to-br from-[#1c2821] to-[#0f1611] p-6 text-white shadow-sm">
                <p className="text-xs font-bold uppercase text-[#efb95f]">
                  Lối tắt
                </p>
                <h3 className="mt-2 text-lg font-bold">Tiếp tục thiết kế</h3>
                <div className="mt-5 grid gap-2">
                  {[
                    { href: "/product-space", icon: Sparkles, label: "Khám phá Moodboard" },
                    { href: "/showroom", icon: Compass, label: "Mở phòng mẫu 3D" },
                    { href: "/products", icon: ShoppingBag, label: "Xem catalog sản phẩm" },
                    { href: "/cart", icon: Package, label: "Giỏ hàng của tôi" },
                  ].map((item) => (
                    <Link
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                      href={item.href}
                      key={item.href}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-[#efb95f]" />
                        {item.label}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "wishlist" && (
            <WishlistSection
              items={wishlist}
              onRemove={(id) => removeWishlist(id)}
            />
          )}

          {activeTab === "saved-moodboards" && (
            <SavedMoodboardsSection
              items={savedMoods}
              onRemove={(id) => removeSavedMood(id)}
            />
          )}

          {(activeTab === "account" || activeTab === "preferences") && (
            <form className="" onSubmit={saveProfile}>
              <div className="p-5 sm:p-7">
                {formError && (
                  <div
                    className="mb-6 flex items-start gap-3 rounded-lg border border-[#efc2bc] bg-[#fff3f0] p-4 text-sm font-semibold text-[#9b3c31]"
                    role="alert"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {saveSuccess && (
                  <div
                    className="mb-6 flex items-center gap-3 rounded-lg border border-[#b9ddc9] bg-[#effaf3] p-4 text-sm font-bold text-[#23633e]"
                    role="status"
                  >
                    <Check className="h-4 w-4" />
                    Hồ sơ đã được cập nhật.
                  </div>
                )}

                {activeTab === "account" ? (
                  <section>
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase text-[#2f6f5e]">
                        Tài khoản DECOHO
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">Thông tin liên hệ</h2>
                      <p className="mt-2 text-sm leading-6 text-[#62685f]">
                        Thông tin này được dùng khi tư vấn thiết kế, khảo sát và
                        giao sản phẩm.
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
                            className="h-12 w-full rounded-lg border border-[#d7cfc2] bg-[#faf8f4] pl-10 pr-3 text-sm outline-none transition focus:border-[#2f6f5e] focus:bg-white focus:ring-2 focus:ring-[#2f6f5e]/10"
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
                            className="h-12 w-full cursor-not-allowed rounded-lg border border-[#ddd7cc] bg-[#efede8] pl-10 pr-3 text-sm text-[#687068] outline-none"
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
                            className={`h-12 w-full rounded-lg border bg-[#faf8f4] pl-10 pr-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
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
                            className="h-12 w-full cursor-not-allowed rounded-lg border border-[#ddd7cc] bg-[#efede8] pl-10 pr-3 text-sm text-[#687068] outline-none"
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
                          className="min-h-24 w-full resize-y rounded-lg border border-[#d7cfc2] bg-[#faf8f4] py-3 pl-10 pr-3 text-sm leading-6 outline-none transition focus:border-[#2f6f5e] focus:bg-white focus:ring-2 focus:ring-[#2f6f5e]/10"
                          onChange={(event) => {
                            setAddress(event.target.value);
                            setSaveSuccess(false);
                          }}
                          placeholder="Nhập địa chỉ của bạn"
                          value={address}
                        />
                      </span>
                    </label>

                    <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#f0f5f2] p-4 text-sm leading-6 text-[#4e6256]">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2f6f5e]" />
                      <p>
                        Email đăng nhập được khóa để bảo vệ liên kết tài khoản.
                        Các thay đổi còn lại chỉ được lưu trong phiên DECOHO của
                        bạn.
                      </p>
                    </div>

                    <AvatarEditor
                      avatar={avatar}
                      avatarInputRef={avatarInputRef}
                      onReset={() => {
                        setAvatar(profileUser.avatar);
                        setSaveSuccess(false);
                      }}
                      onUpload={handleAvatarUpload}
                    />
                  </section>
                ) : (
                  <section>
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase text-[#b06d2d]">
                        Cá nhân hóa đề xuất
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">Gu nội thất của bạn</h2>
                      <p className="mt-2 text-sm leading-6 text-[#62685f]">
                        DECOHO dùng lựa chọn này để ưu tiên không gian và sản phẩm
                        phù hợp hơn.
                      </p>
                    </div>

                    <fieldset>
                      <legend className="text-sm font-bold">Phong cách chủ đạo</legend>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {preferredStyles.map((style) => {
                          const isSelected = selectedStyle === style.id;
                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`relative min-h-28 rounded-lg border p-4 text-left transition ${
                                isSelected
                                  ? "border-[#2f6f5e] bg-[#edf4f0] shadow-sm"
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
                                <strong className="text-sm">{style.label}</strong>
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
                      <legend className="text-sm font-bold">Vật liệu yêu thích</legend>
                      <p className="mt-1 text-xs leading-5 text-[#687068]">
                        Có thể chọn nhiều vật liệu.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {favoriteMaterials.map((material) => {
                          const isSelected = selectedMaterials.includes(material.id);
                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                isSelected
                                  ? "border-[#d49a49] bg-[#fff5e4] text-[#8d5b23]"
                                  : "border-[#dcd5ca] bg-[#faf8f4] text-[#5f655e] hover:border-[#aaa196]"
                              }`}
                              key={material.id}
                              onClick={() => toggleMaterial(material.id)}
                              type="button"
                            >
                              {isSelected && <Check className="h-4 w-4" />}
                              {material.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="mt-7 rounded-lg bg-[#1c2821] p-5 text-white">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e6a43c] text-[#17211b]">
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase text-[#efb95f]">
                            Chân dung không gian
                          </p>
                          <h3 className="mt-1 text-lg font-bold">
                            {selectedStyleOption.label}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-white/70">
                            {selectedStyleOption.description}
                            {selectedMaterialNames.length > 0
                              ? ` Ưu tiên ${selectedMaterialNames
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

              <div className="flex flex-col gap-3 border-t border-[#e8e1d7] bg-[#faf8f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-xs text-[#687068]">
                  {hasChanges ? "Bạn có thay đổi chưa được lưu." : "Mọi thay đổi đã được lưu."}
                </p>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2f6f5e] px-5 text-sm font-bold text-white transition hover:bg-[#26574a] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!hasChanges || isSaving || phoneInvalid}
                  id="profile-save"
                  type="submit"
                >
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
  onUpload,
  onReset,
  avatarInputRef,
}: {
  avatar: string;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <section className="mt-7 rounded-xl border border-[#d7cfc2] bg-[#faf8f4] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">Ảnh đại diện</h3>
          <p className="mt-1 text-xs text-[#687068]">JPG, PNG hoặc WEBP — tối đa 8 MB</p>
        </div>
        <AvatarPreview
          avatar={avatar}
          className="h-14 w-14 rounded-full bg-[#edf4f0] text-[#2f6f5e]"
        />
      </div>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onUpload}
        ref={avatarInputRef}
        type="file"
      />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2f6f5e] px-3 text-xs font-bold text-white transition hover:bg-[#26574a]"
          onClick={() => avatarInputRef.current?.click()}
          type="button"
        >
          <Upload className="h-4 w-4" />
          Tải ảnh lên
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d7cfc2] px-3 text-xs font-bold transition hover:bg-white"
          onClick={onReset}
          type="button"
        >
          <X className="h-4 w-4" />
          Đặt lại
        </button>
      </div>

      <p className="mt-5 text-xs font-bold uppercase text-[#687068]">
        Hoặc chọn biểu tượng
      </p>
      <div className="mt-3 grid grid-cols-6 gap-2">
        {avatarOptions.map((option) => {
          const OptionIcon = avatarIcons[option.id] ?? CircleUserRound;
          return (
            <button
              aria-label={`Chọn ${option.label}`}
              className="grid aspect-square place-items-center rounded-lg border border-[#ddd6ca] bg-[#faf8f4] text-[#62685f] transition hover:border-[#2f6f5e] hover:text-[#2f6f5e]"
              key={option.id}
              onClick={onReset}
              title={`${option.label} - chọn để đổi`}
              type="button"
            >
              <OptionIcon className="h-4 w-4" />
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
    return <EmptyState
      icon={Heart}
      title="Chưa có sản phẩm yêu thích"
      description="Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại. Danh sách sẽ hiển thị tại đây."
      ctaHref="/products"
      ctaLabel="Khám phá sản phẩm"
    />;
  }

  return (
    <div className="p-5 sm:p-7">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sản phẩm yêu thích</h2>
          <p className="mt-1 text-sm text-[#62685f]">
            {items.length} sản phẩm đã được lưu
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d7cfc2] bg-white px-4 text-xs font-bold transition hover:bg-[#f5f1ea]"
          href="/products"
        >
          <Sparkles className="h-4 w-4" />
          Thêm sản phẩm
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            className="group relative overflow-hidden rounded-xl border border-[#ded6c9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            key={item.id}
          >
            <Link className="block" href={`/products/${item.id}`}>
              <div className="relative h-44 overflow-hidden bg-[#eee7dc]">
                {item.image ? (
                  <Image
                    alt={item.name}
                    className="h-full w-full object-cover transition group-hover:scale-[1.04]"
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={item.image}
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
                    <span className="rounded-full bg-[#f7f3ec] px-2 py-0.5 text-[10px] font-bold uppercase text-[#6f746d]">
                      {item.category}
                    </span>
                  )}
                  {item.style && (
                    <span className="rounded-full bg-[#eef6f2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#2f6f5e]">
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
    return <EmptyState
      icon={Bookmark}
      title="Chưa lưu moodboard nào"
      description="Nhấn biểu tượng bookmark trên các moodboard để lưu lại. Bạn có thể xem và mở lại chúng tại đây."
      ctaHref="/product-space"
      ctaLabel="Khám phá Moodboard"
    />;
  }

  return (
    <div className="p-5 sm:p-7">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Moodboard đã lưu</h2>
          <p className="mt-1 text-sm text-[#62685f]">
            {items.length} moodboard đã lưu vào bộ sưu tập của bạn
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d7cfc2] bg-white px-4 text-xs font-bold transition hover:bg-[#f5f1ea]"
          href="/product-space"
        >
          <Compass className="h-4 w-4" />
          Khám phá thêm
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            className="group relative overflow-hidden rounded-xl border border-[#ded6c9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            key={item.id}
          >
            <Link className="block" href={`/product-space/${item.id}`}>
              <div className="relative h-44 overflow-hidden bg-[#eee7dc]">
                {item.image ? (
                  <Image
                    alt={item.title}
                    className="h-full w-full object-cover transition group-hover:scale-[1.04]"
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={item.image}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#1c2821] to-[#2f6f5e] text-white/80">
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
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#1c2821]/85 px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur">
                    {item.roomType.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-[#2f6f5e]">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#687068]">
                  <span className="truncate">Bởi {item.author ?? "Ẩn danh"}</span>
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
    <div className="p-8 sm:p-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-[#edf4f0] text-[#2f6f5e]">
          <Icon className="h-10 w-10" />
        </span>
        <h3 className="mt-5 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#62685f]">{description}</p>
        <Link
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#2f6f5e] px-5 text-sm font-bold text-white transition hover:bg-[#26574a]"
          href={ctaHref}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
