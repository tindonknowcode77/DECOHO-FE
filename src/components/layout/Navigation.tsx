"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
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
  { href: "/product-space", label: "Moodboards" },
  { href: "/community", label: "Diễn đàn" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/showroom", label: "Phòng mẫu 3D" },
];

const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/onboarding",
];

function Icon({ name }: { name: IconName }) {
  const paths = {
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m5 16.5h.01M18 19.5h.01",
    close: "M6 6l12 12M18 6 6 18",
    login: "M14 17l5-5-5-5M19 12H7m4-8H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5",
    logout:
      "M10 17l5-5-5-5M15 12H3m8-8h6a2 2 0 0 1 2 2v3m0 6v3a2 2 0 0 1-2 2h-6",
    menu: "M4 6h16M4 12h16M4 18h16",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5",
    store:
      "M4 10h16l-1-6H5l-1 6Zm2 0v10h12V10M9 20v-6h6v6M4 10a3 3 0 0 0 6 0m0 0a3 3 0 0 0 6 0m0 0a3 3 0 0 0 6 0",
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

function MobileSearchButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden" onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
      <button
        aria-label="Mở tìm kiếm"
        aria-expanded={open}
        className="rounded-md p-2 text-[#646a61] transition hover:bg-[#f7f3ec] hover:text-[#2f6f5e]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-40 border-b border-[#ded6c9] bg-white p-3 shadow-lg">
          <GlobalSearch />
        </div>
      ) : null}
    </div>
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
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
        setCartCount(items.reduce((total, item) => total + item.quantity, 0)),
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

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    (mounted && authPaths.includes(pathname))
  ) {
    return null;
  }

  return (
    <header
      onKeyDown={(event) => {
        if (event.key === "Escape") closeMenus();
      }}
      className="sticky top-0 z-50 border-b border-[#e2e5d9] bg-[#fffefb]/95 shadow-[0_4px_24px_#253c2e05] backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="grid min-h-[72px] grid-cols-[1fr_auto] items-center gap-4 sm:min-h-[86px] sm:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-10">
          <Link
            aria-label="DECOHO home"
            className="justify-self-start"
            href="/"
            onClick={closeMenus}
          >
            <BrandLogo
              className="h-10 w-[140px] shrink-0 sm:h-12 sm:w-[175px]"
              variant="horizontal"
            />
          </Link>

          <div className="hidden w-full max-w-lg justify-self-center sm:block">
            <GlobalSearch />
          </div>

          <div className="flex shrink-0 items-center justify-self-end gap-1.5 xl:gap-2">

            <MobileSearchButton />


            {currentUser ? (
              <div className="relative hidden sm:block">
                <button
                  aria-label="Menu tài khoản"
                  aria-expanded={isProfileOpen}
                  className="flex items-center gap-2 rounded-full border border-[#e4e8db] bg-[#f5f6ee] p-1 pr-2 transition hover:bg-[#e9efdf]"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  type="button"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dfe8d3] text-xs font-bold text-[#2f6f5e]">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </span>
                  <ChevronDown size={14} className="text-[#708164]" />
                </button>

                {isProfileOpen && (
                  <>
                    <button
                      aria-label="Đóng menu tài khoản"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setIsProfileOpen(false)}
                      type="button"
                    />
                    <div className="absolute right-0 z-20 mt-3 w-64 rounded-2xl border border-[#ded6c9] bg-white p-2 shadow-xl">
                      <div className="mb-1 border-b border-[#eee7dc] px-3 py-3">
                        <p className="text-xs text-[#646a61]">
                          Tài khoản cá nhân
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-[#2f6f5e]">
                          {currentUser.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#646a61]">
                          {currentUser.email}
                        </p>
                      </div>

                      {(currentUser.role === "admin" ||
                        currentUser.role === "super_admin") && (
                        <Link
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                            pathname === "/admin"
                              ? "bg-[#2f6f5e] text-white"
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
                              ? "bg-[#2f6f5e] text-white"
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
                            ? "bg-[#2f6f5e] text-white"
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
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2.5 text-xs font-semibold text-[#2f6f5e] transition hover:bg-[#f7f3ec]"
                  href="/login"
                >
                  Đăng nhập
                </Link>
                <Link
                  className="whitespace-nowrap rounded-full bg-[#2f6f5e] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#285f51]"
                  href="/register"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="site-mobile-menu"
              className="rounded-md p-2 text-[#51564f] transition hover:bg-[#f7f3ec] lg:hidden"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              type="button"
            >
              <Icon name={isMobileMenuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </div>

      <nav
        aria-label="Điều hướng chính"
        className="hidden items-center justify-center gap-2 border-t border-[#eef0e7] px-5 py-2 lg:flex"
      >
        {menuItems.map((item) => {
          const active =
            isActivePath(pathname, item.href) ||
            (item.href === "/product-space" &&
              pathname.startsWith("/moodboards"));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={closeMenus}
              className={`rounded-full px-6 py-2 text-[13px] font-medium transition ${active ? "bg-[#edf2e6] text-[#2f6f5e]" : "text-[#78816f] hover:bg-[#f4f5ee] hover:text-[#2f6f5e]"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isMobileMenuOpen && (
        <div
          id="site-mobile-menu"
          className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-[#e3e7da] bg-[#fffefb] lg:hidden"
        >
          <div className="space-y-1 px-5 py-3">
            {menuItems.map((item) => {
              const isActive = mounted && isActivePath(pathname, item.href);

              return (
                <Link
                  className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-[#2f6f5e] text-white"
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
                pathname === "/cart"
                  ? "bg-[#2f6f5e] text-white"
                  : "text-[#51564f]"
              }`}
              href="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Giỏ hàng ({cartCount})
            </Link>

            {currentUser ? (
              <>
                {(currentUser.role === "admin" ||
                  currentUser.role === "super_admin") && (
                  <Link
                    className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                      pathname === "/admin"
                        ? "bg-[#2f6f5e] text-white"
                        : "text-[#51564f]"
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
                      pathname === "/store"
                        ? "bg-[#2f6f5e] text-white"
                        : "text-[#51564f]"
                    }`}
                    href="/store"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Kênh nhà cung cấp
                  </Link>
                )}
                <Link
                  className={`block rounded-md px-4 py-3 text-sm font-semibold ${
                    pathname === "/profile"
                      ? "bg-[#2f6f5e] text-white"
                      : "text-[#51564f]"
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
                  className="rounded-md border border-[#ded6c9] px-4 py-3 text-sm font-bold text-[#2f6f5e]"
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
