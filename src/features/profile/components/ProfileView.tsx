"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  clearSessionUser,
  getSessionUser,
  saveSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";
import { initialCartItems } from "@/src/features/cart/mock/cartItems";
import {
  avatarOptions,
  favoriteMaterials,
  preferredStyles,
  profileUser,
} from "../mock/profile";
import type { UserProfile } from "../types";

type IconName =
  | "arrow"
  | "bag"
  | "check"
  | "cloud"
  | "compass"
  | "cpu"
  | "file"
  | "heart"
  | "logout"
  | "mail"
  | "map"
  | "phone"
  | "save"
  | "spark"
  | "trash"
  | "user";

const coverImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=85&w=1600";

function Icon({ name }: { name: IconName }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    bag: "M6 8h12l-1 13H7L6 8Zm3 0a3 3 0 0 1 6 0",
    check: "m5 12 4 4L19 6",
    cloud: "M7 18a5 5 0 0 1 1.3-9.8A6 6 0 0 1 20 10.5 3.8 3.8 0 0 1 18.5 18H7Zm6-7-2 3h3l-2 3",
    compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3-12-2 5-5 2 2-5 5-2Z",
    cpu: "M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3M7 7h10v10H7V7Zm3 3h4v4h-4v-4Z",
    file: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6m-6 4h6",
    heart:
      "M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.2a5.1 5.1 0 0 0 0-7.2Z",
    logout: "M10 17l5-5-5-5M15 12H3m8-8h6a2 2 0 0 1 2 2v3m0 6v3a2 2 0 0 1-2 2h-6",
    mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
    map: "M12 21s7-4.8 7-11a7 7 0 1 0-14 0c0 6.2 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z",
    save: "M5 3h12l2 2v16H5V3Zm3 0v6h8V3M8 21v-7h8v7",
    spark:
      "m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z",
    trash: "M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3",
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  };

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function avatarInitial(optionId: string) {
  const option = avatarOptions.find((item) => item.id === optionId);
  return option ? option.label.slice(0, 1).toUpperCase() : "D";
}

