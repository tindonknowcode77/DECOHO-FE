"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/src/components/common/BrandLogo";
import GlobalSearch from "./GlobalSearch";
import {
  clearSessionUser,
  getSessionUser,
  subscribeSessionUser,
} from "@/src/features/auth/services/session";
import type { AuthSessionUser } from "@/src/features/auth/types";
import { initialCartItems } from "@/src/features/cart/mock/cartItems";
import {
  getStoredCartItems,
  subscribeCartItems,
} from "@/src/features/cart/services/cartStorage";

type IconName =
  | "bell"
  | "cart"
  | "close"
  | "login"
  | "logout"
  | "menu"
  | "shield"
  | "store"
  | "user";

const menuItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/product-space", label: "Moodboard" },
  { href: "/community", label: "Cộng đồng" },
  { href: "/showroom", label: "Phòng mẫu 3D" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/store", label: "Cửa hàng" },
];

const categoryItems = [
  ["🛋", "Phòng khách", "Sofa"],
  ["🛏", "Phòng ngủ", "Giường"],
  ["🍽", "Phòng ăn", "Bàn"],
  ["💡", "Đèn", "Đèn"],
  ["▦", "Thảm", "Thảm"],
  ["◌", "Trang trí", "Đồ trang trí"],
  ["🪴", "Cây xanh", "Cây xanh"],
  ["🧸", "Phòng bé", "Phòng bé"],
] as const;

const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/onboarding"];

function Icon({ name }: { name: IconName }) {
  const paths = {
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m5 16.5h.01M18 19.5h.01",
    close: "M6 6l12 12M18 6 6 18",
    login: "M14 17l5-5-5-5M19 12H7m4-8H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5",
    logout: "M10 17l5-5-5-5M15 12H3m8-8h6a2 2 0 0 1 2 2v3m0 6v3a2 2 0 0 1-2 2h-6",
    menu: "M4 6h16M4 12h16M4 18h16",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5",
    store: "M4 10h16l-1-6H5l-1 6Zm2 0v10h12V10M9 20v-6h6v6M4 10a3 3 0 0 0 6 0m0 0a3 3 0 0 0 6 0m0 0a3 3 0 0 0 6 0",
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  };

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
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

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [cartCount, setCartCount] = useState(
    initialCartItems.reduce((total, item) => total + item.quantity, 0),
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentUser(getSessionUser());
      setCartCount(
        getStoredCartItems(initialCartItems).reduce(
          (total, item) => total + item.quantity,
          0,
        ),
      );
    }, 0);
    const unsubscribe = subscribeSessionUser(setCurrentUser);
    const unsubscribeCart = subscribeCartItems(
      (items) =>
        setCartCount(
          items.reduce((total, item) => total + item.quantity, 0),
        ),
      initialCartItems,
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
      unsubscribeCart();
    };
  }, []);

  function closeMenus() {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }

  function handleLogout() {
    clearSessionUser();
    closeMenus();
    router.push("/login");
  }

  if (authPaths.includes(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#ded6c9] bg-white/85 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 xl:px-8">
        <div className="flex h-[72px] items-center gap-3 xl:gap-5">
          <Link aria-label="DECOHO home" href="/" onClick={closeMenus}>
            <BrandLogo className="h-12 w-[170px] shrink-0" variant="horizontal" />
          </Link>

          <GlobalSearch />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
            {menuItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition 2xl:px-3.5 2xl:text-sm ${
                    isActive
                      ? "text-[#1f2421]"
                      : "text-[#646a61] hover:bg-[#f7f3ec] hover:text-[#1f2421]"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-[#d89b47]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 xl:gap-2">
            <button
              aria-label="Thông báo"
              className="relative hidden rounded-md p-2 text-[#646a61] transition hover:bg-[#f7f3ec] hover:text-[#1f2421] sm:block"
              type="button"
            >
              <Icon name="bell" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d89b47]" />
            </button>

            <Link
              aria-label="Giỏ hàng"
              className="relative rounded-md p-2 text-[#646a61] transition hover:bg-[#f7f3ec] hover:text-[#1f2421]"
              href="/cart"
              onClick={closeMenus}
            >
              <Icon name="cart" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#2f6f5e] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </Link>

            {currentUser ? (
              <div className="relative hidden sm:block">
                <button
                  className="flex items-center gap-2 rounded-md border border-transparent p-1.5 transition hover:border-[#ded6c9] hover:bg-[#f7f3ec]"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  type="button"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d89b47] text-xs font-bold text-[#1f2421]">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="hidden text-left lg:block">
                    <span className="block text-xs font-bold leading-none text-[#1f2421]">
                      {currentUser.name}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#646a61]">
                      {currentUser.role === "super_admin"
                        ? "Quản trị viên cao cấp"
                        : currentUser.role === "admin"
                          ? "Quản trị viên"
                          : currentUser.role === "staff"
                            ? "Nhân viên"
                        : currentUser.role === "supplier"
                          ? "Nhà cung cấp"
                          : "Thành viên"}
                    </span>
                  </span>
                </button>

                {isProfileOpen && (
                  <>
                    <button
                      aria-label="Đóng menu tài khoản"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setIsProfileOpen(false)}
                      type="button"
                    />
                    <div className="absolute right-0 z-20 mt-2 w-60 rounded-md border border-[#ded6c9] bg-white p-2 shadow-xl">
                      <div className="mb-1 border-b border-[#eee7dc] px-3 py-3">
                        <p className="text-xs text-[#646a61]">Tài khoản cá nhân</p>
                        <p className="mt-1 truncate text-sm font-bold text-[#1f2421]">
                          {currentUser.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#646a61]">
                          {currentUser.email}
                        </p>
                      </div>

                      {(currentUser.role === "admin" || currentUser.role === "super_admin") && (
                        <Link
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                            pathname === "/admin"
                              ? "bg-[#1f2421] text-white"
                              : "text-[#51564f] hover:bg-[#f7f3ec]"
                          }`}
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Icon name="shield" />
                          Admin Center
                        </Link>
                      )}

                      {currentUser.role === "supplier" && (
                        <Link
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                            pathname === "/store"
                              ? "bg-[#1f2421] text-white"
                              : "text-[#51564f] hover:bg-[#f7f3ec]"
                          }`}
                          href="/store"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Icon name="store" />
                          Kênh nhà cung cấp
                        </Link>
                      )}

                      <Link
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                          pathname === "/profile"
                            ? "bg-[#1f2421] text-white"
                            : "text-[#51564f] hover:bg-[#f7f3ec]"
                        }`}
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Icon name="user" />
                        Trang cá nhân
                      </Link>

                      <button
                        className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-[#bc3d2b] hover:bg-[#fff1ee]"
                        onClick={handleLogout}
                        type="button"
                      >
                        <Icon name="logout" />
                        Đăng xuất tài khoản
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#ded6c9] bg-white px-3 py-2.5 text-sm font-bold text-[#1f2421] transition hover:bg-[#f7f3ec]"
                  href="/login"
                >
                  <Icon name="login" />
                  Đăng nhập
                </Link>
                <Link
                  className="whitespace-nowrap rounded-lg bg-[#2f6f5e] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#285f51]"
                  href="/register"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              aria-label="Mở menu"
              className="rounded-md p-2 text-[#51564f] transition hover:bg-[#f7f3ec] xl:hidden"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              type="button"
            >
              <Icon name={isMobileMenuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="Danh mục nội thất" className="border-t border-[#eee7dc] bg-white/95">
        <div className="mx-auto flex max-w-[1680px] justify-start gap-2 overflow-x-auto px-4 py-2.5 text-xs font-bold text-[#5f665d] scrollbar-hide md:justify-center">
          {categoryItems.map(([icon, label, category]) => (
            <Link
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3.5 py-2 transition hover:border-[#d9e7b4] hover:bg-[#f2f8df] hover:text-[#66862e]"
              href={`/products?category=${encodeURIComponent(category)}`}
              key={label}
              onClick={closeMenus}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="border-t border-[#ded6c9] bg-white xl:hidden">
          <div className="space-y-1 px-5 py-3">
            {menuItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-[#1f2421] text-white"
                      : "text-[#51564f] hover:bg-[#f7f3ec]"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-[#eee7dc]" />

            <Link
              className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                pathname === "/cart" ? "bg-[#1f2421] text-white" : "text-[#51564f]"
              }`}
              href="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Giỏ hàng ({cartCount})
            </Link>

            {currentUser ? (
              <>
                {(currentUser.role === "admin" || currentUser.role === "super_admin") && (
                  <Link
                    className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                      pathname === "/admin" ? "bg-[#1f2421] text-white" : "text-[#51564f]"
                    }`}
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Center
                  </Link>
                )}
                {currentUser.role === "supplier" && (
                  <Link
                    className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                      pathname === "/store" ? "bg-[#1f2421] text-white" : "text-[#51564f]"
                    }`}
                    href="/store"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Kênh nhà cung cấp
                  </Link>
                )}
                <Link
                  className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                    pathname === "/profile" ? "bg-[#1f2421] text-white" : "text-[#51564f]"
                  }`}
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trang cá nhân
                </Link>
                <button
                  className="block w-full rounded-md px-4 py-3 text-left text-sm font-semibold text-[#bc3d2b] hover:bg-[#fff1ee]"
                  onClick={handleLogout}
                  type="button"
                >
                  Đăng xuất tài khoản
                </button>
              </>
            ) : (
              <div className="grid gap-2 pt-1">
                <Link
                  className="rounded-md border border-[#ded6c9] px-4 py-3 text-sm font-bold text-[#1f2421]"
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  className="rounded-md bg-[#2f6f5e] px-4 py-3 text-sm font-bold text-white"
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