export default function ProfileView() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(profileUser);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState(profileUser.name);
  const [phone, setPhone] = useState(profileUser.phone);
  const [address, setAddress] = useState(profileUser.address);
  const [selectedStyle, setSelectedStyle] = useState(profileUser.preferredStyle);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    profileUser.favoriteMaterials,
  );
  const [avatar, setAvatar] = useState(profileUser.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const cartCount = useMemo(
    () => initialCartItems.reduce((total, item) => total + item.quantity, 0),
    [],
  );
  const selectedStyleName =
    preferredStyles.find((style) => style.id === selectedStyle)?.label ?? "Japandi";

  function applySessionUser(sessionUser: AuthSessionUser | null) {
    if (!sessionUser) {
      setIsAuthenticated(false);
      setHasCheckedSession(true);
      return;
    }

    const registeredDate = sessionUser.registeredAt
      ? new Date(sessionUser.registeredAt)
      : null;
    const joinedDate =
      registeredDate && !Number.isNaN(registeredDate.getTime())
        ? new Intl.DateTimeFormat("vi-VN").format(registeredDate)
        : profileUser.joinedDate;

    const nextUser = {
      ...profileUser,
      address: sessionUser.address ?? profileUser.address,
      avatar: sessionUser.avatar ?? profileUser.avatar,
      email: sessionUser.email,
      favoriteMaterials: sessionUser.favoriteMaterials ?? profileUser.favoriteMaterials,
      joinedDate,
      name: sessionUser.name,
      phone: sessionUser.phone ?? profileUser.phone,
      preferredStyle: sessionUser.preferredStyle ?? profileUser.preferredStyle,
    };

    setUser(nextUser);
    setName(nextUser.name);
    setPhone(nextUser.phone);
    setAddress(nextUser.address);
    setSelectedStyle(nextUser.preferredStyle);
    setSelectedMaterials(nextUser.favoriteMaterials);
    setAvatar(nextUser.avatar);
    setIsAuthenticated(true);
    setHasCheckedSession(true);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      applySessionUser(getSessionUser());
    }, 0);
    const unsubscribe = subscribeSessionUser(applySessionUser);

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  function toggleMaterial(materialId: string) {
    setSelectedMaterials((materials) =>
      materials.includes(materialId)
        ? materials.filter((item) => item !== materialId)
        : [...materials, materialId],
    );
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    window.setTimeout(() => {
      const currentSession = getSessionUser();
      const nextUser = {
        ...user,
        address: address.trim(),
        avatar,
        favoriteMaterials: selectedMaterials,
        name: name.trim(),
        phone: phone.trim(),
        preferredStyle: selectedStyle,
      };

      setUser({
        ...nextUser,
      });
      saveSessionUser({
        address: nextUser.address,
        avatar: nextUser.avatar,
        email: nextUser.email,
        favoriteMaterials: nextUser.favoriteMaterials,
        name: nextUser.name,
        phone: nextUser.phone,
        preferredStyle: nextUser.preferredStyle,
        registeredAt: currentSession?.registeredAt ?? new Date().toISOString(),
        role: currentSession?.role,
        storeId: currentSession?.storeId,
        storeName: currentSession?.storeName,
        storeStatus: currentSession?.storeStatus,
      });
      setIsSaving(false);
      setSaveSuccess(true);

      window.setTimeout(() => setSaveSuccess(false), 2600);
    }, 650);
  }

  function handleLogout() {
    clearSessionUser();
    router.push("/login");
  }

  if (!hasCheckedSession) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
        <section className="mx-auto max-w-md rounded-md border border-[#ded6c9] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#646a61]">Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
        <section className="mx-auto max-w-lg rounded-md border border-[#ded6c9] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-[#1f2421] text-[#d89b47]">
            <Icon name="user" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">Bạn chưa đăng nhập</h1>
          <p className="mt-3 text-sm leading-6 text-[#646a61]">
            Vui lòng đăng nhập hoặc đăng ký tài khoản để xem hồ sơ, lưu gu thiết
            kế và quản lý các dự án DECOHO.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              className="rounded-md bg-[#1f2421] px-5 py-3 text-sm font-bold text-white"
              href="/login"
            >
              Đăng nhập
            </Link>
            <Link
              className="rounded-md border border-[#ded6c9] px-5 py-3 text-sm font-bold text-[#1f2421]"
              href="/register"
            >
              Đăng ký
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#1f2421] sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="relative mb-8 min-h-56 overflow-hidden rounded-md border border-[#ded6c9] bg-[#1f2421] shadow-sm">
          <Image
            alt="Không gian phòng khách cao cấp"
            className="h-full w-full object-cover opacity-65"
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            src={coverImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2421]/80 via-[#1f2421]/20 to-transparent" />

          <div className="relative z-10 flex min-h-56 flex-col justify-end gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-md border border-white/20 bg-white/10 text-3xl font-bold text-white backdrop-blur">
                {avatarInitial(avatar)}
              </div>
              <div className="text-white">
                <p className="inline-flex items-center gap-2 rounded-md border border-[#d89b47]/30 bg-[#d89b47]/20 px-3 py-1 text-xs font-bold uppercase text-[#f7d79a]">
                  <Icon name="spark" />
                  Gia chủ Premium
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight">{user.name}</h1>
                <p className="mt-1 text-sm text-white/70">Thành viên từ {user.joinedDate}</p>
              </div>
            </div>

            <button
              className="inline-flex w-fit items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              onClick={handleLogout}
              type="button"
            >
              <Icon name="logout" />
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Icon name="cpu" />
                Thống kê thiết kế
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-[#fbf7ef] p-4 text-center">
                  <p className="text-xs font-bold uppercase text-[#646a61]">Product Space</p>
                  <p className="mt-2 text-3xl font-bold">3</p>
                  <p className="mt-1 text-xs text-[#2f6f5e]">Lượt hoàn thành</p>
                </div>
                <div className="rounded-md bg-[#fbf7ef] p-4 text-center">
                  <p className="text-xs font-bold uppercase text-[#646a61]">Giỏ hàng</p>
                  <p className="mt-2 text-3xl font-bold">{cartCount}</p>
                  <p className="mt-1 text-xs text-[#b46f2c]">Sản phẩm chờ</p>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-[#1f2421] p-4 text-white">
                <p className="text-xs font-bold uppercase text-[#d89b47]">
                  Đặc quyền hội viên
                </p>
                <h3 className="mt-2 text-base font-bold">Sáng tạo không giới hạn</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Tài khoản demo được mở sẵn báo cáo AI, catalog sản phẩm và
                  giỏ hàng để kiểm thử hành trình thiết kế DECOHO.
                </p>
              </div>
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold">Biểu tượng nhận diện</h2>
              <p className="mt-1 text-sm text-[#646a61]">
                Chọn một biểu tượng ngắn để cá nhân hóa hồ sơ.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {avatarOptions.map((option) => (
                  <button
                    className={`rounded-md border p-3 text-center transition ${
                      avatar === option.id
                        ? "border-[#1f2421] bg-[#1f2421] text-white"
                        : "border-[#ded6c9] bg-[#fbf7ef] text-[#1f2421] hover:border-[#b8ad9e]"
                    }`}
                    key={option.id}
                    onClick={() => setAvatar(option.id)}
                    type="button"
                  >
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-white/15 text-lg font-bold">
                      {avatarInitial(option.id)}
                    </span>
                    <span className="mt-2 block truncate text-xs font-semibold">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold">Lối tắt</h2>
              <div className="mt-4 grid gap-2">
                {[
                  { href: "/process", icon: "file", label: "Xem quy trình" },
                  { href: "/products", icon: "bag", label: "Catalog sản phẩm" },
                  { href: "/cart", icon: "heart", label: "Giỏ hàng đang chọn" },
                ].map((item) => (
                  <Link
                    className="flex items-center justify-between rounded-md border border-[#eee7dc] px-3 py-3 text-sm font-semibold text-[#51564f] hover:bg-[#fbf7ef]"
                    href={item.href}
                    key={item.href}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={item.icon as IconName} />
                      {item.label}
                    </span>
                    <Icon name="arrow" />
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          <section className="rounded-md border border-[#ded6c9] bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col justify-between gap-3 border-b border-[#eee7dc] pb-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase text-[#2f6f5e]">DECOHO Account</p>
                <h2 className="mt-2 text-2xl font-bold">Thông tin tài khoản</h2>
                <p className="mt-1 text-sm text-[#646a61]">
                  Quản lý thông tin thành viên và khẩu vị thiết kế của bạn.
                </p>
              </div>

              {saveSuccess && (
                <p className="inline-flex w-fit items-center gap-2 rounded-md border border-[#b7dfc4] bg-[#eefbf2] px-3 py-2 text-sm font-bold text-[#23643b]">
                  <Icon name="check" />
                  Đã cập nhật
                </p>
              )}
            </div>

            <form className="space-y-6" onSubmit={saveProfile}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#51564f]">Họ và tên</span>
                  <span className="relative mt-2 block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                      <Icon name="user" />
                    </span>
                    <input
                      className="h-12 w-full rounded-md border border-[#ded6c9] bg-[#fbf7ef] pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e]"
                      onChange={(event) => setName(event.target.value)}
                      required
                      type="text"
                      value={name}
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#51564f]">Email đăng nhập</span>
                  <span className="relative mt-2 block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                      <Icon name="mail" />
                    </span>
                    <input
                      className="h-12 w-full cursor-not-allowed rounded-md border border-[#ded6c9] bg-[#eee7dc] pl-10 pr-3 text-sm text-[#646a61] outline-none"
                      disabled
                      type="email"
                      value={user.email}
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#51564f]">Số điện thoại</span>
                  <span className="relative mt-2 block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                      <Icon name="phone" />
                    </span>
                    <input
                      className="h-12 w-full rounded-md border border-[#ded6c9] bg-[#fbf7ef] pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e]"
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="0987 654 321"
                      type="tel"
                      value={phone}
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#51564f]">
                    Phong cách yêu thích
                  </span>
                  <span className="relative mt-2 block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                      <Icon name="compass" />
                    </span>
                    <select
                      className="h-12 w-full appearance-none rounded-md border border-[#ded6c9] bg-[#fbf7ef] pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e]"
                      onChange={(event) => setSelectedStyle(event.target.value)}
                      value={selectedStyle}
                    >
                      {preferredStyles.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold uppercase text-[#51564f]">
                  Địa chỉ nhận hàng hoặc khảo sát
                </span>
                <span className="relative mt-2 block">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a61]">
                    <Icon name="map" />
                  </span>
                  <input
                    className="h-12 w-full rounded-md border border-[#ded6c9] bg-[#fbf7ef] pl-10 pr-3 text-sm outline-none focus:border-[#2f6f5e]"
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Địa chỉ của bạn"
                    type="text"
                    value={address}
                  />
                </span>
              </label>

              <div>
                <p className="text-xs font-bold uppercase text-[#51564f]">
                  Vật liệu kiến trúc yêu thích
                </p>
                <p className="mt-1 text-sm text-[#646a61]">
                  Những lựa chọn này giúp AI ưu tiên chất cảm phù hợp khi gợi ý
                  sofa, bàn, tủ và đèn.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {favoriteMaterials.map((material) => {
                    const isSelected = selectedMaterials.includes(material.id);

                    return (
                      <button
                        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                          isSelected
                            ? "border-[#d89b47] bg-[#fff7e8] text-[#8a5d25]"
                            : "border-[#ded6c9] bg-[#fbf7ef] text-[#51564f] hover:border-[#b8ad9e]"
                        }`}
                        key={material.id}
                        onClick={() => toggleMaterial(material.id)}
                        type="button"
                      >
                        {isSelected && <Icon name="check" />}
                        {material.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-md border border-[#ecd5ab] bg-[#fff7e8] p-4 text-sm leading-6 text-[#8a5d25]">
                <p className="inline-flex items-center gap-2 font-bold">
                  <Icon name="spark" />
                  Gợi ý thiết kế
                </p>
                <p className="mt-2">
                  Hồ sơ hiện thiên về phong cách <strong>{selectedStyleName}</strong> và
                  vật liệu tự nhiên. DECOHO có thể dùng dữ liệu này để ưu tiên
                  không gian thoáng, màu nền dịu và sản phẩm có chất liệu ấm.
                </p>
              </div>

              <div className="flex justify-end border-t border-[#eee7dc] pt-5">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-[#1f2421] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2f352f] disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Icon name="save" />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
